
import React, { useState, useEffect } from "react";
import axios from "../api/api";
import { 
    Box, Button, TextField, Typography, MenuItem, Select, FormControl, 
    InputLabel, Paper, Divider, CircularProgress, Alert, Avatar, 
    Chip, Grid, Card, CardContent, InputAdornment
} from "@mui/material";
import { AttachMoney, Description, Group, Person } from "@mui/icons-material";

const ExpensePage = () => {
    const [groupId, setGroupId] = useState("");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [paidBy, setPaidBy] = useState("");
    const [participants, setParticipants] = useState([]);
    const [payments, setPayments] = useState([]);
    const [groups, setGroups] = useState([]);
    const [members, setMembers] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const user_id = localStorage.getItem("user_id");
    const token = localStorage.getItem("user");
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const response = await axios.get(`/groups/user/${user_id}`);
            if (response.data && Array.isArray(response.data)) {
                setGroups(response.data);
            } else {
                console.log("No groups found.");
            }
        } catch (error) {
            console.error("Error fetching groups:", error.response?.data?.error || error.message);
        }
    };

    useEffect(() => {
        if (groupId) {
            fetchGroupMembers();
        }
    }, [groupId]);

    const fetchGroupMembers = async () => {
        try {
            const response = await axios.get(`/groupMembers/${groupId}`);
            if (response.data && Array.isArray(response.data)) {
                setMembers(response.data);
                setParticipants(response.data.map(member => ({ user_id: member.user_id })));
                setPayments([]);
            } else {
                console.log("No members found.");
                setMembers([]);
                setParticipants([]);
                setPayments([]);
            }
        } catch (error) {
            console.error("Error fetching group members:", error.response?.data?.error || error.message);
        }
    };

    const handlePaymentChange = (userId, value) => {
        const amountPaid = parseFloat(value) || 0;
        setPayments(prevPayments => {
            const updatedPayments = prevPayments.filter(payment => payment.user_id !== userId);
            if (amountPaid > 0) {
                updatedPayments.push({ user_id: userId, amount: amountPaid });
            }
            return updatedPayments;
        });
    };

    const handleCreateExpense = async () => {
        if (!groupId || !amount || !description || !paidBy || participants.length === 0 || payments.length === 0) {
            setError("Please fill in all fields, select who paid, and specify payments.");
            return;
        }

        const totalAmount = parseFloat(amount);
        const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

        if (totalPaid !== totalAmount) {
            setError(`The sum of payments (₹${totalPaid}) does not match the total amount (₹${totalAmount}).`);
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);
        
        try {
            const payload = {
                group_id: parseInt(groupId),
                paid_by: parseInt(paidBy),
                amount: totalAmount,
                description,
                expense_type: "EQUAL",
                participants: participants.map(participant => ({ user_id: participant.user_id })),
                payments: payments.map(payment => ({
                    user_id: payment.user_id,
                    amount: payment.amount
                })),
            };

            const response = await axios.post("/expenses/create", payload, { headers });
            setSuccess("Expense created successfully!");
            setGroupId("");
            setAmount("");
            setDescription("");
            setPaidBy("");
            setParticipants([]);
            setPayments([]);
        } catch (error) {
            console.error("Error creating expense:", error.response?.data?.error || error.message);
            setError(`Failed to create expense: ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const getMemberName = (userId) => {
        const member = members.find(m => m.user_id === userId);
        return member?.username || `User ${userId}`;
    };

    const getMemberAvatar = (userId) => {
        const member = members.find(m => m.user_id === userId);
        return member?.avatar || null;
    };

    return (
        <Paper elevation={3} sx={{ padding: 4, maxWidth: 600, margin: "2rem auto" }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Create New Expense
            </Typography>
            <Divider sx={{ my: 2 }} />

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    {success}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Left Column - Basic Info */}
                <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                                <Group sx={{ mr: 1 }} /> Group Information
                            </Typography>

                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Select Group</InputLabel>
                                <Select 
                                    value={groupId} 
                                    onChange={(e) => setGroupId(e.target.value)}
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <Group />
                                        </InputAdornment>
                                    }
                                >
                                    {groups.length > 0 ? (
                                        groups.map((group) => (
                                            <MenuItem key={group.group_id} value={group.group_id}>
                                                {group.group_name}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem disabled>No groups found</MenuItem>
                                    )}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Paid By</InputLabel>
                                <Select 
                                    value={paidBy} 
                                    onChange={(e) => setPaidBy(e.target.value)}
                                    disabled={!groupId}
                                >
                                    {members.length > 0 ? (
                                        members.map((member) => (
                                            <MenuItem key={member.user_id} value={member.user_id}>
                                                <Box display="flex" alignItems="center">
                                                    {getMemberAvatar(member.user_id) && (
                                                        <Avatar 
                                                            src={getMemberAvatar(member.user_id)} 
                                                            sx={{ width: 24, height: 24, mr: 1 }}
                                                        />
                                                    )}
                                                    {getMemberName(member.user_id)}
                                                </Box>
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem disabled>No members available</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </CardContent>
                    </Card>

                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                                <Description sx={{ mr: 1 }} /> Expense Details
                            </Typography>

                            <TextField
                                label="Total Amount"
                                type="number"
                                fullWidth
                                sx={{ mb: 2 }}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AttachMoney />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                label="Description"
                                fullWidth
                                multiline
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What was this expense for?"
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Right Column - Payments */}
                <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                                <Person sx={{ mr: 1 }} /> Payment Details
                            </Typography>

                            {members.length > 0 ? (
                                <>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                                        Specify how much each person contributed
                                    </Typography>

                                    {members.map((member) => (
                                        <Box key={member.user_id} sx={{ mb: 2 }}>
                                            <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                                                {getMemberAvatar(member.user_id) && (
                                                    <Avatar 
                                                        src={getMemberAvatar(member.user_id)} 
                                                        sx={{ width: 32, height: 32, mr: 1 }}
                                                    />
                                                )}
                                                <Typography>{getMemberName(member.user_id)}</Typography>
                                            </Box>
                                            <TextField
                                                label="Amount Paid"
                                                type="number"
                                                fullWidth
                                                size="small"
                                                value={payments.find((p) => p.user_id === member.user_id)?.amount || ""}
                                                onChange={(e) => handlePaymentChange(member.user_id, e.target.value)}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            ₹
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        </Box>
                                    ))}

                                    <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
                                        <Typography variant="subtitle2">
                                            Total Paid: ₹{payments.reduce((sum, payment) => sum + payment.amount, 0)}
                                        </Typography>
                                        <Typography variant="subtitle2">
                                            Expense Amount: ₹{amount || 0}
                                        </Typography>
                                    </Box>
                                </>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    Select a group to see members
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCreateExpense}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                    sx={{ minWidth: 120 }}
                >
                    {loading ? "Creating..." : "Create Expense"}
                </Button>
            </Box>
        </Paper>
    );
};

export default ExpensePage;