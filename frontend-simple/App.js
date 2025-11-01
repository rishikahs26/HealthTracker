import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";

const { manifest } = Constants;
const API_URL = manifest?.debuggerHost
  ? `http://${manifest.debuggerHost.split(":")[0]}:5000`
  : "http://10.201.14.118:5000";

export default function App() {
  const [page, setPage] = useState("profile");
  const [profile, setProfile] = useState({ name: "", age: "", conditions: "" });
  const [appointments, setAppointments] = useState([]);
  const [newAppointment, setNewAppointment] = useState({ date: "", doctor: "" });
  const [prescriptions, setPrescriptions] = useState([]);
  const [newPrescription, setNewPrescription] = useState({ name: "", image: "" });

  useEffect(() => {
    const loadData = async () => {
      try {
        const res1 = await fetch(`${API_URL}/appointments`);
        setAppointments(await res1.json());
      } catch (err) {
        Alert.alert("Error", "Could not load appointments");
      }

      try {
        const res2 = await fetch(`${API_URL}/prescriptions`);
        setPrescriptions(await res2.json());
      } catch (err) {
        Alert.alert("Error", "Could not load prescriptions");
      }
    };
    loadData();
  }, []);

  const handleSaveProfile = async () => {
    if (!profile.name || !profile.age)
      return Alert.alert("Error", "Please fill in name and age");
    try {
      await fetch(`${API_URL}/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      Alert.alert("✅ Success", "Profile saved successfully!");
    } catch {
      Alert.alert("Error", "Failed to save profile");
    }
  };

  const handleAddAppointment = async () => {
    if (!newAppointment.date || !newAppointment.doctor)
      return Alert.alert("Error", "Enter date and doctor name");
    try {
      await fetch(`${API_URL}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAppointment),
      });
      setAppointments([...appointments, newAppointment]);
      setNewAppointment({ date: "", doctor: "" });
    } catch {
      Alert.alert("Error", "Failed to add appointment");
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return Alert.alert("Permission denied", "Allow access to photo library");
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.IMAGE],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setNewPrescription({ ...newPrescription, image: result.assets[0].uri });
    }
  };

  const handleAddPrescription = async () => {
    if (!newPrescription.name)
      return Alert.alert("Error", "Enter prescription name");
    try {
      await fetch(`${API_URL}/prescriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPrescription),
      });
      setPrescriptions([...prescriptions, newPrescription]);
      setNewPrescription({ name: "", image: "" });
    } catch {
      Alert.alert("Error", "Failed to save prescription");
    }
  };

  const TabButton = ({ label, value }) => (
    <TouchableOpacity
      onPress={() => setPage(value)}
      style={{
        backgroundColor: page === value ? "#2563eb" : "#e2e8f0",
        padding: 10,
        borderRadius: 10,
        width: "30%",
        alignItems: "center",
      }}
    >
      <Text style={{ color: page === value ? "white" : "black" }}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc", padding: 20 }}>
      {/* Tabs */}
      <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 20 }}>
        <TabButton label="Profile" value="profile" />
        <TabButton label="Appointments" value="appointments" />
        <TabButton label="Prescriptions" value="prescriptions" />
      </View>

      {/* PROFILE PAGE */}
      {page === "profile" && (
        <View>
          <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>🧑 Health Profile</Text>
          {["name", "age", "conditions"].map((key) => (
            <TextInput
              key={key}
              placeholder={key}
              value={profile[key]}
              onChangeText={(t) => setProfile({ ...profile, [key]: t })}
              style={{
                borderWidth: 1,
                padding: 10,
                marginVertical: 6,
                borderRadius: 8,
                backgroundColor: "white",
              }}
            />
          ))}
          <Button title="💾 Save Profile" onPress={handleSaveProfile} />
        </View>
      )}

      {/* APPOINTMENTS PAGE */}
      {page === "appointments" && (
        <FlatList
          data={appointments}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: "white", padding: 10, marginVertical: 5, borderRadius: 10, elevation: 2 }}>
              <Text>📆 {item.date}</Text>
              <Text>👩‍⚕️ {item.doctor}</Text>
            </View>
          )}
          ListFooterComponent={
            <View>
              <TextInput
                placeholder="Date (e.g. 2025-10-30)"
                value={newAppointment.date}
                onChangeText={(t) => setNewAppointment({ ...newAppointment, date: t })}
                style={{
                  borderWidth: 1,
                  padding: 10,
                  marginVertical: 5,
                  borderRadius: 8,
                  backgroundColor: "white",
                }}
              />
              <TextInput
                placeholder="Doctor"
                value={newAppointment.doctor}
                onChangeText={(t) => setNewAppointment({ ...newAppointment, doctor: t })}
                style={{
                  borderWidth: 1,
                  padding: 10,
                  marginVertical: 5,
                  borderRadius: 8,
                  backgroundColor: "white",
                }}
              />
              <Button title="➕ Add Appointment" onPress={handleAddAppointment} />
            </View>
          }
        />
      )}

      {/* PRESCRIPTIONS PAGE */}
      {page === "prescriptions" && (
        <FlatList
          data={prescriptions}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: "white", padding: 10, marginVertical: 5, borderRadius: 10 }}>
              <Text>📋 {item.name}</Text>
              {item.image ? (
                <Image
                  source={{ uri: item.image }}
                  style={{ width: "100%", height: 150, borderRadius: 10, marginTop: 5 }}
                />
              ) : null}
            </View>
          )}
          ListFooterComponent={
            <View>
              <TextInput
                placeholder="Prescription name"
                value={newPrescription.name}
                onChangeText={(t) => setNewPrescription({ ...newPrescription, name: t })}
                style={{
                  borderWidth: 1,
                  padding: 10,
                  marginVertical: 5,
                  borderRadius: 8,
                  backgroundColor: "white",
                }}
              />
              <Button title="📸 Pick Image" onPress={handlePickImage} />
              {newPrescription.image ? (
                <Image
                  source={{ uri: newPrescription.image }}
                  style={{ width: "100%", height: 150, borderRadius: 10, marginVertical: 10 }}
                />
              ) : null}
              <Button title="💾 Save Prescription" onPress={handleAddPrescription} />
            </View>
          }
        />
      )}
    </View>
  );
}
