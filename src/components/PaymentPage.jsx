import { useState, useEffect } from "react";
import { 
  Typography, TextField, Button, List, ListItem, Container,
  Paper, Divider, Chip, Grid, Card, CardContent, Avatar,
  InputAdornment, FormControl, InputLabel, Select, MenuItem,
  Box, CircularProgress, Badge
} from "@mui/material";
import {
  AccountBalanceWallet, Payment, CheckCircle, Pending,
  AttachMoney, AccountCircle, Group, History
} from "@mui/icons-material";
import API from "../api/api";
import Swal from 'sweetalert2';

function PaymentPage() {
  const [payments, setPayments] = useState([]);
  const [amount, setAmount] = useState("");
  const [payeeId, setPayeeId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const user_id = localStorage.getItem("user_id");
  const token = localStorage.getItem("user");
  const headers = { Authorization: `Bearer ${token}` };
  const [loading, setLoading] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user's groups
        const groupsRes = await API.get(`/groups/user/${user_id}`, { headers });
        setGroups(groupsRes.data);
        
        // Fetch payments
        const paymentsRes = await API.get(`/payments/user/${user_id}`, { headers });
        setPayments(paymentsRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [user_id, token]);

  // Fetch group members when group changes
  useEffect(() => {
    if (groupId) {
      const fetchMembers = async () => {
        try {
          const res = await API.get(`/groupMembers/${groupId}`, { headers });
          setMembers(res.data.filter(member => member.user_id !== user_id)); // Exclude current user
        } catch (err) {
          console.error("Error fetching members:", err);
        }
      };
      fetchMembers();
    }
  }, [groupId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !payeeId || !groupId) {
      Swal.fire({
        title: "Missing Information",
        text: "Please fill in all details to make a payment.",
        icon: "info",
        confirmButtonText: "OK",
      });
      return;
    }

    setLoading(true);
    const paymentData = {
      payer_id: user_id,
      group_id: groupId,
      payee_id: payeeId,
      amount: parseFloat(amount),
      payment_method: paymentMethod,
    };

    try {
      const res = await API.post("/payments/create", paymentData, { headers });
      Swal.fire({
        title: "Payment Sent!",
        text: `₹${amount} payment was successfully initiated.`,
        icon: "success",
        confirmButtonText: "OK",
      });
      setPayments([res.data.payment, ...payments]);
      resetForm();
    } catch (err) {
      Swal.fire({
        title: "Payment Failed",
        text: err.response?.data?.message || "Payment creation failed!",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount("");
    setPayeeId("");
    setGroupId("");
    setPaymentMethod("UPI");
  };

  const handleComplete = async (paymentId) => {
    try {
      await API.put(`/payments/complete/${paymentId}`, {}, { headers });
      Swal.fire({
        title: "Payment Completed",
        text: "The payment has been marked as complete.",
        icon: "success",
        confirmButtonText: "OK",
      });
      setPayments(payments.map(payment => 
        payment.payment_id === paymentId 
          ? { ...payment, payment_status: "COMPLETED" } 
          : payment
      ));
    } catch (err) {
      Swal.fire({
        title: "Error",
        text: "Failed to complete the payment.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch(status) {
      case "COMPLETED":
        return <CheckCircle color="success" />;
      case "PENDING":
        return <Pending color="warning" />;
      case "FAILED":
        return <Pending color="error" />;
      default:
        return <Pending color="action" />;
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch(method) {
      case "UPI":
        return <Payment color="primary" />;
      case "CASH":
        return <AttachMoney color="success" />;
      case "BANK_TRANSFER":
        return <AccountBalanceWallet color="info" />;
      default:
        return <Payment color="inherit" />;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        <AccountBalanceWallet sx={{ verticalAlign: 'middle', mr: 2 }} />
        Payment Dashboard
      </Typography>

      <Grid container spacing={4}>
        {/* Payment Form Column */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <Payment sx={{ mr: 1 }} /> New Payment
              </Typography>
              
              <form onSubmit={handleSubmit}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Group</InputLabel>
                  <Select
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    label="Group"
                    required
                  >
                    {groups.map(group => (
                      <MenuItem key={group.group_id} value={group.group_id}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Group sx={{ mr: 1 }} />
                          {group.group_name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Pay To</InputLabel>
                  <Select
                    value={payeeId}
                    onChange={(e) => setPayeeId(e.target.value)}
                    label="Pay To"
                    disabled={!groupId}
                    required
                  >
                    {members.map(member => (
                      <MenuItem key={member.user_id} value={member.user_id}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            src={member.avatar} 
                            sx={{ width: 24, height: 24, mr: 1 }}
                          >
                            {member.username?.charAt(0)}
                          </Avatar>
                          {member.username || `User ${member.user_id}`}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Amount"
                  type="number"
                  fullWidth
                  sx={{ mb: 3 }}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        ₹
                      </InputAdornment>
                    ),
                  }}
                  required
                />

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    label="Payment Method"
                    required
                  >
                    <MenuItem value="UPI">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Payment sx={{ mr: 1 }} /> UPI
                      </Box>
                    </MenuItem>
                    <MenuItem value="CASH">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AttachMoney sx={{ mr: 1 }} /> Cash
                      </Box>
                    </MenuItem>
                    <MenuItem value="BANK_TRANSFER">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccountBalanceWallet sx={{ mr: 1 }} /> Bank Transfer
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  fullWidth
                  size="large"
                  disabled={loading || !amount || !payeeId || !groupId}
                  startIcon={loading ? <CircularProgress size={20} /> : <Payment />}
                >
                  {loading ? "Processing..." : "Send Payment"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment History Column */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <History sx={{ mr: 1 }} /> Payment History
                <Chip 
                  label={`${payments.length} transactions`} 
                  size="small" 
                  sx={{ ml: 2 }} 
                />
              </Typography>

              {payments.length > 0 ? (
                <List sx={{ maxHeight: 500, overflow: 'auto' }}>
                  {payments.map((payment) => (
                    <Paper key={payment.payment_id} elevation={2} sx={{ mb: 2 }}>
                      <ListItem>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={2}>
                            <Badge
                              overlap="circular"
                              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                              badgeContent={getPaymentMethodIcon(payment.payment_method)}
                            >
                              <Avatar>
                                {payment.payee_name?.charAt(0) || 'U'}
                              </Avatar>
                            </Badge>
                          </Grid>
                          <Grid item xs={5}>
                            <Typography variant="subtitle1" noWrap>
                              {payment.payee_name || `User ${payment.payee_id}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(payment.created_at).toLocaleDateString()}
                            </Typography>
                          </Grid>
                          <Grid item xs={3}>
                            <Typography variant="h6" color="primary">
                              ₹{payment.amount}
                            </Typography>
                          </Grid>
                          <Grid item xs={2}>
                            {getPaymentStatusIcon(payment.payment_status)}
                          </Grid>
                        </Grid>
                      </ListItem>
                      {payment.payment_status !== "COMPLETED" && (
                        <Box sx={{ p: 2, pt: 0, textAlign: 'right' }}>
                          <Button
                            variant="outlined"
                            color="success"
                            size="small"
                            onClick={() => handleComplete(payment.payment_id)}
                            startIcon={<CheckCircle />}
                          >
                            Mark Complete
                          </Button>
                        </Box>
                      )}
                    </Paper>
                  ))}
                </List>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  py: 4,
                  textAlign: 'center'
                }}>
                  <AccountBalanceWallet sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No payment history yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your payment transactions will appear here
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default PaymentPage;