// This file is deprecated. Use the new admin dashboard structure in src/pages/admin/ instead.

import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, AppBar, Typography, Box, Button, IconButton, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import FolderIcon from '@mui/icons-material/Folder';
import PeopleIcon from '@mui/icons-material/People';
import HomeIcon from '@mui/icons-material/Home';

const drawerWidth = 220;

const adminMenu = [
  { text: 'Διαχείριση Αρχείων', icon: <FolderIcon />, path: '/admin/files' },
  { text: 'Διαχείριση Χρηστών', icon: <PeopleIcon />, path: '/admin/users' },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const drawerContent = (
    <Box>
      <Toolbar />
      <Box sx={{ px: 2, py: 1 }}>
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
      </Box>
      <List>
        {adminMenu.map((item) => (
          <ListItem
            button
            key={item.text}
            selected={location.pathname === item.path}
            onClick={() => {
              navigate(item.path);
              if (isMobile) setMobileOpen(false);
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #e3eafc 0%, #f4f6f8 100%)' }}>
      <AppBar position="fixed" sx={{ zIndex: 1201, background: '#1a237e' }}>
        <Toolbar>
          {isMobile && (
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
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
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', background: '#e3eafc' },
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
          ml: { xs: 0, sm: `${drawerWidth}px` },
          px: { xs: 1, sm: 3 },
          py: { xs: 2, sm: 3 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', my: 'auto' }}>
          <Toolbar />
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard; 