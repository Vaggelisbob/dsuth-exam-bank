import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, TextField, MenuItem, Alert, CircularProgress, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const periods = [
  'Ιανουάριος',
  'Ιούνιος',
  'Σεπτέμβριος',
];

const Upload = () => {
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  const [period, setPeriod] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate('/login');
      } else {
        setUser(data.session.user);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/login');
      } else {
        setUser(session.user);
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!title || !course || !year || !period || !file) {
      setError('Συμπλήρωσε όλα τα πεδία και επίλεξε αρχείο.');
      return;
    }
    setLoading(true);
    // 1. Ανεβάζουμε το αρχείο στο Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${user.id}.${fileExt}`;
    const { data: storageData, error: storageError } = await supabase.storage.from('exams').upload(fileName, file);
    if (storageError) {
      setError('Σφάλμα στο ανέβασμα αρχείου: ' + storageError.message);
      setLoading(false);
      return;
    }
    // 2. Παίρνουμε το public URL
    const { data: publicUrlData } = supabase.storage.from('exams').getPublicUrl(fileName);
    // 3. Καταχωρούμε στη βάση
    const { error: dbError } = await supabase.from('exams').insert([
      {
        title,
        course,
        year: parseInt(year),
        period,
        uploader: user.id,
        file_url: publicUrlData.publicUrl,
      },
    ]);
    if (dbError) {
      setError('Σφάλμα στη βάση: ' + dbError.message);
      setLoading(false);
      return;
    }
    setSuccess('Το αρχείο ανέβηκε με επιτυχία!');
    setTitle('');
    setCourse('');
    setYear('');
    setPeriod('');
    setFile(null);
    setLoading(false);
  };

  if (!user) return null;

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" color="primary" gutterBottom align={isMobile ? 'center' : 'left'}>
        Ανέβασμα Αρχείου Εξέτασης
      </Typography>
      <Box component="form" onSubmit={handleUpload} sx={{ mt: 2 }}>
        <Stack spacing={2} direction="column">
          <TextField
            label="Τίτλος"
            fullWidth
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <TextField
            label="Μάθημα"
            fullWidth
            value={course}
            onChange={e => setCourse(e.target.value)}
          />
          <TextField
            label="Έτος"
            type="number"
            fullWidth
            value={year}
            onChange={e => setYear(e.target.value)}
          />
          <TextField
            label="Εξεταστική"
            select
            fullWidth
            value={period}
            onChange={e => setPeriod(e.target.value)}
          >
            {periods.map((p) => (
              <MenuItem key={p} value={p}>{p}</MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            component="label"
            sx={{ mt: 1, fontSize: isMobile ? '1.1rem' : '1rem', py: isMobile ? 2 : 1 }}
            fullWidth
          >
            Επιλογή Αρχείου
            <input
              type="file"
              hidden
              accept="application/pdf"
              onChange={e => setFile(e.target.files[0])}
            />
          </Button>
          {file && <Typography variant="body2" sx={{ mt: 1 }}>{file.name}</Typography>}
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
          <Box sx={{ mt: 2, position: 'relative' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              fullWidth
              sx={{ fontSize: isMobile ? '1.1rem' : '1rem', py: isMobile ? 2 : 1 }}
            >
              Ανέβασμα
            </Button>
            {loading && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', mt: '-12px', ml: '-12px' }} />}
          </Box>
        </Stack>
      </Box>
    </Container>
  );
};

export default Upload; 