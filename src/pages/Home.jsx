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
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useNavigate } from 'react-router-dom';

const periods = ['Ιανουάριος', 'Ιούνιος', 'Σεπτέμβριος'];

const Home = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  const [period, setPeriod] = useState('');
  const [semester, setSemester] = useState('');
  const [courses, setCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [user, setUser] = useState(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [examFavorites, setExamFavorites] = useState([]);
  const [favLoading, setFavLoading] = useState(false);

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
      const { data, error } = await supabase.from('courses').select('*').order('semester, name', { ascending: true });
      if (!error && data) {
        setAllCourses(data);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!semester) {
      setCourses(allCourses.map(c => c.name));
    } else {
      setCourses(allCourses.filter(c => c.semester === Number(semester)).map(c => c.name));
      if (course && !allCourses.find(c => c.name === course && c.semester === Number(semester))) {
        setCourse('');
      }
    }
  }, [semester, allCourses]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('favorites_exams')
      .select('exam_id')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (!error && data) {
          setExamFavorites(data.map(f => f.exam_id));
        }
      });
  }, [user]);

  const toggleExamFavorite = async (examId) => {
    if (!user) return;
    setFavLoading(true);
    if (examFavorites.includes(examId)) {
      await supabase.from('favorites_exams').delete().eq('user_id', user.id).eq('exam_id', examId);
      setExamFavorites(examFavorites.filter(id => id !== examId));
    } else {
      await supabase.from('favorites_exams').insert([{ user_id: user.id, exam_id: examId }]);
      setExamFavorites([...examFavorites, examId]);
    }
    setFavLoading(false);
  };

  return (
    <Box sx={{
      width: '100vw',
      minHeight: '100dvh',
      background: 'linear-gradient(135deg, #e3f0ff 0%, #f9fbff 100%)',
      py: 0,
      overflowX: 'hidden',
      px: 0,
    }}>
      <Container
        disableGutters
        maxWidth="xl"
        sx={{
          mt: 0,
          mb: 0,
          px: 0,
          width: '100vw',
          overflowX: 'hidden',
        }}
      >
        {/* Hero Section */}
        <Box
          sx={{
            width: '100vw',
            position: 'relative',
            left: '50%',
            right: '50%',
            marginLeft: '-50vw',
            marginRight: '-50vw',
            maxWidth: '100vw',
            borderRadius: 0,
            boxShadow: { xs: 4, md: 8 },
            p: { xs: 2.5, sm: 5, md: 7 },
            mb: { xs: 4, md: 6 },
            minHeight: { xs: 320, md: 340 },
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #e3f0ff 0%, #c9e7ff 50%, #e0c3fc 100%)',
            transition: 'background 0.5s',
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 700, textAlign: { xs: 'center', md: 'left' }, mx: 'auto' }}>
            <Typography
              variant={isMobile ? 'h5' : isTablet ? 'h3' : isUltraWide ? 'h1' : 'h2'}
              color="primary"
              gutterBottom
              noWrap={false}
              sx={{
                fontWeight: 900,
                mb: 1,
                letterSpacing: '-1px',
                fontSize: isUltraWide ? '3.2rem' : undefined,
                textShadow: '0 2px 8px #e3eafc',
                whiteSpace: !isMobile ? 'nowrap' : 'normal',
                wordBreak: 'normal',
                display: 'block',
                width: '100%',
                maxWidth: '100%',
              }}
            >
              <SchoolIcon sx={{ fontSize: { xs: 36, md: 56, xl: 72 }, mr: 1, mb: -0.5, color: 'primary.main', verticalAlign: 'middle' }} />
              Τράπεζα Θεμάτων UTH
            </Typography>
            <Typography
              variant={isMobile ? 'body1' : 'h5'}
              sx={{ mb: 2, color: 'text.secondary', fontWeight: 600, fontSize: isUltraWide ? '1.7rem' : undefined }}
            >
              ΨΗΦΙΑΚΑ ΣΥΣΤΗΜΑΤΑ, ΠΑΝΕΠΙΣΤΗΜΙΟ ΘΕΣΣΑΛΙΑΣ
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
                  backgroundColor: 'transparent',
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
                ΔΕΣ ΤΑ ΜΑΘΗΜΑΤΑ
              </Button>
            </Stack>
          </Box>
        </Box>
        {/* Header κάτω από το hero section */}
        <Typography variant="h6" align="center" sx={{ fontWeight: 700, mb: 3, color: 'primary.main', letterSpacing: 0.5 }}>
          Βρες αρχεία εξετάσεων ανά εξάμηνο και μάθημα
        </Typography>
        {/* Filters & List */}
        {isMobile || isTablet ? (
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
                  label="ΕΞΑΜΗΝΟ"
                  select
                  value={semester}
                  onChange={e => setSemester(e.target.value)}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="">ΟΛΑ</MenuItem>
                  {[...Array(8)].map((_, i) => (
                    <MenuItem key={i + 1} value={i + 1}>{i + 1}ο Εξάμηνο</MenuItem>
                  ))}
                </TextField>
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
                  ΚΑΘΑΡΙΣΜΑ
                </Button>
              </Stack>
            </Drawer>
          </Box>
        ) : (
          <Grid container spacing={isUltraWide ? 4 : isDesktop ? 3 : 2} sx={{ mb: 3 }} alignItems="stretch">
            <Grid item xs={12} sm={3} md={2} lg={2} xl={2} sx={{ minWidth: 0, flexGrow: 1 }}>
              <TextField
                label="ΕΞΑΜΗΝΟ"
                select
                value={semester}
                onChange={e => setSemester(e.target.value)}
                fullWidth
                size={isMobile ? 'small' : 'medium'}
                sx={{ fontSize: isUltraWide ? '1.1rem' : undefined, whiteSpace: 'nowrap' }}
              >
                <MenuItem value="">ΟΛΑ</MenuItem>
                {[...Array(8)].map((_, i) => (
                  <MenuItem key={i + 1} value={i + 1}>{i + 1}ο Εξάμηνο</MenuItem>
                ))}
              </TextField>
            </Grid>
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
                  ΚΑΘΑΡΙΣΜΑ
                </Button>
              )}
            </Grid>
          </Grid>
        )}
        {loading ? (
          <Box sx={{ mt: 2 }}>
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
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2, width: '100%', maxWidth: '100%', overflowX: 'auto', px: isUltraWide ? 4 : 0 }}>
            <Table size={isTablet ? 'small' : 'medium'} sx={{ minWidth: 0, width: '100%' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', md: '1rem', xl: isUltraWide ? '1.2rem' : undefined }, py: isUltraWide ? 2 : 1 }}>ΜΑΘΗΜΑ</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', md: '1rem', xl: isUltraWide ? '1.2rem' : undefined }, py: isUltraWide ? 2 : 1 }}>ΕΤΟΣ</TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', md: '1rem', xl: isUltraWide ? '1.2rem' : undefined }, py: isUltraWide ? 2 : 1 }}>ΕΞΕΤΑΣΤΙΚΗ</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', md: '1rem', xl: isUltraWide ? '1.2rem' : undefined }, py: isUltraWide ? 2 : 1 }}>ΕΝΕΡΓΕΙΕΣ</TableCell>
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
                      <TableCell align="center" sx={{ fontSize: isUltraWide ? '1.1rem' : undefined, py: isUltraWide ? 2 : 1 }}>
                        <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                          <Tooltip title="Προβολή">
                            <IconButton
                              color="info"
                              href={exam.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              size="small"
                              sx={{ mr: isMobile ? 0 : 1, borderRadius: '50%', background: '#e3eafc', '&:hover': { background: '#d0e2ff' } }}
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
                          {user && (
                            <Tooltip title={examFavorites.includes(exam.id) ? 'Αφαίρεση από αγαπημένα' : 'Προσθήκη στα αγαπημένα'}>
                              <IconButton
                                aria-label={examFavorites.includes(exam.id) ? 'Αφαίρεση από αγαπημένα' : 'Προσθήκη στα αγαπημένα'}
                                onClick={e => { e.stopPropagation(); toggleExamFavorite(exam.id); }}
                                color="error"
                                sx={{ transition: 'transform 0.15s', '&:hover': { transform: 'scale(1.18)' }, ml: isMobile ? 0 : 1 }}
                                disabled={favLoading}
                              >
                                {examFavorites.includes(exam.id) ? <FavoriteIcon sx={{ fontSize: 24 }} /> : <FavoriteBorderIcon sx={{ fontSize: 24 }} />}
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
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