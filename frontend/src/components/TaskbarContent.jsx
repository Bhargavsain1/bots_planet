// src/components/TaskbarContent.js
import React from "react";
import { Card, CardContent, Typography, Box, ListItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
function TaskbarContent({ itemDetails }) {
  const navigate = useNavigate();
  if (!itemDetails) {
    return (
      <Typography
        variant="h6"
        sx={{ mt: 3, textAlign: "center", color: "text.secondary" }}
      >
        Select a report from the sidebar dropdown to view details here.
      </Typography>
    );
  }
  const handleClick = (item) => {
    console.log(item);
    if (item.docName == "Modules") {
      navigate("/module");
    } else if (item.docName == "Functional Areas") {
      navigate("/function-area");
    } else if (item.docName == "Document Templates") {
      navigate("/document-template");
    } else if (item.docName == "Documents") {
      navigate("/document");
    }
  };

  return (
    <Card elevation={3} sx={{ mt: 3, margin: "2px", pt: "-10px" }}>
      <CardContent
        sx={{
          mt: 3,
          margin: "2px",
          pr: "10px",
          // --- Flexbox properties to get items on a single line ---
          display: "flex", // Enable flexbox
          flexDirection: "row", // Arrange items horizontally (default, but good to be explicit)
          flexWrap: "wrap", // Allow items to wrap to the next line if space runs out
          gap: 3, // Adds 8px (default Material-UI spacing unit) horizontal space between items
          // You can use a number (1, 2, 3...) for theme spacing, or a string like '10px'
        }}
      >
        {itemDetails.map((item, index) => (
          <Typography
            key={index} // Always use a unique key when mapping over arrays
            variant="h6"
            component="span" // Use 'span' or 'div' for flex item, 'span' is more semantic for inline text
            // Remove any 'marginBottom' or 'gutterBottom' if they were present
            onClick={() => handleClick(item)}
          >
            {item.docName}
          </Typography>
        ))}
      </CardContent>
    </Card>
  );
}

export default TaskbarContent;
