import { useEffect, useState } from "react";
import {
  Typography, Box, Avatar, Card, CardContent, Grid, Button, Divider, Paper, CircularProgress
} from "@mui/material";
import { Group, AccountBalanceWallet } from "@mui/icons-material"; // Icons for visual enhancement
import API from "../api/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

function UserDashboard() {
  const [userName, setUserName] = useState("");
  const [expenseSplits, setExpenseSplits] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  const user_id = localStorage.getItem("user_id");
  const token = localStorage.getItem("user");
  const headers = { Authorization: `Bearer ${token}` };
  const navigate = useNavigate();

  useEffect(() => {
    console.log("User ID:", user_id);
    console.log("Token:", token);

    const fetchUserData = async () => {
      try {
        const res = await API.get(`/users/${user_id}`, { headers });
        setUserName(res.data.name);
      } catch (err) {
        console.error("Error fetching user data:", err);
        Swal.fire("Error", "Could not fetch user data", "error");
      }
    };

    const fetchGroups = async () => {
      try {
        const res = await API.get(`/groups/user/${user_id}`, { headers });
        setGroups(res.data);
      } catch (err) {
        Swal.fire({
          title: "Error fetching groups!",
          icon: "error",
          draggable: false,
        });
      }
    };

    const initializeData = async () => {
      if (user_id && token) {
        setLoading(true);
        await Promise.all([fetchUserData(), fetchGroups()]);
        setLoading(false);
      } else {
        Swal.fire({
          title: "User not logged in",
          text: "Please log in again",
          icon: "warning",
        }).then(() => navigate("/login")); // Redirect to login
      }
    };

    initializeData();
  }, [user_id, token, navigate]);

  // Placeholder for navigation (e.g., to group details or expense page)
  const handleGroupClick = (user_id) => {
    navigate(`/groups/user/${user_id}`); // Adjust route as needed
  };

  return (
    <Box sx={{ padding: 4, maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header Section */}
      <Paper elevation={3} sx={{ padding: 3, textAlign: "center", mb: 4 }}>
        <Avatar
          src="" // Add a dynamic src if available from user data
          alt="Profile"
          sx={{ width: 120, height: 120, margin: "0 auto", mb: 2, bgcolor: "primary.main" }}
        >
          {userName ? userName[0] : "U"} {/* Initial if no image */}
        </Avatar>
        <Typography variant="h4" gutterBottom>
          Welcome {userName || "User"}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your expenses, groups, and balances below.
        </Typography>
      </Paper>

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Groups Section */}
          <Typography variant="h5" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
            <Group sx={{ mr: 1 }} /> Your Groups
          </Typography>
          <Grid container spacing={3}>
            {groups.length === 0 ? (
              <Grid item xs={12}>
                <Typography color="text.secondary">
                  You’re not part of any groups yet. Create one to get started!
                </Typography>
              </Grid>
            ) : (
              groups.map((group) => (
                <Grid item xs={12} sm={6} md={4} key={group.group_id}>
                  <Card
                    sx={{ cursor: "pointer", "&:hover": { boxShadow: 6 } }}
                    onClick={() => handleGroupClick(group.group_id)}
                  >
                    <CardContent>
                      <Typography variant="h6">{group.group_name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Group ID: {group.group_id}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2">
                        Members: {group.members?.length || "N/A"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>

          {/* Placeholder for Expense Summary */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
              <AccountBalanceWallet sx={{ mr: 1 }} /> Balance Summary
            </Typography>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="body1" color="text.secondary">
                {expenseSplits.length === 0
                  ? "No expense data available yet."
                  : "Expense summary coming soon!"}
              </Typography>
              {/* Add expense split logic here when implemented */}
            </Paper>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Button
              variant="contained"
              color="primary"
              sx={{ mr: 2 }}
              onClick={() => navigate("/groups")} // Adjust route as needed
            >
              Create Group
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate("/groups")} // Adjust route as needed
            >
              Add Expense
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}

export default UserDashboard;