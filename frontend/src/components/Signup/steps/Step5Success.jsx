import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";

const Step6Success = ({ data }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const didRunRef = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (didRunRef.current) return;
    didRunRef.current = true;

    const completeSignup = async () => {
      try {
        // Register the user with all collected data
        const registrationData = {
          name: data.adminName,
          email: data.corporateEmail,
          password: data.password,
          role: "admin",
          orgName: data.orgName,
          industry: data.industry,
          orgSize: data.orgSize,
          location: data.location,
          selectedBots: data.selectedBots || [],
          phoneNumber: `${data.countryCode}${data.phoneNumber}`,
        };

        // Register user
        const response = await axios.post(
          "http://localhost:5000/api/users/register",
          registrationData
        );
        console.log("Registration response:", response.data);

        // Log the user in
        await login(response.data.userId, registrationData.password);

        // Redirect to dashboard
        navigate("/dashboard");
      } catch (error) {
        console.error("Signup failed:", error);
        let errorMessage = "Failed to complete registration. ";

        if (error.response) {
          const backendMessage = error.response.data?.message || "";
          errorMessage += backendMessage || "Please try again.";

          // If user already exists, try to log in and redirect
          if (backendMessage.toLowerCase().includes("user already exists")) {
            try {
              await login(data.corporateEmail, data.password);
              navigate("/dashboard");
              return;
            } catch (loginError) {
              errorMessage += " Login failed as well.";
              console.error(loginError);
            }
          }
        } else if (error.request) {
          errorMessage +=
            "No response from server. Please check your connection.";
        } else {
          errorMessage += error.message || "Please try again.";
        }

        setError(errorMessage);
      }
    };

    completeSignup();
  }, [data, login, navigate]);

  return (
    <Box sx={{ textAlign: "center", py: 4 }}>
      <CircularProgress size={60} sx={{ mb: 3 }} />
      <Typography variant="h5" gutterBottom>
        Completing Your Registration
      </Typography>
      <Typography color="textSecondary" sx={{ mb: 2 }}>
        Please wait while we set up your account...
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default Step6Success;
