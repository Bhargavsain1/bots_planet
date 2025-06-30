import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  CircularProgress,
  Paper,
  IconButton,
  InputBase,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { useAuth } from "../context/AuthContext";

// CAPTCHA generator function with mixed letters & digits
const generateCaptcha = () => {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let captcha = "";
  for (let i = 0; i < 6; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return captcha;
};

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    userId: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showRecoverUserId, setShowRecoverUserId] = useState(false);

  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [resetIdentifier, setResetIdentifier] = useState("");

  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);

  // Generate CAPTCHA on load
  useEffect(() => {
    setCaptcha(generateCaptcha());
  }, []);

  // Draw CAPTCHA on canvas
  useEffect(() => {
    const canvas = document.getElementById("captchaCanvas");
    const ctx = canvas?.getContext("2d");

    if (ctx && captcha) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Noise lines
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.strokeStyle = `rgba(0,0,0,${Math.random()})`;
        ctx.stroke();
      }

      // Dots
      for (let i = 0; i < 25; i++) {
        ctx.beginPath();
        ctx.arc(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          1.5,
          0,
          2 * Math.PI
        );
        ctx.fillStyle = "#999";
        ctx.fill();
      }

      // Text
      ctx.font = "bold 20px Courier New";
      ctx.fillStyle = "#000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const x = canvas.width / 2;
      const y = canvas.height / 2;
      const angle = (Math.random() - 0.5) * 0.4;

      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(captcha, 0, 0);
      ctx.rotate(-angle);
      ctx.translate(-x, -y);
    }
  }, [captcha]);

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
    setIsCaptchaValid(false);
  };

  const handleCaptchaChange = (e) => {
    const value = e.target.value;
    setCaptchaInput(value);
    setIsCaptchaValid(value === captcha);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.userId || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    if (!isCaptchaValid) {
      setError("CAPTCHA does not match.");
      return;
    }

    setLoading(true);
    try {
      await login(form.userId, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!resetIdentifier) {
      setError("Please enter your Email or User ID.");
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Password reset instructions sent! (Demo)");
      setShowForgotPassword(false);
      setResetIdentifier("");
    } catch {
      setError("Failed to send reset instructions.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverUserId = async (e) => {
    e.preventDefault();
    setError("");

    // if (!recoveryEmail) {
    //   setError("Please enter your registered Email.");
    //   return;
    // }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("User ID recovery instructions sent! (Demo)");
      setShowRecoverUserId(false);
      setRecoveryEmail("");
    } catch {
      setError("Failed to send recovery instructions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="login-page">
      <Paper elevation={3} className="login-form">
        {!showForgotPassword && !showRecoverUserId && (
          <>
            <Typography variant="h4" className="login-title">
              Welcome Back
            </Typography>
            <Typography variant="subtitle1" className="login-subtitle">
              Sign in to continue to Bots Planet
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                label="User ID"
                name="userId"
                value={form.userId}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                autoFocus
              />
              <TextField
                label="Password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
              />

              {/* CAPTCHA */}
              <Box mt={2} display="flex" alignItems="center" gap={1}>
                <canvas
                  id="captchaCanvas"
                  width="120"
                  height="40"
                  style={{
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                    backgroundColor: "#ffffff",
                  }}
                />
                <IconButton
                  onClick={refreshCaptcha}
                  aria-label="refresh captcha"
                  sx={{
                    color: "#ffffff",
                    backgroundColor: "#2196f3",
                    "&:hover": {
                      backgroundColor: "#1976d2",
                    },
                    borderRadius: "4px",
                    height: "40px",
                    width: "40px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <RefreshIcon sx={{ fontSize: 20 }} />
                </IconButton>
                <InputBase
                  id="captchaInput"
                  placeholder="Enter CAPTCHA"
                  value={captchaInput}
                  onChange={handleCaptchaChange}
                  sx={{
                    flexGrow: 1,
                    transform: "translateY(2px)",
                    height: "40px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                    backgroundColor: "#ffffff",
                    "& .MuiInputBase-input": {
                      padding: "0 14px",
                      paddingTop: "2px",
                      lineHeight: "40px",
                      boxSizing: "border-box",
                    },
                  }}
                />
              </Box>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : "Sign In"}
              </Button>

              <Box mt={2} display="flex" justifyContent="space-between">
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => {
                    setShowRecoverUserId(true);
                    setShowForgotPassword(false);
                  }}
                >
                  Forgot User ID?
                </Link>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setShowRecoverUserId(false);
                  }}
                >
                  Forgot Password?
                </Link>
              </Box>

              <Box mt={2} textAlign="center">
                <Typography variant="body2">
                  Don't have an account?{" "}
                  <Link component={RouterLink} to="/signup">
                    Sign Up
                  </Link>
                </Typography>
              </Box>
            </form>
          </>
        )}

        {showForgotPassword && (
          <>
            <Typography variant="h4" className="login-title">
              Reset Password
            </Typography>
            <Typography variant="subtitle1" className="login-subtitle">
              User ID
            </Typography>
            <form onSubmit={handleForgotPassword}>
              <TextField
                label="User ID"
                value={resetIdentifier}
                onChange={(e) => setResetIdentifier(e.target.value)}
                fullWidth
                margin="normal"
                required
              />
              {error && <Alert severity="error">{error}</Alert>}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  "Send Reset Instructions"
                )}
              </Button>
              <Box mt={2} textAlign="center">
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Back to Login
                </Link>
              </Box>
            </form>
          </>
        )}

        {showRecoverUserId && (
          <>
            <Typography variant="h4" className="login-title">
              Recover User ID
            </Typography>
            {/* <Typography variant="subtitle1" className="login-subtitle">
              Enter your registered Email
            </Typography> */}
            <form onSubmit={handleRecoverUserId}>
              <TextField
                label="Email Address"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                fullWidth
                margin="normal"
                required
              />
              {error && <Alert severity="error">{error}</Alert>}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Send User ID"}
              </Button>
              <Box mt={2} textAlign="center">
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => setShowRecoverUserId(false)}
                >
                  Back to Login
                </Link>
              </Box>
            </form>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default Login;
