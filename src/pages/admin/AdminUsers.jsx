import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, Skeleton, Select, FormControl, MenuItem } from '@mui/material';
import { supabase } from '../../supabaseClient';

const ADMIN_UID = 'ae26da15-7102-4647-8cbb-8f045491433c';

const AdminUsers = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [roleSaving, setRoleSaving] = useState({});
  const [roleError, setRoleError] = useState('');
  const [roleSuccess, setRoleSuccess] = useState('');

  const cardBg = {
    background: '#f8fafc',
    boxShadow: '0 2px 12px 0 rgba(31,38,135,0.08)',
    borderRadius: '18px',
    border: '1px solid #e3eafc',
  };

  useEffect(() => {
    setUsersLoading(true);
    supabase.from('profiles').select('id,email,first_name,last_name,role').then(({ data, error }) => {
      if (!error) setAllUsers(data);
      setUsersLoading(false);
    });
  }, []);

  const handleRoleChange = (userId, newRole) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };
  const handleRoleSave = async (userId, newRole) => {
    setRoleSaving(prev => ({ ...prev, [userId]: true }));
    setRoleError(''); setRoleSuccess('');
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (error) setRoleError('Σφάλμα αλλαγής ρόλου: ' + error.message);
    else setRoleSuccess('Ο ρόλος άλλαξε!');
    setRoleSaving(prev => ({ ...prev, [userId]: false }));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" color="#111" fontWeight={700} gutterBottom align="left">
        ΔΙΑΧΕΙΡΙΣΗ ΧΡΗΣΤΩΝ
      </Typography>
      {roleError && <Alert severity="error" sx={{ mb: 2 }}>{roleError}</Alert>}
      {roleSuccess && <Alert severity="success" sx={{ mb: 2 }}>{roleSuccess}</Alert>}
      <TableContainer component={Paper} sx={{ ...cardBg, mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Όνομα</TableCell>
              <TableCell>Επώνυμο</TableCell>
              <TableCell>Ρόλος</TableCell>
              <TableCell>Ενέργεια</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usersLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                  <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                  <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                  <TableCell><Skeleton variant="rectangular" width={100} height={36} /></TableCell>
                  <TableCell><Skeleton variant="rectangular" width={80} height={36} /></TableCell>
                </TableRow>
              ))
            ) : (
              allUsers.map(u => (
                <TableRow key={u.id}>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.first_name}</TableCell>
                  <TableCell>{u.last_name}</TableCell>
                  <TableCell>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={u.role || 'student'}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        disabled={roleSaving[u.id]}
                      >
                        <MenuItem value="student">ΦΟΙΤΗΤΗΣ</MenuItem>
                        <MenuItem value="admin">ADMIN</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      disabled={roleSaving[u.id] || !u.role}
                      onClick={() => handleRoleSave(u.id, u.role)}
                    >
                      ΑΠΟΘΗΚΕΥΣΗ
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AdminUsers; 