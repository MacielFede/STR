import { Grid, TextField } from "@mui/material";
import { useContext } from "react";
import { AppContext } from "../../../context/AppContext";

export function BusquedaPorCruces() {
  const {callePrimariaOrigen, setCallePrimariaOrigen,
    calleSecundariaOrigen, setCalleSecundariaOrigen, callePrimariaDestino, setCallePrimariaDestino,
    calleSecundariaDestino, setCalleSecundariaDestino
  } = useContext(AppContext)

  return (
    <>
      <Grid item xs={6} sm={6}>
        <TextField
          label="Origen calle primaria"
          fullWidth
          variant="outlined"
          value={callePrimariaOrigen}
          onChange={(e) => setCallePrimariaOrigen(e.target.value)}
          size="small"
        />
      </Grid>
      <Grid item xs={6} sm={6}>
        <TextField
          label="Origen calle secundaria"
          fullWidth
          variant="outlined"
          value={calleSecundariaOrigen}
          onChange={(e) => setCalleSecundariaOrigen(e.target.value)}
          size="small"
        />
      </Grid>
      <Grid item xs={6} sm={6}>
        <TextField
          label="Destino calle primaria"
          fullWidth
          variant="outlined"
          value={callePrimariaDestino}
          onChange={(e) => setCallePrimariaDestino(e.target.value)}
          size="small"
        />
      </Grid>
      <Grid item xs={6} sm={6}>
        <TextField
          label="Destino calle secundaria"
          fullWidth
          variant="outlined"
          value={calleSecundariaDestino}
          onChange={(e) => setCalleSecundariaDestino(e.target.value)}
          size="small"
        />
      </Grid>
    </>
  )
}