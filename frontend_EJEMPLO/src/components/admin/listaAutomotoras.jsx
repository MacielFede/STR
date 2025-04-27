import React, { useEffect, useState } from "react";
import Footer from "../common/Footer";
import { Box, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import axios from "axios";
import { confirmAlert } from "react-confirm-alert";

const ListaAutomotoras = () => {
  const [automotoras, setAutomotoras] = useState([]);
  useEffect(() => {
    axios
      .get(`${process.env.API_URL}/automotora?tamanoPagina=100&numeroPagina=0`)
      .then((res) => {
        let content = res.data;
        if (!content.error) {
          setAutomotoras(content.data);
        }
      });
  }, []);
  const submit = (id) => {
    confirmAlert({
      title: "Eliminar automotora",
      message: "¿Está seguro que desea eliminar la automotora?",
      buttons: [
        {
          label: "Si",
          onClick: () => eliminarAutomotora(id),
        },
        {
          label: "No",
        },
      ],
    });
  };
  const eliminarAutomotora = (id) => {
    try {
      //TODO: Agregar header con token
      axios.delete(`${process.env.API_URL}/automotora/${id}`);
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
          <Link to="/administrador/registro-automotoras">
            <Button>Registrar Automotora</Button>
          </Link>
        </Box>
        {automotoras.map((automotora) => (
          <Box
            component="div"
            sx={{ flex: 1 }}
            padding="15px"
            bgcolor="black"
            borderRadius="3px"
            display="flex"
            justifyContent="space-between"
            key={automotora.id}
          >
            <Typography>{automotora.nombre}</Typography>

            <div>
              <Link to={`/administrador/editar-automotoras/${automotora.id}`}>
                <Button color="info">Editar</Button>
              </Link>
              <Button color="error" onClick={() => submit(automotora.id)}>
                Eliminar
              </Button>
            </div>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ListaAutomotoras;
