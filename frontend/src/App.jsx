import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
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
import LandingPage from "./components/LandingPage";
import Pricing from "./components/Pricing";
import Solutions from "./components/Solutions";
import Contact from "./components/Contact";
import Navbar from "./components/Navbar";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  const location = useLocation();
  const showNavbar = location.pathname !== "/dashboard";
  return (
    <AuthProvider>
      <SnackbarProvider>
        {showNavbar && <Navbar />}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/document" element={<Documents />} />
          <Route path="/function-area" element={<FunctionArea />} />
          <Route path="/module" element={<Module />} />
          <Route path="/document-template" element={<DocumentTemplate />} />
        </Routes>
      </SnackbarProvider>
    </AuthProvider>
  );
};

export default App;
