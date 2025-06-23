import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, TextField, MenuItem, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Card, CardContent, CardActions, Stack } from '@mui/material';
import { supabase } from '../supabaseClient';

const periods = ['Ιανουάριος', 'Ιούνιος', 'Σεπτέμβριος'];

const Home = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  const [period, setPeriod] = useState('');
  const [courses, setCourses] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      let query = supabase.from('exams').select('*').eq('approved', true).order('created_at', { ascending: false });
      if (course) query = query.eq('course', course);
      if (year) query = query.eq('year', parseInt(year));
      if (period) query = query.eq('period', period);
      const { data, error } = await query;
      if (!error) setExams(data);
      setLoading(false);
    };
    fetchExams();
  }, [course, year, period]);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase.from('exams').select('course').neq('course', '').eq('approved', true);
      if (!error && data) {
        const uniqueCourses = [...new Set(data.map(x => x.course))];
        setCourses(uniqueCourses);
      }
    };
    fetchCourses();
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" color="primary" gutterBottom>
        Τράπεζα Θεμάτων - Ψηφιακά Συστήματα ΠΘ
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Εδώ θα βρείτε θέματα και αρχεία προηγούμενων εξετάσεων. Συνδεθείτε για να ανεβάσετε νέο αρχείο.
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Μάθημα"
          select
          value={course}
          onChange={e => setCourse(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">Όλα</MenuItem>
          {courses.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </TextField>
        <TextField
          label="Έτος"
          type="number"
          value={year}
          onChange={e => setYear(e.target.value)}
          sx={{ minWidth: 100 }}
        />
        <TextField
          label="Εξεταστική"
          select
          value={period}
          onChange={e => setPeriod(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">Όλες</MenuItem>
          {periods.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
        </TextField>
        <Button variant="outlined" onClick={() => { setCourse(''); setYear(''); setPeriod(''); }}>Καθαρισμός</Button>
      </Stack>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : isMobile ? (
        <Stack spacing={2}>
          {exams.length === 0 ? (
            <Typography align="center">Δεν βρέθηκαν αρχεία.</Typography>
          ) : (
            exams.map((exam) => (
              <Card key={exam.id} variant="outlined">
                <CardContent>
                  <Typography variant="h6">{exam.title}</Typography>
                  <Typography variant="body2">Μάθημα: {exam.course}</Typography>
                  <Typography variant="body2">Έτος: {exam.year}</Typography>
                  <Typography variant="body2">Εξεταστική: {exam.period}</Typography>
                </CardContent>
                <CardActions>
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
                <TableCell>Λήψη</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">Δεν βρέθηκαν αρχεία.</TableCell>
                </TableRow>
              ) : (
                exams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell>{exam.title}</TableCell>
                    <TableCell>{exam.course}</TableCell>
                    <TableCell>{exam.year}</TableCell>
                    <TableCell>{exam.period}</TableCell>
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default Home; 