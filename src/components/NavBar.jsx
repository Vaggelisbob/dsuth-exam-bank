import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Skeleton, ListItemIcon, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Divider from '@mui/material/Divider';
import HomeIcon from '@mui/icons-material/Home';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const ADMIN_UID = 'ae26da15-7102-4647-8cbb-8f045491433c';

const NavBar = () => {
  const [user, setUser] = useState(undefined);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const openSettings = Boolean(settingsAnchorEl);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };
  const handleLogoutMenu = async () => {
    await handleLogout();
    handleClose();
  };
  const handleSettingsMenu = (event) => {
    setSettingsAnchorEl(event.currentTarget);
  };
  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  const menuItems = [
    { label: 'Ανέβασμα', to: '/upload' },
    ...(user && user.id === ADMIN_UID ? [{ label: 'Admin', to: '/admin' }] : []),
    user
      ? { label: 'Αποσύνδεση', action: handleLogout }
      : { label: 'Είσοδος', to: '/login' },
  ];

  return (
    <>
      <AppBar position="fixed" sx={{ top: 0, zIndex: theme.zIndex.appBar + 1, boxShadow: 0, background: '#282828' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: { xs: 56, md: 64 }, p: 0 }}>
          <Typography variant="h6" component={Link} to="/" sx={{ color: '#fff', textDecoration: 'none', flexGrow: { xs: 1, sm: 0 }, px: 2, py: 0.5, borderRadius: 1.5, transition: 'background 0.2s', cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}>
            Τράπεζα Θεμάτων UTH
          </Typography>
          {/* Desktop */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            <Button color="inherit" component={Link} to="/" sx={{ '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)', color: 'inherit' } }}>ΑΡΧΙΚΗ</Button>
            <Button color="inherit" component={Link} to="/courses" sx={{ '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)', color: 'inherit' } }}>ΜΑΘΗΜΑΤΑ</Button>
            <Button color="inherit" component={Link} to="/favorites" startIcon={<FavoriteIcon />} sx={{ '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)', color: 'inherit' } }}>ΑΓΑΠΗΜΕΝΑ</Button>
            <Button color="inherit" component={Link} to="/upload" sx={{ minWidth: 0, p: 1.2, '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)', color: 'inherit' } }}>
              <UploadFileIcon />
            </Button>
            {user === undefined ? (
              <Skeleton variant="circular" width={40} height={40} sx={{ ml: 1, bgcolor: 'rgba(255,255,255,0.3)', pr: 2 }} />
            ) : user ? (
              <>
                <IconButton
                  size="large"
                  edge="end"
                  color="inherit"
                  onClick={handleMenu}
                  sx={{ ml: 1, pr: 2 }}
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  PaperProps={{
                    sx: {
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      minWidth: 180,
                      py: 1.2
                    }
                  }}
                >
                  <MenuItem disabled sx={{
                    opacity: 1,
                    fontWeight: 600,
                    color: 'primary.main',
                    fontSize: '0.97rem',
                    cursor: 'default',
                    pointerEvents: 'none',
                    justifyContent: 'center',
                    textAlign: 'center',
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    mb: 0.5
                  }}>
                    {user.email}
                  </MenuItem>
                  {user && user.id === ADMIN_UID && (
                    <MenuItem component={Link} to="/admin" onClick={handleClose} sx={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', display: 'flex', width: '100%' }}>
                      Ρυθμίσεις Admin
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleProfile} sx={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', display: 'flex', width: '100%' }}>
                    Ρυθμίσεις Προφίλ
                  </MenuItem>
                  <MenuItem onClick={handleLogoutMenu} sx={{ color: 'error.main', fontWeight: 600, justifyContent: 'center', alignItems: 'center', textAlign: 'center', display: 'flex', width: '100%', m: 0, px: 2, py: 1.2 }}>
                    <ListItemIcon sx={{ color: 'error.main', minWidth: 0, justifyContent: 'center', display: 'flex', mx: 'auto' }}><LogoutIcon fontSize="small" /></ListItemIcon>
                    <span style={{ flex: 1, textAlign: 'center', fontWeight: 600, color: 'inherit', letterSpacing: 0.5 }}>ΑΠΟΣΥΝΔΕΣΗ</span>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button color="inherit" component={Link} to="/login" sx={{ '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)', color: 'inherit' } }}>ΕΙΣΟΔΟΣ</Button>
            )}
          </Box>
          {/* Mobile/Tablet */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Hamburger menu μόνο */}
            <IconButton color="inherit" edge="end" onClick={() => setMobileOpen(true)} sx={{ mx: 1.5, '&:focus, &:focus-visible': { outline: 'none', boxShadow: 'none', border: 'none' } }}>
              <MenuIcon />
            </IconButton>
            <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}
              PaperProps={{
                sx: {
                  width: 260,
                  borderTopLeftRadius: 24,
                  borderBottomLeftRadius: 24,
                  bgcolor: 'linear-gradient(135deg, #e3f0ff 0%, #f9fbff 100%)',
                  boxShadow: 6,
                  p: 0,
                  overflow: 'hidden',
                }
              }}
            >
              <Box sx={{ width: '100%', position: 'relative', minHeight: '100vh', p: 0 }} role="presentation" onClick={() => setMobileOpen(false)}>
                {/* Header with logo/title and close */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 2, bgcolor: 'rgba(40,56,80,0.07)', borderBottom: '1px solid #e0e7ef' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a237e', letterSpacing: 0.5 }}>
                    Τράπεζα UTH
                  </Typography>
                  <IconButton
                    color="default"
                    onClick={e => { e.stopPropagation(); setMobileOpen(false); }}
                    sx={{ ml: 1 }}
                  >
                    <CloseIcon sx={{ color: '#222' }} />
                  </IconButton>
                </Box>
                <List sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch', p: 0, mt: 1 }}>
                  <ListItemButton component={Link} to="/" sx={{ my: 0.5, mx: 2, borderRadius: 2, py: 1.5, px: 2, '&:hover': { bgcolor: '#e3eaff' }, justifyContent: 'flex-start' }}>
                    <ListItemIcon sx={{ minWidth: 36, color: '#1a237e' }}><HomeIcon /></ListItemIcon>
                    <ListItemText primary="ΑΡΧΙΚΗ" sx={{ color: '#1a237e', fontWeight: 600 }} />
                  </ListItemButton>
                  <ListItemButton component={Link} to="/courses" sx={{ my: 0.5, mx: 2, borderRadius: 2, py: 1.5, px: 2, '&:hover': { bgcolor: '#e3eaff' }, justifyContent: 'flex-start' }}>
                    <ListItemIcon sx={{ minWidth: 36, color: '#1976d2' }}><MenuBookIcon /></ListItemIcon>
                    <ListItemText primary="ΜΑΘΗΜΑΤΑ" sx={{ color: '#1976d2', fontWeight: 600 }} />
                  </ListItemButton>
                  <ListItemButton component={Link} to="/favorites" sx={{ my: 0.5, mx: 2, borderRadius: 2, py: 1.5, px: 2, '&:hover': { bgcolor: '#ffe3e3' }, justifyContent: 'flex-start' }}>
                    <ListItemIcon sx={{ minWidth: 36, color: '#e53935' }}><FavoriteIcon /></ListItemIcon>
                    <ListItemText primary="ΑΓΑΠΗΜΕΝΑ" sx={{ color: '#e53935', fontWeight: 600 }} />
                  </ListItemButton>
                  <ListItemButton component={Link} to="/upload" sx={{ my: 0.5, mx: 2, borderRadius: 2, py: 1.5, px: 2, '&:hover': { bgcolor: '#e3f7e3' }, justifyContent: 'flex-start' }}>
                    <ListItemIcon sx={{ minWidth: 36, color: '#43a047' }}><UploadFileIcon /></ListItemIcon>
                    <ListItemText primary="ΑΝΕΒΑΣΜΑ" sx={{ color: '#43a047', fontWeight: 600 }} />
                  </ListItemButton>
                  {/* Divider */}
                  <Divider sx={{ my: 1, mx: 2 }} />
                  {/* Profile/Admin/Login/Logout */}
                  {user && (
                    <>
                      {user.id === ADMIN_UID && (
                        <ListItemButton component={Link} to="/admin" sx={{ my: 0.5, mx: 2, borderRadius: 2, py: 1.5, px: 2, '&:hover': { bgcolor: '#fffbe3' }, justifyContent: 'flex-start' }}>
                          <ListItemIcon sx={{ minWidth: 36, color: '#fbc02d' }}><SettingsIcon /></ListItemIcon>
                          <ListItemText primary="ΡΥΘΜΙΣΕΙΣ ADMIN" sx={{ color: '#fbc02d', fontWeight: 600 }} />
                        </ListItemButton>
                      )}
                      <ListItemButton component={Link} to="/profile" sx={{ my: 0.5, mx: 2, borderRadius: 2, py: 1.5, px: 2, '&:hover': { bgcolor: '#e3eaff' }, justifyContent: 'flex-start' }}>
                        <ListItemIcon sx={{ minWidth: 36, color: '#1976d2' }}><AccountCircle /></ListItemIcon>
                        <ListItemText primary="ΡΥΘΜΙΣΕΙΣ ΠΡΟΦΙΛ" sx={{ color: '#1976d2', fontWeight: 600 }} />
                      </ListItemButton>
                      <ListItemButton onClick={handleLogout} sx={{ my: 0.5, mx: 2, borderRadius: 2, py: 1.5, px: 2, '&:hover': { bgcolor: '#ffe3e3' }, justifyContent: 'flex-start' }}>
                        <ListItemIcon sx={{ minWidth: 36, color: '#e53935' }}><LogoutIcon /></ListItemIcon>
                        <ListItemText primary="ΑΠΟΣΥΝΔΕΣΗ" sx={{ color: '#e53935', fontWeight: 600 }} />
                      </ListItemButton>
                    </>
                  )}
                  {!user && (
                    <ListItemButton component={Link} to="/login" sx={{ my: 0.5, mx: 2, borderRadius: 2, py: 1.5, px: 2, '&:hover': { bgcolor: '#e3eaff' }, justifyContent: 'flex-start' }}>
                      <ListItemIcon sx={{ minWidth: 36, color: '#1976d2' }}><LoginIcon /></ListItemIcon>
                      <ListItemText primary="ΕΙΣΟΔΟΣ" sx={{ color: '#1976d2', fontWeight: 600 }} />
                    </ListItemButton>
                  )}
                </List>
              </Box>
            </Drawer>
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default NavBar; 