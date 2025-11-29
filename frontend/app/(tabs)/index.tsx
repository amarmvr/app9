import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Text, Button, Card, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Patient {
  id: string;
  patientId: string;
  age: number;
  gender: string;
  weight: number;
  heightCm: number;
  heightFeet: number;
  heightInches: number;
}

export default function PatientsListScreen() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const fetchPatients = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/patients?userId=${user?.id}`);
      const data = await response.json();
      setPatients(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch patients');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPatients();
  }, []);

  const renderPatient = ({ item }: { item: Patient }) => (
    <TouchableOpacity
      onPress={() => router.push(`/patient-details?patientId=${item.patientId}`)}
    >
      <Card style={styles.patientCard}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.patientId}>{item.patientId}</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#007bff" />
          </View>
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Age:</Text>
              <Text style={styles.detailValue}>{item.age} years</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Gender:</Text>
              <Text style={styles.detailValue}>{item.gender}</Text>
            </View>
          </View>
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Weight:</Text>
              <Text style={styles.detailValue}>{item.weight} kg</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Height:</Text>
              <Text style={styles.detailValue}>{item.heightCm} cm</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.fullName}!</Text>
          <Text style={styles.subtitle}>{patients.length} registered</Text>
        </View>
      </View>

      <FlatList
        data={patients}
        renderItem={renderPatient}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="account-off" size={64} color="#cccccc" />
            <Text style={styles.emptyText}>No patients registered yet</Text>
          </View>
        }
      />

      <View style={styles.fabContainer}>
        <Button
          mode="contained"
          onPress={() => router.push('/add-patient')}
          buttonColor="#007bff"
          icon="plus"
          style={styles.fab}
          contentStyle={styles.fabContent}
        >
          Add Patient
        </Button>
      </View>
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
  header: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  patientCard: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  patientId: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666666',
  },
  detailValue: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    marginTop: 16,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  fab: {
    borderRadius: 28,
  },
  fabContent: {
    paddingVertical: 8,
  },
});