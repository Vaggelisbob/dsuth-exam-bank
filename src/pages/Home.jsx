import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, TextField, MenuItem, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Card, CardContent, CardActions, Stack, Grid, Skeleton, Drawer, IconButton } from '@mui/material';
import { supabase } from '../supabaseClient';
import SchoolIcon from '@mui/icons-material/School';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';

const periods = ['Ιανουάριος', 'Ιούνιος', 'Σεπτέμβριος'];

const Home = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  const [period, setPeriod] = useState('');
  const [courses, setCourses] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [user, setUser] = useState(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 600;
  const isTablet = windowWidth >= 600 && windowWidth < 900;
  const isDesktop = windowWidth >= 900 && windowWidth < 1536;
  const isUltraWide = windowWidth >= 1536;

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });
  }, []);

  return (
    <Box sx={{
      width: '100vw',
      minHeight: '100dvh',
      background: 'linear-gradient(135deg, #e3eafc 0%, #f4f6f8 100%)',
      py: { xs: 2, md: 6 },
      overflowX: 'hidden',
      px: 0,
    }}>
      <Container
        disableGutters
        maxWidth="xl"
        sx={{
          mt: { xs: 2, sm: 4 },
          mb: { xs: 2, sm: 4 },
          px: { xs: 2, sm: 4, md: 6, lg: 8 },
          width: '100vw',
          overflowX: 'hidden',
        }}
      >
        {/* Hero Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: { xs: 4, md: 6 },
            gap: { xs: 2, md: 6 },
          }}
        >
          <Box sx={{ flex: 1 }}>
            {loading ? (
              <>
                <Skeleton variant="text" width={isMobile ? '80%' : isTablet ? '60%' : '50%'} height={isMobile ? 40 : 64} sx={{ mb: 1, borderRadius: 2 }} />
                <Skeleton variant="text" width={isMobile ? '60%' : '40%'} height={isMobile ? 28 : 40} sx={{ mb: 2, borderRadius: 2 }} />
                <Skeleton variant="text" width={isMobile ? '90%' : '70%'} height={isMobile ? 24 : 32} sx={{ mb: 3, borderRadius: 2 }} />
                <Skeleton variant="rectangular" width={isMobile ? '100%' : 220} height={48} sx={{ borderRadius: 2, mb: 2 }} />
              </>
            ) : (
              <>
                <Typography
                  variant={isMobile ? 'h5' : isTablet ? 'h3' : isUltraWide ? 'h1' : 'h2'}
                  color="primary"
                  gutterBottom
                  sx={{ fontWeight: 800, mb: 1, letterSpacing: '-1px', fontSize: isUltraWide ? '3.2rem' : undefined }}
                >
                  <SchoolIcon sx={{ fontSize: { xs: 36, md: 48, xl: 64 }, mr: 1, mb: -0.5, color: 'primary.main' }} />
                  Τράπεζα Θεμάτων UTH
                </Typography>
                <Typography
                  variant={isMobile ? 'body1' : 'h5'}
                  sx={{ mb: 2, color: 'text.secondary', fontWeight: 500, fontSize: isUltraWide ? '1.7rem' : undefined }}
                >
                  ΨΗΦΙΑΚΑ ΣΥΣΤΗΜΑΤΑ ΠΘ
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ mb: 3, color: 'text.secondary', maxWidth: 600, fontSize: isUltraWide ? '1.25rem' : undefined }}
                >
                  Βρες, κατέβασε ή μοιράσου θέματα και αρχεία προηγούμενων εξετάσεων της σχολής. Η γνώση ανήκει σε όλους!
                </Typography>
                {user ? (
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<UploadFileIcon />}
                    href="/upload"
                    sx={{
                      fontWeight: 600,
                      fontSize: isUltraWide ? '1.2rem' : undefined,
                      px: 3,
                      py: 1.2,
                      borderRadius: 2,
                      backgroundColor: 'primary.main',
                      color: '#fff',
                      boxShadow: 'none',
                      transition: 'background 0.2s, color 0.2s',
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.08)',
                        color: 'primary.main',
                        boxShadow: 'none',
                      },
                    }}
                  >
                    ΑΝΕΒΑΣΕ ΘΕΜΑ
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    href="/login"
                    sx={{
                      fontWeight: 600,
                      fontSize: isUltraWide ? '1.2rem' : undefined,
                      px: 3,
                      py: 1.2,
                      borderRadius: 2,
                      backgroundColor: 'primary.main',
                      color: '#fff',
                      boxShadow: 'none',
                      transition: 'background 0.2s, color 0.2s',
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.04)',
                        color: 'primary.main',
                        boxShadow: 'none',
                      },
                    }}
                  >
                    ΣΥΝΔΕΣΗ ΓΙΑ ΑΝΕΒΑΣΜΑ
                  </Button>
                )}
              </>
            )}
          </Box>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {loading ? (
              <Skeleton variant="rectangular" width={isMobile ? 180 : 320} height={isMobile ? 120 : 220} sx={{ borderRadius: 4 }} />
            ) : (
              <img
                src="https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=500&q=80"
                alt="university students"
                style={{
                  width: isMobile ? 180 : 320,
                  maxWidth: '100%',
                  borderRadius: 24,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                  objectFit: 'cover',
                }}
              />
            )}
          </Box>
        </Box>
        {/* Filters & List */}
        {isMobile ? (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setFilterDrawerOpen(true)}
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              ΦΙΛΤΡΑ
            </Button>
            <Drawer
              anchor="bottom"
              open={filterDrawerOpen}
              onClose={() => setFilterDrawerOpen(false)}
              PaperProps={{ sx: { borderTopLeftRadius: 16, borderTopRightRadius: 16, p: 2 } }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Φίλτρα</Typography>
                <IconButton onClick={() => setFilterDrawerOpen(false)}><CloseIcon /></IconButton>
              </Box>
              <Stack spacing={2}>
                <TextField
                  label="ΜΑΘΗΜΑ"
                  select
                  value={course}
                  onChange={e => setCourse(e.target.value)}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="">ΟΛΑ</MenuItem>
                  {courses.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </TextField>
                <TextField
                  label="ΕΤΟΣ"
                  type="number"
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="ΕΞΕΤΑΣΤΙΚΗ"
                  select
                  value={period}
                  onChange={e => setPeriod(e.target.value)}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="">ΟΛΕΣ</MenuItem>
                  {periods.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </TextField>
                <Button
                  variant="outlined"
                  onClick={() => { setCourse(''); setYear(''); setPeriod(''); }}
                  fullWidth
                  size="large"
                >
                  ΚΑΘΑΡΙΣΜΟΣ
                </Button>
              </Stack>
            </Drawer>
          </Box>
        ) : (
          <Grid container spacing={isUltraWide ? 4 : isDesktop ? 3 : 2} sx={{ mb: 3 }} alignItems="stretch">
            <Grid item xs={12} sm={4} md={3} lg={2} xl={2} sx={{ minWidth: 0, flexGrow: 1 }}>
              {loading ? (
                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
              ) : (
                <TextField
                  label="ΜΑΘΗΜΑ"
                  select
                  value={course}
                  onChange={e => setCourse(e.target.value)}
                  fullWidth
                  size={isMobile ? 'small' : 'medium'}
                  sx={{ fontSize: isUltraWide ? '1.1rem' : undefined, whiteSpace: 'nowrap' }}
                >
                  <MenuItem value="">ΟΛΑ</MenuItem>
                  {courses.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </TextField>
              )}
            </Grid>
            <Grid item xs={6} sm={4} md={2} lg={2} xl={2} sx={{ minWidth: 0, flexGrow: 1 }}>
              {loading ? (
                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
              ) : (
                <TextField
                  label="ΕΤΟΣ"
                  type="number"
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  fullWidth
                  size={isMobile ? 'small' : 'medium'}
                  sx={{ fontSize: isUltraWide ? '1.1rem' : undefined, whiteSpace: 'nowrap' }}
                />
              )}
            </Grid>
            <Grid item xs={6} sm={4} md={3} lg={2} xl={2} sx={{ minWidth: 0, flexGrow: 1 }}>
              {loading ? (
                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
              ) : (
                <TextField
                  label="ΕΞΕΤΑΣΤΙΚΗ"
                  select
                  value={period}
                  onChange={e => setPeriod(e.target.value)}
                  fullWidth
                  size={isMobile ? 'small' : 'medium'}
                  sx={{ fontSize: isUltraWide ? '1.1rem' : undefined, whiteSpace: 'nowrap' }}
                >
                  <MenuItem value="">ΟΛΕΣ</MenuItem>
                  {periods.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </TextField>
              )}
            </Grid>
            <Grid item xs={12} sm={12} md={2} lg={2} xl={2} display="flex" alignItems="stretch">
              {loading ? (
                <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
              ) : (
                <Button
                  variant="outlined"
                  onClick={() => { setCourse(''); setYear(''); setPeriod(''); }}
                  fullWidth
                  size={isMobile ? 'small' : 'medium'}
                  sx={{ height: '100%', fontSize: isUltraWide ? '1.1rem' : undefined, minHeight: 56 }}
                >
                  ΚΑΘΑΡΙΣΜΟΣ
                </Button>
              )}
            </Grid>
          </Grid>
        )}
        {loading ? (
          <Box sx={{ mt: 2 }}>
            {isMobile ? (
              <Stack spacing={2}>
                {[...Array(3)].map((_, i) => (
                  <Card key={i} variant="outlined" sx={{ mx: { xs: 0, sm: 2 } }}>
                    <CardContent>
                      <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
                      <Skeleton variant="text" width="40%" height={24} />
                      <Skeleton variant="text" width="30%" height={24} />
                      <Skeleton variant="text" width="30%" height={24} />
                    </CardContent>
                    <CardActions>
                      <Skeleton variant="rectangular" width="100%" height={36} />
                    </CardActions>
                  </Card>
                ))}
              </Stack>
            ) : (
              <TableContainer component={Paper} sx={{ mt: 2, width: '100%', maxWidth: '100%', overflowX: 'auto', px: isUltraWide ? 4 : 0 }}>
                <Table size={isTablet ? 'small' : 'medium'} sx={{ minWidth: 0, width: '100%' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>ΤΙΤΛΟΣ</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>ΜΑΘΗΜΑ</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>ΕΤΟΣ</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>ΕΞΕΤΑΣΤΙΚΗ</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>ΛΗΨΗ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                        <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                        <TableCell><Skeleton variant="text" width="40%" /></TableCell>
                        <TableCell><Skeleton variant="text" width="60%" /></TableCell>
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
            {exams.length === 0 ? (
              <Typography align="center">Δεν βρέθηκαν αρχεία.</Typography>
            ) : (
              exams.map((exam) => (
                <Card key={exam.id} variant="outlined" sx={{ mx: { xs: 0, sm: 2 } }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem', xl: isUltraWide ? '1.5rem' : undefined } }}>{exam.title}</Typography>
                    <Typography variant="body2" sx={{ fontSize: isUltraWide ? '1.1rem' : undefined }}>Μάθημα: {exam.course}</Typography>
                    <Typography variant="body2" sx={{ fontSize: isUltraWide ? '1.1rem' : undefined }}>Έτος: {exam.year}</Typography>
                    <Typography variant="body2" sx={{ fontSize: isUltraWide ? '1.1rem' : undefined }}>Εξεταστική: {exam.period}</Typography>
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
                      sx={{ fontSize: isUltraWide ? '1.1rem' : undefined }}
                    >
                      DOWNLOAD
                    </Button>
                  </CardActions>
                </Card>
              ))
            )}
          </Stack>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2, width: '100%', maxWidth: '100%', overflowX: 'auto', px: isUltraWide ? 4 : 0 }}>
            <Table size={isTablet ? 'small' : 'medium'} sx={{ minWidth: 0, width: '100%' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', md: '1rem', xl: isUltraWide ? '1.2rem' : undefined }, py: isUltraWide ? 2 : 1 }}>ΤΙΤΛΟΣ</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', md: '1rem', xl: isUltraWide ? '1.2rem' : undefined }, py: isUltraWide ? 2 : 1 }}>ΜΑΘΗΜΑ</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', md: '1rem', xl: isUltraWide ? '1.2rem' : undefined }, py: isUltraWide ? 2 : 1 }}>ΕΤΟΣ</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', md: '1rem', xl: isUltraWide ? '1.2rem' : undefined }, py: isUltraWide ? 2 : 1 }}>ΕΞΕΤΑΣΤΙΚΗ</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', md: '1rem', xl: isUltraWide ? '1.2rem' : undefined }, py: isUltraWide ? 2 : 1 }}>ΛΗΨΗ</TableCell>
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
                      <TableCell sx={{ fontSize: isUltraWide ? '1.1rem' : undefined, py: isUltraWide ? 2 : 1 }}>{exam.title}</TableCell>
                      <TableCell sx={{ fontSize: isUltraWide ? '1.1rem' : undefined, py: isUltraWide ? 2 : 1 }}>{exam.course}</TableCell>
                      <TableCell sx={{ fontSize: isUltraWide ? '1.1rem' : undefined, py: isUltraWide ? 2 : 1 }}>{exam.year}</TableCell>
                      <TableCell sx={{ fontSize: isUltraWide ? '1.1rem' : undefined, py: isUltraWide ? 2 : 1 }}>{exam.period}</TableCell>
                      <TableCell sx={{ fontSize: isUltraWide ? '1.1rem' : undefined, py: isUltraWide ? 2 : 1 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          href={exam.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          sx={{ fontSize: isUltraWide ? '1.1rem' : undefined }}
                        >
                          DOWNLOAD
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
    </Box>
  );
};

export default Home; 