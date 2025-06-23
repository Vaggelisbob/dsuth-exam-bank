import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, TextField, Stack, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Skeleton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { supabase } from '../../supabaseClient';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [courseName, setCourseName] = useState('');
  const [courseSemester, setCourseSemester] = useState(1);
  const [saving, setSaving] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    const { data, error } = await supabase.from('courses').select('*').order('name', { ascending: true });
    if (error) setError(error.message);
    else setCourses(data);
    setLoading(false);
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleOpenDialog = (course = null) => {
    setEditCourse(course);
    setCourseName(course ? course.name : '');
    setCourseSemester(course ? course.semester : 1);
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditCourse(null);
    setCourseName('');
    setCourseSemester(1);
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    if (!courseName.trim()) {
      setError('Το όνομα μαθήματος είναι υποχρεωτικό.');
      setSaving(false);
      return;
    }
    if (courseSemester < 1 || courseSemester > 8) {
      setError('Το εξάμηνο πρέπει να είναι από 1 έως 8.');
      setSaving(false);
      return;
    }
    if (editCourse) {
      // Update
      const { error } = await supabase.from('courses').update({ name: courseName.trim(), semester: courseSemester }).eq('id', editCourse.id);
      if (error) setError(error.message);
      else setSuccess('Το μάθημα ενημερώθηκε!');
    } else {
      // Insert
      const { error } = await supabase.from('courses').insert([{ name: courseName.trim(), semester: courseSemester }]);
      if (error) setError(error.message);
      else setSuccess('Το μάθημα προστέθηκε!');
    }
    setSaving(false);
    fetchCourses();
    handleCloseDialog();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Σίγουρα θέλεις να διαγράψεις το μάθημα;')) return;
    setError('');
    setSuccess('');
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) setError(error.message);
    else setSuccess('Το μάθημα διαγράφηκε!');
    fetchCourses();
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" color="secondary" gutterBottom>
        Διαχείριση Μαθημάτων
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ mb: 2 }}>
        Προσθήκη Μαθήματος
      </Button>
      {loading ? (
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Όνομα Μαθήματος</TableCell>
                <TableCell>Εξάμηνο</TableCell>
                <TableCell align="right">Ενέργειες</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.length === 0 ? (
                <TableRow><TableCell colSpan={3} align="center">Δεν υπάρχουν μαθήματα.</TableCell></TableRow>
              ) : courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>{course.name}</TableCell>
                  <TableCell>{course.semester}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(course)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(course.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="xs">
        <DialogTitle>{editCourse ? 'Επεξεργασία Μαθήματος' : 'Προσθήκη Μαθήματος'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Όνομα Μαθήματος"
            value={courseName}
            onChange={e => setCourseName(e.target.value)}
            fullWidth
            autoFocus
            sx={{ mt: 1 }}
          />
          <TextField
            label="Εξάμηνο"
            type="number"
            value={courseSemester}
            onChange={e => setCourseSemester(Number(e.target.value))}
            fullWidth
            sx={{ mt: 2 }}
            inputProps={{ min: 1, max: 8 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Ακύρωση</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>{editCourse ? 'Αποθήκευση' : 'Προσθήκη'}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminCourses; 