from fastapi import FastAPI, APIRouter, HTTPException, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
import io
from xlsxwriter import Workbook

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Helper function to convert ObjectId to string
def serialize_doc(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

# ==================== MODELS ====================

class UserSignup(BaseModel):
    fullName: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    fullName: str
    email: str

class PatientCreate(BaseModel):
    userId: str
    age: int
    gender: str
    weight: float
    heightCm: float
    heightFeet: int
    heightInches: float
    hasSepsis: bool
    monitoringMethod: str
    additionalNotes: Optional[str] = ""

class PatientResponse(BaseModel):
    id: str
    patientId: str
    userId: str
    age: int
    gender: str
    weight: float
    heightCm: float
    heightFeet: int
    heightInches: float
    hasSepsis: bool
    monitoringMethod: str
    additionalNotes: str
    createdAt: str

class VitalCreate(BaseModel):
    patientId: str
    timestamp: str
    trialDeviceReading: Optional[float] = None
    probeReading: Optional[float] = None
    roomTemperature: Optional[float] = None
    bodyTemperature: Optional[float] = None
    heartRate: Optional[int] = None
    spo2: Optional[int] = None
    bloodPressure: Optional[str] = ""
    medications: Optional[str] = ""

class VitalResponse(BaseModel):
    id: str
    patientId: str
    timestamp: str
    trialDeviceReading: Optional[float]
    probeReading: Optional[float]
    roomTemperature: Optional[float]
    bodyTemperature: Optional[float]
    heartRate: Optional[int]
    spo2: Optional[int]
    bloodPressure: str
    medications: str
    createdAt: str

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/signup")
async def signup(user: UserSignup):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_doc = {
        "fullName": user.fullName,
        "email": user.email,
        "password": user.password,  # In production, hash this
        "createdAt": datetime.utcnow().isoformat()
    }
    result = await db.users.insert_one(user_doc)
    
    return {
        "id": str(result.inserted_id),
        "fullName": user.fullName,
        "email": user.email
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    
    if not user or user["password"] != credentials.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {
        "id": str(user["_id"]),
        "fullName": user["fullName"],
        "email": user["email"]
    }

# ==================== PATIENT ROUTES ====================

@api_router.get("/patients/next-id")
async def get_next_patient_id():
    # Find the highest patient ID
    patients = await db.patients.find().sort("patientId", -1).limit(1).to_list(1)
    
    if not patients:
        return {"nextId": "PT001"}
    
    last_id = patients[0]["patientId"]
    # Extract number from PT001 format
    num = int(last_id[2:]) + 1
    next_id = f"PT{num:03d}"
    
    return {"nextId": next_id}

@api_router.post("/patients")
async def create_patient(patient: PatientCreate):
    # Get next patient ID
    next_id_response = await get_next_patient_id()
    patient_id = next_id_response["nextId"]
    
    patient_doc = {
        "patientId": patient_id,
        "userId": patient.userId,
        "age": patient.age,
        "gender": patient.gender,
        "weight": patient.weight,
        "heightCm": patient.heightCm,
        "heightFeet": patient.heightFeet,
        "heightInches": patient.heightInches,
        "hasSepsis": patient.hasSepsis,
        "monitoringMethod": patient.monitoringMethod,
        "additionalNotes": patient.additionalNotes,
        "createdAt": datetime.utcnow().isoformat()
    }
    
    result = await db.patients.insert_one(patient_doc)
    patient_doc["id"] = str(result.inserted_id)
    patient_doc.pop("_id", None)
    
    return patient_doc

@api_router.get("/patients")
async def get_patients(userId: str):
    patients = await db.patients.find({"userId": userId}).sort("patientId", -1).to_list(1000)
    
    result = []
    for patient in patients:
        patient["id"] = str(patient["_id"])
        patient.pop("_id", None)
        result.append(patient)
    
    return result

@api_router.get("/patients/{patient_id}")
async def get_patient(patient_id: str):
    patient = await db.patients.find_one({"patientId": patient_id})
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    patient["id"] = str(patient["_id"])
    patient.pop("_id", None)
    
    return patient

# ==================== VITALS ROUTES ====================

@api_router.post("/vitals")
async def create_vital(vital: VitalCreate):
    vital_doc = vital.dict()
    vital_doc["createdAt"] = datetime.utcnow().isoformat()
    
    result = await db.vitals.insert_one(vital_doc)
    vital_doc["id"] = str(result.inserted_id)
    vital_doc.pop("_id", None)
    
    return vital_doc

@api_router.post("/vitals/bulk")
async def create_vitals_bulk(vitals: List[VitalCreate]):
    vital_docs = []
    for vital in vitals:
        vital_doc = vital.dict()
        vital_doc["createdAt"] = datetime.utcnow().isoformat()
        vital_docs.append(vital_doc)
    
    result = await db.vitals.insert_many(vital_docs)
    
    return {"inserted_count": len(result.inserted_ids)}

@api_router.get("/vitals/{patient_id}")
async def get_vitals(patient_id: str):
    vitals = await db.vitals.find({"patientId": patient_id}).sort("timestamp", 1).to_list(10000)
    
    result = []
    for vital in vitals:
        vital["id"] = str(vital["_id"])
        vital.pop("_id", None)
        result.append(vital)
    
    return result

@api_router.put("/vitals/{vital_id}")
async def update_vital(vital_id: str, vital: VitalCreate):
    vital_doc = vital.dict()
    
    result = await db.vitals.update_one(
        {"_id": ObjectId(vital_id)},
        {"$set": vital_doc}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Vital record not found")
    
    return {"success": True}

@api_router.delete("/vitals/{vital_id}")
async def delete_vital(vital_id: str):
    result = await db.vitals.delete_one({"_id": ObjectId(vital_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Vital record not found")
    
    return {"success": True}

@api_router.get("/vitals/export/{patient_id}")
async def export_vitals(patient_id: str):
    # Get patient details
    patient = await db.patients.find_one({"patientId": patient_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Get all vitals for this patient
    vitals = await db.vitals.find({"patientId": patient_id}).sort("timestamp", 1).to_list(10000)
    
    # Create Excel file in memory
    output = io.BytesIO()
    workbook = Workbook(output, {'in_memory': True})
    worksheet = workbook.add_worksheet('Vital Readings')
    
    # Add formats
    header_format = workbook.add_format({
        'bold': True,
        'bg_color': '#007bff',
        'font_color': 'white',
        'border': 1
    })
    
    cell_format = workbook.add_format({
        'border': 1
    })
    
    # Write patient details
    worksheet.write(0, 0, 'Patient ID:', header_format)
    worksheet.write(0, 1, patient_id, cell_format)
    worksheet.write(1, 0, 'Age:', header_format)
    worksheet.write(1, 1, patient['age'], cell_format)
    worksheet.write(2, 0, 'Gender:', header_format)
    worksheet.write(2, 1, patient['gender'], cell_format)
    worksheet.write(3, 0, 'Weight:', header_format)
    worksheet.write(3, 1, f"{patient['weight']} kg", cell_format)
    worksheet.write(4, 0, 'Height:', header_format)
    worksheet.write(4, 1, f"{patient['heightCm']} cm ({patient['heightFeet']}'{patient['heightInches']}\")", cell_format)
    
    # Write vitals table headers
    row = 6
    headers = [
        'S.No', 'Timestamp', 'Trial Device (NV-Core) Reading (°C)', 
        'Rectal/Oesophageal/Nasal Reading (°C)', 'Body Temperature (°C)',
        'Room Temperature (°C)', 'Heart Rate (bpm)', 'SpO2 (%)', 
        'BP (mmHg)', 'Medications Given'
    ]
    
    for col, header in enumerate(headers):
        worksheet.write(row, col, header, header_format)
    
    # Write vitals data
    row += 1
    for idx, vital in enumerate(vitals, 1):
        worksheet.write(row, 0, idx, cell_format)
        worksheet.write(row, 1, vital.get('timestamp', ''), cell_format)
        worksheet.write(row, 2, vital.get('trialDeviceReading', ''), cell_format)
        worksheet.write(row, 3, vital.get('probeReading', ''), cell_format)
        worksheet.write(row, 4, vital.get('bodyTemperature', ''), cell_format)
        worksheet.write(row, 5, vital.get('roomTemperature', ''), cell_format)
        worksheet.write(row, 6, vital.get('heartRate', ''), cell_format)
        worksheet.write(row, 7, vital.get('spo2', ''), cell_format)
        worksheet.write(row, 8, vital.get('bloodPressure', ''), cell_format)
        worksheet.write(row, 9, vital.get('medications', ''), cell_format)
        row += 1
    
    # Set column widths
    worksheet.set_column(0, 0, 8)
    worksheet.set_column(1, 1, 20)
    worksheet.set_column(2, 9, 15)
    
    workbook.close()
    output.seek(0)
    
    return Response(
        content=output.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename={patient_id}_vitals.xlsx"
        }
    )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()