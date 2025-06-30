// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Typography,
//   Paper,
//   TableContainer,
//   Table,
//   TableHead,
//   TableBody,
//   TableRow,
//   TableCell,
//   TextField,
//   Button,
//   Alert,
//   CircularProgress, // For loading indicator
// } from "@mui/material";
// import axios from "axios";

// const Modules = () => {
//   // State for existing module fields (fetched from API)
//   const [moduleFields, setModuleFields] = useState([]);
//   const [selectedDocument, setSelectedDocument] = useState([]);
//   const [docNames, setDocNames] = useState([]);

//   // State for new blank input rows
//   const [newRows, setNewRows] = useState([
//     {
//       documentName: "",
//       seqNumber: "",
//       fieldLabel: "",
//       fieldType: "",
//       fieldDescription: "",
//       displayFlag: "",
//       updateFlag: "",
//       foreignDocument: "",
//       displayList: "",
//       fieldName: "",
//       defaultValue: "Default",
//       id: Date.now(),
//     },
//   ]);
//   // State for displaying validation or API errors within the component
//   const [error, setError] = useState("");
//   // State for loading indicator while fetching existing modules
//   const [isLoading, setIsLoading] = useState(true);
//   // State for loading indicator while submitting new data
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // --- Effect to fetch existing module data on component mount ---
//   useEffect(() => {
//     const fetchDocumentNames = async () => {
//       try {
//         setIsLoading(true);
//         // Replace with your actual API endpoint
//         const response = await fetch("http://localhost:5000/api/document_list");
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const data = await response.json();
//         // Assuming the API returns an array of objects, and each object has a 'docName' property
//         const names = data.map((item) => item.docName);
//         setDocNames(names);
//       } catch (error) {
//         console.error("Error fetching document list:", error);
//         // You might want to set an error state here to display a message to the user
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchDocumentNames();
//   }, []);

//   // Function to handle changes in the input fields of new rows
//   const handleNewRowChange = (e, rowIndex) => {
//     const { name, value } = e.target;
//     setNewRows((prevRows) =>
//       prevRows.map((row, index) =>
//         index === rowIndex ? { ...row, [name]: value } : row
//       )
//     );
//   };

//   // Function to add a new blank row to the table for user input
//   const addNewBlankRow = () => {
//     setNewRows((prevRows) => [
//       ...prevRows,

//       {
//         documentName: selectedDocument,
//         seqNumber: "",
//         fieldLabel: "",
//         fieldType: "",
//         fieldDescription: "",
//         displayFlag: "",
//         updateFlag: "",
//         foreignDocument: "",
//         displayList: "",
//         fieldName: "",
//         defaultValue: "Default",
//         id: Date.now(),
//       },
//     ]);
//   };

//   // --- Submission Logic for NEW data ---
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setError(""); // Clear previous errors

//     const newRowsToSubmit = [];

//     // 1. Validate and collect only the filled newRows
//     for (let i = 0; i < newRows.length; i++) {
//       const row = newRows[i];
//       // Only include rows that have content in both fields
//       if (
//         row.documentName.trim() ||
//         row.seqNumber.trim() ||
//         row.fieldLabel.trim() ||
//         row.fieldType.trim() ||
//         row.fieldDescription.trim() ||
//         row.displayFlag.trim() ||
//         row.foreignDocument.trim()
//       ) {
//         if (
//           !row.documentName.trim() ||
//           !row.seqNumber.trim() ||
//           !row.fieldLabel.trim() ||
//           !row.fieldType.trim() ||
//           !row.fieldDescription.trim() ||
//           !row.displayFlag.trim() ||
//           !row.foreignDocument.trim()
//         ) {
//           setError(`Please fill all fields in row  before submitting.`);
//           setIsSubmitting(false);
//           return; // Stop submission if validation fails
//         }
//         // Add only the relevant data, without the local 'id'
//         newRowsToSubmit.push({
//           documentName: row.documentName.trim(),
//           seqNumber: row.seqNumber.trim(),
//           fieldLabel: row.fieldLabel.trim(),
//           fieldType: row.fieldType.trim(),
//           fieldDescription: row.fieldDescription.trim(),
//           displayFlag: row.displayFlag.trim(),
//           updateFlag: row.updateFlag.trim(),
//           foreignDocument: row.foreignDocument.trim(),
//           displayList: row.displayList.trim(),
//           defaultValue: "Default",
//         });
//       }
//     }

//     // 2. Check if there's any data to submit
//     if (newRowsToSubmit.length === 0) {
//       setError(
//         "No new module fields to submit. Please add some data in the blank rows."
//       );
//       setIsSubmitting(false);
//       return;
//     }

//     console.log("Submitting new module fields:", newRowsToSubmit);
//     setModuleFields(newRowsToSubmit);
//     try {
//       // API call to save new data
//       const response = await axios.post(
//         "http://localhost:5000/api/collections/add-field", // New API endpoint for saving answers
//         moduleFields // Send only the new data
//       );
//       console.log("API response (new data):", response.data);

//       alert("New module data submitted successfully!"); // Simple alert for success

//       // Clear only the newRows after successful submission
//       setNewRows([
//         {
//           documentName: selectedDocument,
//           seqNumber: "",
//           fieldLabel: "",
//           fieldType: "",
//           fieldDescription: "",
//           displayFlag: "",
//           updateFlag: "",
//           foreignDocument: "",
//           displayList: "",
//           fieldName: "",
//           defaultValue: "Default",
//           id: Date.now(),
//         },
//       ]);
//       // You might want to re-fetch existing modules here if the new data should appear immediately
//       // e.g., await fetchExistingModules(); or manually add to moduleFields if response provides _id
//     } catch (apiError) {
//       console.error("Error submitting new module data:", apiError);
//       setError(
//         `Submission failed: ${
//           apiError.response?.data?.message || apiError.message
//         }`
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };
//   const handleDocumentSelectChange = (e) => {
//     const value = e.target.value;
//     setSelectedDocument(value);
//     setNewRows((prevRows) =>
//       prevRows.map((row) => ({ ...row, documentName: value }))
//     );
//   };

//   const renderModuleFieldsTable = () => (
//     <Paper sx={{ p: 3, mt: 3 }}>
//       <Box
//         sx={{
//           mb: 3,
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//         }}
//       >
//         <Typography variant="h6">Existing Module Fields</Typography>
//         <Button variant="contained" onClick={addNewBlankRow}>
//           Add New Blank Row
//         </Button>
//       </Box>

//       {error && (
//         <Alert severity="error" sx={{ mb: 2 }}>
//           {error}
//         </Alert>
//       )}

//       <TableContainer
//         component={Paper}
//         sx={{
//           mt: 2,
//           border: "2px solid #000",
//           borderRadius: 1,
//           maxHeight: "70vh",
//           overflow: "auto",
//           "& .MuiTableCell-root": {
//             border: "1px solid #000",
//             padding: "8px",
//             height: "52px",
//             textAlign: "center",
//           },
//           "& .MuiTableCell-head": {
//             backgroundColor: "#f5f5f5",
//             fontWeight: "bold",
//             position: "sticky",
//             top: 0,
//             zIndex: 1,
//           },
//           "& .MuiInputBase-root": {
//             border: "none",
//             "& fieldset": {
//               border: "none",
//             },
//             "&:hover fieldset": {
//               border: "none",
//             },
//             "&.Mui-focused fieldset": {
//               border: "none",
//             },
//             backgroundColor: "transparent",
//           },
//         }}
//       >
//         <Table
//           sx={{ minWidth: 650 }}
//           aria-label="module fields grid"
//           stickyHeader
//         >
//           <TableHead>
//             <TableRow>
//               <TableCell sx={{ width: "60px" }}>S.No</TableCell>
//               <TableCell>Document Name</TableCell>
//               <TableCell>Seq Number</TableCell>
//               <TableCell>Field Label</TableCell>
//               <TableCell>Field Type</TableCell>
//               <TableCell>Field Description</TableCell>
//               <TableCell>Display Flag</TableCell>
//               <TableCell>Update Flag</TableCell>
//               <TableCell>Foreign Document</TableCell>
//               <TableCell>Display List</TableCell>
//               <TableCell>Field Name</TableCell>
//               <TableCell>Default Value</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {isLoading ? (
//               <TableRow>
//                 <TableCell colSpan={3} sx={{ textAlign: "center" }}>
//                   <CircularProgress size={24} />
//                   <Typography variant="body2" sx={{ mt: 1 }}>
//                     Loading existing modules...
//                   </Typography>
//                 </TableCell>
//               </TableRow>
//             ) : (
//               <>
//                 {/* Display Existing Module Fields (Read-Only) */}
//                 {moduleFields.map((field, index) => (
//                   <TableRow key={field.id}>
//                     <TableCell>{index + 1}</TableCell>
//                     {Object.keys(field)
//                       .filter((key) => key !== "id") // Exclude 'id' from rendering
//                       .map((key) => (
//                         <TableCell key={key}>{field[key]}</TableCell>
//                       ))}
//                   </TableRow>
//                 ))}

//                 {/* Input Fields for New Rows */}
//                 {newRows.map((row, rowIndex) => (
//                   <TableRow key={row.id}>
//                     <TableCell>{moduleFields.length + rowIndex + 1}</TableCell>
//                     <TableCell>
//                       <TextField
//                         name="documentName"
//                         value={row.documentName}
//                         onChange={(e) => handleNewRowChange(e, rowIndex)}
//                         size="small"
//                         fullWidth
//                         required
//                         InputProps={{ readOnly: true }}
//                       />
//                     </TableCell>
//                     <TableCell>
//                       <TextField
//                         name="seqNumber"
//                         value={row.seqNumber}
//                         onChange={(e) => handleNewRowChange(e, rowIndex)}
//                         size="small"
//                         fullWidth
//                         required
//                       />
//                     </TableCell>
//                     <TableCell>
//                       <TextField
//                         name="fieldLabel"
//                         value={row.fieldLabel}
//                         onChange={(e) => handleNewRowChange(e, rowIndex)}
//                         size="small"
//                         fullWidth
//                         required
//                       />
//                     </TableCell>
//                     <TableCell>
//                       <TextField
//                         name="fieldType"
//                         value={row.fieldType}
//                         onChange={(e) => handleNewRowChange(e, rowIndex)}
//                         size="small"
//                         fullWidth
//                         required
//                       />
//                     </TableCell>
//                     <TableCell>
//                       <TextField
//                         name="fieldDescription"
//                         value={row.fieldDescription}
//                         onChange={(e) => handleNewRowChange(e, rowIndex)}
//                         size="small"
//                         fullWidth
//                         required
//                       />
//                     </TableCell>
//                     <TableCell>
//                       <TextField
//                         name="displayFlag"
//                         value={row.displayFlag}
//                         onChange={(e) => handleNewRowChange(e, rowIndex)}
//                         size="small"
//                         fullWidth
//                         required
//                       />
//                     </TableCell>
//                     <TableCell>
//                       <TextField
//                         name="updateFlag"
//                         value={row.updateFlag}
//                         onChange={(e) => handleNewRowChange(e, rowIndex)}
//                         size="small"
//                         fullWidth
//                         required
//                       />
//                     </TableCell>
//                     <TableCell>
//                       <TextField
//                         name="foreignDocument"
//                         value={row.foreignDocument}
//                         onChange={(e) => handleNewRowChange(e, rowIndex)}
//                         size="small"
//                         fullWidth
//                         required
//                       />
//                     </TableCell>
//                     <TableCell>
//                       <TextField
//                         name="displayList"
//                         value={row.displayList}
//                         onChange={(e) => handleNewRowChange(e, rowIndex)}
//                         size="small"
//                         fullWidth
//                         required
//                       />
//                     </TableCell>
//                     <TableCell>
//                       <TextField
//                         name="fieldName"
//                         value={row.fieldName}
//                         onChange={(e) => handleNewRowChange(e, rowIndex)}
//                         size="small"
//                         fullWidth
//                         required
//                       />
//                     </TableCell>
//                     <TableCell>
//                       <TextField
//                         name="defaultValue"
//                         value={row.defaultValue}
//                         onChange={(e) => handleNewRowChange(e, rowIndex)}
//                         size="small"
//                         fullWidth
//                         required
//                       />
//                     </TableCell>
//                   </TableRow>
//                 ))}

//                 {/* Message for empty state */}
//                 {moduleFields.length === 0 &&
//                 newRows.length === 0 &&
//                 !isLoading ? (
//                   <TableRow>
//                     <TableCell colSpan={3} sx={{ textAlign: "center" }}>
//                       No existing module fields found. Click "Add New Blank Row"
//                       to start adding new data.
//                     </TableCell>
//                   </TableRow>
//                 ) : null}
//               </>
//             )}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
//         <Typography variant="body2" color="text.secondary">
//           Total Fields: {moduleFields.length + newRows.length}
//         </Typography>
//       </Box>
//     </Paper>
//   );

//   return (
//     <Box>
//       <Typography variant="h6" gutterBottom>
//         Manage Modules
//       </Typography>
//       <Box sx={{ mb: 3, width: "300px" }}>
//         <FormControl fullWidth>
//           <InputLabel id="document-select-label">Select Document</InputLabel>
//           <Select
//             labelId="document-select-label"
//             id="document-select"
//             value={selectedDocument}
//             label="Select Document"
//             onChange={handleDocumentSelectChange}
//             MenuProps={{ sx: { zIndex: 9999 } }}
//           >
//             <MenuItem value=""></MenuItem>
//             {docNames.map((name) => (
//               <MenuItem key={name} value={name}>
//                 {name}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//       </Box>
//       {renderModuleFieldsTable()}
//       <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
//         <Button
//           variant="contained"
//           color="primary"
//           onClick={handleSubmit}
//           disabled={isSubmitting} // Disable button during submission
//         >
//           {isSubmitting ? (
//             <CircularProgress size={24} color="inherit" />
//           ) : (
//             "Submit"
//           )}
//         </Button>
//       </Box>
//     </Box>
//   );
// };

// export default Modules;

import React from "react";
import DataGridTemplate from "./DataGridTemplate"; // Adjust path as needed

const Modules = () => {
  let collectionName = "modules";
  const userConfig = {
    title: "Modules",
    fetchApiUrl: `http://localhost:5000/api/get_document_by_collection/${collectionName}`,
    //  "http://localhost:5000/api/modules", // User-specific fetch API
    postApiUrl: "http://localhost:5000/api/save_module", // User-specific post API
    //  initialNewRowData: { moduleNameee: "", moduleDescription: "" }, // Fields for new user row
    //displayFields: ["moduleName", "moduleDescription"], // Fields to display for users
  };

  return <DataGridTemplate {...userConfig} />;
};

export default Modules;
