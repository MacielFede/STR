import { Box, Button, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import axios from "axios";
import { Container } from "postcss";
import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";

export function ListaSucursalesRanking() {
  const [sucursales, setSucursales] = useState([])
  const [cantidad, setCantidad] = useState(10)

  useEffect(() => {
    getSucursales()
  }, []);

  const getSucursales = () => {
    axios
      .get(`${process.env.API_URL}/Sucursal/Sucursal/MayorCantVehiculos?cantidad=${cantidad}`)
      .then((res) => {
        if (!res.data.error) setSucursales(res.data.data);
        console.log(res.data.data)
      });
  }

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
          <Link to="/administrador/sucursales-ranking">
            <Button>Ranking sucursales</Button>
          </Link>
        </Box>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow sx={{ bgcolor: '#1976d2', color: '#FFFF' }}>
                <TableCell>Posisción</TableCell>
                <TableCell align="center">Automotora</TableCell>
                <TableCell align="center">Nombre</TableCell>
                <TableCell align="center">Combustión</TableCell>
                <TableCell align="center">Híbridos</TableCell>
                <TableCell align="center">Eléctricos</TableCell>
                <TableCell align="center">Desconocido</TableCell>
                <TableCell align="center">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sucursales.map((sucursal, index) => (
                <TableRow
                  key={sucursal.name}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">{index + 1}</TableCell>
                  <TableCell align="center">{sucursal.automotoraName}</TableCell>
                  <TableCell align="center">{sucursal.nombre}</TableCell>
                  <TableCell align="center">{sucursal.combustion}</TableCell>
                  <TableCell align="center">{sucursal.hibrido}</TableCell>
                  <TableCell align="center">{sucursal.electrico}</TableCell>
                  <TableCell align="center">{sucursal.desconocido}</TableCell>
                  <TableCell align="center">{sucursal.vehiculos}</TableCell>

                </TableRow>
              ))}


            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  )
}