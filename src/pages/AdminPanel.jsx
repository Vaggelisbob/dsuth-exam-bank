import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, TablePagination, TextField, InputAdornment, Card, CardContent, CardActions, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import SearchIcon from '@mui/icons-material/Search';

const ADMIN_UID = 'ae26da15-7102-4647-8cbb-8f045491433c'; // Βάλε εδώ το admin uid

const AdminPanel = () => {
  const [user, setUser] = useState(null);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate('/login');
      } else if (data.session.user.id !== ADMIN_UID) {
        navigate('/');
      } else {
        setUser(data.session.user);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/login');
      } else if (session.user.id !== ADMIN_UID) {
        navigate('/');
      } else {
        setUser(session.user);
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchExams = async () => {
    setLoading(true);
    setError('');
    const { data, error } = await supabase.from('exams').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setExams(data);
    setLoading(false);
  };

  const fetchUsers = async (userIds) => {
    if (!userIds.length) return;
    // Supabase public schema δεν επιτρέπει select * from auth.users, οπότε χρησιμοποιούμε RPC ή view αν έχεις φτιάξει. Εναλλακτικά, δείχνουμε το uid.
    // Εδώ θα προσπαθήσουμε να κάνουμε fetch από public.users αν υπάρχει, αλλιώς αφήνουμε το uid.
    // Αν έχεις view users με email, κάνε select από εκεί.
  };

  useEffect(() => {
    if (user) fetchExams();
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    // Fetch emails των uploaders αν υπάρχει view/table
    const getUploaderEmails = async () => {
      const uploaderIds = [...new Set(exams.map(e => e.uploader).filter(Boolean))];
      if (uploaderIds.length === 0) return;
      // Προσπάθησε να κάνεις fetch από public.users (αν υπάρχει)
      // Αν δεν υπάρχει, άφησε το uid
      // Παράδειγμα:
      // const { data } = await supabase.from('users').select('id,email').in('id', uploaderIds);
      // if (data) {
      //   const map = {};
      //   data.forEach(u => { map[u.id] = u.email; });
      //   setUsers(map);
      // }
    };
    getUploaderEmails();
  }, [exams]);

  const handleApprove = async (id) => {
    setError(''); setSuccess('');
    const { error } = await supabase.from('exams').update({ approved: true }).eq('id', id);
    if (error) setError(error.message);
    else { setSuccess('Εγκρίθηκε!'); fetchExams(); }
  };

  const handleDelete = async (id, file_url) => {
    setError(''); setSuccess('');
    // Διαγραφή από storage
    const filePath = file_url.split('/exams/')[1];
    if (filePath) {
      await supabase.storage.from('exams').remove([filePath]);
    }
    // Διαγραφή από DB
    const { error } = await supabase.from('exams').delete().eq('id', id);
    if (error) setError(error.message);
    else { setSuccess('Διαγράφηκε!'); fetchExams(); }
  };

  // Search & Pagination
  const filteredExams = exams.filter(exam => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (exam.title && exam.title.toLowerCase().includes(s)) ||
      (exam.course && exam.course.toLowerCase().includes(s)) ||
      (exam.period && exam.period.toLowerCase().includes(s)) ||
      (exam.year && String(exam.year).includes(s))
    );
  });
  const paginatedExams = filteredExams.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (!user) return null;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" color="secondary" gutterBottom align={isMobile ? 'center' : 'left'}>
        Admin Panel - Διαχείριση Αρχείων
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Stack direction={isMobile ? 'column' : 'row'} spacing={2} sx={{ mb: 2, alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'flex-end' }}>
        <TextField
          placeholder="Αναζήτηση..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, minWidth: isMobile ? 0 : 200 }}
        />
      </Stack>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : isMobile ? (
        <Stack spacing={2}>
          {paginatedExams.length === 0 ? (
            <Typography align="center">Δεν βρέθηκαν αρχεία.</Typography>
          ) : (
            paginatedExams.map((exam) => (
              <Card key={exam.id} variant="outlined">
                <CardContent>
                  <Typography variant="h6">{exam.title}</Typography>
                  <Typography variant="body2">Μάθημα: {exam.course}</Typography>
                  <Typography variant="body2">Έτος: {exam.year}</Typography>
                  <Typography variant="body2">Εξεταστική: {exam.period}</Typography>
                  <Typography variant="body2">Uploader: {users[exam.uploader] || exam.uploader}</Typography>
                  <Typography variant="body2">Εγκεκριμένο: {exam.approved ? 'Ναι' : 'Όχι'}</Typography>
                </CardContent>
                <CardActions>
                  {!exam.approved && (
                    <Button variant="outlined" color="success" size="small" onClick={() => handleApprove(exam.id)} fullWidth>
                      Approve
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDelete(exam.id, exam.file_url)}
                    fullWidth
                  >
                    Διαγραφή
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    href={exam.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    fullWidth
                  >
                    Download
                  </Button>
                </CardActions>
              </Card>
            ))
          )}
          <TablePagination
            component="div"
            count={filteredExams.length}
            page={page}
            onPageChange={(_e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Stack>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Τίτλος</TableCell>
                <TableCell>Μάθημα</TableCell>
                <TableCell>Έτος</TableCell>
                <TableCell>Εξεταστική</TableCell>
                <TableCell>Uploader</TableCell>
                <TableCell>Εγκεκριμένο</TableCell>
                <TableCell>Λήψη</TableCell>
                <TableCell>Ενέργειες</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedExams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">Δεν βρέθηκαν αρχεία.</TableCell>
                </TableRow>
              ) : (
                paginatedExams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell>{exam.title}</TableCell>
                    <TableCell>{exam.course}</TableCell>
                    <TableCell>{exam.year}</TableCell>
                    <TableCell>{exam.period}</TableCell>
                    <TableCell>{users[exam.uploader] || exam.uploader}</TableCell>
                    <TableCell>{exam.approved ? 'Ναι' : 'Όχι'}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        href={exam.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                      >
                        Download
                      </Button>
                    </TableCell>
                    <TableCell>
                      {!exam.approved && (
                        <Button variant="outlined" color="success" size="small" sx={{ mr: 1 }} onClick={() => handleApprove(exam.id)}>
                          Approve
                        </Button>
                      )}
                      <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(exam.id, exam.file_url)}>
                        Διαγραφή
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredExams.length}
            page={page}
            onPageChange={(_e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </TableContainer>
      )}
    </Container>
  );
};

export default AdminPanel; 