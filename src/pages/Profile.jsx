import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, CardActions, Button, Box, CircularProgress, Alert, TextField, Stack, Snackbar, InputAdornment, IconButton, Skeleton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import MenuItem from '@mui/material/MenuItem';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const ADMIN_UID = 'ae26da15-7102-4647-8cbb-8f045491433c';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Fetch user and profile
  useEffect(() => {
    let ignore = false;
    supabase.auth.getSession().then(async ({ data, error }) => {
      if (error) {
        setError('Σφάλμα κατά τον έλεγχο σύνδεσης.');
        setLoading(false);
        return;
      }
      if (!data.session) {
        navigate('/login');
      } else {
        setUser(data.session.user);
        // Fetch profile
        const { data: prof, error: profErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
        if (!ignore) {
          if (profErr) setError('Σφάλμα ανάκτησης προφίλ.');
          else setProfile(prof);
          setLoading(false);
        }
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
      ignore = true;
      listener?.subscription.unsubscribe();
    };
  }, [navigate]);

  // Handle profile field change
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Save profile changes
  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    const updateObj = {
      first_name: profile.first_name,
      last_name: profile.last_name,
      updated_at: new Date().toISOString(),
    };
    if (user.id === ADMIN_UID) {
      updateObj.role = profile.role;
    }
    const { error: updateErr } = await supabase
      .from('profiles')
      .update(updateObj)
      .eq('id', user.id);
    if (updateErr) setError('Σφάλμα αποθήκευσης: ' + updateErr.message);
    else setSuccess('Τα στοιχεία αποθηκεύτηκαν!');
    setSaving(false);
  };

  // Change password
  const handlePasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες.');
      return;
    }
    const { error: passErr } = await supabase.auth.updateUser({ password: newPassword });
    if (passErr) setPasswordError(passErr.message);
    else setPasswordSuccess('Ο κωδικός άλλαξε!');
    setShowPasswordFields(false);
    setNewPassword('');
  };

  if (loading) return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 4 }}>
      <Card variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <CardContent>
          <Typography variant="h5" color="primary" gutterBottom>
            ΠΡΟΦΙΛ ΧΡΗΣΤΗ
          </Typography>
          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 2, width: '60%' }} />
          </Stack>
        </CardContent>
        <CardActions sx={{ mt: 2 }}>
          <Skeleton variant="rectangular" height={40} width="100%" sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={40} width="100%" sx={{ borderRadius: 2 }} />
        </CardActions>
      </Card>
    </Container>
  );
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!user || !profile) return null;

  return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 4 }}>
      <Card variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <CardContent>
          <Typography variant="h5" color="primary" gutterBottom>
            ΠΡΟΦΙΛ ΧΡΗΣΤΗ
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="ΟΝΟΜΑ"
              name="first_name"
              value={profile.first_name || ''}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="ΕΠΩΝΥΜΟ"
              name="last_name"
              value={profile.last_name || ''}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Email"
              value={user.email}
              fullWidth
              InputProps={{ readOnly: true }}
            />
            {user.id === ADMIN_UID ? (
              <TextField
                select
                label="ΡΟΛΟΣ"
                name="role"
                value={profile.role || 'student'}
                onChange={handleChange}
                fullWidth
                helperText="Μόνο ο admin μπορεί να αλλάξει το ρόλο."
              >
                <MenuItem value="student">ΦΟΙΤΗΤΗΣ</MenuItem>
                <MenuItem value="admin">ADMIN</MenuItem>
              </TextField>
            ) : (
              <TextField
                label="ΡΟΛΟΣ"
                value={profile.role || 'student'}
                fullWidth
                InputProps={{ readOnly: true }}
                helperText={user.id === ADMIN_UID ? 'Μόνο ο admin μπορεί να αλλάξει το ρόλο.' : ''}
              />
            )}
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setShowPasswordFields((v) => !v)}
              fullWidth
            >
              ΑΛΛΑΓΗ ΚΩΔΙΚΟΥ
            </Button>
            {showPasswordFields && (
              <Stack spacing={1}>
                <TextField
                  label="ΝΕΟΣ ΚΩΔΙΚΟΣ"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword((show) => !show)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handlePasswordChange}
                  fullWidth
                >
                  ΑΠΟΘΗΚΕΥΣΗ ΚΩΔΙΚΟΥ
                </Button>
                {passwordError && <Alert severity="error">{passwordError}</Alert>}
                {passwordSuccess && <Alert severity="success">{passwordSuccess}</Alert>}
              </Stack>
            )}
          </Stack>
        </CardContent>
        <CardActions sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            fullWidth
            disabled={saving}
          >
            ΑΠΟΘΗΚΕΥΣΗ ΣΤΟΙΧΕΙΩΝ
          </Button>
          <Button variant="outlined" color="error" onClick={async () => { await supabase.auth.signOut(); navigate('/'); }} fullWidth>ΑΠΟΣΥΝΔΕΣΗ</Button>
        </CardActions>
        <Snackbar
          open={!!success}
          autoHideDuration={3000}
          onClose={() => setSuccess('')}
          message={success}
        />
      </Card>
    </Container>
  );
};

export default Profile; 