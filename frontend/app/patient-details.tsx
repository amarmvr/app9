import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Text, Button, Card, ActivityIndicator, DataTable } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import VitalsRow, { VitalData } from '../components/VitalsRow';
import { addMinutes, formatTimestamp } from '../utils/heightConverter';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Patient {
  patientId: string;
  age: number;
  gender: string;
  weight: number;
  heightCm: number;
  heightFeet: number;
  heightInches: number;
  hasSepsis: boolean;
  monitoringMethod: string;
  additionalNotes: string;
}

interface Vital {
  id: string;
  timestamp: string;
  trialDeviceReading?: number;
  probeReading?: number;
  roomTemperature?: number;
  bodyTemperature?: number;
  heartRate?: number;
  spo2?: number;
  bloodPressure: string;
  medications: string;
}

export default function PatientDetailsScreen() {
  const { patientId } = useLocalSearchParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [newRows, setNewRows] = useState<{ id: string; timestamp: string; data: VitalData }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchPatientDetails();
    fetchVitals();
  }, []);

  const fetchPatientDetails = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/patients/${patientId}`);
      const data = await response.json();
      setPatient(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch patient details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVitals = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/vitals/${patientId}`);
      const data = await response.json();
      setVitals(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch vitals');
      console.error(error);
    }
  };

  const handleAddRow = () => {
    let newTimestamp: Date;
    
    if (newRows.length > 0) {
      // Get the last row's timestamp and add 5 minutes
      const lastTimestamp = new Date(newRows[newRows.length - 1].timestamp);
      newTimestamp = addMinutes(lastTimestamp, 5);
    } else if (vitals.length > 0) {
      // Get the last vital's timestamp and add 5 minutes
      const lastTimestamp = new Date(vitals[vitals.length - 1].timestamp);
      newTimestamp = addMinutes(lastTimestamp, 5);
    } else {
      // Use current time
      newTimestamp = new Date();
    }

    const newRow = {
      id: Date.now().toString(),
      timestamp: newTimestamp.toISOString(),
      data: {
        timestamp: newTimestamp.toISOString(),
        trialDeviceReading: '',
        probeReading: '',
        roomTemperature: '',
        bodyTemperature: '',
        heartRate: '',
        spo2: '',
        bloodPressure: '',
        medications: '',
      },
    };

    setNewRows([...newRows, newRow]);
  };

  const handleUpdateRow = (id: string, data: VitalData) => {
    setNewRows(newRows.map(row => (row.id === id ? { ...row, data } : row)));
  };

  const handleDeleteRow = (id: string) => {
    setNewRows(newRows.filter(row => row.id !== id));
  };
  
  const handleTimestampChange = (id: string, newTimestamp: string) => {
    setNewRows(newRows.map(row => 
      row.id === id ? { ...row, timestamp: newTimestamp, data: { ...row.data, timestamp: newTimestamp } } : row
    ));
  };

  const handleSaveAll = async () => {
    if (newRows.length === 0) {
      Alert.alert('Info', 'No new rows to save');
      return;
    }

    setSaving(true);
    try {
      const vitalsToSave = newRows.map(row => ({
        patientId: patientId as string,
        timestamp: row.data.timestamp,
        trialDeviceReading: row.data.trialDeviceReading ? parseFloat(row.data.trialDeviceReading) : null,
        probeReading: row.data.probeReading ? parseFloat(row.data.probeReading) : null,
        roomTemperature: row.data.roomTemperature ? parseFloat(row.data.roomTemperature) : null,
        bodyTemperature: row.data.bodyTemperature ? parseFloat(row.data.bodyTemperature) : null,
        heartRate: row.data.heartRate ? parseInt(row.data.heartRate) : null,
        spo2: row.data.spo2 ? parseInt(row.data.spo2) : null,
        bloodPressure: row.data.bloodPressure,
        medications: row.data.medications,
      }));

      const response = await fetch(`${BACKEND_URL}/api/vitals/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vitalsToSave),
      });

      if (response.ok) {
        Alert.alert('Success', 'Vitals saved successfully');
        setNewRows([]);
        fetchVitals();
      } else {
        Alert.alert('Error', 'Failed to save vitals');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to server');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/vitals/export/${patientId}`);
      
      if (response.ok) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const filename = `${patientId}_vitals_${timestamp}.xlsx`;
        
        if (Platform.OS === 'web') {
          // Web platform - use download link
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          Alert.alert('Success', 'File downloaded successfully!');
        } else {
          // Mobile platform - use FileSystem and Sharing
          const arrayBuffer = await response.arrayBuffer();
          const base64 = btoa(
            new Uint8Array(arrayBuffer).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ''
            )
          );
          
          const fileUri = FileSystem.documentDirectory + filename;
          await FileSystem.writeAsStringAsync(fileUri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });

          console.log('File saved to:', fileUri);

          const sharingAvailable = await Sharing.isAvailableAsync();
          
          if (sharingAvailable) {
            await Sharing.shareAsync(fileUri, {
              mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              dialogTitle: 'Export Patient Vitals',
              UTI: 'com.microsoft.excel.xlsx'
            });
            Alert.alert('Success', 'File exported and ready to share!');
          } else {
            Alert.alert('Success', `File saved to:\n${fileUri}`);
          }
        }
      } else {
        const errorText = await response.text();
        console.error('Export error response:', errorText);
        Alert.alert('Error', `Failed to export data: ${errorText}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', `Failed to export data: ${error.message || error}`);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!patient) {
    return (
      <View style={styles.centerContainer}>
        <Text>Patient not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Button
            mode="text"
            onPress={() => router.back()}
            icon="arrow-left"
            textColor="#007bff"
          >
            Back
          </Button>
          <Text style={styles.title}>Patient: {patient.patientId}</Text>
          <Button
            mode="contained"
            onPress={handleExport}
            loading={exporting}
            buttonColor="#34c759"
            compact
          >
            Export
          </Button>
        </View>

        <ScrollView style={styles.scrollView}>
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Patient Details</Text>
              <View style={styles.detailsGrid}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Age:</Text>
                  <Text style={styles.detailValue}>{patient.age} years</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Gender:</Text>
                  <Text style={styles.detailValue}>{patient.gender}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Weight:</Text>
                  <Text style={styles.detailValue}>{patient.weight} kg</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Height:</Text>
                  <Text style={styles.detailValue}>
                    {patient.heightCm} cm ({patient.heightFeet}'{patient.heightInches}")
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Sepsis:</Text>
                  <Text style={styles.detailValue}>{patient.hasSepsis ? 'YES' : 'NO'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Monitoring:</Text>
                  <Text style={styles.detailValue}>{patient.monitoringMethod}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.vitalsHeader}>
                <Text style={styles.cardTitle}>Log Vital Readings</Text>
                <View style={styles.actionButtons}>
                  <Button
                    mode="outlined"
                    onPress={handleAddRow}
                    icon="plus"
                    compact
                    style={styles.addButton}
                  >
                    Add Row
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleSaveAll}
                    loading={saving}
                    disabled={newRows.length === 0}
                    buttonColor="#007bff"
                    compact
                  >
                    Save All ({newRows.length})
                  </Button>
                </View>
              </View>

              <ScrollView horizontal>
                <View>
                  <View style={styles.tableHeader}>
                    <View style={[styles.headerCellContainer, { width: 120 }]}>
                      <Text style={styles.headerCell}>Timestamp</Text>
                    </View>
                    <View style={[styles.headerCellContainer, { width: 100 }]}>
                      <Text style={styles.headerCell}>Trial Device{'\n'}(NV-Core){'\n'}Reading (°C)</Text>
                    </View>
                    <View style={[styles.headerCellContainer, { width: 100 }]}>
                      <Text style={styles.headerCell}>Rectal/{'\n'}Oesophageal/{'\n'}Nasal{'\n'}Reading (°C)</Text>
                    </View>
                    <View style={[styles.headerCellContainer, { width: 100 }]}>
                      <Text style={styles.headerCell}>Body{'\n'}Temperature{'\n'}(°C)</Text>
                    </View>
                    <View style={[styles.headerCellContainer, { width: 100 }]}>
                      <Text style={styles.headerCell}>Room{'\n'}Temperature{'\n'}(°C)</Text>
                    </View>
                    <View style={[styles.headerCellContainer, { width: 80 }]}>
                      <Text style={styles.headerCell}>Heart Rate{'\n'}(bpm)</Text>
                    </View>
                    <View style={[styles.headerCellContainer, { width: 80 }]}>
                      <Text style={styles.headerCell}>SpO2{'\n'}(%)</Text>
                    </View>
                    <View style={[styles.headerCellContainer, { width: 100 }]}>
                      <Text style={styles.headerCell}>BP{'\n'}(mmHg)</Text>
                    </View>
                    <View style={[styles.headerCellContainer, { width: 120 }]}>
                      <Text style={styles.headerCell}>Medications{'\n'}Given</Text>
                    </View>
                    <View style={[styles.headerCellContainer, { width: 50 }]}>
                      <Text style={styles.headerCell}>Action</Text>
                    </View>
                  </View>

                  {newRows.map((row) => (
                    <VitalsRow
                      key={row.id}
                      timestamp={row.timestamp}
                      onUpdate={(data) => handleUpdateRow(row.id, data)}
                      onDelete={() => handleDeleteRow(row.id)}
                      onTimestampChange={(newTimestamp) => handleTimestampChange(row.id, newTimestamp)}
                    />
                  ))}
                </View>
              </ScrollView>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Historical Vital Readings ({vitals.length})</Text>
              <ScrollView horizontal>
                <DataTable>
                  <DataTable.Header>
                    <DataTable.Title style={{ width: 50 }}>S.No</DataTable.Title>
                    <DataTable.Title style={{ width: 120 }}>Timestamp</DataTable.Title>
                    <DataTable.Title style={{ width: 100 }}>Trial Device (NV-Core) Reading (°C)</DataTable.Title>
                    <DataTable.Title style={{ width: 100 }}>Rectal/Oesophageal/Nasal Reading (°C)</DataTable.Title>
                    <DataTable.Title style={{ width: 100 }}>Body Temperature (°C)</DataTable.Title>
                    <DataTable.Title style={{ width: 100 }}>Room Temperature (°C)</DataTable.Title>
                    <DataTable.Title style={{ width: 80 }}>Heart Rate (bpm)</DataTable.Title>
                    <DataTable.Title style={{ width: 80 }}>SpO2 (%)</DataTable.Title>
                    <DataTable.Title style={{ width: 100 }}>BP (mmHg)</DataTable.Title>
                    <DataTable.Title style={{ width: 120 }}>Medications Given</DataTable.Title>
                  </DataTable.Header>

                  {vitals.map((vital, index) => (
                    <DataTable.Row key={vital.id}>
                      <DataTable.Cell style={{ width: 50 }}>{index + 1}</DataTable.Cell>
                      <DataTable.Cell style={{ width: 120 }}>
                        {formatTimestamp(new Date(vital.timestamp))}
                      </DataTable.Cell>
                      <DataTable.Cell style={{ width: 100 }}>
                        {vital.trialDeviceReading || '-'}
                      </DataTable.Cell>
                      <DataTable.Cell style={{ width: 100 }}>
                        {vital.probeReading || '-'}
                      </DataTable.Cell>
                      <DataTable.Cell style={{ width: 100 }}>
                        {vital.bodyTemperature || '-'}
                      </DataTable.Cell>
                      <DataTable.Cell style={{ width: 100 }}>
                        {vital.roomTemperature || '-'}
                      </DataTable.Cell>
                      <DataTable.Cell style={{ width: 80 }}>
                        {vital.heartRate || '-'}
                      </DataTable.Cell>
                      <DataTable.Cell style={{ width: 80 }}>
                        {vital.spo2 || '-'}
                      </DataTable.Cell>
                      <DataTable.Cell style={{ width: 100 }}>
                        {vital.bloodPressure || '-'}
                      </DataTable.Cell>
                      <DataTable.Cell style={{ width: 120 }}>
                        {vital.medications || '-'}
                      </DataTable.Cell>
                    </DataTable.Row>
                  ))}
                </DataTable>
              </ScrollView>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginBottom: 0,
    backgroundColor: '#ffffff',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  detailsGrid: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333333',
  },
  vitalsHeader: {
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  addButton: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  headerCellContainer: {
    marginHorizontal: 2,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 60,
  },
  headerCell: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 10,
    textAlign: 'center',
  },
});
