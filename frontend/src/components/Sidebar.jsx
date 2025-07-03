import React from "react";
import {
  Drawer,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Box,
  Typography,
  Alert,
  Collapse,
  ListItemIcon,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

function Sidebar({
  modules,
  loadingModules,
  errorModules,
  selectedModuleId,
  onModuleClick,
  subItems,
  loadingSubItems,
  errorSubItems,
  selectedSubItemId,
  onSubItemSelect,
  drawerWidth,
}) {
  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#F0F0F0",
            color: "black",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {loadingModules && (
              <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                <CircularProgress size={24} />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  Loading Modules...
                </Typography>
              </Box>
            )}
            {errorModules && (
              <Alert severity="error" sx={{ mx: 2, mt: 1 }}>
                {errorModules}
              </Alert>
            )}
            {!loadingModules && !errorModules && modules.length === 0 && (
              <Typography
                variant="body2"
                sx={{ p: 2, textAlign: "center", color: "text.secondary" }}
              >
                No modules found.
              </Typography>
            )}

            {!loadingModules &&
              !errorModules &&
              modules.map((module) => (
                <React.Fragment key={module._id}>
                  <ListItem
                    disablePadding
                    selected={module._id === selectedModuleId}
                    onClick={() => onModuleClick(module._id)}
                  >
                    <ListItemButton>
                      <ListItemText primary={module.moduleName} />{" "}
                      {module._id === selectedModuleId ? (
                        <ExpandLess />
                      ) : (
                        <ExpandMore />
                      )}
                    </ListItemButton>
                  </ListItem>

                  <Collapse
                    in={module._id === selectedModuleId}
                    timeout="auto"
                    unmountOnExit
                  >
                    <List component="div" disablePadding sx={{ pl: 4 }}>
                      {" "}
                      {loadingSubItems && (
                        <ListItem>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            Loading Reports...
                          </Typography>
                        </ListItem>
                      )}
                      {errorSubItems && (
                        <ListItem>
                          <Alert
                            severity="error"
                            sx={{ width: "100%", py: 0.5 }}
                          >
                            {errorSubItems}
                          </Alert>
                        </ListItem>
                      )}
                      {!loadingSubItems &&
                      !errorSubItems &&
                      subItems.length > 0 ? (
                        subItems.map((subItem) => (
                          <ListItem
                            key={subItem._id}
                            disablePadding
                            selected={subItem._id === selectedSubItemId}
                            onClick={() => onSubItemSelect(subItem._id)}
                          >
                            <ListItemButton>
                              <ListItemText primary={subItem.faName} />
                            </ListItemButton>
                          </ListItem>
                        ))
                      ) : (
                        <ListItem>
                          <Typography variant="body2" color="text.secondary">
                            No reports available.
                          </Typography>
                        </ListItem>
                      )}
                    </List>
                  </Collapse>
                </React.Fragment>
              ))}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
}

export default Sidebar;
