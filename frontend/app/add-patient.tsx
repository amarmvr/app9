import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Text, TextInput, Button, SegmentedButtons, RadioButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { cmToFeet, feetToCm } from '../utils/heightConverter';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function AddPatientScreen() {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [weight, setWeight] = useState('');
  const [heightUnit, setHeightUnit] = useState('cm');
  const [heightCm, setHeightCm] = useState('');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [hasSepsis, setHasSepsis] = useState(false);
  const [monitoringMethod, setMonitoringMethod] = useState('Nasal');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleHeightCmChange = (value: string) => {
    setHeightCm(value);
    if (value) {
      const cm = parseFloat(value);
      if (!isNaN(cm)) {
        const { feet, inches } = cmToFeet(cm);
        setHeightFeet(feet.toString());
        setHeightInches(inches.toString());
      }
    }
  };

  const handleHeightFeetChange = (feet: string, inches: string) => {
    setHeightFeet(feet);
    setHeightInches(inches);
    if (feet && inches) {
      const f = parseInt(feet);
      const i = parseFloat(inches);
      if (!isNaN(f) && !isNaN(i)) {
        const cm = feetToCm(f, i);
        setHeightCm(cm.toString());
      }
    }
  };

  const handleSubmit = async () => {
    if (!age || !weight || !heightCm) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          age: parseInt(age),
          gender,
          weight: parseFloat(weight),
          heightCm: parseFloat(heightCm),
          heightFeet: parseInt(heightFeet) || 0,
          heightInches: parseFloat(heightInches) || 0,
          hasSepsis,
          monitoringMethod,
          additionalNotes,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Patient added successfully');
        router.back();
      } else {
        const data = await response.json();
        Alert.alert('Error', data.detail || 'Failed to add patient');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to server');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.title}>Add New Patient</Text>
          <View style={{ width: 80 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TextInput
            label="Age *"
            value={age}
            onChangeText={setAge}
            mode="outlined"
            keyboardType="numeric"
            placeholder="Age"
            style={styles.input}
            outlineColor="#007bff"
            activeOutlineColor="#007bff"
          />

          <Text style={styles.label}>Gender *</Text>
          <RadioButton.Group onValueChange={setGender} value={gender}>
            <View style={styles.radioGroup}>
              <View style={styles.radioItem}>
                <RadioButton value="Male" color="#007bff" />
                <Text>Male</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="Female" color="#007bff" />
                <Text>Female</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="Other" color="#007bff" />
                <Text>Other</Text>
              </View>
            </View>
          </RadioButton.Group>

          <TextInput
            label="Weight (kg) *"
            value={weight}
            onChangeText={setWeight}
            mode="outlined"
            keyboardType="decimal-pad"
            placeholder="Weight in kg"
            style={styles.input}
            outlineColor="#007bff"
            activeOutlineColor="#007bff"
          />

          <Text style={styles.label}>Height *</Text>
          <SegmentedButtons
            value={heightUnit}
            onValueChange={setHeightUnit}
            buttons={[
              { value: 'cm', label: 'cm' },
              { value: 'feet', label: 'feet' },
            ]}
            style={styles.segmentedButtons}
          />

          {heightUnit === 'cm' ? (
            <TextInput
              label="Height in cm"
              value={heightCm}
              onChangeText={handleHeightCmChange}
              mode="outlined"
              keyboardType="decimal-pad"
              placeholder="Height in cm"
              style={styles.input}
              outlineColor="#007bff"
              activeOutlineColor="#007bff"
            />
          ) : (
            <View style={styles.heightRow}>
              <TextInput
                label="Feet"
                value={heightFeet}
                onChangeText={(value) => handleHeightFeetChange(value, heightInches)}
                mode="outlined"
                keyboardType="numeric"
                placeholder="Feet"
                style={[styles.input, styles.heightInput]}
                outlineColor="#007bff"
                activeOutlineColor="#007bff"
              />
              <TextInput
                label="Inches"
                value={heightInches}
                onChangeText={(value) => handleHeightFeetChange(heightFeet, value)}
                mode="outlined"
                keyboardType="decimal-pad"
                placeholder="Inches"
                style={[styles.input, styles.heightInput]}
                outlineColor="#007bff"
                activeOutlineColor="#007bff"
              />
            </View>
          )}

          <Text style={styles.label}>Sepsis</Text>
          <SegmentedButtons
            value={hasSepsis ? 'YES' : 'NO'}
            onValueChange={(value) => setHasSepsis(value === 'YES')}
            buttons={[
              { value: 'YES', label: 'YES' },
              { value: 'NO', label: 'NO' },
            ]}
            style={styles.segmentedButtons}
          />

          <Text style={styles.label}>Monitoring Method</Text>
          <RadioButton.Group onValueChange={setMonitoringMethod} value={monitoringMethod}>
            <View style={styles.radioColumn}>
              <View style={styles.radioItem}>
                <RadioButton value="Nasal" color="#007bff" />
                <Text>Nasal</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="Oesophageal" color="#007bff" />
                <Text>Oesophageal</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton value="Rectal" color="#007bff" />
                <Text>Rectal</Text>
              </View>
            </View>
          </RadioButton.Group>

          <TextInput
            label="Additional Notes"
            value={additionalNotes}
            onChangeText={setAdditionalNotes}
            mode="outlined"
            multiline
            numberOfLines={3}
            placeholder="Any additional information"
            style={styles.input}
            outlineColor="#007bff"
            activeOutlineColor="#007bff"
          />

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
            buttonColor="#007bff"
          >
            Add Patient
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  scrollContent: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  label: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
    fontWeight: '500',
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  heightRow: {
    flexDirection: 'row',
    gap: 12,
  },
  heightInput: {
    flex: 1,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  radioColumn: {
    marginBottom: 16,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButton: {
    marginTop: 16,
    paddingVertical: 6,
  },
});