import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Card, CardContent, Skeleton, Stack, Divider, useTheme, IconButton } from '@mui/material';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('courses').select('*').order('semester, name', { ascending: true });
      if (!error && data) setCourses(data);
      setLoading(false);
    };
    fetchCourses();
  }, []);

  // Ομαδοποίηση ανά εξάμηνο
  const grouped = courses.reduce((acc, course) => {
    acc[course.semester] = acc[course.semester] || [];
    acc[course.semester].push(course);
    return acc;
  }, {});

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" color="primary" gutterBottom align="center" sx={{ fontWeight: 700, letterSpacing: 1 }}>
        Όλα τα Μαθήματα
      </Typography>
      {loading ? (
        <Stack spacing={3}>
          {[1,2,3].map(i => <Skeleton key={i} variant="rounded" height={120} />)}
        </Stack>
      ) : (
        Object.keys(grouped).sort((a, b) => a - b).map(sem => (
          <Box key={sem} sx={{ mb: 5 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Typography variant="h6" color="secondary" sx={{ fontWeight: 600 }}>{`Εξάμηνο ${sem}`}</Typography>
              <Divider flexItem sx={{ borderColor: theme.palette.secondary.main, ml: 2 }} />
            </Stack>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                gap: 3,
              }}
            >
              {grouped[sem].map(course => (
                <Card
                  key={course.id}
                  onClick={() => navigate(`/courses/${course.id}`)}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 3,
                    boxShadow: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}11 0%, ${theme.palette.secondary.main}22 100%)`,
                    transition: 'transform 0.18s, box-shadow 0.18s',
                    '&:hover': {
                      boxShadow: 8,
                      transform: 'translateY(-4px) scale(1.03)',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}22 0%, ${theme.palette.secondary.main}33 100%)`,
                    },
                    minHeight: 110,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <CardContent sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <SchoolRoundedIcon color="primary" sx={{ fontSize: 38, flexShrink: 0 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ color: theme.palette.primary.dark, mb: 0.5 }}>
                        {course.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Εξάμηνο {course.semester}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        ))
      )}
    </Container>
  );
};

export default Courses; 