import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, AppBar, Typography, Box, Button, IconButton, useTheme, useMediaQuery, ListItemButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import FolderIcon from '@mui/icons-material/Folder';
import PeopleIcon from '@mui/icons-material/People';
import HomeIcon from '@mui/icons-material/Home';
import BookIcon from '@mui/icons-material/Book';
import AdminCourses from './AdminCourses';

const drawerWidth = 220;
const collapsedWidth = 60;

const adminMenu = [
  { text: 'Διαχείριση Αρχείων', icon: <FolderIcon />, path: '/admin/files' },
  { text: 'Διαχείριση Χρηστών', icon: <PeopleIcon />, path: '/admin/users' },
  { text: 'Διαχείριση Μαθημάτων', icon: <BookIcon />, path: '/admin/courses' },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(true); // controls permanent drawer on desktop
  const [mobileOpen, setMobileOpen] = useState(false); // controls temporary drawer on mobile

  const handleDrawerToggle = () => {
    if (isMobile) setMobileOpen(!mobileOpen);
    else setDrawerOpen(!drawerOpen);
  };

  const drawerContent = (
    <Box>
      <Toolbar />
      <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: drawerOpen || isMobile ? 'block' : 'center', alignItems: 'center' }}>
        {(drawerOpen || isMobile) ? (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<HomeIcon />}
            fullWidth
            onClick={() => navigate('/')}
            sx={{ mb: 2 }}
          >
            Επιστροφή στην Ιστοσελίδα
          </Button>
        ) : (
          <IconButton color="primary" onClick={() => navigate('/')} sx={{ mb: 2 }}>
            <HomeIcon />
          </IconButton>
        )}
      </Box>
      <List>
        {adminMenu.map((item) => (
          <ListItemButton
            key={item.text}
            selected={location.pathname === item.path}
            onClick={() => {
              navigate(item.path);
              if (isMobile) setMobileOpen(false);
            }}
            sx={{ justifyContent: drawerOpen || isMobile ? 'flex-start' : 'center', px: drawerOpen || isMobile ? 2 : 1 }}
          >
            <ListItemIcon sx={{ minWidth: 0, mr: drawerOpen || isMobile ? 2 : 'auto', justifyContent: 'center' }}>{item.icon}</ListItemIcon>
            {(drawerOpen || isMobile) && <ListItemText primary={item.text} />}
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #e3eafc 0%, #f4f6f8 100%)', overflowX: 'hidden' }}>
      <AppBar position="fixed" sx={{ zIndex: 1201, background: '#1a237e' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
            {(isMobile ? mobileOpen : drawerOpen) ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      {/* Sidebar Drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', background: '#e3eafc' },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          open={drawerOpen}
          sx={{
            width: drawerOpen ? drawerWidth : collapsedWidth,
            flexShrink: 0,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            [`& .MuiDrawer-paper`]: {
              width: drawerOpen ? drawerWidth : collapsedWidth,
              boxSizing: 'border-box',
              background: '#e3eafc',
              overflowX: 'hidden',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          ml: { xs: 0, sm: drawerOpen ? `${drawerWidth}px` : `${collapsedWidth}px` },
          px: { xs: 1, sm: 3 },
          py: { xs: 2, sm: 3 },
          transition: theme.transitions.create(['margin-left'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          maxWidth: '100vw',
          overflowX: 'hidden',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto', my: 'auto', p: { xs: 0, sm: 2 }, overflowX: 'hidden' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard; 