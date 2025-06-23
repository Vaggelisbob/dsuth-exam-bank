import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, TablePagination, TextField, InputAdornment, Card, CardContent, CardActions, Stack, Skeleton } from '@mui/material';
import { supabase } from '../../supabaseClient';
import SearchIcon from '@mui/icons-material/Search';

const AdminFiles = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    setError('');
    const { data, error } = await supabase.from('exams').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setExams(data);
    setLoading(false);
  };

  useEffect(() => { fetchExams(); }, []);

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

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" color="secondary" gutterBottom align={isMobile ? 'center' : 'left'}>
        ΔΙΑΧΕΙΡΙΣΗ ΑΡΧΕΙΩΝ
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Stack direction={isMobile ? 'column' : 'row'} spacing={2} sx={{ mb: 2, alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'flex-end' }}>
        <TextField
          placeholder="ΑΝΑΖΗΤΗΣΗ..."
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
        <Box sx={{ mt: 2 }}>
          {isMobile ? (
            <Stack spacing={2}>
              {[...Array(3)].map((_, i) => (
                <Card key={i} variant="outlined">
                  <CardContent>
                    <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="40%" height={24} />
                    <Skeleton variant="text" width="30%" height={24} />
                    <Skeleton variant="text" width="30%" height={24} />
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="40%" height={24} />
                  </CardContent>
                  <CardActions>
                    <Skeleton variant="rectangular" width="100%" height={36} />
                    <Skeleton variant="rectangular" width="100%" height={36} />
                    <Skeleton variant="rectangular" width="100%" height={36} />
                  </CardActions>
                </Card>
              ))}
            </Stack>
          ) : (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ΤΙΤΛΟΣ</TableCell>
                    <TableCell>ΜΑΘΗΜΑ</TableCell>
                    <TableCell>ΕΤΟΣ</TableCell>
                    <TableCell>ΕΞΕΤΑΣΤΙΚΗ</TableCell>
                    <TableCell>UPLOADER</TableCell>
                    <TableCell>ΕΓΚΕΚΡΙΜΕΝΟ</TableCell>
                    <TableCell>ΛΗΨΗ</TableCell>
                    <TableCell>ΕΝΕΡΓΕΙΕΣ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                      <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                      <TableCell><Skeleton variant="text" width="40%" /></TableCell>
                      <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                      <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                      <TableCell><Skeleton variant="text" width="40%" /></TableCell>
                      <TableCell><Skeleton variant="rectangular" width={80} height={32} /></TableCell>
                      <TableCell><Skeleton variant="rectangular" width={80} height={32} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
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
                      APPROVE
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDelete(exam.id, exam.file_url)}
                    fullWidth
                  >
                    ΔΙΑΓΡΑΦΗ
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
                    DOWNLOAD
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
                <TableCell>ΤΙΤΛΟΣ</TableCell>
                <TableCell>ΜΑΘΗΜΑ</TableCell>
                <TableCell>ΕΤΟΣ</TableCell>
                <TableCell>ΕΞΕΤΑΣΤΙΚΗ</TableCell>
                <TableCell>UPLOADER</TableCell>
                <TableCell>ΕΓΚΕΚΡΙΜΕΝΟ</TableCell>
                <TableCell>ΛΗΨΗ</TableCell>
                <TableCell>ΕΝΕΡΓΕΙΕΣ</TableCell>
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
                        DOWNLOAD
                      </Button>
                    </TableCell>
                    <TableCell>
                      {!exam.approved && (
                        <Button variant="outlined" color="success" size="small" sx={{ mr: 1 }} onClick={() => handleApprove(exam.id)}>
                          APPROVE
                        </Button>
                      )}
                      <Button variant="outlined" color="error" size="small" onClick={() => handleDelete(exam.id, exam.file_url)}>
                        ΔΙΑΓΡΑΦΗ
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

export default AdminFiles; 