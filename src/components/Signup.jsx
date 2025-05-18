import { useState } from "react";
import {
  TextField, Button, Typography, Container, Box, Paper, CircularProgress,
  InputAdornment, IconButton, Link
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material"; // For password toggle
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import Swal from "sweetalert2";

function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone_number: ""
  });
  const [loading, setLoading] = useState(false); // Add loading state
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await API.post("/users/register", formData);
      Swal.fire({
        title: "Signup Successful!",
        text: response.data.message || "You can now log in.",
        icon: "success",
        draggable: true,
        timer: 2000,
        showConfirmButton: false,
      });
      navigate("/login");
    } catch (err) {
      Swal.fire({
        title: "Signup Failed!",
        text: err.response?.data?.message || "Please try again.",
        icon: "error",
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePassword = () => setShowPassword(!showPassword);

  return (
    <Container maxWidth="sm" sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
      <Paper elevation={6} sx={{ p: 4, width: "100%", borderRadius: 2 }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography variant="h4" gutterBottom color="primary">
            Create Your Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Join us to manage your expenses and groups!
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            autoFocus
            sx={{ mb: 2 }}
          />
          <TextField
            label="Email"
            variant="outlined"
            type="email"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            variant="outlined"
            type={showPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleTogglePassword} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Phone Number"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.phone_number}
            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            required
            sx={{ mb: 3 }}
            inputProps={{ pattern: "[0-9]*", maxLength: 15 }} // Basic phone number validation
          />

          <Button
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            disabled={loading}
            sx={{ py: 1.5, fontSize: "1rem" }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Sign Up"}
          </Button>
        </form>

        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{" "}
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate("/login")}
              sx={{ textDecoration: "underline", color: "primary.main" }}
            >
              Log In
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default Signup;