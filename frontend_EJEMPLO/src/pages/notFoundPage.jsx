import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const goHome = () => {
    navigate('/');
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ textAlign: 'center', mt: 8 }}>
      <Box sx={{ my: 4 }}>
        <ErrorOutlineIcon sx={{ fontSize: 60 }} color="error" />
        <Typography variant="h4" component="h1" gutterBottom>
          404 - Página No Encontrada
        </Typography>
        <Typography variant="subtitle1">
          Lo sentimos, la página que buscas no existe o fue movida.
        </Typography>
        <Box mt={4}>
          <Button variant="contained" color="primary" onClick={goHome}>
            Volver al Inicio
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default NotFoundPage;