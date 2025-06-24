import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer, List, ListItemIcon, ListItemText, Toolbar, AppBar, Typography, Box, Button, IconButton, useTheme, useMediaQuery, ListItemButton, Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import FolderIcon from '@mui/icons-material/Folder';
import PeopleIcon from '@mui/icons-material/People';
import HomeIcon from '@mui/icons-material/Home';
import BookIcon from '@mui/icons-material/Book';
import AdminCourses from './AdminCourses';

const drawerWidth = 220;
const collapsedWidth = 80;

const adminMenu = [
  { text: 'Διαχείριση Αρχείων', icon: <FolderIcon />, path: '/admin/files' },
  { text: 'Διαχείριση Χρηστών', icon: <PeopleIcon />, path: '/admin/users' },
  { text: 'Διαχείριση Μαθημάτων', icon: <BookIcon />, path: '/admin/courses' },
];

const glassBg = {
  background: 'rgba(255, 255, 255, 0.25)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderRadius: '24px',
  border: '1px solid rgba(255,255,255,0.18)',
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    if (isMobile) setMobileOpen(!mobileOpen);
    else setDrawerOpen(!drawerOpen);
  };

  const drawerContent = (
    <Box sx={{ ...glassBg, height: '100%', p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <Box>
        <Toolbar />
        {(drawerOpen || isMobile) ? (
          <IconButton
            color="primary"
            onClick={() => navigate('/')}
            sx={{
              mb: 3,
              mx: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: 48,
              borderRadius: 2,
              transition: 'transform 0.15s',
              background: 'transparent !important',
              '&:hover': {
                backgroundColor: 'transparent !important',
                background: 'transparent !important',
                transform: 'scale(1.08)',
              },
              '&.Mui-focusVisible': {
                backgroundColor: 'transparent !important',
                background: 'transparent !important',
              },
              '&.Mui-active': {
                backgroundColor: 'transparent !important',
                background: 'transparent !important',
              },
            }}
          >
            <HomeIcon sx={{ fontSize: 32, color: '#1a237e', transition: 'font-size 0.2s', mx: 'auto' }} />
          </IconButton>
        ) : (
          <IconButton
            color="primary"
            onClick={() => navigate('/')}
            sx={{
              mb: 3,
              mx: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: 48,
              borderRadius: 2,
              transition: 'transform 0.15s',
              background: 'transparent !important',
              '&:hover': {
                backgroundColor: 'transparent !important',
                background: 'transparent !important',
                transform: 'scale(1.08)',
              },
              '&.Mui-focusVisible': {
                backgroundColor: 'transparent !important',
                background: 'transparent !important',
              },
              '&.Mui-active': {
                backgroundColor: 'transparent !important',
                background: 'transparent !important',
              },
            }}
          >
            <HomeIcon sx={{ fontSize: 32, color: '#1a237e', transition: 'font-size 0.2s', mx: 'auto' }} />
          </IconButton>
        )}
        <Divider sx={{ mb: 2, opacity: 0.3 }} />
        <List>
          {adminMenu.map((item) => (
            <ListItemButton
              key={item.text}
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                mb: 1,
                borderRadius: 2,
                px: drawerOpen || isMobile ? 2.5 : 1.5,
                justifyContent: drawerOpen || isMobile ? 'flex-start' : 'center',
                background: 'transparent !important',
                boxShadow: 'none',
                transition: 'transform 0.15s',
                minHeight: 48,
                '&:hover': {
                  backgroundColor: 'transparent !important',
                  background: 'transparent !important',
                  transform: 'scale(1.08)',
                },
                '&.Mui-selected': {
                  backgroundColor: 'transparent !important',
                  background: 'transparent !important',
                  boxShadow: 'none',
                  transform: 'scale(1.08)',
                },
                '&.Mui-focusVisible': {
                  backgroundColor: 'transparent !important',
                  background: 'transparent !important',
                },
                '&.Mui-active': {
                  backgroundColor: 'transparent !important',
                  background: 'transparent !important',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: drawerOpen || isMobile ? 2.5 : 0,
                  justifyContent: 'center',
                  color: location.pathname === item.path ? '#283593' : '#1a237e',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: 0,
                }}
              >
                {React.cloneElement(item.icon, {
                  fontSize: drawerOpen || isMobile ? 'medium' : 'large',
                  style: {
                    fontSize: drawerOpen || isMobile ? 26 : 32,
                    transition: 'font-size 0.2s',
                  },
                })}
              </ListItemIcon>
              {(drawerOpen || isMobile) && (
                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 500, fontSize: 15 }} />
              )}
            </ListItemButton>
          ))}
        </List>
      </Box>
      {(drawerOpen || isMobile) && (
        <Box sx={{ textAlign: 'center', mt: 2, color: '#1a237e', opacity: 0.7, fontSize: 13 }}>
          DSUth Exam Bank Admin
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #e3eafc 0%, #f4f6f8 100%)', overflowX: 'hidden' }}>
      <AppBar position="fixed" sx={{ zIndex: 1201, background: 'rgba(26,35,126,0.95)', boxShadow: '0 4px 24px 0 rgba(26,35,126,0.10)' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
            {(isMobile ? mobileOpen : drawerOpen) ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, letterSpacing: 1 }}>
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
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', background: 'transparent', border: 'none', boxShadow: 'none' },
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
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
              overflowX: 'hidden',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              p: 1,
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
          background: 'none',
        }}
      >
        <Box sx={{
          width: '100%',
          maxWidth: 900,
          mx: 'auto',
          my: 'auto',
          p: { xs: 1, sm: 3 },
          ...glassBg,
          minHeight: { xs: '70vh', sm: '75vh' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
        }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard; 