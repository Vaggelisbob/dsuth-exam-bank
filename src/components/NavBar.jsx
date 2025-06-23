import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const ADMIN_UID = 'ae26da15-7102-4647-8cbb-8f045491433c';

const NavBar = () => {
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

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

  const menuItems = [
    { label: 'Ανέβασμα', to: '/upload' },
    ...(user && user.id === ADMIN_UID ? [{ label: 'Admin', to: '/admin' }] : []),
    user
      ? { label: 'Αποσύνδεση', action: handleLogout }
      : { label: 'Είσοδος', to: '/login' },
  ];

  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6" component={Link} to="/" sx={{ color: 'inherit', textDecoration: 'none', flexGrow: { xs: 1, sm: 0 } }}>
          Τράπεζα Θεμάτων ΠΘ
        </Typography>
        {/* Desktop */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
          <Button color="inherit" component={Link} to="/upload">Ανέβασμα</Button>
          {user && user.id === ADMIN_UID && (
            <Button color="inherit" component={Link} to="/admin">Admin</Button>
          )}
          {user ? (
            <>
              <Typography variant="body2" sx={{ color: 'white', mx: 2, display: 'inline' }}>{user.email}</Typography>
              <Button color="inherit" onClick={handleLogout}>Αποσύνδεση</Button>
            </>
          ) : (
            <Button color="inherit" component={Link} to="/login">Είσοδος</Button>
          )}
        </Box>
        {/* Mobile */}
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton color="inherit" edge="end" onClick={() => setMobileOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}>
            <Box sx={{ width: 220 }} role="presentation" onClick={() => setMobileOpen(false)}>
              <List>
                <ListItem>
                  <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    {user ? user.email : ' '}
                  </Typography>
                </ListItem>
                {menuItems.map((item, idx) => (
                  <ListItem key={idx} disablePadding>
                    {item.to ? (
                      <ListItemButton component={Link} to={item.to}>
                        <ListItemText primary={item.label} />
                      </ListItemButton>
                    ) : (
                      <ListItemButton onClick={item.action}>
                        <ListItemText primary={item.label} />
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
  );
};

export default NavBar; 