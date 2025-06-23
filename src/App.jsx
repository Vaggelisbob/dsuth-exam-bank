import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Box from '@mui/material/Box';
import Home from './pages/Home';
import Login from './pages/Login';
import Upload from './pages/Upload';
import AdminPanel from './pages/AdminPanel';
import Register from './pages/Register';
import Profile from './pages/Profile';
import NavBar from './components/NavBar';
import React, { lazy, Suspense } from 'react';
import AdminDashboard from './pages/admin/AdminDashboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#552222', // Νέο primary χρώμα
    },
    secondary: {
      main: '#FFD200', // Χρυσό
    },
    background: {
      default: '#f8fafc', // Πολύ ανοιχτό γκρι/λευκό
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

const AdminFiles = lazy(() => import('./pages/admin/AdminFiles'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ overflowX: 'hidden', maxWidth: '100vw', pt: { xs: '56px', md: '64px' } }}>
        <Router>
          <NavBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/admin" element={<AdminDashboard />}>
              <Route path="files" element={<Suspense fallback={<div>Loading...</div>}><AdminFiles /></Suspense>} />
              <Route path="users" element={<Suspense fallback={<div>Loading...</div>}><AdminUsers /></Suspense>} />
            </Route>
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Router>
      </Box>
    </ThemeProvider>
  );
}

export default App;
