import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Home from './pages/Home';
import Login from './pages/Login';
import Upload from './pages/Upload';
import AdminPanel from './pages/AdminPanel';
import NavBar from './components/NavBar';

const theme = createTheme({
  palette: {
    primary: {
      main: '#003366', // Μπλε της σχολής
    },
    secondary: {
      main: '#d32f2f', // Κόκκινο
    },
    background: {
      default: '#f4f6f8', // Ανοιχτό γκρι
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
