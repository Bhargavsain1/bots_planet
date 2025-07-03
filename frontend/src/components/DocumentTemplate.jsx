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
  Snackbar,
  Alert as MuiAlert,
} from "@mui/material";
import { useSnackbar } from '../context/SnackbarContext';

const DocumentTemplate = ({ pageType = "DocumentTemplate" }) => {
  const [documentFields, setDocumentFields] = useState([]); // This will store data fetched from the backend
  const [newRows, setNewRows] = useState([
    {
      documentName: "",
      seqNumber: "",
      fieldLabel: "",
      fieldType: "",
      fieldDescription: "",
      displayFlag: "",
      updatableFlag: "", // Changed from updateFlag
      foreignDocument: "",
      displayList: "",
      defaultValue: "Default",
      id: Date.now(),
    },
  ]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [docNames, setDocNames] = useState([]);
  const [collectionNames, setCollectionNames] = useState([]);
  const [functionalAreas, setFunctionalAreas] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [secondDropdownOptions, setSecondDropdownOptions] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState("");
  const { showSnackbar } = useSnackbar();
  // const [selectedDocument1, setSelectedDocument1] = useState("");
  const [selectedDocument2, setSelectedDocument2] = useState("");

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const [foreignDocFields, setForeignDocFields] = useState({});

  const fetchDocumentFields = async (docName) => {
    if (!docName) {
      setDocumentFields([]);
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
    const fetchData = async () => {
      setError("");
      try {
        if (pageType === "FunctionalArea") {
          const response = await fetch(
            "http://localhost:5000/api/functional_area"
          );
          if (!response.ok) {
            throw new Error("Failed to fetch functional areas");
          }
          const data = await response.json();
          setFunctionalAreas(data.map((item) => item.faName));
        } else if (pageType === "Document") {
          const [functionalAreasRes, modulesRes] = await Promise.all([
            fetch("http://localhost:5000/api/function_area"),
            fetch("http://localhost:5000/api/modules"),
          ]);
          if (!functionalAreasRes.ok) {
            throw new Error("Failed to fetch functional areas");
          }
          if (!modulesRes.ok) {
            throw new Error("Failed to fetch modules");
          }
          const functionalAreasData = await functionalAreasRes.json();
          const modulesData = await modulesRes.json();
          setFunctionalAreas(functionalAreasData.map((item) => item.faName));
          setModules(modulesData.map((item) => item.moduleName));
        } else if (pageType === "DocumentTemplate") {
          const response = await fetch(
            "http://localhost:5000/api/document_list"
          );
          if (!response.ok) {
            throw new Error("Failed to fetch document list");
          }
          const data = await response.json();
          setDocNames(data.map((item) => item.docName));
          setCollectionNames(data.map((item) => item.collectionName));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(`Failed to fetch data for ${pageType}.`);
        // Clear all data states on error
        setDocNames([]);
        setFunctionalAreas([]);
        setModules([]);
      }
    };

    fetchData();
  }, [pageType]);

  useEffect(() => {
    if (pageType === "Document") {
      fetch("http://localhost:5000/api/modules")
        .then((res) => res.json())
        .then((data) => setModules(data))
        .catch(() => setModules([]));
    }
  }, [pageType]);

  useEffect(() => {
    if (!selectedModuleId) {
      setSecondDropdownOptions([]);
      return;
    }
    fetch(`http://localhost:5000/api/function_area/${selectedModuleId}`)
      .then((res) => res.json())
      .then((data) => setSecondDropdownOptions(data))
      .catch(() => setSecondDropdownOptions([]));
  }, [selectedModuleId]);

  useEffect(() => {
    fetchDocumentFields(selectedDocument);
  }, [selectedDocument]);

  const handleNewRowChange = async (e, rowIndex) => {
    const { name, value } = e.target;
    setNewRows((prevRows) =>
      prevRows.map((row, index) =>
        index === rowIndex ? { ...row, [name]: value } : row
      )
    );

    if (name === "foreignDocument") {
      console.log("foreign document ", value, e.target.value);
      if (value) {
        try {
          const response = await fetch(
            `http://localhost:5000/api/get_document_by_collection/${value}`
          );
          if (!response.ok) throw new Error("Failed to fetch fields");
          const data = await response.json();
          const fieldNames = data.map((field) => field.fieldLabel);
          setForeignDocFields((prev) => ({
            ...prev,
            [rowIndex]: fieldNames,
          }));
        } catch (err) {
          setForeignDocFields((prev) => ({
            ...prev,
            [rowIndex]: [],
          }));
        }
      } else {
        setForeignDocFields((prev) => ({
          ...prev,
          [rowIndex]: [],
        }));
      }
      setNewRows((prevRows) =>
        prevRows.map((row, index) =>
          index === rowIndex ? { ...row, displayList: "" } : row
        )
      );
    }
  };

  const addRow = () => {
    setNewRows((prevRows) => [
      ...prevRows,
      {
        documentName: selectedDocument,
        seqNumber: "",
        fieldLabel: "",
        fieldType: "",
        fieldDescription: "",
        displayFlag: "",
        updatableFlag: "", // Changed from updateFlag
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
      "updatableFlag", // Changed from updateFlag
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
        console.log("valid rows", validNewRows);
      } else {
        invalidRows.push(index + 1);
      }
    });

    if (invalidRows.length > 0) {
      setSnackbarMessage(
        `Please fill all required fields in new row(s): ${invalidRows.join(
          ", "
        )}.`
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setError("");
      setSuccessMessage("");
      showSnackbar(`Please fill all required fields in new row(s): ${invalidRows.join(", ")}.`, 'error', 3000);
      return;
    }

    if (validNewRows.length === 0) {
      setSnackbarMessage(
        "No new valid rows to submit. Please fill the fields to add."
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setError("");
      setSuccessMessage("");
      showSnackbar('No new valid rows to submit. Please fill the fields to add.', 'error', 3000);
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
      console.log("response in use effect", response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Submission successful:", result);

      setSnackbarMessage("Document fields submitted successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setSuccessMessage("");
      showSnackbar('Document fields submitted successfully!', 'success', 3000);
      setNewRows([
        {
          documentName: selectedDocument,
          seqNumber: "",
          fieldLabel: "",
          fieldType: "",
          fieldDescription: "",
          displayFlag: "",
          updatableFlag: "", // Changed from updateFlag
          foreignDocument: "",
          displayList: "",
          defaultValue: "Default",
          id: Date.now(),
        },
      ]);
      fetchDocumentFields(selectedDocument);
    } catch (apiError) {
      console.error("Error submitting document fields:", apiError);
      setSnackbarMessage("Failed to submit document fields. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setSuccessMessage("");
      showSnackbar('Failed to submit document fields.', 'error', 3000);
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
        updatableFlag: "", // Changed from updateFlag
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
    { header: "Updatable Flag", key: "updatableFlag" }, // Changed header and key
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
        <Button variant="contained" onClick={addNewBlankRow} sx={{ borderRadius: '16px', px: 3, py: 1.2 }}>
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
                  <Select
                    name="fieldType"
                    value={row.fieldType}
                    onChange={(e) => handleNewRowChange(e, rowIndex)}
                    size="small"
                    fullWidth
                    required
                    displayEmpty
                  >
                    {/*} <MenuItem value="">
                      <em>None</em>
                    </MenuItem>*/}
                    <MenuItem value="String">String</MenuItem>
                    <MenuItem value="Number">Number</MenuItem>
                  </Select>
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
                  <Select
                    name="displayFlag"
                    value={row.displayFlag}
                    onChange={(e) => handleNewRowChange(e, rowIndex)}
                    size="small"
                    fullWidth
                    required
                    displayEmpty
                  >
                    {/*} <MenuItem value="">
                      <em>None</em>
                    </MenuItem>*/}
                    <MenuItem value="Y">Y</MenuItem>
                    <MenuItem value="N">N</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    name="updatableFlag"
                    value={row.updatableFlag}
                    onChange={(e) => handleNewRowChange(e, rowIndex)}
                    size="small"
                    fullWidth
                    required
                    displayEmpty
                  >
                    {/*<MenuItem value="">
                      <em>None</em>
                    </MenuItem>*/}
                    <MenuItem value="Y">Y</MenuItem>
                    <MenuItem value="N">N</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    name="foreignDocument"
                    value={row.foreignDocument}
                    onChange={(e) => handleNewRowChange(e, rowIndex)}
                    //onChange={(e)=> handleDisplayList(e, rowIndex)}
                    size="small"
                    fullWidth
                    required
                    displayEmpty
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {collectionNames.map((name) => (
                      <MenuItem key={name} value={name}>
                        {name}
                      </MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    name="displayList"
                    value={row.displayList}
                    onChange={(e) => handleNewRowChange(e, rowIndex)}
                    size="small"
                    fullWidth
                    required
                    displayEmpty
                    disabled={!row.foreignDocument}
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {(foreignDocFields[rowIndex] || []).map((field) => (
                      <MenuItem key={field} value={field}>
                        {field}
                      </MenuItem>
                    ))}
                  </Select>
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
        <Button variant="contained" onClick={handleSubmit} sx={{ borderRadius: '16px', px: 3, py: 1.2 }}>
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

      {/* Conditionally render two dropdowns for Document, one for others */}
      {pageType === "Document" ? (
        <Box sx={{ display: "flex", gap: 2, mt: 2, mb: 3 }}>
          <Box sx={{ width: "300px" }}>
            <FormControl fullWidth>
              <InputLabel id="document-select-label-1">
                Select Document 1
              </InputLabel>
              <Select
                labelId="document-select-label-1"
                id="document-select-1"
                value={selectedModuleId}
                label="Select Document 1"
                onChange={(e) => setSelectedModuleId(e.target.value)}
                MenuProps={{ sx: { zIndex: 9999 } }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {modules.map((mod) => (
                  <MenuItem key={mod.moduleId} value={mod.moduleId}>
                    {mod.moduleName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ width: "300px" }}>
            <FormControl fullWidth>
              <InputLabel id="document-select-label-2">
                Select Document 2
              </InputLabel>
              <Select
                labelId="document-select-label-2"
                id="document-select-2"
                value={selectedDocument2}
                label="Select Document 2"
                onChange={(e) => setSelectedDocument2(e.target.value)}
                MenuProps={{ sx: { zIndex: 9999 } }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {secondDropdownOptions.map((opt) => (
                  <MenuItem key={opt.faId} value={opt.faName}>
                    {opt.faName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      ) : (
        ["DocumentTemplate", "FunctionalArea"].includes(pageType) && (
          <Box sx={{ mt: 2, mb: 3, width: "300px" }}>
            <FormControl fullWidth>
              <InputLabel id="document-select-label">
                Select Document
              </InputLabel>
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
                {(pageType === "FunctionalArea"
                  ? functionalAreas
                  : docNames
                ).map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )
      )}

      {renderDocumentFieldsTable()}
    </Box>
  );
};

export default DocumentTemplate;
