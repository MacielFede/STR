import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import MenuItem from '@mui/material/MenuItem';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@mui/material';

const pages = [
  { title: 'Automotoras', url: '/administrador/automotoras' },
  { title: 'Automoviles', url: '/administrador/automoviles' },
  { title: 'Ranking de sucursales', url: '/administrador/sucursales-ranking' },
  { title: 'Zonas sin cobertura', url: '/administrador/zona-cobertura' }
];

function ResponsiveAppBar () {
  const [anchorElNav, setAnchorElNav] = useState(null)

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget)
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
  };

  const logoutAdmin = () => {
    console.log('logout')
    localStorage.removeItem('token')
    window.location.href = '/'
  }

  return (
    <AppBar position='static'>
      <Container maxWidth='xl'>
        <Toolbar disableGutters>
          <DirectionsCarIcon
            sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }}
          />
          <Typography
            variant='h6'
            noWrap
            component='a'
            href='/administrador'
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            RentYou
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size='large'
              aria-label='account of current user'
              aria-controls='menu-appbar'
              aria-haspopup='true'
              onClick={handleOpenNavMenu}
              color='inherit'
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id='menu-appbar'
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' }
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page.title} onClick={handleCloseNavMenu}>
                  <Link to={page.url}>{page.title}</Link>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <DirectionsCarIcon
            sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}
          />
          <Typography
            variant='h5'
            noWrap
            component='a'
            href='/administrador'
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            RentYou
          </Typography>
          <Box
            sx={{
              flexGrow: 1,
              gap: '20px',
              display: { xs: 'none', md: 'flex' }
            }}
          >
            {pages.map((page) => (
              <Link
                to={page.url}
                key={page.title}
                onClick={handleCloseNavMenu}
              >
                {page.title}
              </Link>
            ))}
          </Box>
          <Button
            sx={{ my: 2, top: '0px', right: '10px', zIndex: 1, color: '#333333', bgcolor: '#E0E0E0', '&:hover': { bgcolor: '#C0C0C0' } }}
            variant='contained'
            onClick={logoutAdmin}
          >
            Logout
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
export default ResponsiveAppBar
