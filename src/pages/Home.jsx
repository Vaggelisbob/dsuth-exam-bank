import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, TextField, MenuItem, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Card, CardContent, CardActions, Stack, Grid, Skeleton, Drawer, IconButton, Tooltip } from '@mui/material';
import { supabase } from '../supabaseClient';
import SchoolIcon from '@mui/icons-material/School';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import MenuBookIcon from '@mui/icons-material/MenuBook';
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
            width: '100%',
            maxWidth: 1400,
            mx: 'auto',
            borderRadius: { xs: 3, md: 6 },
            boxShadow: { xs: 2, md: 6 },
            p: { xs: 2, sm: 4, md: 6 },
            mb: { xs: 4, md: 6 },
            minHeight: { xs: 320, md: 340 },
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(120deg, #e3eafcbb 60%, #f4f6f8cc 100%), url('https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80') center/cover no-repeat`,
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 700, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography
              variant={isMobile ? 'h5' : isTablet ? 'h3' : isUltraWide ? 'h1' : 'h2'}
              color="primary"
              gutterBottom
              sx={{ fontWeight: 900, mb: 1, letterSpacing: '-1px', fontSize: isUltraWide ? '3.2rem' : undefined, textShadow: '0 2px 8px #e3eafc' }}
            >
              <SchoolIcon sx={{ fontSize: { xs: 36, md: 56, xl: 72 }, mr: 1, mb: -0.5, color: 'primary.main', verticalAlign: 'middle' }} />
              Τράπεζα Θεμάτων UTH
            </Typography>
            <Typography
              variant={isMobile ? 'body1' : 'h5'}
              sx={{ mb: 2, color: 'text.secondary', fontWeight: 600, fontSize: isUltraWide ? '1.7rem' : undefined }}
            >
              ΨΗΦΙΑΚΑ ΣΥΣΤΗΜΑΤΑ ΠΘ
            </Typography>
            <Typography
              variant="body1"
              sx={{ mb: 3, color: 'text.secondary', maxWidth: 600, fontSize: isUltraWide ? '1.25rem' : undefined, fontWeight: 500, mx: { xs: 'auto', md: 0 } }}
            >
              Βρες, κατέβασε ή μοιράσου θέματα και αρχεία προηγούμενων εξετάσεων της σχολής. Η γνώση ανήκει σε όλους!
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2, width: '100%', maxWidth: 500, mx: { xs: 'auto', md: 0 } }}>
              {user ? (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<UploadFileIcon />}
                  href="/upload"
                  sx={{
                    fontWeight: 700,
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
                    width: { xs: '100%', sm: 'auto' },
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
                    fontWeight: 700,
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
                    width: { xs: '100%', sm: 'auto' },
                  }}
                >
                  ΣΥΝΔΕΣΗ ΓΙΑ ΑΝΕΒΑΣΜΑ
                </Button>
              )}
              <Button
                variant="outlined"
                color="primary"
                size="large"
                startIcon={<MenuBookIcon />}
                href="/courses"
                sx={{
                  fontWeight: 700,
                  fontSize: isUltraWide ? '1.2rem' : undefined,
                  px: 3,
                  py: 1.2,
                  borderRadius: 2,
                  backgroundColor: '#fff',
                  color: 'primary.main',
                  boxShadow: 'none',
                  borderWidth: 2,
                  borderColor: 'primary.main',
                  transition: 'background 0.2s, color 0.2s',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: '#fff',
                    boxShadow: 'none',
                  },
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                Δες τα μαθήματα
              </Button>
            </Stack>
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
                  <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', md: '1rem', xl: isUltraWide ? '1.2rem' : undefined }, py: isUltraWide ? 2 : 1 }}>ΜΑΘΗΜΑ</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', md: '1rem', xl: isUltraWide ? '1.2rem' : undefined }, py: isUltraWide ? 2 : 1 }}>ΕΤΟΣ</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', md: '1rem', xl: isUltraWide ? '1.2rem' : undefined }, py: isUltraWide ? 2 : 1 }}>ΕΞΕΤΑΣΤΙΚΗ</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', md: '1rem', xl: isUltraWide ? '1.2rem' : undefined }, py: isUltraWide ? 2 : 1 }}>ΕΝΕΡΓΕΙΕΣ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {exams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">Δεν βρέθηκαν αρχεία.</TableCell>
                  </TableRow>
                ) : (
                  exams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell sx={{ fontSize: isUltraWide ? '1.1rem' : undefined, py: isUltraWide ? 2 : 1 }}>{exam.course}</TableCell>
                      <TableCell sx={{ fontSize: isUltraWide ? '1.1rem' : undefined, py: isUltraWide ? 2 : 1 }}>{exam.year}</TableCell>
                      <TableCell sx={{ fontSize: isUltraWide ? '1.1rem' : undefined, py: isUltraWide ? 2 : 1 }}>{exam.period}</TableCell>
                      <TableCell sx={{ fontSize: isUltraWide ? '1.1rem' : undefined, py: isUltraWide ? 2 : 1 }}>
                        <Tooltip title="Προβολή">
                          <IconButton
                            color="info"
                            href={exam.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="small"
                            sx={{ mr: 1, borderRadius: '50%', background: '#e3eafc', '&:hover': { background: '#d0e2ff' } }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Λήψη">
                          <IconButton
                            color="primary"
                            href={exam.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="small"
                            sx={{ borderRadius: '50%', background: '#fbe9e7', '&:hover': { background: '#ffccbc' } }}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
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