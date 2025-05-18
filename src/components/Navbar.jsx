import { 
  AppBar, Toolbar, Typography, Button, IconButton, Box, Menu, MenuItem, 
  Tooltip, useTheme, useMediaQuery 
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { 
  Home as HomeIcon, Group as GroupIcon, Payment as PaymentIcon, 
  Receipt as ReceiptIcon, Logout as LogoutIcon, Login as LoginIcon, 
  PersonAdd as SignupIcon, Menu as MenuIcon 
} from "@mui/icons-material"; // Icons for visual enhancement
import { useState } from "react";

function Navbar({ isAuthenticated, setIsAuthenticated }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // Responsive breakpoint
  const [anchorEl, setAnchorEl] = useState(null); // For mobile menu

  // Handle Logout
  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of SplitWise.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "No, Stay",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      backdrop: true,
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("user");
        localStorage.removeItem("user_id");
        setIsAuthenticated(false);
        Swal.fire({
          title: "Logged Out",
          text: "You have been successfully logged out.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/login", { replace: true });
      }
    });
  };

  // Mobile menu handlers
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // Navigation items based on authentication
  const navItems = isAuthenticated ? [
    { label: "Dashboard", path: "/dashboard", icon: <HomeIcon /> },
    { label: "Groups", path: "/groups", icon: <GroupIcon /> },
    { label: "Expenses", path: "/expenses", icon: <ReceiptIcon /> },
    { label: "Payments", path: "/payments", icon: <PaymentIcon /> },
  ] : [
    { label: "Login", path: "/login", icon: <LoginIcon /> },
    { label: "Signup", path: "/signup", icon: <SignupIcon /> },
  ];

  return (
    <AppBar position="sticky" sx={{ background: "linear-gradient(90deg, #1976d2, #42a5f5)" }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Logo/Title */}
        <Typography
          variant="h6"
          sx={{ 
            fontWeight: "bold", 
            letterSpacing: 1, 
            cursor: "pointer",
            "&:hover": { color: "#fff" },
          }}
          onClick={() => navigate(isAuthenticated ? "/dashboard" : "/")}
        >
          SplitWise
        </Typography>

        {/* Desktop Navigation */}
        {!isMobile ? (
          <Box sx={{ display: "flex", gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.label}
                color="inherit"
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{ 
                  textTransform: "none", 
                  fontSize: "1rem",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" },
                }}
              >
                {item.label}
              </Button>
            ))}
            {isAuthenticated && (
              <Tooltip title="Logout">
                <Button
                  color="error"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{ 
                    textTransform: "none", 
                    "&:hover": { bgcolor: "rgba(255, 0, 0, 0.1)" },
                  }}
                >
                  Logout
                </Button>
              </Tooltip>
            )}
          </Box>
        ) : (
          /* Mobile Navigation */
          <>
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleMenuOpen}
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: { bgcolor: "#1976d2", color: "#fff" },
              }}
            >
              {navItems.map((item) => (
                <MenuItem
                  key={item.label}
                  onClick={() => {
                    navigate(item.path);
                    handleMenuClose();
                  }}
                  sx={{ "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" } }}
                >
                  {item.icon}
                  <Typography sx={{ ml: 1 }}>{item.label}</Typography>
                </MenuItem>
              ))}
              {isAuthenticated && (
                <MenuItem
                  onClick={() => {
                    handleLogout();
                    handleMenuClose();
                  }}
                  sx={{ "&:hover": { bgcolor: "rgba(255, 0, 0, 0.1)" } }}
                >
                  <LogoutIcon />
                  <Typography sx={{ ml: 1 }}>Logout</Typography>
                </MenuItem>
              )}
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;