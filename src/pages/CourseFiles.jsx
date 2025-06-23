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
                borderRadius: 4,
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.12)',
                background: file.approved
                  ? 'linear-gradient(120deg, rgba(227,240,255,0.85) 60%, rgba(201,231,255,0.85) 100%)'
                  : 'linear-gradient(120deg, #fffbe6cc 60%, #ffd20033 100%)',
                backdropFilter: 'blur(6px)',
                borderColor: file.approved ? theme.palette.primary.light : theme.palette.secondary.main,
                display: 'flex',
                alignItems: 'center',
                px: { xs: 1, sm: 2 },
                transition: 'box-shadow 0.2s, transform 0.2s',
                '&:hover': { boxShadow: '0 12px 32px 0 rgba(31,38,135,0.18)', transform: 'translateY(-2px) scale(1.01)' },
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: { xs: 1, sm: 2 } }}>
                <PictureAsPdfRoundedIcon color={file.approved ? 'primary' : 'warning'} sx={{ fontSize: 48, mb: 0.5 }} />
                <Box sx={{ mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    PDF
                  </Typography>
                </Box>
              </Box>
              <CardContent sx={{ flex: 1, py: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} spacing={1} justifyContent="space-between">
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: theme.palette.primary.dark }}>
                      Έτος: {file.year} | Εξεταστική: {file.period}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                      <Avatar sx={{ width: 28, height: 28, bgcolor: theme.palette.primary.main, fontSize: 16, boxShadow: 2 }}>
                        <PersonIcon fontSize="small" />
                      </Avatar>
                      <Box sx={{ bgcolor: '#fff', px: 1.5, py: 0.5, borderRadius: 2, boxShadow: 1, ml: -1, fontWeight: 600, fontSize: 14, color: 'primary.main', border: '1px solid #e3f0ff' }}>
                        {uploaders[file.uploader] || file.uploader}
                      </Box>
                    </Stack>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: { xs: 1, sm: 0 } }}>
                    <Box sx={{
                      bgcolor: file.approved ? 'success.main' : 'warning.main',
                      color: '#fff',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      fontWeight: 700,
                      fontSize: 13,
                      letterSpacing: 0.5,
                      boxShadow: 1,
                    }}>
                      {file.approved ? 'Εγκεκριμένο' : 'Αναμονή έγκρισης'}
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
              <CardActions sx={{ p: 2, flexDirection: 'column', gap: 1.2, minWidth: 120, justifyContent: 'center', alignItems: 'center' }}>
                <Tooltip title="Προβολή PDF">
                  <Button
                    variant="outlined"
                    color="info"
                    href={file.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="medium"
                    sx={{ minWidth: 44, width: 44, height: 44, borderRadius: '50%', boxShadow: 1, transition: 'all 0.15s', '&:hover': { boxShadow: 3 }, p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                  >
                    <VisibilityIcon />
                  </Button>
                </Tooltip>
                <Tooltip title="Λήψη PDF">
                  <Button
                    variant="contained"
                    color="primary"
                    href={file.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="medium"
                    sx={{ minWidth: 44, width: 44, height: 44, borderRadius: '50%', boxShadow: 1, transition: 'all 0.15s', '&:hover': { boxShadow: 3 }, p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                  >
                    <DownloadIcon />
                  </Button>
                </Tooltip>
                {user && user.id === ADMIN_UID && !file.approved && (
                  <Tooltip title="Έγκριση αρχείου">
                    <Button variant="outlined" color="success" onClick={() => handleApprove(file.id)} size="medium" sx={{ minWidth: 44, width: 44, height: 44, borderRadius: '50%', boxShadow: 1, transition: 'all 0.15s', '&:hover': { boxShadow: 3 }, p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <CheckIcon />
                    </Button>
                  </Tooltip>
                )}
                {user && user.id === ADMIN_UID && (
                  <Tooltip title="Διαγραφή αρχείου">
                    <Button variant="outlined" color="error" onClick={() => handleDelete(file.id, file.file_url)} size="medium" sx={{ minWidth: 44, width: 44, height: 44, borderRadius: '50%', boxShadow: 1, transition: 'all 0.15s', '&:hover': { boxShadow: 3 }, p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <DeleteIcon />
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