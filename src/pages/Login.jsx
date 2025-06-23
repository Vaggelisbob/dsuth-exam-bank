import React, { useState } from 'react';
import { Container, Typography, Box, Button, TextField, Alert, Stack } from '@mui/material';
import { supabase } from '../supabaseClient';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else setMessage('Επιτυχής είσοδος!');
    setLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    else setMessage('Έγινε εγγραφή! Έλεγξε το email σου για επιβεβαίωση.');
    setLoading(false);
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8, mb: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" color="primary" gutterBottom align={isMobile ? 'center' : 'left'}>
          Είσοδος / Εγγραφή
        </Typography>
        <Box component="form" sx={{ mt: 2, width: '100%' }}>
          <Stack spacing={2} direction="column">
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <TextField
              label="Κωδικός"
              type="password"
              fullWidth
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            {error && <Alert severity="error">{error}</Alert>}
            {message && <Alert severity="success">{message}</Alert>}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ fontSize: isMobile ? '1.1rem' : '1rem', py: isMobile ? 2 : 1 }}
              onClick={handleSignIn}
              disabled={loading}
            >
              Είσοδος
            </Button>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              sx={{ fontSize: isMobile ? '1.1rem' : '1rem', py: isMobile ? 2 : 1 }}
              onClick={handleSignUp}
              disabled={loading}
            >
              Εγγραφή
            </Button>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
};

export default Login; 