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

const ADMIN_UID = 'ae26da15-7102-4647-8cbb-8f045491433c';

const NavBar = () => {
  const [user, setUser] = useState(undefined);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
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
            <Button color="inherit" component={Link} to="/upload" sx={{ '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)', color: 'inherit' } }}>ΑΝΕΒΑΣΜΑ</Button>
            <Button color="inherit" component={Link} to="/courses" sx={{ '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)', color: 'inherit' } }}>ΜΑΘΗΜΑΤΑ</Button>
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
                >
                  {user && (
                    <MenuItem disabled sx={{ opacity: 1, fontWeight: 600, color: 'primary.main', fontSize: '0.97rem', cursor: 'default', pointerEvents: 'none' }}>
                      {user.email}
                    </MenuItem>
                  )}
                  {user && user.id === ADMIN_UID && (
                    <MenuItem component={Link} to="/admin" onClick={handleClose} sx={{ '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }, color: 'inherit' }}>
                      <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                      <span style={{ color: 'inherit' }}>Admin</span>
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleProfile}>ΠΡΟΦΙΛ</MenuItem>
                  <MenuItem onClick={handleLogoutMenu} sx={{ color: 'error.main', fontWeight: 600 }}>
                    <ListItemIcon sx={{ color: 'error.main' }}><LogoutIcon fontSize="small" /></ListItemIcon>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button color="inherit" component={Link} to="/login" sx={{ '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)', color: 'inherit' } }}>ΕΙΣΟΔΟΣ</Button>
            )}
          </Box>
          {/* Mobile/Tablet */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
            {/* Profile/Login icon on the right */}
            {user === undefined ? (
              <Skeleton variant="circular" width={36} height={36} sx={{ bgcolor: 'rgba(255,255,255,0.3)', mr: 1 }} />
            ) : user ? (
              <>
                <IconButton
                  size="large"
                  edge="end"
                  color="inherit"
                  onClick={handleMenu}
                  sx={{ mr: 1 }}
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  {user && (
                    <MenuItem disabled sx={{ opacity: 1, fontWeight: 600, color: 'primary.main', fontSize: '0.97rem', cursor: 'default', pointerEvents: 'none' }}>
                      {user.email}
                    </MenuItem>
                  )}
                  {user && user.id === ADMIN_UID && (
                    <MenuItem component={Link} to="/admin" onClick={handleClose} sx={{ '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }, color: 'inherit' }}>
                      <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                      <span style={{ color: 'inherit' }}>Admin</span>
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleProfile}>ΠΡΟΦΙΛ</MenuItem>
                  <MenuItem onClick={handleLogoutMenu} sx={{ color: 'error.main', fontWeight: 600 }}>
                    <ListItemIcon sx={{ color: 'error.main' }}><LogoutIcon fontSize="small" /></ListItemIcon>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                component={Link}
                to="/login"
                sx={{ mr: 1 }}
              >
                <LoginIcon />
              </IconButton>
            )}
            {/* Hamburger menu */}
            <IconButton color="inherit" edge="end" onClick={() => setMobileOpen(true)} sx={{ mx: 1.5, '&:focus, &:focus-visible': { outline: 'none', boxShadow: 'none', border: 'none' } }}>
              <MenuIcon />
            </IconButton>
            <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}>
              <Box sx={{ width: 220, position: 'relative' }} role="presentation" onClick={() => setMobileOpen(false)}>
                <IconButton
                  color="default"
                  onClick={e => { e.stopPropagation(); setMobileOpen(false); }}
                  sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, display: { xs: 'flex', md: 'none' } }}
                >
                  <CloseIcon sx={{ color: '#222' }} />
                </IconButton>
                <Box sx={{ height: 0, pt: '40px' }} />
                <List>
                  <ListItemButton component={Link} to="/">
                    <ListItemText primary="ΑΡΧΙΚΗ" />
                  </ListItemButton>
                  {menuItems.filter(item => item.label !== 'Είσοδος' && item.label !== 'Admin' && item.label !== 'Αποσύνδεση').map((item, idx) => (
                    <ListItem key={idx} disablePadding>
                      {item.to ? (
                        <ListItemButton component={Link} to={item.to}>
                          <ListItemText primary={item.label === 'Ανέβασμα' ? 'ΑΝΕΒΑΣΜΑ' : item.label === 'Προφίλ' ? 'ΠΡΟΦΙΛ' : item.label} />
                        </ListItemButton>
                      ) : (
                        <ListItemButton onClick={item.action}>
                          <ListItemText primary={item.label === 'Ανέβασμα' ? 'ΑΝΕΒΑΣΜΑ' : item.label === 'Προφίλ' ? 'ΠΡΟΦΙΛ' : item.label} />
                        </ListItemButton>
                      )}
                    </ListItem>
                  ))}
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