import React, { useEffect, useState } from "react";
import Footer from "../common/Footer";
import { Box, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import axios from "axios";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

const ListaAutomoviles = () => {
  const [automoviles, setAutomoviles] = useState([]);
  useEffect(() => {
    axios.get(`${process.env.API_URL}/automovil`).then((res) => {
      let content = res.data;
      if (!content.error) {
        setAutomoviles(content.data);
      }
    });
  }, []);
  const submit = (id) => {
    confirmAlert({
      title: "Eliminar automovil",
      message: "¿Está seguro que desea eliminar el automovil?",
      buttons: [
        {
          label: "Si",
          onClick: () => eliminarAutomovil(id),
        },
        {
          label: "No",
        },
      ],
    });
  };
  const eliminarAutomovil = (id) => {
    try {
      //TODO: Agregar header con token
      axios.delete(`${process.env.API_URL}/automovil/${id}`);
      redirecty;
    } catch (error) {}
  };
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Box
        component="div"
        display="flex"
        flexDirection="column"
        margin="40px"
        gap="20px"
      >
        <Box width="inherit">
          <Link to="/administrador/registro-autos">
            <Button>Registrar Automovil</Button>
          </Link>
        </Box>
        {automoviles.map((automovil) => (
          <Box
            component="div"
            sx={{ flex: 1 }}
            padding="15px"
            bgcolor="black"
            borderRadius="3px"
            display="flex"
            justifyContent="space-between"
            key={automovil.id}
          >
            <Typography>
              {automovil.marca} {automovil.modelo} - Sucursal{" "}
              {automovil.sucursalId}
            </Typography>

            <div>
              <Link
                to={`/administrador/editar-recorrido-autos/${automovil.id}`}
              >
                <Button color="info">Editar</Button>
              </Link>
              <Button color="error" onClick={() => submit(automovil.id)}>
                Eliminar
              </Button>
            </div>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ListaAutomoviles;
