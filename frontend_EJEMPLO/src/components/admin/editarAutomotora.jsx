import React, { useEffect, useState } from "react";
import {
  Paper,
  Button,
  TextField,
  FormGroup,
  Box,
  Typography,
} from "@mui/material";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";

const EditarAutomotoras = () => {
  const [automotive, setAutomotive] = useState(null);
  const [sucursales, setSucursales] = useState([]);
  let { id } = useParams();
  let navigate = useNavigate();

  useEffect(() => {
    // console.log(id);
    axios.get(`${process.env.API_URL}/automotora/${id}`).then((res) => {
      let content = res.data;
      if (!content.error) {
        // console.log(content.data);
        setAutomotive(content.data);
      }
    });

    axios
      .get(`${process.env.API_URL}/sucursal?automotoraID=${id}`)
      .then((res) => {
        let content = res.data;
        // console.log({ content });
        if (!content.error) {
          setSucursales(content.data);
        }
      });
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    // TODO: Cambiar a mensaje de error en el formulario
    if (!automotive) {
      return console.error("Debe ingresar un nombre de automotora");
    }
    try {
      var body = {
        Nombre: automotive.nombre,
        Id: automotive.id,
      };
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${process.env.API_URL}/Automotora`,
        body,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.status == 200) {
        throw new Error("Error al guardar la automotora");
      } else {
        console.log("Automotora guardada con exito");
        navigate("/administrador/automotoras", { replace: true });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAutomotive = (event) => {
    setAutomotive({ ...automotive, nombre: event.target.value });
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <FormGroup>
        <TextField
          label="Nombre de la automotora"
          value={automotive?.nombre || ""}
          onChange={(e) => handleAutomotive(e)}
          required
        />
        <Button onClick={handleSubmit}>Editar automotora</Button>
      </FormGroup>
      <Box width="inherit">
        <Link to={`/administrador/registro-sucursal/${id}`}>
          <Button>Nueva sucursal</Button>
        </Link>
      </Box>
      {sucursales.length > 0 ? (
        sucursales.map((sucursal) => (
          <Box
            component="div"
            sx={{ flex: 1 }}
            padding="5px"
            borderRadius="3px"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            style={{
              border: "1px solid rgb(59 130 246)",
              marginBottom: "10px",
            }}
            key={sucursal.id}
          >
            <Typography>{sucursal.nombre}</Typography>

            <div>
              <Link to={`/administrador/editar-sucursal/${sucursal.id}`}>
                <Button color="info">Editar</Button>
              </Link>
            </div>
          </Box>
        ))
      ) : (
        <Typography>No se encontraron sucursales</Typography>
      )}
    </Paper>
  );
};

export default EditarAutomotoras;
