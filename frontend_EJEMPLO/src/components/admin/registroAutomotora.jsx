import { useState, useContext, createContext } from "react";
import { Typography, Paper, FormGroup, TextField, Button } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RegistroAutomotoras = () => {
  const [newAutomotive, setNewAutomotive] = useState("");
  let navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    // TODO: Cambiar a mensaje de error en el formulario
    if (!newAutomotive) {
      return console.error("Debe ingresar un nombre de automotora");
    }
    try {
      //const response = await fetch(`${process.env.API_URL}/Automotora?Nombre=${encodeURIComponent(newAutomotive)}`, {
      var body = {
        Nombre: newAutomotive,
      };
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.API_URL}/Automotora`,
        body,
        {
          method: "POST",

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
    setNewAutomotive(event.target.value);
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="h6">Componente Mapa en construcción</Typography>
      <FormGroup>
        <TextField
          label="Nombre de la automotora"
          value={newAutomotive}
          onChange={handleAutomotive}
          required
        />
        <Button onClick={handleSubmit}>Registrar automotora</Button>
      </FormGroup>
    </Paper>
  );
};

export default RegistroAutomotoras;
