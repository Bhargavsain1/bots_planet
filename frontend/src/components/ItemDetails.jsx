import React from "react";
import { Typography, Box, Button } from "@mui/material";

function ItemDetails({ details, onSubItemClick }) {
  if (!details || details.length === 0) {
    return (
      <Typography variant="h6" sx={{ mt: 2, ml: 2 }}>
        No item selected or details not available.
      </Typography>
    );
  }

  const handleItemClick = (itemName) => {
    onSubItemClick(itemName);
  };

  return (
    <Box
      sx={{
        backgroundColor: "#F0F0F0",
        color: "black",
        display: "flex",
        alignItems: "center",
        height: "48px",
        width: "100%",
        pl: 0,
        boxSizing: "border-box",
        zIndex: (theme) => theme.zIndex.appBar + 1,
      }}
    >
      {details.map((item) => (
        <Button
          key={item.name}
          onClick={() => handleItemClick(item.name)}
          sx={{
            color: "inherit",
            textTransform: "none",
            padding: "6px 12px",
            borderRadius: "4px",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              textDecoration: "underline",
              cursor: "pointer",
            },
          }}
        >
          <Typography variant="body1">{item.name}</Typography>
        </Button>
      ))}
    </Box>
  );
}

export default ItemDetails;
