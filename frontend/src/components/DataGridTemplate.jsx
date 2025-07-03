import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import axios from "axios";
 
// Helper function to capitalize the first letter of a string
const capitalize = (s) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};
 
const DataGridTemplate = ({
  title,
  fetchFieldApiUrl,
  postApiUrl,
  updateApiUrl,
  collectionName,
  fetchActualData,
}) => {
  const [tableData, setTableData] = useState([]);
  const [newRows, setNewRows] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
 
  const [fieldDefinitions, setFieldDefinitions] = useState([]);
 
  // States for cell-level inline editing
  const [editingCell, setEditingCell] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const inputRef = useRef(null);
 
  // --- Dropdown States ---
 
  // const [faOptions, setFaOptions] = useState([]); // For function_area dropdown
 
  const [modulesOptions, setModulesOptions] = useState([]); // For modules dropdown
 
  const [secondDropdownOptions, setSecondDropdownOptions] = useState([]); // For function_area under module
 
  const [selectedModuleId, setSelectedModuleId] = useState("");
 
  const [selectedFaName, setSelectedFaName] = useState("");
 
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError("");
 
        // Fetch field definitions first
        const fieldDefinitionsResponse = await axios.get(fetchFieldApiUrl);
        const fetchedFieldDefinitions = fieldDefinitionsResponse.data.filter(
          (field) => field.displayFlag === "Y"
        );
        setFieldDefinitions(fetchedFieldDefinitions);
 
        // Determine which fields to display based on displayFlag
        const displayFieldLabels = fetchedFieldDefinitions.map(
          (field) => field.fieldLabel
        );
 
        // Now fetch the actual data
        console.log("enter the field");
        const dataResponse = await axios.get(fetchActualData); // Assuming this is your actual data endpoint
        console.log("dataresponse", dataResponse);
        const processedTableData = dataResponse.data.map((item) => {
          console.log("Item", item);
          const newItem = {};
          newItem._id = item._id; // Ensure _id is carried through for updates
          displayFieldLabels.forEach((fieldLabel) => {
            newItem[fieldLabel] = item[fieldLabel];
            console.log("newItem[fieldLabel]", newItem[fieldLabel]);
          });
          return {
            ...newItem,
            id: item._id || `${Date.now() + Math.random()}`,
          };
        });
        setTableData(processedTableData);
      } catch (err) {
        console.error(`Error fetching data from ${fetchFieldApiUrl}:`, err);
        setError(
          `Failed to load existing data. Please try again later. ${err.message}`
        );
      } finally {
        setIsLoading(false);
      }
    };
 
    fetchData();
  }, [fetchFieldApiUrl]); // Re-run effect if fetchFieldApiUrl changes
 
  // Effect to focus the input field when editing starts
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);
 
  // Function to handle changes in the input fields of new rows
  const handleNewRowChange = (e, rowIndex, fieldName) => {
    const { value } = e.target;
    setNewRows((prevRows) =>
      prevRows.map((row, index) =>
        index === rowIndex ? { ...row, [fieldName]: value } : row
      )
    );
  };
 
  // Function to add a new blank row to the table for user input
  const addNewBlankRow = () => {
    // Prepare the new row object
    let newRow = { id: `new-${Date.now()}` };

    // For Functional Areas: auto-fill module name if selected
    if (collectionName === "functional_areas" && selectedModuleId) {
      // Find the selected module name
      const selectedModule = modulesOptions.find(
        (mod) => (mod.moduleId || mod._id) === selectedModuleId
      );
      if (selectedModule) {
        // Try to find the field label for module name
        const moduleNameField = fieldDefinitions.find(
          (f) => f.fieldLabel.toLowerCase().includes("module")
        );
        if (moduleNameField) {
          newRow[moduleNameField.fieldLabel] = selectedModule.moduleName;
        }
      }
    }

    // For Documents: auto-fill module name and functional area if selected
    if (collectionName === "documents") {
      // Module Name
      if (selectedModuleId) {
        const selectedModule = modulesOptions.find(
          (mod) => (mod.moduleId || mod._id) === selectedModuleId
        );
        if (selectedModule) {
          const moduleNameField = fieldDefinitions.find(
            (f) => f.fieldLabel.toLowerCase().includes("module")
          );
          if (moduleNameField) {
            newRow[moduleNameField.fieldLabel] = selectedModule.moduleName;
          }
        }
      }
      // Functional Area
      if (selectedFaName) {
        const faField = fieldDefinitions.find(
          (f) => f.fieldLabel.toLowerCase().includes("functional")
        );
        if (faField) {
          newRow[faField.fieldLabel] = selectedFaName;
        }
      }
    }

    setNewRows((prevRows) => [...prevRows, newRow]);
  };
 
  // --- Inline Editing Handlers (Cell-level) ---
  const handleDoubleClickCell = (id, fieldLabel, currentValue, isUpdatable) => {
    if (isUpdatable) {
      setEditingCell({ id, fieldLabel, originalValue: currentValue });
      setEditingValue(currentValue);
    }
  };
 
  const handleEditChange = (e) => {
    setEditingValue(e.target.value);
  };
 
  const handleSaveEdit = async () => {
    if (!editingCell || isSubmitting) return;
    console.log("editingell", editingCell);
 
    const { id, fieldLabel, originalValue } = editingCell;
 
    // Check if the value has actually changed
    if (editingValue === originalValue) {
      setEditingCell(null); // Exit editing mode
      setEditingValue(""); // Clear editing value
      return; // No need to save if no change
    }
 
    setIsSubmitting(true);
    setError("");
 
    try {
      // Find the original record's _id for the API call
      const originalRecord = tableData.find((row) => row.id === id);
      if (!originalRecord || !originalRecord._id) {
        throw new Error("Original record or its ID not found for update.");
      }
 
      const updatePayload = {
        [fieldLabel]: editingValue,
      };
      console.log("ipdatablepayload", updatePayload);
      const url = `${updateApiUrl}/${originalRecord._id}`;
      const response = await axios.put(url, updatePayload);
      console.log("Update API response (cell edit):", response.data);
 
      // Update the tableData state with the new value
      setTableData((prevData) =>
        prevData.map((row) =>
          row.id === id ? { ...row, [fieldLabel]: editingValue } : row
        )
      );
 
      setEditingCell(null); // Exit editing mode
      setEditingValue(""); // Clear editing value
    } catch (apiError) {
      console.error("Error updating data:", apiError);
      setError(
        `Update failed: ${apiError.response?.data?.message || apiError.message}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };
 
  const handleCancelEdit = () => {
    setEditingCell(null); // Exit editing mode without saving
    setEditingValue(""); // Clear editing value
    setError(""); // Clear any related error
  };
 
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent new line in text field/form submission
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };
 
  // --- Submission Logic for NEW data ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(""); // Clear previous errors
 
    const newRowsToSubmit = [];
    // Get field labels that are both displayable and updatable for validation
    const updatableDisplayFieldLabels = fieldDefinitions
      .filter((f) => f.displayFlag === "Y" && f.updatebleFlag === "Y")
      .map((f) => f.fieldLabel);
 
    // Validate and collect only the filled newRows
    for (let i = 0; i < newRows.length; i++) {
      const row = newRows[i];
      let isEmptyRow = true;
      const rowData = {};
 
      fieldDefinitions.forEach((fieldDef) => {
        if (fieldDef.displayFlag === "Y") {
          rowData[fieldDef.fieldLabel] = row[fieldDef.fieldLabel];
 
          if (
            row[fieldDef.fieldLabel] &&
            String(row[fieldDef.fieldLabel]).trim() !== ""
          ) {
            isEmptyRow = false;
          }
        }
      });
 
      if (!isEmptyRow) {
        for (const fieldLabel of updatableDisplayFieldLabels) {
          if (!row[fieldLabel] || String(row[fieldLabel]).trim() === "") {
            setError(
              `Please fill all required (updatable) fields in new row ${
                tableData.length + i + 1
              }.`
            );
            setIsSubmitting(false);
            return;
          }
        }
        newRowsToSubmit.push(rowData);
      }
    }
 
    // Check if there's any data to submit
    if (newRowsToSubmit.length === 0) {
      setError(
        "No new data to submit. Please add some data in the blank rows."
      );
      setIsSubmitting(false);
      return;
    }
 
    console.log("Submitting new data:", newRowsToSubmit);
 
    try {
      const response = await axios.post(postApiUrl, newRowsToSubmit);
      console.log("API response (new data):", response.data);
 
      setNewRows([]);
      const updatedDataResponse = await axios.get(fetchActualData);
      const updatedDisplayFieldLabels = fieldDefinitions
        .filter((f) => f.displayFlag === "Y")
        .map((f) => f.fieldLabel);
      const updatedProcessedData = updatedDataResponse.data.map((item) => {
        const newItem = {};
        newItem._id = item._id;
        updatedDisplayFieldLabels.forEach((fieldLabel) => {
          newItem[fieldLabel] = item[fieldLabel];
        });
        return {
          ...newItem,
          id: item._id || `new-${Date.now() + Math.random()}`,
        };
      });
      setTableData(updatedProcessedData);
    } catch (apiError) {
      console.error("Error submitting new data:", apiError);
      setError(
        `Submission failed: ${
          apiError.response?.data?.message || apiError.message
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };
 
  useEffect(() => {
    if (collectionName === "functional_areas") {
      fetch("http://localhost:5000/api/modules")
        .then((res) => res.json())
 
        .then((data) => setModulesOptions(data))
 
        .catch(() => setModulesOptions([]));
    }
  }, [collectionName]);
 
  // Fetch modules options if collectionName === 'document'
 
  useEffect(() => {
    if (collectionName === "documents") {
      fetch("http://localhost:5000/api/modules")
        .then((res) => res.json())
 
        .then((data) => setModulesOptions(data))
 
        .catch(() => setModulesOptions([]));
    }
  }, [collectionName]);
 
  // Fetch function_area options for selected module (second dropdown)
 
  useEffect(() => {
    if (collectionName === "documents" && selectedModuleId) {
      fetch(`http://localhost:5000/api/functional_area/${selectedModuleId}`)
        .then((res) => res.json())
 
        .then((data) => setSecondDropdownOptions(data))
 
        .catch(() => setSecondDropdownOptions([]));
    } else {
      setSecondDropdownOptions([]);
    }
  }, [collectionName, selectedModuleId]);
 
  const renderTable = () => (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">
          Existing {title.split(" ")[1] || "Records"}
        </Typography>
        <Button variant="contained" onClick={addNewBlankRow}>
          Add Row
        </Button>
      </Box>
 
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
 
      <TableContainer
        component={Paper}
        sx={{
          mt: 2,
          border: "2px solid #000",
          borderRadius: 1,
          maxHeight: "70vh",
          overflow: "auto",
          "& .MuiTableCell-root": {
            border: "1px solid #000",
            padding: "8px",
            height: "52px",
            textAlign: "center",
          },
          "& .MuiTableCell-head": {
            backgroundColor: "#f5f5f5",
            fontWeight: "bold",
            position: "sticky",
            top: 0,
            zIndex: 1,
          },
          "& .MuiInputBase-root": {
            border: "none",
            "& fieldset": {
              border: "none",
            },
            "&:hover fieldset": {
              border: "none",
            },
            "&.Mui-focused fieldset": {
              border: "none",
            },
            backgroundColor: "transparent",
          },
        }}
      >
        <Table sx={{ minWidth: 650 }} aria-label={`${title} grid`} stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: "60px" }}>S.No</TableCell>
              {fieldDefinitions.map((fieldDef) => (
                <TableCell key={fieldDef.fieldLabel}>
                  {capitalize(
                    fieldDef.fieldLabel.replace(/([A-Z])/g, " $1").trim()
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={fieldDefinitions.length + 1}
                  sx={{ textAlign: "center" }}
                >
                  <CircularProgress size={24} />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Loading existing data...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {/* Display Existing Data (Double-Click Editable) */}
                {tableData.map((row, index) => (
                  <TableRow key={row.id}>
                    <TableCell>{index + 1}</TableCell>
                    {fieldDefinitions.map((fieldDef) => {
                      const fieldLabel = fieldDef.fieldLabel;
                      const isUpdatable = fieldDef.updatebleFlag === "Y";
                      const isEditingThisCell =
                        editingCell &&
                        editingCell.id === row.id &&
                        editingCell.fieldLabel === fieldLabel;
 
                      return (
                        <TableCell
                          key={`${row.id}-${fieldLabel}`}
                          sx={{
                            backgroundColor: isUpdatable
                              ? "inherit"
                              : "#f0f0f0",
                            color: isUpdatable ? "inherit" : "#888",
                            cursor: isUpdatable ? "pointer" : "default", // Indicate editable cells
                          }}
                          onDoubleClick={() =>
                            handleDoubleClickCell(
                              row.id,
                              fieldLabel,
                              row[fieldLabel],
                              isUpdatable
                            )
                          }
                        >
                          {isEditingThisCell ? (
                            <TextField
                              inputRef={inputRef} // Attach ref for auto-focus
                              value={editingValue}
                              onChange={handleEditChange}
                              onBlur={handleSaveEdit} // Save on blur
                              onKeyDown={handleKeyDown} // Save on Enter, Cancel on Escape
                              size="small"
                              fullWidth
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  border: "none",
                                  borderRadius: "4px",
                                  "&.Mui-focused fieldset": {
                                    borderColor: "none",
                                  },
                                  "&:hover fieldset": { borderColor: "none" },
                                },
                                "& fieldset": { border: "none" },
                              }}
                            />
                          ) : (
                            row[fieldLabel]
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
 
                {/* Input Fields for New Rows */}
                {newRows.map((row, rowIndex) => (
                  <TableRow key={row.id}>
                    <TableCell>{tableData.length + rowIndex + 1}</TableCell>
                    {fieldDefinitions.map((fieldDef) => {
                      const fieldLabel = fieldDef.fieldLabel;
                      const isUpdatable = fieldDef.updatebleFlag === "Y";
                      // Determine if this field should be auto-filled and non-editable
                      let isAutoFilled = false;
                      let autoFilledValue = "";
                      if (collectionName === "functional_areas" && fieldLabel.toLowerCase().includes("module")) {
                        if (row[fieldLabel]) {
                          isAutoFilled = true;
                          autoFilledValue = row[fieldLabel];
                        }
                      }
                      if (collectionName === "documents") {
                        if (fieldLabel.toLowerCase().includes("module") && row[fieldLabel]) {
                          isAutoFilled = true;
                          autoFilledValue = row[fieldLabel];
                        }
                        if (fieldLabel.toLowerCase().includes("functional") && row[fieldLabel]) {
                          isAutoFilled = true;
                          autoFilledValue = row[fieldLabel];
                        }
                      }
                      return (
                        <TableCell
                          key={`${row.id}-${fieldLabel}-input`}
                          sx={{
                            backgroundColor: isUpdatable ? "inherit" : "#f0f0f0",
                          }}
                        >
                          {isAutoFilled ? (
                            <TextField
                              name={fieldLabel}
                              value={autoFilledValue}
                              size="small"
                              fullWidth
                              disabled
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  border: "none",
                                  borderRadius: "4px",
                                  "&.Mui-focused fieldset": {
                                    borderColor: "none",
                                  },
                                  "&:hover fieldset": { borderColor: "none" },
                                },
                                "& fieldset": { border: "none" },
                                "& .Mui-disabled": {
                                  "-webkit-text-fill-color": "rgba(0, 0, 0, 0.87)",
                                  opacity: 1,
                                },
                              }}
                            />
                          ) : (
                            <TextField
                              name={fieldLabel}
                              value={row[fieldLabel] || ""}
                              onChange={(e) =>
                                handleNewRowChange(e, rowIndex, fieldLabel)
                              }
                              size="small"
                              fullWidth
                              required={isUpdatable}
                              disabled={!isUpdatable}
                              placeholder={`Enter ${capitalize(
                                fieldLabel.replace(/([A-Z])/g, " $1").trim()
                              )}`}
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  border: "none",
                                  borderRadius: "4px",
                                  "&.Mui-focused fieldset": {
                                    borderColor: "none",
                                  },
                                  "&:hover fieldset": { borderColor: "none" },
                                },
                                "& fieldset": { border: "none" },
                                "& .Mui-disabled": {
                                  "-webkit-text-fill-color": "rgba(0, 0, 0, 0.87)",
                                  opacity: 1,
                                },
                              }}
                            />
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
 
                {/* Message for empty state */}
                {tableData.length === 0 &&
                newRows.length === 0 &&
                !isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={fieldDefinitions.length + 1}
                      sx={{ textAlign: "center" }}
                    >
                      No existing records found. Click "Add New Row" to start
                      adding new data.
                    </TableCell>
                  </TableRow>
                ) : null}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>
 
      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
        <Typography variant="body2" color="text.secondary">
          Total Records: {tableData.length + newRows.length}
        </Typography>
      </Box>
    </Paper>
  );
 
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {/* Dropdowns based on collectionName */}
 
      {collectionName === "functional_areas" && (
        <Box sx={{ mt: 2, mb: 3, width: "300px" }}>
          <FormControl fullWidth>
            <InputLabel id="module-select-label">Select Module</InputLabel>
 
            <Select
              labelId="module-select-label"
              id="module-select"
              value={selectedModuleId}
              label="Select Module"
              onChange={(e) => {
                setSelectedModuleId(e.target.value);
 
                setSelectedFaName(""); // Reset second dropdown
              }}
              MenuProps={{ sx: { zIndex: 9999 } }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
 
              {modulesOptions.map((mod) => (
                <MenuItem
                  key={mod.moduleId || mod._id || mod.moduleName}
                  value={mod.moduleId || mod._id}
                >
                  {mod.moduleName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
 
      {collectionName === "documents" && (
        <Box sx={{ display: "flex", gap: 2, mt: 2, mb: 3 }}>
          <Box sx={{ width: "300px" }}>
            <FormControl fullWidth>
              <InputLabel id="module-select-label">Select Module</InputLabel>
 
              <Select
                labelId="module-select-label"
                id="module-select"
                value={selectedModuleId}
                label="Select Module"
                onChange={(e) => {
                  setSelectedModuleId(e.target.value);
 
                  setSelectedFaName(""); // Reset second dropdown
                }}
                MenuProps={{ sx: { zIndex: 9999 } }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
 
                {modulesOptions.map((mod) => (
                  <MenuItem
                    key={mod.moduleId || mod._id || mod.moduleName}
                    value={mod.moduleId || mod._id}
                  >
                    {mod.moduleName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
 
          <Box sx={{ width: "300px" }}>
            <FormControl fullWidth>
              <InputLabel id="fa-select-label-2">
                Select Functional Area
              </InputLabel>
 
              <Select
                labelId="fa-select-label-2"
                id="fa-select-2"
                value={selectedFaName}
                label="Select Functional Area"
                onChange={(e) => setSelectedFaName(e.target.value)}
                MenuProps={{ sx: { zIndex: 9999 } }}
                disabled={!selectedModuleId}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
 
                {secondDropdownOptions.map((fa) => (
                  <MenuItem
                    key={fa.faId || fa._id || fa.faName}
                    value={fa.faName}
                  >
                    {fa.faName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      )}
      {renderTable()}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Submit"
          )}
        </Button>
      </Box>
    </Box>
  );
};
 
export default DataGridTemplate;