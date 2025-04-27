// homePage.jsx
import { useContext, useEffect } from "react";
import { Box, Container, Button, Paper } from "@mui/material";
import RentMap from "../map/RentMap.jsx";
import { AppContext } from "../context/AppContext.jsx";
import { useNavigate } from "react-router-dom";
import SolicitarAutoForm from "../components/admin/SolicitarAuto.jsx";

const HomePage = () => {
  const navigate = useNavigate();

  const { setActivePage } = useContext(AppContext);

  useEffect(() => {
    setActivePage("homePage");
  }, []);

  const handleLoginClick = () => {
    navigate("/administrador/login");
  };

  return (
    <>
      <Box className="App">
        <div
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
        >
          <Paper
            sx={{
              zIndex: 100,
              width: "40%",
              position: "fixed",
              top: "10px",
              alignContent: "center",
              justifyContent: "center",
              textAlign: "left",
              padding: "17px",
              bgcolor: "RGBA(224, 224, 224, 0.7)",
            }}
            elevation={3}
          >
            <span>
              Seleccione puntos en el mapa para formar un polígono que devolverá
              los vehículos cuyas rutas se intersecten con este.
            </span>
          </Paper>
        </div>
        <RentMap />
      </Box>
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            sx={{
              my: 2,
              zIndex: 1,
              color: "#333333",
              bgcolor: "#E0E0E0",
              "&:hover": { bgcolor: "#C0C0C0" },
            }}
            variant="contained"
            onClick={handleLoginClick}
          >
            Login
          </Button>
        </Box>
        <SolicitarAutoForm />
      </Container>
    </>
  );
};

export default HomePage;
