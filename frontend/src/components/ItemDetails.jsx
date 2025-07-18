import React from "react";
import { Box, Typography } from "@mui/material";
import { Droppable, Draggable } from "react-beautiful-dnd";

function ItemDetails({ details, onSubItemClick }) {
  console.log("DETAILS", details);
  if (!details || details.length === 0) {
    return (
      <Typography variant="h6" sx={{ mt: 2, ml: 2 }}>
        No item selected or details not available.
      </Typography>
    );
  }

  return (
    <Droppable droppableId="taskbar" direction="horizontal">
      {(provided) => (
        <Box
          ref={provided.innerRef}
          {...provided.droppableProps}
          sx={{
            backgroundColor: "#F0F0F0",
            display: "flex",
            alignItems: "center",
            minHeight: "48px",
            padding: "8px",
            overflowX: "auto",
            gap: 1,
          }}
        >
          {details.map((item, index) =>
            item.id ? (
              <Draggable
                key={item.id}
                draggableId={item.id.toString()}
                index={index}
              >
                {(provided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    sx={{
                      backgroundColor: "#e0e0e0",
                      borderRadius: 1,
                      padding: "6px 12px",
                      cursor: "move",
                      whiteSpace: "nowrap",
                    }}
                    onClick={() => onSubItemClick(item.name)}
                  >
                    {item.name}
                  </Box>
                )}
              </Draggable>
            ) : null
          )}

          {provided.placeholder}
        </Box>
      )}
    </Droppable>
  );
}

export default ItemDetails;
