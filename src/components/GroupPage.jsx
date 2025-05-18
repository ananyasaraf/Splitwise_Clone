import React, { useEffect, useState } from "react";
import axios from "../api/api";
import { 
  Button, TextField, Box, Typography, Paper, List, ListItem, 
  ListItemText, Grid, Divider, CircularProgress, Tooltip, 
  IconButton, Select, MenuItem, Avatar, Badge, Chip, 
  Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  Group as GroupIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Edit as EditIcon
} from "@mui/icons-material";
import Swal from "sweetalert2";

const GroupPage = () => {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState([{ username: "", email: "", is_admin: false }]);
  const [loading, setLoading] = useState({ groups: false, create: false });
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const user_id = localStorage.getItem("user_id");
  const user_name = localStorage.getItem("username");

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(prev => ({ ...prev, groups: true }));
      const response = await axios.get(`/groups/user/${user_id}`);
      setGroups(response.data);
    } catch (error) {
      console.error("Error fetching groups:", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "Failed to fetch groups",
        icon: "error",
        confirmButtonText: "OK"
      });
    } finally {
      setLoading(prev => ({ ...prev, groups: false }));
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();

    if (!user_id) {
      Swal.fire("Error", "User session expired. Please login again.", "error");
      return;
    }

    if (!groupName.trim()) {
      Swal.fire("Error", "Group name is required!", "error");
      return;
    }

    const invalidMembers = members.filter(member => 
      !member.username.trim() || !member.email.trim() || !validateEmail(member.email)
    );

    if (invalidMembers.length > 0) {
      Swal.fire("Error", "Each member must have a valid username and email!", "error");
      return;
    }

    setLoading(prev => ({ ...prev, create: true }));
    try {
      const filteredMembers = members.filter(member => member.email !== user_name);
      const payload = { 
        group_name: groupName, 
        members: filteredMembers, 
        user_id 
      };

      const response = await axios.post("/groups/add-member", payload);
      
      Swal.fire({
        title: "Success!",
        text: response.data.message || "Group created successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      resetForm();
      fetchGroups();
    } catch (error) {
      console.error("Error creating group:", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.error || "Failed to create group",
        icon: "error",
        confirmButtonText: "OK"
      });
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const resetForm = () => {
    setGroupName("");
    setMembers([{ username: "", email: "", is_admin: false }]);
  };

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...members];
    updatedMembers[index][field] = field === "is_admin" ? value === "true" : value;
    setMembers(updatedMembers);
  };

  const addMemberField = () => {
    if (members.length < 10) { // Limit to 10 members for UX
      setMembers([...members, { username: "", email: "", is_admin: false }]);
    }
  };

  const removeMemberField = (index) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const openEditDialog = (group) => {
    setSelectedGroup(group);
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedGroup(null);
  };

  return (
    <Box sx={{ padding: { xs: 2, md: 4 }, maxWidth: "1400px", margin: "0 auto" }}>
      <Typography variant="h4" gutterBottom sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <GroupIcon color="primary" sx={{ mr: 1, fontSize: '2rem' }} /> 
        Group Management
      </Typography>

      {/* Create Group Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <AddIcon sx={{ mr: 1 }} /> Create New Group
        </Typography>
        
        <form onSubmit={handleCreateGroup}>
          <TextField
            label="Group Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
            sx={{ mb: 3 }}
            disabled={loading.create}
            InputProps={{
              startAdornment: (
                <GroupIcon color="action" sx={{ mr: 1 }} />
              ),
            }}
          />

          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 1 }} /> Group Members
            <Chip label={`${members.length} members`} size="small" sx={{ ml: 1 }} />
          </Typography>

          {members.map((member, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2, alignItems: "center" }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label={`Member ${index + 1} Username`}
                  variant="outlined"
                  fullWidth
                  value={member.username}
                  onChange={(e) => handleMemberChange(index, "username", e.target.value)}
                  required
                  disabled={loading.create}
                  InputProps={{
                    startAdornment: (
                      <PersonIcon color="action" sx={{ mr: 1 }} />
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Email"
                  variant="outlined"
                  fullWidth
                  type="email"
                  value={member.email}
                  onChange={(e) => handleMemberChange(index, "email", e.target.value)}
                  required
                  disabled={loading.create}
                  error={member.email && !validateEmail(member.email)}
                  helperText={member.email && !validateEmail(member.email) ? "Invalid email format" : ""}
                />
              </Grid>
              <Grid item xs={8} sm={2}>
                <Select
                  value={member.is_admin ? "true" : "false"}
                  onChange={(e) => handleMemberChange(index, "is_admin", e.target.value)}
                  fullWidth
                  disabled={loading.create}
                >
                  <MenuItem value="false">Member</MenuItem>
                  <MenuItem value="true">Admin</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={4} sm={2} sx={{ textAlign: 'center' }}>
                {members.length > 1 && (
                  <Tooltip title="Remove Member">
                    <IconButton
                      color="error"
                      onClick={() => removeMemberField(index)}
                      disabled={loading.create}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Grid>
            </Grid>
          ))}

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addMemberField}
              disabled={loading.create || members.length >= 10}
              sx={{ mr: 2 }}
            >
              Add Member {members.length >= 10 && "(Max 10)"}
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading.create}
              sx={{ minWidth: 150, py: 1 }}
              startIcon={loading.create ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loading.create ? "Creating..." : "Create Group"}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Groups List Section */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <GroupIcon sx={{ mr: 1 }} /> Your Groups
        {groups.length > 0 && (
          <Chip label={`${groups.length} groups`} size="small" sx={{ ml: 1 }} />
        )}
      </Typography>

      {loading.groups ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : groups.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', backgroundColor: 'grey.50' }}>
          <GroupIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No groups found
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Create your first group above to get started
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {groups.map((group) => (
            <Grid item xs={12} sm={6} md={4} key={group.group_id}>
              <Paper elevation={3} sx={{ 
                p: 2, 
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: 4
                }
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {group.group_name}
                  </Typography>
                  <Tooltip title="Edit Group">
                    <IconButton 
                      size="small" 
                      onClick={() => openEditDialog(group)}
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Created: {new Date(group.created_at).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Members:</strong> {group.members?.length || 0}
                </Typography>
                <List dense sx={{ flexGrow: 1, overflow: 'auto', maxHeight: 200 }}>
                  {group.members?.map((member, idx) => (
                    <ListItem key={idx} sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              sx={{ 
                                width: 30, 
                                height: 30, 
                                mr: 1,
                                bgcolor: member.is_admin ? 'primary.main' : 'grey.500'
                              }}
                            >
                              {member.username?.charAt(0)?.toUpperCase()}
                            </Avatar>
                            {member.username}
                            {member.is_admin && (
                              <AdminIcon color="primary" sx={{ ml: 1, fontSize: '1rem' }} />
                            )}
                          </Box>
                        }
                        secondary={member.email}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Edit Group Dialog */}
      <Dialog open={editDialogOpen} onClose={closeEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit Group: {selectedGroup?.group_name}
        </DialogTitle>
        <DialogContent>
          {/* Edit form would go here */}
          <Typography>Group editing functionality would be implemented here</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditDialog}>Cancel</Button>
          <Button variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GroupPage;