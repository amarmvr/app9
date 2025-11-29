import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, IconButton } from 'react-native-paper';
import { validateTemperature, formatTimestamp } from '../utils/heightConverter';

interface VitalsRowProps {
  timestamp: string;
  onUpdate: (data: VitalData) => void;
  onDelete: () => void;
  onTimestampChange: (timestamp: string) => void;
}

export interface VitalData {
  timestamp: string;
  trialDeviceReading: string;
  probeReading: string;
  roomTemperature: string;
  bodyTemperature: string;
  heartRate: string;
  spo2: string;
  bloodPressure: string;
  medications: string;
}

export default function VitalsRow({ timestamp, onUpdate, onDelete, onTimestampChange }: VitalsRowProps) {
  const [data, setData] = useState<VitalData>({
    timestamp,
    trialDeviceReading: '',
    probeReading: '',
    roomTemperature: '',
    bodyTemperature: '',
    heartRate: '',
    spo2: '',
    bloodPressure: '',
    medications: '',
  });
  
  const [isEditingTimestamp, setIsEditingTimestamp] = useState(false);
  const [timestampInput, setTimestampInput] = useState(formatTimestamp(new Date(timestamp)));

  useEffect(() => {
    onUpdate(data);
  }, [data]);
  
  useEffect(() => {
    setData(prev => ({ ...prev, timestamp }));
    setTimestampInput(formatTimestamp(new Date(timestamp)));
  }, [timestamp]);

  const handleTemperatureChange = (field: keyof VitalData, value: string) => {
    setData({ ...data, [field]: value });
  };

  const validateTemperatureField = (field: keyof VitalData) => {
    // Skip validation for room temperature
    if (field === 'roomTemperature') {
      return;
    }
    
    const value = data[field];
    if (value && value.trim() !== '') {
      const numValue = parseFloat(value);
      if (!validateTemperature(numValue)) {
        Alert.alert('Invalid Temperature', 'Temperature must be between 20°C and 60°C');
        setData({ ...data, [field]: '' });
      }
    }
  };
  
  const handleTimestampEdit = () => {
    setIsEditingTimestamp(true);
  };
  
  const handleTimestampSave = () => {
    try {
      // Parse the timestamp input (format: DD/MM/YY HH:MM)
      const parts = timestampInput.split(' ');
      if (parts.length !== 2) {
        Alert.alert('Invalid Format', 'Please use format: DD/MM/YY HH:MM');
        return;
      }
      
      const dateParts = parts[0].split('/');
      const timeParts = parts[1].split(':');
      
      if (dateParts.length !== 3 || timeParts.length !== 2) {
        Alert.alert('Invalid Format', 'Please use format: DD/MM/YY HH:MM');
        return;
      }
      
      const day = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1; // JS months are 0-indexed
      const year = 2000 + parseInt(dateParts[2]); // Assuming 20XX
      const hours = parseInt(timeParts[0]);
      const minutes = parseInt(timeParts[1]);
      
      const newDate = new Date(year, month, day, hours, minutes);
      
      if (isNaN(newDate.getTime())) {
        Alert.alert('Invalid Date', 'Please enter a valid date and time');
        return;
      }
      
      const isoTimestamp = newDate.toISOString();
      onTimestampChange(isoTimestamp);
      setData({ ...data, timestamp: isoTimestamp });
      setIsEditingTimestamp(false);
    } catch (error) {
      Alert.alert('Invalid Format', 'Please use format: DD/MM/YY HH:MM');
    }
  };

  return (
    <View style={styles.row}>
      <View style={[styles.inputContainer, { width: 120 }]}>
        {isEditingTimestamp ? (
          <View style={styles.timestampEditContainer}>
            <TextInput
              value={timestampInput}
              onChangeText={setTimestampInput}
              mode="outlined"
              placeholder="DD/MM/YY HH:MM"
              style={[styles.input, { flex: 1 }]}
              dense
            />
            <IconButton
              icon="check"
              size={18}
              iconColor="#34c759"
              onPress={handleTimestampSave}
              style={styles.iconBtn}
            />
          </View>
        ) : (
          <View style={styles.timestampContainer}>
            <TextInput
              value={timestampInput}
              mode="outlined"
              editable={false}
              style={[styles.input, { flex: 1 }]}
              dense
            />
            <IconButton
              icon="pencil"
              size={18}
              iconColor="#007bff"
              onPress={handleTimestampEdit}
              style={styles.iconBtn}
            />
          </View>
        )}
      </View>
      
      <View style={[styles.inputContainer, { width: 100 }]}>
        <TextInput
          value={data.trialDeviceReading}
          onChangeText={(value) => handleTemperatureChange('trialDeviceReading', value)}
          onBlur={() => validateTemperatureField('trialDeviceReading')}
          mode="outlined"
          keyboardType="decimal-pad"
          placeholder="°C"
          style={styles.input}
          dense
        />
      </View>
      
      <View style={[styles.inputContainer, { width: 100 }]}>
        <TextInput
          value={data.probeReading}
          onChangeText={(value) => handleTemperatureChange('probeReading', value)}
          onBlur={() => validateTemperatureField('probeReading')}
          mode="outlined"
          keyboardType="decimal-pad"
          placeholder="°C"
          style={styles.input}
          dense
        />
      </View>
      
      <View style={[styles.inputContainer, { width: 100 }]}>
        <TextInput
          value={data.bodyTemperature}
          onChangeText={(value) => handleTemperatureChange('bodyTemperature', value)}
          onBlur={() => validateTemperatureField('bodyTemperature')}
          mode="outlined"
          keyboardType="decimal-pad"
          placeholder="°C"
          style={styles.input}
          dense
        />
      </View>
      
      <View style={[styles.inputContainer, { width: 100 }]}>
        <TextInput
          value={data.roomTemperature}
          onChangeText={(value) => handleTemperatureChange('roomTemperature', value)}
          mode="outlined"
          keyboardType="decimal-pad"
          placeholder="°C"
          style={styles.input}
          dense
        />
      </View>
      
      <View style={[styles.inputContainer, { width: 80 }]}>
        <TextInput
          value={data.heartRate}
          onChangeText={(value) => setData({ ...data, heartRate: value })}
          mode="outlined"
          keyboardType="numeric"
          placeholder="bpm"
          style={styles.input}
          dense
        />
      </View>
      
      <View style={[styles.inputContainer, { width: 80 }]}>
        <TextInput
          value={data.spo2}
          onChangeText={(value) => setData({ ...data, spo2: value })}
          mode="outlined"
          keyboardType="numeric"
          placeholder="%"
          style={styles.input}
          dense
        />
      </View>
      
      <View style={[styles.inputContainer, { width: 100 }]}>
        <TextInput
          value={data.bloodPressure}
          onChangeText={(value) => setData({ ...data, bloodPressure: value })}
          mode="outlined"
          placeholder="120/80"
          style={styles.input}
          dense
        />
      </View>
      
      <View style={[styles.inputContainer, { width: 120 }]}>
        <TextInput
          value={data.medications}
          onChangeText={(value) => setData({ ...data, medications: value })}
          mode="outlined"
          placeholder="Meds"
          style={styles.input}
          dense
        />
      </View>

      <View style={{ width: 50, alignItems: 'center' }}>
        <IconButton
          icon="delete"
          size={20}
          iconColor="#ff3b30"
          onPress={onDelete}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  inputContainer: {
    marginHorizontal: 2,
  },
  input: {
    backgroundColor: '#ffffff',
    fontSize: 12,
    minHeight: 40,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  timestampEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  iconBtn: {
    margin: 0,
    padding: 0,
    marginLeft: -8,
  },
});