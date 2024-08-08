import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";

import { BACKEND_IP } from "../constants";
import { getProjectStatus } from "../utils";

const HomePage = () => {
  const [projects, setProjects] = useState([]);
  const navigation = useNavigation();
  const [displayStatus, setDisplayStatus] = useState(5); // Default to All
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("All");

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
  }, [navigation]);

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

  const handleDisplayChange = async (value) => {
    const newStatus = parseInt(value);
    setDisplayStatus(newStatus);
    fetchProjects(newStatus, selectedCompany);
  };

  const handleCompanyChange = async (value) => {
    const newSelectedCompanyName = value;
    setSelectedCompany(newSelectedCompanyName);
    await fetchProjects(displayStatus, newSelectedCompanyName);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Projects Report</Text>
      <View style={styles.selectorContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Project Status</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={displayStatus}
              onValueChange={handleDisplayChange}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="All" value={5} />
              <Picker.Item label="Ongoing" value={1} />
              <Picker.Item label="Completed" value={2} />
              <Picker.Item label="Bill Submitted" value={3} />
              <Picker.Item label="To Be Submitted" value={4} />
            </Picker>
          </View>
        </View>
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
      </View>
      <View style={styles.table}>
        <View style={styles.tableRowHeader}>
          <Text
            style={[
              styles.tableCell,
              styles.tableHeader,
              styles.cellBorderRight,
            ]}
          >
            Company
          </Text>
          <Text
            style={[
              styles.tableCell,
              styles.tableHeader,
              styles.cellBorderRight,
            ]}
          >
            Project #
          </Text>
          <Text
            style={[
              styles.tableCell,
              styles.tableHeader,
              styles.cellBorderRight,
            ]}
          >
            Status
          </Text>
          <Text
            style={[
              styles.tableCell,
              styles.tableHeader,
              styles.cellBorderRight,
            ]}
          >
            Project Name
          </Text>
        </View>
        {projects.map((project) => (
          <View key={project.project_id} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.cellBorderRight]}>
              {project.company_name}
            </Text>
            <Text style={[styles.tableCell, styles.cellBorderRight]}>
              {project.project_number}
            </Text>
            <Text style={[styles.tableCell, styles.cellBorderRight]}>
              {getProjectStatus(project.project_status)}
            </Text>
            <Text style={styles.tableCell}>{project.project_name}</Text>
          </View>
        ))}
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
  table: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  tableRowHeader: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  tableCell: {
    flex: 1,
    padding: 8,
    fontSize: 12,
    color: "#333",
  },
  tableHeader: {
    fontWeight: "bold",
  },
  cellBorderRight: {
    borderRightWidth: 1,
    borderRightColor: "#ccc",
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
});

export default HomePage;
