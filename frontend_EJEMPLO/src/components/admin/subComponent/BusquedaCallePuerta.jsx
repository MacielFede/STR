import { Grid, TextField } from "@mui/material";
import { useContext } from "react";
import { AppContext } from "../../../context/AppContext";


export function BusquedaCallePuerta(){

  const {
    calleOrigen, calleDestino, 
    setCalleOrigen, setCalleDestino,
    numeroOrigen, numeroDestino, 
    setNumeroOrigen, setNumeroDestino,
  } = useContext(AppContext)

  return (
  <>
      <Grid item xs={10} sm={10}>
        <TextField
          label="Nombre de calle de origen"
          fullWidth
          value={calleOrigen??""}
          onChange={(e) => setCalleOrigen(e.target.value)}
          variant="outlined"
          size="small"
        />
      </Grid>
      <Grid item xs={2} sm={2}>
        <TextField
          label="N° Puerta"
          fullWidth
          value={numeroOrigen??""}
          onChange={(e) => setNumeroOrigen(e.target.value)}
          size="small"
        />
      </Grid>
      <Grid item xs={10} sm={10}>
        <TextField
          label="Nombre de calle de destino"
          fullWidth
          value={calleDestino??""}
          onChange={(e) => setCalleDestino(e.target.value)}
          variant="outlined"
          size="small"
        />
      </Grid>

      <Grid item xs={2} sm={2}>
        <TextField
          label="N° Puerta"
          fullWidth
          value={numeroDestino??""}
          onChange={(e) => setNumeroDestino(e.target.value)}
          size="small"
        />
      </Grid>
    </>
  )
}