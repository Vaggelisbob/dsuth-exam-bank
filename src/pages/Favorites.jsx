import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Card, CardContent, Skeleton, Stack, Divider, useTheme, IconButton, Badge, Chip, Tooltip, Alert, Button } from '@mui/material';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Favorites = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examCounts, setExamCounts] = useState({});
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]); // ids των αγαπημένων μαθημάτων
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    // Φέρνουμε τα αγαπημένα course_ids
    supabase
      .from('favorites')
      .select('course_id')
      .eq('user_id', user.id)
      .then(async ({ data, error }) => {
        if (!error && data) {
          const favIds = data.map(f => f.course_id);
          setFavorites(favIds);
          // Παίρνουμε τα courses
          if (favIds.length > 0) {
            const { data: courseData } = await supabase.from('courses').select('*').in('id', favIds);
            setCourses(courseData || []);
          } else {
            setCourses([]);
          }
        }
        setLoading(false);
      });
  }, [user]);

  useEffect(() => {
    const fetchExamCounts = async () => {
      const { data, error } = await supabase
        .from('exams')
        .select('course, id', { count: 'exact', head: false })
        .eq('approved', true);
      if (!error && data) {
        const counts = {};
        data.forEach(e => {
          counts[e.course] = (counts[e.course] || 0) + 1;
        });
        setExamCounts(counts);
      }
    };
    fetchExamCounts();
  }, []);

  // Ομαδοποίηση ανά εξάμηνο
  const grouped = courses.reduce((acc, course) => {
    acc[course.semester] = acc[course.semester] || [];
    acc[course.semester].push(course);
    return acc;
  }, {});

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ width: '100%', maxWidth: 420, mt: 6 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" align="center" color="primary" fontWeight={700}>
              Αγαπημένα
            </Typography>
          </Box>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ mb: 2 }}>
              <Alert severity="info" sx={{ fontSize: 17, fontWeight: 500, textAlign: 'center', mb: 2 }}>
                Για να δείτε τα αγαπημένα σας μαθήματα, πρέπει να συνδεθείτε.
              </Alert>
              <Button variant="contained" color="primary" fullWidth sx={{ fontWeight: 700, fontSize: 17, textTransform: 'none' }} onClick={() => navigate('/login')}>
                Σύνδεση
              </Button>
            </Box>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" color="primary" gutterBottom align="center" sx={{ fontWeight: 700, letterSpacing: 1 }}>
        Τα Αγαπημένα μου Μαθήματα
      </Typography>
      {loading ? (
        <Stack spacing={3}>
          {[1,2,3].map(i => <Skeleton key={i} variant="rounded" height={120} />)}
        </Stack>
      ) : courses.length === 0 ? (
        <Typography align="center" color="text.secondary" sx={{ mt: 6, fontSize: '1.2rem' }}>
          Δεν έχεις προσθέσει ακόμα αγαπημένα μαθήματα.
        </Typography>
      ) : (
        Object.keys(grouped).sort((a, b) => a - b).map(sem => (
          <Box key={sem} sx={{ mb: 5 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111', letterSpacing: 0.5 }}>{`Εξάμηνο ${sem}`}</Typography>
              <Divider flexItem sx={{ borderColor: '#111', ml: 2 }} />
            </Stack>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 3,
              }}
            >
              {grouped[sem].map(course => (
                <Card
                  key={course.id}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 3,
                    boxShadow: 3,
                    background: `linear-gradient(120deg, #f4f6fb 0%, #dbeafe 60%, #f4f6f8 100%)`,
                    backdropFilter: 'blur(1.5px)',
                    border: '1.5px solid #e3eafc',
                    transition: 'transform 0.18s, box-shadow 0.18s, background 0.18s',
                    '&:hover': {
                      boxShadow: 8,
                      transform: 'translateY(-4px) scale(1.03)',
                      background: 'linear-gradient(120deg, #e3eafc 0%, #b6d6fa 60%, #f4f6fb 100%)',
                    },
                    minHeight: { xs: 110, md: 200 },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  <CardContent sx={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, px: 2, py: 2, pb: 1 }}>
                    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <SchoolRoundedIcon color="primary" sx={{ fontSize: 40, flexShrink: 0, mr: 1 }} />
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                          variant="h6"
                          fontWeight={800}
                          sx={{
                            color: theme.palette.primary.dark,
                            mb: 0.5,
                            fontSize: { xs: '1.1rem', sm: '1.18rem', md: '1.22rem' },
                            wordBreak: 'break-word',
                            whiteSpace: 'normal',
                          }}
                        >
                          {course.name}
                        </Typography>
                        <Chip label={`Εξάμηνο ${course.semester}`} size="small" sx={{ mt: 0.5, background: '#e3eafc', color: theme.palette.primary.dark, fontWeight: 600, fontSize: '0.95em' }} />
                      </Box>
                    </Box>
                  </CardContent>
                  <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, px: 2, pb: 1, mt: 'auto' }}>
                    <Tooltip title="Διαθέσιμα αρχεία">
                      <Badge badgeContent={examCounts[course.name] || 0} color="info" sx={{ '& .MuiBadge-badge': { fontSize: '0.85em', minWidth: 20, height: 20 } }} showZero>
                        <InsertDriveFileIcon color="action" sx={{ fontSize: 28 }} />
                      </Badge>
                    </Tooltip>
                    <FavoriteIcon color="error" sx={{ fontSize: 28 }} />
                  </Box>
                </Card>
              ))}
            </Box>
          </Box>
        ))
      )}
    </Container>
  );
};

export default Favorites; 