import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  TouchableOpacity,
  Linking,
  Button,
} from "react-native";

import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

import { BACKEND_IP } from "../constants";
import { formatUrl } from "../utils";

const HomePage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const navigation = useNavigation();
  const displayStatus = 1; // Always ongoing

  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [expenseDate, setExpenseDate] = useState(new Date()); // Default to today
  const [expenseType, setExpenseType] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");

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

  const onDateChange = (event, selectedDate) => {
    // event keyword is required
    const currentDate = selectedDate || expenseDate;
    setExpenseDate(currentDate);
  };

  const openLink = async () => {
    const url =
      "https://otekinc.sharepoint.com/:f:/s/ProjectTracking/EjL6aVYoIIhDixGLoyG-HJ0BPEzI0nW5ZPtKvv6fR4MLMQ?e=oNZ88N";
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      Linking.openURL(url);
    } else {
      console.error("Cannot open the URL:", url);
    }
  };

  const handlePDFChange = (pdfUrl) => {
    setPdfUrl(pdfUrl);
  };

  const handleSubmit = async () => {
    // Check if required fields are filled
    if (!expenseType || !expenseAmount || !selectedProject) {
      Alert.alert("Validation Error", "Please fill in all required fields.");
      return;
    }

    let token = await AsyncStorage.getItem("token");
    const engineer_id = await AsyncStorage.getItem("engineer_id");

    try {
      // Select the project id first
      const response = await axios.get(`${BACKEND_IP}/projectIdMobile`, {
        headers: { "access-token": token },
        params: { projectName: selectedProject },
      });

      const projectId = response.data[0].project_id;

      // Expense to be put in
      const expenseData = {
        project_id: projectId,
        expense_type: expenseType,
        amount: parseFloat(expenseAmount),
        expense_date: expenseDate || new Date().toISOString(),
        pdf_url: formatUrl(pdfUrl),
        engineer_id: engineer_id,
      };

      const res = await axios.post(`${BACKEND_IP}/addExpense`, expenseData, {
        headers: { "access-token": token },
      });

      if (res.status === 200) {
        Alert.alert(
          "Submitted",
          "Your expense has been submitted successfully."
        );
        clearAllButProject();
      } else {
        console.error("Submission failed:", res.status);
        Alert.alert("Error", "There was an issue submitting your expense.");
      }
    } catch (error) {
      console.error("There was an error submitting the expense:", error);
      Alert.alert("Error", "There was an issue submitting your expense.");
    }
  };

  const clearFields = () => {
    setSelectedCompany("All");
    setSelectedProject(null);
    setExpenseType("");
    setExpenseAmount("");
    setPdfUrl("");
  };

  const clearAllButProject = () => {
    setSelectedCompany("All");
    setExpenseType("");
    setExpenseAmount("");
    setPdfUrl("");
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
          <Text style={styles.selectedProjectText} value="">
            Selected Project: {selectedProject}
          </Text>
        ) : (
          <Text style={styles.selectedProjectText}>No project selected</Text>
        )}
      </View>
      {/* Below is info for expenses table */}
      {selectedProject !== null && selectedProject !== "null" ? (
        <>
          <View style={styles.inputRow}>
            <Text style={styles.label}>Expense Date: </Text>
            <View style={styles.expenseDate}>
              <DateTimePicker
                value={expenseDate}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            </View>
          </View>
          <View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Expense Type</Text>
              <View style={styles.expensePickerContainer}>
                <Picker
                  selectedValue={expenseType}
                  onValueChange={handleExpenseTypeChange}
                  style={[
                    styles.pickerContainer,
                    styles.expensePickerContainer,
                  ]}
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Select an expense type" value="" />
                  <Picker.Item label="Tools" value="0" />
                  <Picker.Item label="Transportation" value="1" />
                  <Picker.Item label="Meals" value="2" />
                  <Picker.Item label="Medical" value="3" />
                  <Picker.Item label="Accommodation" value="4" />
                  <Picker.Item label="Miscellaneous" value="5" />
                </Picker>
              </View>
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.label}>Expense Amount: $</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter amount"
                keyboardType="numeric"
                value={expenseAmount}
                onChangeText={handleExpenseAmountChange}
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.label}>Submit PDF in Teams: </Text>
              <Button title="Teams Link" onPress={openLink} color="#6200EE" />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.label}>PDF URL: </Text>
              <TextInput
                style={styles.input}
                placeholder="Paste URL"
                keyboardType="url"
                value={pdfUrl}
                onChangeText={handlePDFChange}
                multiline={false}
                overflow={false}
              />
            </View>
          </View>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={clearFields}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : null}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e0f7fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 24,
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
  expensePickerContainer: {
    width: "100%",
  },
  picker: {
    height: 200,
    width: 150,
  },
  pickerItem: {
    fontSize: 11,
  },
  selectorContainer: {
    marginBottom: 16,
    flexDirection: "row",
  },
  projectDetail: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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
  expenseDate: {
    alignSelf: "left",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "20%",
    marginTop: 20,
  },
  input: {
    width: "50%",
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
