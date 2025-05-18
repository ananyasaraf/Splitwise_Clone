import { useState, useEffect } from "react";
import { 
  TextField, 
  Button, 
  List, 
  ListItem, 
  Typography, 
  Snackbar, 
  Alert, 
  Box 
} from "@mui/material";
import API from "../api/api";

function ExpenseSplit({ expenseId }) {
  const [splitUserId, setSplitUserId] = useState("");
  const [amountOwed, setAmountOwed] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [splits, setSplits] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const token = localStorage.getItem("token"); // Using correct token key
  const headers = { Authorization: `Bearer ${token}` };

  // ✅ Fetch all splits on component mount
  useEffect(() => {
    fetchSplits();
  }, []);

  // ✅ Function to fetch all splits
  const fetchSplits = async () => {
    try {
      const res = await API.get(`/expenseSplits/${expenseId}`, { headers });
      setSplits(res.data.result);
    } catch (err) {
      console.error("Failed to fetch splits:", err.response?.data?.error || err.message);
      showSnackbar("Failed to fetch splits!", "error");
    }
  };

  // ✅ Function to show Snackbar (Alert)
  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // ✅ Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!splitUserId || !amountOwed || !amountPaid) {
      showSnackbar("Please fill all fields!", "warning");
      return;
    }

    const splitData = {
      expense_id: expenseId,
      user_id: parseInt(splitUserId),
      amount_owed: parseFloat(amountOwed),
      amount_paid: parseFloat(amountPaid),
    };

    try {
      await API.post("/expenseSplits/create", splitData, { headers });
      showSnackbar("Split added successfully!", "success");
      resetForm();
      fetchSplits(); // Refresh list
    } catch (err) {
      console.error("Failed to create split:", err.response?.data?.error || err.message);
      showSnackbar("Failed to create split!", "error");
    }
  };

  // ✅ Reset Form Fields
  const resetForm = () => {
    setSplitUserId("");
    setAmountOwed("");
    setAmountPaid("");
  };

  return (
    <Box sx={{ padding: 2, marginTop: 2 }}>
      <Typography variant="h5" gutterBottom>
        Expense Split
      </Typography>

      {/* Form to Add Split */}
      <form onSubmit={handleSubmit}>
        <TextField
          label="User ID"
          variant="outlined"
          value={splitUserId}
          onChange={(e) => setSplitUserId(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Amount Owed"
          variant="outlined"
          type="number"
          value={amountOwed}
          onChange={(e) => setAmountOwed(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Amount Paid"
          variant="outlined"
          type="number"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          fullWidth 
          sx={{ marginTop: 2 }}
        >
          Add Split
        </Button>
      </form>

      {/* Display Splits List */}
      <Typography variant="h6" sx={{ marginTop: 3 }}>
        Splits Summary
      </Typography>

      {splits.length > 0 ? (
        <List>
         {splits.map((split,index) => (
  <ListItem key={index} sx={{ padding: 2, borderBottom: "1px solid #ddd" }}>
    <Typography variant="body1">
      <b>Name:</b> {split.name||"Unknown"} | 
      <b> Owed:</b> ₹{parseFloat(split.amount_owed||0).toFixed(2)}
    </Typography>
  </ListItem>
))}

        </List>
      ) : (
        <Typography color="textSecondary">No splits found.</Typography>
      )}

      {/* Snackbar for Feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ExpenseSplit;
