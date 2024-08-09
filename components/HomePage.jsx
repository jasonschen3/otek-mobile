import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
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
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  projectDetail: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  selectedProjectText: {
    fontSize: 18,
    textAlign: "center",
    color: "#333",
  },
});

export default HomePage;
