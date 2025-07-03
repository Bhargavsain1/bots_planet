import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import Modules from "./Modules";
import Documents from "./Documents";
import FunctionalArea from "./FunctionArea";
import DocumentTemplate from "./DocumentTemplate";
import ItemDetails from "./ItemDetails";

import IconButton from "@mui/material/IconButton";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";

const drawerWidth = 200;
const Dashboard = () => {
  // State for Level 1: Modules
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [errorModules, setErrorModules] = useState(null);
  const [selectedModuleId, setSelectedModuleId] = useState(null);

  // State for Level 2:  Sub-Items (for the dropdown in sidebar)
  const [subItems, setSubItems] = useState([]);
  const [loadingSubItems, setLoadingSubItems] = useState(false);
  const [errorSubItems, setErrorSubItems] = useState(null);
  const [selectedSubItemId, setSelectedSubItemId] = useState(null);

  // State for Level 3: Taskbar Content
  const [taskbarContent, setTaskbarContent] = useState(null);
  const [loadingTaskbarContent, setLoadingTaskbarContent] = useState(false);
  const [errorTaskbarContent, setErrorTaskbarContent] = useState(null);

  // State for active sub-component
  const [activeSubComponent, setActiveSubComponent] = useState(null);

  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const getModules = async () => {
      setLoadingModules(true);
      setErrorModules(null);
      try {
        const data = await axios.get("http://localhost:5000/api/modules");

        setModules(data.data);
        setErrorModules(null);
      } catch (err) {
        console.error("Failed to fetch modules:", err);
        setErrorModules("Failed to load modules. Please try again.");
      } finally {
        setLoadingModules(false);
      }
    };
    getModules();
  }, []);

  const handleModuleClick = useCallback(
    async (moduleId) => {
      // If clicking the same module, collapse it
      if (moduleId === selectedModuleId) {
        setSelectedModuleId(null);
        setSubItems([]);
        setSelectedSubItemId(null);
        setTaskbarContent(null);
        setActiveSubComponent(null);
        return;
      }

      setSelectedModuleId(moduleId);
      setSelectedSubItemId(null);
      setTaskbarContent(null);
      setLoadingSubItems(true);
      setErrorSubItems(null);
      setActiveSubComponent(null);
      try {
        const data = await axios.get(
          `http://localhost:5000/api/functional_area/${moduleId}`
        );
        console.log("data in subbitem", data);
        setSubItems(data.data);
        // Optionally auto-select the first sub-item
        if (data.length > 0) {
          handleSubItemSelect(data[0].id);
        }
      } catch (err) {
        console.error(`Failed to fetch sub-items for module ${moduleId}:`, err);
        setErrorSubItems("Failed to load sub-items.");
        setSubItems([]); // Clear previous sub-items on error
      } finally {
        setLoadingSubItems(false);
      }
    },
    [selectedModuleId]
  );

  const handleSubItemSelect = useCallback(async (subItemId) => {
    console.log("subItemId", subItemId);
    setSelectedSubItemId(subItemId);
    setLoadingTaskbarContent(true);
    setErrorTaskbarContent(null);
    setTaskbarContent(null);

    try {
      const response = await axios.get(
        `http://localhost:5000/api/each_funarea_documents/${subItemId}`
      );
      console.log("datain subitem", response);
      setTaskbarContent(
        response.data.map((item) => ({
          id: item.id || item.faId || item.docId,
          name: item.name || item.docName || item.faName,
        }))
      );
    } catch (err) {
      console.error(`Failed to fetch details for sub-item ${subItemId}:`, err);
      setErrorTaskbarContent("Failed to load item details.");
    } finally {
      setLoadingTaskbarContent(false);
    }
  }, []);

  const handleSubItemClick = (itemName) => {
    setActiveSubComponent(itemName);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "#F0F0F0",
          border: "4px",
        }}
      >
        <Toolbar>
          <img
            src="/hasmanlogo.png"
            alt="Hasman"
            style={{ height: "40px", marginRight: "10px" }}
          />
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, color: "black" }}
          ></Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton>
              <NotificationsIcon sx={{ color: "darkblue" }} />
            </IconButton>
            <IconButton>
              <SettingsIcon sx={{ color: "darkblue" }} />
            </IconButton>
            <IconButton onClick={handleLogout}>
              <LogoutIcon sx={{ color: "darkblue" }} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Component */}
      <Sidebar
        modules={modules}
        loadingModules={loadingModules}
        errorModules={errorModules}
        selectedModuleId={selectedModuleId}
        onModuleClick={handleModuleClick}
        subItems={subItems}
        loadingSubItems={loadingSubItems}
        errorSubItems={errorSubItems}
        selectedSubItemId={selectedSubItemId}
        onSubItemSelect={handleSubItemSelect}
        drawerWidth={drawerWidth}
      />

      {/* Main Content Area (Taskbar) */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // p: 3,
          pr: 2,
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          marginTop: "8px",
          marginLeft: "10px",
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        {errorTaskbarContent && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorTaskbarContent}
          </Alert>
        )}
        {loadingTaskbarContent ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "50vh",
            }}
          >
            <CircularProgress />
            <Typography variant="h6" sx={{ ml: 2 }}>
              Loading report details...
            </Typography>
          </Box>
        ) : (
          <ItemDetails
            details={
              taskbarContent
                ? taskbarContent.map((item) => ({
                    name: item.name || item.docName || item.faName,
                  }))
                : []
            }
            onSubItemClick={handleSubItemClick}
          />
        )}
        <Box sx={{ p: 3 }}>
          {activeSubComponent === "Document Templates" ? (
            <DocumentTemplate />
          ) : activeSubComponent === "Modules" ? (
            <Modules />
          ) : activeSubComponent === "Functional Areas" ? (
            <FunctionalArea />
          ) : activeSubComponent === "Documents" ? (
            <Documents />
          ) : (
            <Typography></Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
