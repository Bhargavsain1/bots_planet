import React, { useState } from "react";
import { Stepper, Step, StepLabel, Box, Paper } from "@mui/material";
import Step1RegisterOrg from "./steps/Step1RegisterOrg";
import Step2AdminProfile from "./steps/Step2AdminProfile";
import Step3SelectBots from "./steps/Step3SelectBots";
import Step4Preview from "./steps/Step4Preview";
import Step5Success from "./steps/Step5Success";
import { useSnackbar } from '../../context/SnackbarContext';

const steps = [
  "Register Organization",
  "Admin Profile",
  "Select Bots",
  "Preview",
  "Completing Setup",
];

const Signup = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({});
  const { showSnackbar } = useSnackbar();

  const handleNext = async (data) => {
    let newData = { ...formData, ...data };
    setFormData(newData);
    if (activeStep === 3) {
      showSnackbar('Registration completed successfully!', 'success', 3000);
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return <Step1RegisterOrg onNext={handleNext} data={formData} />;
      case 1:
        return (
          <Step2AdminProfile
            onNext={handleNext}
            onBack={handleBack}
            data={formData}
          />
        );
      case 2:
        return (
          <Step3SelectBots
            onNext={handleNext}
            onBack={handleBack}
            data={formData}
          />
        );
      case 3:
        return (
          <Step4Preview
            onNext={handleNext}
            onBack={handleBack}
            data={formData}
          />
        );
      case 4:
        return <Step5Success data={formData} />;
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        bgcolor: "#f5f6fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper elevation={3} sx={{ p: 4, minWidth: 400, maxWidth: 500 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label} completed={activeStep > index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box mt={4}>{getStepContent(activeStep)}</Box>
      </Paper>
    </Box>
  );
};

export default Signup;
