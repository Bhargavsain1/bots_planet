import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import axios from "axios";

// Helper function to capitalize the first letter of a string
const capitalize = (s) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// Fields to exclude from display and submission (kept for consistency, though now mostly handled by displayFlag)
const EXCLUDE_FIELDS = [
  "created_at",
  "created_by",
  "updated_at",
  "updated_by",
  "_id",
  "__v",
];

const DataGridTemplate = ({
  title, // Title for the page (e.g., "Manage Users", "Manage Products")
  fetchApiUrl, // API endpoint to fetch existing data and field definitions
  postApiUrl, // API endpoint to post new data
  initialNewRowData, // An object defining the initial structure of a new row (e.g., { name: "", email: "" })
}) => {
  const [tableData, setTableData] = useState([]); // State for existing data (fetched from API)
  const [newRows, setNewRows] = useState([]); // State for new blank input rows
  const [error, setError] = useState(""); // State for displaying validation or API errors
  const [isLoading, setIsLoading] = useState(true); // State for loading indicator while fetching existing data
  const [isSubmitting, setIsSubmitting] = useState(false); // State for loading indicator while submitting new data
  // State to store the field definitions fetched from the API
  const [fieldDefinitions, setFieldDefinitions] = useState([]);

  // --- Effect to fetch existing data and field definitions on component mount ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch field definitions first
        const fieldDefinitionsResponse = await axios.get(fetchApiUrl);
        // Ensure displayFlag comparison matches your API: 'yes' vs 'Y'
        const fetchedFieldDefinitions = fieldDefinitionsResponse.data.filter(
          (field) => field.displayFlag === "Y"
        );
        setFieldDefinitions(fetchedFieldDefinitions);

        // Determine which fields to display based on displayFlag
        const displayFieldLabels = fetchedFieldDefinitions.map(
          (field) => field.fieldLabel
        );

        // Now fetch the actual data
        const dataResponse = await axios.get(
          "http://localhost:5000/api/modules"
        ); // Assuming this is your actual data endpoint
        // Filter out fields that shouldn't be displayed from the existing data
        const processedTableData = dataResponse.data.map((item) => {
          const newItem = {};
          displayFieldLabels.forEach((fieldLabel) => {
            newItem[fieldLabel] = item[fieldLabel];
          });
          // Add a unique ID for React key prop, if _id exists use it, otherwise generate one
          return { ...newItem, id: item._id || Date.now() + Math.random() };
        });
        setTableData(processedTableData);
        setError(""); // Clear any previous errors
      } catch (err) {
        console.error(`Error fetching data from ${fetchApiUrl}:`, err);
        setError(`Failed to load existing data. Please try again later.`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fetchApiUrl]); // Re-run effect if fetchApiUrl changes

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
    setNewRows((prevRows) => [
      ...prevRows,
      { ...initialNewRowData, id: Date.now() }, // Add unique ID
    ]);
  };

  // --- Submission Logic for NEW data ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(""); // Clear previous errors

    const newRowsToSubmit = [];
    // Get field labels that are both displayable and updatable for validation
    const updatableDisplayFieldLabels = fieldDefinitions
      .filter(
        (f) => f.displayFlag?.toLowerCase() === "yes" && f.updatebleFlag === "Y"
      )
      .map((f) => f.fieldLabel);

    // Validate and collect only the filled newRows
    for (let i = 0; i < newRows.length; i++) {
      const row = newRows[i];
      let isEmptyRow = true;
      const rowData = {};

      // Populate rowData with all displayable fields, even if not updatable
      fieldDefinitions.forEach((fieldDef) => {
        if (fieldDef.displayFlag?.toLowerCase() === "yes") {
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
        // Basic validation: ensure all displayable AND updatable fields for a new row have content
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

      alert("New data submitted successfully!");

      // Clear newRows and re-fetch existing data to show updates
      setNewRows([]);
      // Re-fetch existing data to ensure the table is up-to-date
      const updatedDataResponse = await axios.get(
        "http://localhost:5000/api/modules"
      );
      const updatedDisplayFieldLabels = fieldDefinitions
        .filter((f) => f.displayFlag?.toLowerCase() === "yes")
        .map((f) => f.fieldLabel); // Get current display fields
      const updatedProcessedData = updatedDataResponse.data.map((item) => {
        const newItem = {};
        updatedDisplayFieldLabels.forEach((fieldLabel) => {
          newItem[fieldLabel] = item[fieldLabel];
        });
        return { ...newItem, id: item._id || Date.now() + Math.random() };
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
          Add New Row
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
                {/* Display Existing Data (Read-Only) */}
                {tableData.map((row, index) => (
                  <TableRow key={row.id}>
                    <TableCell>{index + 1}</TableCell>
                    {fieldDefinitions.map((fieldDef) => {
                      const fieldLabel = fieldDef.fieldLabel;
                      // Use updatebleFlag as it's in your provided JSON
                      const isUpdatable = fieldDef.updatebleFlag === "Y";

                      return (
                        <TableCell
                          key={`${row.id}-${fieldLabel}`}
                          sx={{
                            // Apply grey background ONLY if not updatable
                            backgroundColor: isUpdatable
                              ? "inherit"
                              : "#f0f0f0",
                            color: isUpdatable ? "inherit" : "#888",
                          }}
                        >
                          {/* Existing data cells are currently read-only in this template.
                              If you need to edit existing data, you'd implement
                              an `onBlur` or `onChange` handler here to dispatch updates to your API.
                          */}
                          {row[fieldLabel]}
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
                      // Use updatebleFlag
                      const isUpdatable = fieldDef.updatebleFlag === "Y";

                      return (
                        <TableCell
                          key={`${row.id}-${fieldLabel}-input`}
                          sx={{
                            // Apply grey background ONLY if not updatable
                            backgroundColor: isUpdatable
                              ? "inherit"
                              : "#f0f0f0",
                          }}
                        >
                          <TextField
                            name={fieldLabel}
                            value={row[fieldLabel] || ""}
                            onChange={(e) =>
                              handleNewRowChange(e, rowIndex, fieldLabel)
                            }
                            size="small"
                            fullWidth
                            required={isUpdatable} // Make required only if updatable
                            disabled={!isUpdatable} // Disable if not updatable
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
                                // Ensure text color is visible when disabled
                                "-webkit-text-fill-color":
                                  "rgba(0, 0, 0, 0.87)",
                                opacity: 1, // Prevent further fading by browser for disabled inputs
                              },
                            }}
                          />
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
