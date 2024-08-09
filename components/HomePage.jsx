import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  TouchableOpacity,
} from "react-native";

import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";

import { BACKEND_IP } from "../constants";

const HomePage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const navigation = useNavigation();
  const displayStatus = 1; // Always ongoing
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("All");

  const [expenseType, setExpenseType] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  useEffect(() => {
    const fetchTokenAndProjects = async () => {
      let token = await AsyncStorage.getItem("token");
      if (!token) {
        navigation.navigate("Login");
        return;
      } else {
        await fetchProjects(displayStatus, selectedCompany);
      }
    };
    const fetchCompanies = async () => {
      let token = await AsyncStorage.getItem("token");
      try {
        const res = await axios.get(`${BACKEND_IP}/allCompanies`, {
          headers: { "access-token": token },
        });
        setCompanies(res.data);
      } catch (error) {
        console.error("There was an error fetching the companies data", error);
      }
    };

    fetchTokenAndProjects();
    fetchCompanies();
  }, [navigation, selectedCompany]);

  const fetchProjects = async (newDisplayStatus, newSelectedCompany) => {
    let token = await AsyncStorage.getItem("token");
    try {
      const response = await axios.get(`${BACKEND_IP}/projectsMobile`, {
        headers: { "access-token": token },
        params: {
          projectDisplayStatus: newDisplayStatus,
          selectedCompanyName: newSelectedCompany,
        },
      });
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      Alert.alert("Error", "Failed to fetch projects");
    }
  };

  const handleCompanyChange = async (value) => {
    setSelectedCompany(value);
    await fetchProjects(displayStatus, value);
  };

  const handleProjectChange = (value) => {
    setSelectedProject(value);
  };

  const handleExpenseTypeChange = (value) => {
    setExpenseType(value);
  };

  const handleExpenseAmountChange = (value) => {
    setExpenseAmount(value);
  };

  const handleSubmit = () => {
    // Submit logic tbd
    Alert.alert("Submitted", "Your expense has been submitted.");
  };

  const handleCancel = () => {
    // Clear all selections and inputs
    setSelectedCompany("All");
    setSelectedProject(null);
    setExpenseType("");
    setExpenseAmount("");
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    navigation.navigate("Login");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Projects Report</Text>
      <View style={styles.selectorContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Company</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCompany}
              onValueChange={handleCompanyChange}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="All" value="All" />
              {companies.map((company) => (
                <Picker.Item
                  key={company.company_id}
                  label={company.company_name}
                  value={company.company_name}
                />
              ))}
            </Picker>
          </View>
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Project Name</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedProject}
              onValueChange={handleProjectChange}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="Select a project" value={null} />
              {projects.map((project) => (
                <Picker.Item
                  key={project.project_id}
                  label={project.project_name}
                  value={project.project_name}
                />
              ))}
            </Picker>
          </View>
        </View>
      </View>
      <View style={styles.projectDetail}>
        {selectedProject ? (
          <Text style={styles.selectedProjectText}>
            Selected Project: {selectedProject}
          </Text>
        ) : (
          <Text style={styles.selectedProjectText}>No project selected</Text>
        )}
      </View>
      <View>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Expense Type</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={expenseType}
              onValueChange={handleExpenseTypeChange}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="Select an expense type" value="" />
              <Picker.Item label="Travel" value="Travel" />
              <Picker.Item label="Food" value="Food" />
              <Picker.Item label="Accommodation" value="Accommodation" />
              <Picker.Item label="Miscellaneous" value="Miscellaneous" />
            </Picker>
          </View>
        </View>
        <View style={styles.formGroup}>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            keyboardType="numeric"
            value={expenseAmount}
            onChangeText={handleExpenseAmountChange}
          />
        </View>
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleCancel}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: "#333",
  },
  formGroup: {
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    overflow: "hidden",
    width: "100%",
  },
  picker: {
    height: 200,
    width: 150,
  },
  pickerItem: {
    fontSize: 11, // Adjust the font size here
  },
  selectorContainer: {
    marginBottom: 16,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 20,
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 4,
    width: "48%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#FF6347",
    padding: 12,
    borderRadius: 4,
    marginTop: 20,
    marginHorizontal: 16,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default HomePage;
