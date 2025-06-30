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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

const DocumentTemplate = () => {
  const [documentFields, setDocumentFields] = useState([]); 
  const [newRows, setNewRows] = useState([
    {
      documentName: "",
      seqNumber: "",
      fieldLabel: "",
      fieldType: "",
      fieldDescription: "",
      displayFlag: "",
      updatebleFlag: "", // Changed from updateFlag
      foreignDocument: "",
      displayList: "",
      defaultValue: "Default",
      id: Date.now(),
    },
  ]);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [docNames, setDocNames] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState("");
 
  // Function to fetch existing document fields (after submission)
  const fetchDocumentFields = async (docName) => {
    if (!docName) {
      setDocumentFields([]); // Clear fields if no document is selected
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/api/get_document/${docName}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setDocumentFields(data);
    } catch (error) {
      console.error("Error fetching document fields:", error);
      setError("Failed to load existing document fields.");
      setDocumentFields([]);
    }
  };

  useEffect(() => {
    const fetchDocumentNames = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/document_list");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const names = data.map((item) => item.docName);
        setDocNames(names);
      } catch (error) {
        console.error("Error fetching document list:", error);
        setError("Failed to fetch document names.");
      }
    };

    fetchDocumentNames();
  }, []);

  // Fetch document fields whenever selectedDocument changes
  useEffect(() => {
    fetchDocumentFields(selectedDocument);
  }, [selectedDocument]);

  const handleNewRowChange = (e, rowIndex) => {
    const { name, value } = e.target;
    setNewRows((prevRows) =>
      prevRows.map((row, index) =>
        index === rowIndex ? { ...row, [name]: value } : row
      )
    );
  };

  const addNewBlankRow = () => {
    setNewRows((prevRows) => [
      ...prevRows,
      {
        documentName: selectedDocument,
        seqNumber: "",
        fieldLabel: "",
        fieldType: "",
        fieldDescription: "",
        displayFlag: "",
        updatebleFlag: "", // Changed from updateFlag
        foreignDocument: "",
        displayList: "",

        defaultValue: "Default",
        id: Date.now(),
      },
    ]);
  };

  const handleSubmit = async () => {
    const requiredFields = [
      "seqNumber",
      "fieldLabel",
      "fieldType",
      "fieldDescription",
      "displayFlag",
      "updatebleFlag", // Changed from updateFlag
    ];
    const validNewRows = [];
    const invalidRows = [];

    newRows.forEach((row, index) => {
      const isRowEffectivelyEmpty =
        requiredFields.every(
          (field) => !row[field] || row[field].toString().trim() === ""
        ) && row.documentName === "";

      if (isRowEffectivelyEmpty) {
        return;
      }

      const allFilled =
        requiredFields.every(
          (field) => row[field] && row[field].toString().trim() !== ""
        ) &&
        row.documentName &&
        row.documentName.toString().trim() !== "";

      if (allFilled) {
        validNewRows.push(row);
      } else {
        invalidRows.push(index + 1);
      }
    });

    if (invalidRows.length > 0) {
      setError(
        `Please fill all required fields in new row(s): ${invalidRows.join(
          ", "
        )}.`
      );
      setSuccessMessage("");
      return;
    }

    if (validNewRows.length === 0) {
      setError("No new valid rows to submit. Please fill the fields to add.");
      setSuccessMessage("");
      return;
    }

    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/save_document_template",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validNewRows),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Submission successful:", result);

      setSuccessMessage("Document fields submitted successfully!");
      setNewRows([
        {
          documentName: selectedDocument,
          seqNumber: "",
          fieldLabel: "",
          fieldType: "",
          fieldDescription: "",
          displayFlag: "",
          updatebleFlag: "", // Changed from updateFlag
          foreignDocument: "",
          displayList: "",
          defaultValue: "Default",
          id: Date.now(),
        },
      ]);
      fetchDocumentFields(selectedDocument);
    } catch (apiError) {
      console.error("Error submitting document fields:", apiError);
      setError("Failed to submit document fields. Please try again.");
      setSuccessMessage("");
    }
  };

  const handleDocumentSelectChange = (e) => {
    const value = e.target.value;
    setSelectedDocument(value);
    setNewRows([
      {
        documentName: value,
        seqNumber: "",
        fieldLabel: "",
        fieldType: "",
        fieldDescription: "",
        displayFlag: "",
        updatebleFlag: "", // Changed from updateFlag
        foreignDocument: "",
        displayList: "",
        defaultValue: "Default",
        id: Date.now(),
      },
    ]);
    fetchDocumentFields(value);
  };

  // Define the headers and corresponding field keys to display in order
  const tableColumns = [
    { header: "S.No", key: null }, // S.No is special, handled by index
    { header: "Document Name", key: "documentName" },
    { header: "Seq Number", key: "seqNumber" },
    { header: "Field Label", key: "fieldLabel" },
    { header: "Field Type", key: "fieldType" },
    { header: "Field Description", key: "fieldDescription" },
    { header: "Display Flag", key: "displayFlag" },
    { header: "Updateable Flag", key: "updatebleFlag" }, // Changed header and key
    { header: "Foreign Document", key: "foreignDocument" },
    { header: "Display List", key: "displayList" },
    { header: "Default Value", key: "defaultValue" },
  ];

  const renderDocumentFieldsTable = () => (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Existing Document Fields</Typography>
        <Button variant="contained" onClick={addNewBlankRow}>
          Add New Blank Row
        </Button>
      </Box>

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
            "& fieldset": {
              border: "none",
            },
            backgroundColor: "transparent",
          },
        }}
      >
        <Table
          sx={{ minWidth: 650 }}
          aria-label="document fields grid"
          stickyHeader
        >
          <TableHead>
            <TableRow>
              {tableColumns.map((col, index) => (
                <TableCell
                  key={index}
                  sx={{ width: col.key === null ? "60px" : undefined }}
                >
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Render existing document fields */}
            {documentFields.map((field, index) => (
              <TableRow key={`existing-${field.id || index}`}>
                <TableCell>{index + 1}</TableCell>
                {/* Dynamically render cells based on tableColumns */}
                {tableColumns
                  .filter((col) => col.key !== null) // Exclude S.No as it's handled
                  .map((col) => (
                    <TableCell key={`${field.id}-${col.key}`}>
                      {field[col.key]}
                    </TableCell>
                  ))}
              </TableRow>
            ))}

            {/* Render new rows for input */}
            {newRows.map((row, rowIndex) => (
              <TableRow key={`new-${row.id}`}>
                <TableCell>{documentFields.length + rowIndex + 1}</TableCell>
                <TableCell>
                  <TextField
                    name="documentName"
                    value={row.documentName}
                    onChange={(e) => handleNewRowChange(e, rowIndex)}
                    size="small"
                    fullWidth
                    required
                    InputProps={{ readOnly: true }} // Make it read-only
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    name="seqNumber"
                    value={row.seqNumber}
                    onChange={(e) => handleNewRowChange(e, rowIndex)}
                    size="small"
                    fullWidth
                    required
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    name="fieldLabel"
                    value={row.fieldLabel}
                    onChange={(e) => handleNewRowChange(e, rowIndex)}
                    size="small"
                    fullWidth
                    required
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    name="fieldType"
                    value={row.fieldType}
                    onChange={(e) => handleNewRowChange(e, rowIndex)}
                    size="small"
                    fullWidth
                    required
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    name="fieldDescription"
                    value={row.fieldDescription}
                    onChange={(e) => handleNewRowChange(e, rowIndex)}
                    size="small"
                    fullWidth
                    required
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    name="displayFlag"
                    value={row.displayFlag}
                    onChange={(e) => handleNewRowChange(e, rowIndex)}
                    size="small"
                    fullWidth
                    required
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    name="updatebleFlag" // Changed name here
                    value={row.updatebleFlag}
                    onChange={(e) => handleNewRowChange(e, rowIndex)}
                    size="small"
                    fullWidth
                    required
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    name="foreignDocument"
                    value={row.foreignDocument}
                    onChange={(e) => handleNewRowChange(e, rowIndex)}
                    size="small"
                    fullWidth
                    required
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    name="displayList"
                    value={row.displayList}
                    onChange={(e) => handleNewRowChange(e, rowIndex)}
                    size="small"
                    fullWidth
                    required
                  />
                </TableCell>

                <TableCell>
                  <TextField
                    name="defaultValue"
                    value={row.defaultValue}
                    onChange={(e) => handleNewRowChange(e, rowIndex)}
                    size="small"
                    fullWidth
                    required
                  />

                </TableCell>
              </TableRow>
            ))}

            {error && (
              <TableRow>
                <TableCell colSpan={tableColumns.length}>
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {error}
                  </Alert>
                </TableCell>
              </TableRow>
            )}
            {successMessage && (
              <TableRow>
                <TableCell colSpan={tableColumns.length}>
                  <Alert severity="success" sx={{ mt: 1 }}>
                    {successMessage}
                  </Alert>
                </TableCell>
              </TableRow>
            )}

            {documentFields.length === 0 && newRows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  sx={{ textAlign: "center" }}
                >
                  No document fields added yet. Click "Add New Blank Row" to
                  start.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{
          mt: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Button variant="contained" onClick={handleSubmit}>
          Submit
        </Button>
      </Box>
      <Box sx={{ mt: 1, display: "flex", justifyContent: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Total Fields (Existing + New):{" "}
          {documentFields.length + newRows.length}
        </Typography>
      </Box>
    </Paper>
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Manage Document Fields
      </Typography>

      <Box sx={{ mb: 3, width: "300px" }}>
        <FormControl fullWidth>
          <InputLabel id="document-select-label">Select Document</InputLabel>
          <Select
            labelId="document-select-label"
            id="document-select"
            value={selectedDocument}
            label="Select Document"
            onChange={handleDocumentSelectChange}
            MenuProps={{ sx: { zIndex: 9999 } }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem> 
            {docNames.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {renderDocumentFieldsTable()}
    </Box>
  );
};

export default DocumentTemplate;
