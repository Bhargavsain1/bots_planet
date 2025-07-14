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
import Autocomplete from "@mui/material/Autocomplete";

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
  docName,
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
  const [modulesOptions, setModulesOptions] = useState([]); // For modules dropdown
  const [secondDropdownOptions, setSecondDropdownOptions] = useState([]); // For function_area under module
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [selectedFaName, setSelectedFaName] = useState("");

  const [filteredTableData, setFilteredTableData] = useState([]); // Add new state to store filtered table data
  const [dropDown, setDropDown] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError("");

        // Fetch field definitions first
        const fieldDefinitionsResponse = await axios.get(fetchFieldApiUrl);
        console.log("fieldDefinitionsResponse", fieldDefinitionsResponse);
        const dropDownCount = fieldDefinitionsResponse.data.filter(
          (field) => field.foreignDocument && field.displayList
        );
        console.log("count", dropDownCount);
        setDropDown(dropDownCount);
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
          const newItem = {};
          newItem._id = item._id;
          displayFieldLabels.forEach((fieldLabel) => {
            newItem[fieldLabel] = item[fieldLabel];
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
  }, [fetchFieldApiUrl]);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  const handleNewRowChange = (e, rowIndex, fieldName) => {
    const { value } = e.target;
    setNewRows((prevRows) =>
      prevRows.map((row, index) =>
        index === rowIndex ? { ...row, [fieldName]: value } : row
      )
    );
  };

  const addNewBlankRow = () => {
    let newRow = { id: `new-${Date.now()}` };

    // Populate newRow with default values from fieldDefinitions
    fieldDefinitions.forEach((fieldDef) => {
      if (
        fieldDef.defaultValue !== undefined &&
        fieldDef.defaultValue !== null
      ) {
        newRow[fieldDef.fieldLabel] = fieldDef.defaultValue;
      } else {
        newRow[fieldDef.fieldLabel] = ""; // Initialize with empty string
      }
    });

    if (collectionName === "functionalareas" && selectedModuleId) {
      const selectedModule = modulesOptions.find(
        (mod) => mod._id === selectedModuleId
      );
      if (selectedModule) {
        const moduleNameField = fieldDefinitions.find((f) =>
          f.fieldLabel.toLowerCase().includes("module")
        );
        if (moduleNameField) {
          newRow[moduleNameField.fieldLabel] = selectedModule.moduleName;
        }
      }
    }

    if (collectionName === "documents") {
      if (selectedModuleId) {
        const selectedModule = modulesOptions.find(
          (mod) => mod._id === selectedModuleId
        );
        if (selectedModule) {
          const moduleNameField = fieldDefinitions.find((f) =>
            f.fieldLabel.toLowerCase().includes("module")
          );
          if (moduleNameField) {
            newRow[moduleNameField.fieldLabel] = selectedModule.moduleName;
          }
        }
      }
      // Functional Area
      if (selectedFaName) {
        const faField = fieldDefinitions.find((f) =>
          f.fieldLabel.toLowerCase().includes("functional")
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

    if (editingValue === originalValue) {
      setEditingCell(null);
      setEditingValue("");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const originalRecord = tableData.find((row) => row.id === id);
      if (!originalRecord || !originalRecord._id) {
        throw new Error("Original record or its ID not found for update.");
      }

      const updatePayload = {
        data: { [fieldLabel]: editingValue },
        docName: docName,
      };
      console.log("updatePayload", updatePayload);

      const url = `${updateApiUrl}/${originalRecord._id}`;
      const response = await axios.put(url, updatePayload);

      setTableData((prevData) =>
        prevData.map((row) =>
          row.id === id ? { ...row, [fieldLabel]: editingValue } : row
        )
      );

      setEditingCell(null);
      setEditingValue("");
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
    setEditingCell(null);
    setEditingValue("");
    setError("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
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
      .filter((f) => f.displayFlag === "Y" && f.updatableFlag === "Y")
      .map((f) => f.fieldLabel);

    // Validate and collect only the filled newRows
    for (let i = 0; i < newRows.length; i++) {
      const row = newRows[i];
      let isEmptyRow = true;
      const rowData = {};

      fieldDefinitions.forEach((fieldDef) => {
        if (fieldDef.displayFlag === "Y") {
          // Use the value from the row, or the default value if the row's value is empty
          // Check if the user has modified the field (i.e., it's not the default value and not empty)
          const userEnteredValue = row[fieldDef.fieldLabel];
          const hasUserEnteredData =
            userEnteredValue !== undefined &&
            userEnteredValue !== null &&
            String(userEnteredValue).trim() !== "" &&
            String(userEnteredValue) !== String(fieldDef.defaultValue);

          rowData[fieldDef.fieldLabel] = hasUserEnteredData
            ? userEnteredValue
            : fieldDef.defaultValue !== undefined
            ? fieldDef.defaultValue
            : ""; // Fallback to empty string if no default

          if (
            rowData[fieldDef.fieldLabel] &&
            String(rowData[fieldDef.fieldLabel]).trim() !== ""
          ) {
            isEmptyRow = false;
          }
        }
      });

      if (!isEmptyRow) {
        for (const fieldLabel of updatableDisplayFieldLabels) {
          // If a field is required (updatable) and still empty after considering default values,
          // then show an error.
          if (
            !rowData[fieldLabel] ||
            String(rowData[fieldLabel]).trim() === ""
          ) {
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
    let data = {
      requestBody: newRowsToSubmit,
      docName: docName,
    };
    console.log("collectionName", data);
    try {
      const response = await axios.post(postApiUrl, data);

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
    if (collectionName === "functionalareas") {
      fetch("http://localhost:5000/api/modules")
        .then((res) => res.json())
        .then((data) => setModulesOptions(data))
        .catch(() => setModulesOptions([]));
    }
  }, [collectionName]);

  useEffect(() => {
    if (collectionName === "documents") {
      fetch("http://localhost:5000/api/modules")
        .then((res) => res.json())
        .then((data) => setModulesOptions(data))
        .catch(() => setModulesOptions([]));
    }
  }, [collectionName]);

  useEffect(() => {
    if (collectionName === "documents" && selectedModuleId) {
      fetch(`http://localhost:5000/api/functionalarea/${selectedModuleId}`)
        .then((res) => res.json())
        .then((data) => setSecondDropdownOptions(data))
        .catch(() => setSecondDropdownOptions([]));
    } else {
      setSecondDropdownOptions([]);
    }
  }, [collectionName, selectedModuleId]);

  useEffect(() => {
    if (collectionName === "functionalareas") {
      if (selectedModuleId) {
        setFilteredTableData(
          tableData.filter((row) => {
            const selectedModule = modulesOptions.find(
              (mod) => mod._id === selectedModuleId
            );

            if (!selectedModule) return false;

            return (
              row._id === selectedModuleId ||
              row.ModuleName === selectedModule.moduleName ||
              row["Module Name"] === selectedModule.moduleName ||
              row.moduleName === selectedModule.moduleName
            );
          })
        );
      } else {
        setFilteredTableData([]); // Show empty table if nothing selected
      }
    } else if (collectionName === "documents") {
      if (selectedModuleId && selectedFaName) {
        setFilteredTableData(
          tableData.filter((row) => {
            const selectedModule = modulesOptions.find(
              (mod) => mod._id === selectedModuleId
            );

            if (!selectedModule) return false;

            return (
              (row.moduleName === selectedModule.moduleName ||
                row["Module Name"] === selectedModule.moduleName ||
                row._id === selectedModuleId) &&
              (row.faName === selectedFaName ||
                row["Functional Area"] === selectedFaName)
            );
          })
        );
      } else {
        setFilteredTableData([]); // Show empty table if nothing selected
      }
    } else {
      setFilteredTableData(tableData);
    }
  }, [
    tableData,
    selectedModuleId,
    selectedFaName,
    collectionName,
    modulesOptions,
  ]);

  const getRowsToDisplay = () => {
    return [...filteredTableData, ...newRows];
  };

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
                {/* Display Existing Data (Double-Click Editable, Only Filtered Rows) */}
                {filteredTableData.map((row, index) => (
                  <TableRow key={row.id}>
                    <TableCell>{index + 1}</TableCell>
                    {fieldDefinitions.map((fieldDef) => {
                      const fieldLabel = fieldDef.fieldLabel;
                      const isUpdatable = fieldDef.updatableFlag === "Y";
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
                    <TableCell>
                      {filteredTableData.length + rowIndex + 1}
                    </TableCell>
                    {fieldDefinitions.map((fieldDef) => {
                      const fieldLabel = fieldDef.fieldLabel;
                      const isUpdatable = fieldDef.updatableFlag === "Y";
                      const isAutoFilled =
                        (collectionName === "functionalareas" &&
                          fieldLabel.toLowerCase().includes("module")) ||
                        (collectionName === "documents" &&
                          (fieldLabel.toLowerCase().includes("module") ||
                            fieldLabel.toLowerCase().includes("functional")));

                      // Check if the current value in the new row is the default value
                      const isDefaultValue =
                        fieldDef.defaultValue !== undefined &&
                        fieldDef.defaultValue !== null &&
                        String(row[fieldLabel] || "") ===
                          String(fieldDef.defaultValue);

                      return (
                        <TableCell
                          key={`${row.id}-${fieldLabel}-input`}
                          sx={{
                            backgroundColor: isUpdatable
                              ? "inherit"
                              : "#f0f0f0",
                          }}
                        >
                          {isAutoFilled ? (
                            <TextField
                              name={fieldLabel}
                              value={row[fieldLabel] || ""} // Display the current row value
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
                                  "-webkit-text-fill-color": isDefaultValue
                                    ? "rgba(0, 0, 0, 0.4)" // Lighter color for disabled default
                                    : "rgba(0, 0, 0, 0.87)", // Standard color for disabled non-default
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
                                // Apply lighter color if it's the default value and not auto-filled
                                "& .MuiInputBase-input": {
                                  color:
                                    isDefaultValue &&
                                    String(row[fieldLabel] || "") ===
                                      String(fieldDef.defaultValue)
                                      ? "rgba(0, 0, 0, 0.4)" // Lighter color for default values
                                      : "inherit", // Standard color
                                },
                                "& .Mui-disabled": {
                                  "-webkit-text-fill-color":
                                    "rgba(0, 0, 0, 0.87)",
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

      {collectionName === "functionalareas" && (
        <Box sx={{ mt: 2, mb: 3, width: "300px" }}>
          <Autocomplete
            options={modulesOptions
              .slice()
              .sort((a, b) =>
                (a.moduleName || "").localeCompare(b.moduleName || "")
              )}
            getOptionLabel={(option) => option.moduleName || ""}
            value={
              modulesOptions.find(
                (mod) => String(mod._id) === String(selectedModuleId)
              ) || null
            }
            onChange={(event, newValue) => {
              setSelectedModuleId(newValue ? newValue._id : "");
              setSelectedFaName("");
            }}
            renderInput={(params) => (
              <TextField {...params} label="Select Module" variant="outlined" />
            )}
            isOptionEqualToValue={(option, value) =>
              String(option._id) === String(value._id)
            }
            clearOnEscape
          />
        </Box>
      )}

      {collectionName === "documents" && (
        <Box sx={{ display: "flex", gap: 2, mt: 2, mb: 3 }}>
          <Box sx={{ width: "300px" }}>
            <Autocomplete
              options={modulesOptions
                .slice()
                .sort((a, b) =>
                  (a.moduleName || "").localeCompare(b.moduleName || "")
                )}
              getOptionLabel={(option) => option.moduleName || ""}
              value={
                modulesOptions.find(
                  (mod) => String(mod._id) === String(selectedModuleId)
                ) || null
              }
              onChange={(event, newValue) => {
                setSelectedModuleId(newValue ? newValue._id : "");
                setSelectedFaName("");
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Module"
                  variant="outlined"
                />
              )}
              isOptionEqualToValue={(option, value) =>
                String(option._id) === String(value._id)
              }
              clearOnEscape
            />
          </Box>

          <Box sx={{ width: "300px" }}>
            <Autocomplete
              options={secondDropdownOptions
                .slice()
                .sort((a, b) => (a.faName || "").localeCompare(b.faName || ""))}
              getOptionLabel={(option) => option.faName || ""}
              value={
                secondDropdownOptions.find(
                  (fa) => String(fa.faName) === String(selectedFaName)
                ) || null
              }
              onChange={(event, newValue) =>
                setSelectedFaName(newValue ? newValue.faName : "")
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Functional Area"
                  variant="outlined"
                />
              )}
              isOptionEqualToValue={(option, value) =>
                String(option.faName) === String(value.faName)
              }
              disabled={!selectedModuleId}
              clearOnEscape
            />
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
