import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, Card, CardContent, CardActions, Button, Skeleton, Stack, Alert, Tooltip, Avatar, useTheme } from '@mui/material';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import PersonIcon from '@mui/icons-material/Person';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import { supabase } from '../supabaseClient';

const ADMIN_UID = 'ae26da15-7102-4647-8cbb-8f045491433c';

const CourseFiles = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploaders, setUploaders] = useState({});
  const theme = useTheme();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      // Fetch course
      const { data: courseData, error: courseError } = await supabase.from('courses').select('*').eq('id', id).single();
      if (courseError) { setError('Σφάλμα ανάκτησης μαθήματος'); setLoading(false); return; }
      setCourse(courseData);
      // Fetch files
      let query = supabase.from('exams').select('*').eq('course', courseData.name).order('created_at', { ascending: false });
      if (!user || user.id !== ADMIN_UID) query = query.eq('approved', true);
      const { data: filesData, error: filesError } = await query;
      if (filesError) { setError('Σφάλμα ανάκτησης αρχείων'); setLoading(false); return; }
      setFiles(filesData);
      // Fetch uploader names
      const uploaderIds = [...new Set((filesData || []).map(f => f.uploader).filter(Boolean))];
      if (uploaderIds.length > 0) {
        const { data: uploaderProfiles } = await supabase.from('profiles').select('id,first_name,last_name,email').in('id', uploaderIds);
        if (uploaderProfiles) {
          const map = {};
          uploaderProfiles.forEach(u => {
            map[u.id] = (u.first_name || u.last_name) ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : (u.email || u.id);
          });
          setUploaders(map);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [id, user]);

  const handleApprove = async (fileId) => {
    setError(''); setSuccess('');
    const { error } = await supabase.from('exams').update({ approved: true }).eq('id', fileId);
    if (error) setError('Σφάλμα έγκρισης: ' + error.message);
    else { setSuccess('Εγκρίθηκε!'); setFiles(files => files.map(f => f.id === fileId ? { ...f, approved: true } : f)); }
  };
  const handleDelete = async (fileId, file_url) => {
    setError(''); setSuccess('');
    // Διαγραφή από storage
    const filePath = file_url.split('/exams/')[1];
    if (filePath) {
      await supabase.storage.from('exams').remove([filePath]);
    }
    // Διαγραφή από DB
    const { error } = await supabase.from('exams').delete().eq('id', fileId);
    if (error) setError('Σφάλμα διαγραφής: ' + error.message);
    else { setSuccess('Διαγράφηκε!'); setFiles(files => files.filter(f => f.id !== fileId)); }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {course && <Typography variant="h5" color="primary" gutterBottom align="center" sx={{ fontWeight: 700 }}>{course.name} (Εξάμηνο {course.semester})</Typography>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {loading ? (
        <Stack spacing={2}>
          {[1,2].map(i => <Skeleton key={i} variant="rounded" height={110} />)}
        </Stack>
      ) : files.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <SentimentDissatisfiedIcon color="disabled" sx={{ fontSize: 60, mb: 1 }} />
          <Typography variant="h6" color="text.secondary">Δεν υπάρχουν αρχεία για αυτό το μάθημα.</Typography>
        </Box>
      ) : (
        <Stack spacing={3}>
          {files.map(file => (
            <Card
              key={file.id}
              variant="outlined"
              sx={{
                borderRadius: 3,
                boxShadow: 2,
                background: file.approved
                  ? `linear-gradient(90deg, ${theme.palette.background.paper} 60%, ${theme.palette.secondary.main}11 100%)`
                  : `linear-gradient(90deg, #fffbe6 60%, #ffd20033 100%)`,
                borderColor: file.approved ? theme.palette.primary.light : theme.palette.secondary.main,
                display: 'flex',
                alignItems: 'center',
                px: 2,
              }}
            >
              <PictureAsPdfRoundedIcon color={file.approved ? 'primary' : 'warning'} sx={{ fontSize: 48, mr: 2 }} />
              <CardContent sx={{ flex: 1, py: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={1} justifyContent="space-between">
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: theme.palette.primary.dark }}>
                      Έτος: {file.year} | Εξεταστική: {file.period}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                      <Avatar sx={{ width: 28, height: 28, bgcolor: theme.palette.primary.main, fontSize: 16 }}>
                        <PersonIcon fontSize="small" />
                      </Avatar>
                      <Typography variant="body2" color="text.secondary">
                        {uploaders[file.uploader] || file.uploader}
                      </Typography>
                    </Stack>
                  </Box>
                  <Typography variant="body2" color={file.approved ? 'success.main' : 'warning.main'} fontWeight={600} sx={{ mt: { xs: 1, sm: 0 } }}>
                    {file.approved ? 'Εγκεκριμένο' : 'Αναμονή έγκρισης'}
                  </Typography>
                </Stack>
              </CardContent>
              <CardActions sx={{ p: 2, flexDirection: 'column', gap: 1, minWidth: 120, justifyContent: 'center', alignItems: 'center' }}>
                <Tooltip title="Προβολή PDF">
                  <Button
                    variant="outlined"
                    color="info"
                    href={file.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<VisibilityIcon />}
                    size="small"
                    fullWidth
                    sx={{ minWidth: 140, fontWeight: 600, textTransform: 'none', justifyContent: 'center', alignItems: 'center', display: 'flex', px: 0 }}
                  >
                    Προβολή
                  </Button>
                </Tooltip>
                <Tooltip title="Λήψη PDF">
                  <Button
                    variant="contained"
                    color="primary"
                    href={file.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<DownloadIcon />}
                    size="small"
                    fullWidth
                    sx={{ minWidth: 140, fontWeight: 600, textTransform: 'none', justifyContent: 'center', alignItems: 'center', display: 'flex', px: 0 }}
                  >
                    Download
                  </Button>
                </Tooltip>
                {user && user.id === ADMIN_UID && !file.approved && (
                  <Tooltip title="Έγκριση αρχείου">
                    <Button variant="outlined" color="success" startIcon={<CheckIcon />} onClick={() => handleApprove(file.id)} size="small" fullWidth sx={{ minWidth: 140, fontWeight: 600, textTransform: 'none', justifyContent: 'center', alignItems: 'center', display: 'flex', px: 0 }}>
                      Έγκριση
                    </Button>
                  </Tooltip>
                )}
                {user && user.id === ADMIN_UID && (
                  <Tooltip title="Διαγραφή αρχείου">
                    <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => handleDelete(file.id, file.file_url)} size="small" fullWidth sx={{ minWidth: 140, fontWeight: 600, textTransform: 'none', justifyContent: 'center', alignItems: 'center', display: 'flex', px: 0 }}>
                      Διαγραφή
                    </Button>
                  </Tooltip>
                )}
              </CardActions>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
};

export default CourseFiles; 