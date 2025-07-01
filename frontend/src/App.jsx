import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import Login from "./components/Login";
import Signup from "./components/Signup/Signup";

import Dashboard from "./components/Dashboard";

import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";

import DocumentTemplate from "./components/DocumentTemplate";
import Module from "./components/Modules";
import FunctionArea from "./components/FunctionArea";
import Documents from "./components/Documents";
import { SnackbarProvider } from "./context/SnackbarContext";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <AuthProvider>
      <SnackbarProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/document" element={<Documents />} />
            <Route path="/function-area" element={<FunctionArea />} />

            <Route path="/module" element={<Module />} />
            <Route path="/document-template" element={<DocumentTemplate />} />
          </Routes>
        </Router>
      </SnackbarProvider>
    </AuthProvider>
  );
};

export default App;
