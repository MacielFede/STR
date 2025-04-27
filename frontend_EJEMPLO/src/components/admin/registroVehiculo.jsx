import React, { useState, useEffect, useContext } from "react";
import {
  Paper,
  FormGroup,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
} from "@mui/material";
import axios from "axios";
import proj4 from "proj4";
import { useNavigate } from "react-router-dom";
import RentMap from "../../map/RentMap";
import { AppContext } from "../../context/AppContext";
import {
  updateWFS,
  multiLineGeometry,
  wfsPropSet,
  pointGeometry,
  getFiltroEquealTo,
  getRecorridoWFS,
  filterIsEqualProperty,
  getFeatureWFS,
} from "../../geoLogic/wsfQueries";
import Circle from "ol/geom/Circle";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import {
  bufferContainsRecorrido,
  getEntitiesAndBuffers,
} from "../../geoLogic/utils";
import { transform } from "ol/proj";
import GeoJSON from "ol/format/GeoJSON";
import { MultiPolygon, Polygon } from "ol/geom";

const RegistroAutos = () => {
  const [matricula, setMatricula] = useState("");
  const [distanciaCobertura, setDistanciaCobertura] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [tipoVehiculo, setTipoVehiculo] = useState("");
  const [automotoraId, setAutomotoraId] = useState("");
  const [automotoras, setAutomotoras] = useState([]);
  const [sucursalId, setSucursalId] = useState("");
  const [sucursales, setSucursales] = useState([]);
  const navigate = useNavigate();

  const {
    setActivePage,
    originPoint,
    destinationPoint,
    setOriginPoint,
    setDestinationPoint,
    sucursalesVectorSource,
    vehiculosVectorSource,
    areaCoberturaVectorSource,
    styles,
    recorrido,
  } = useContext(AppContext);

  useEffect(() => {
    setActivePage("registroVehiculo");
    fetchAutomotoras();
  }, []);

  useEffect(() => {
    if (automotoraId) {
      sucursalesVectorSource.current.clear();
      vehiculosVectorSource.current.clear();
      areaCoberturaVectorSource.current.clear();
      MostrarSucursales();
    }
  }, [automotoraId]);

  const fetchAutomotoras = async () => {
    try {
      const res = await axios.get(`${process.env.API_URL}/Automotora`);
      const content = res.data;
      if (!content.error) {
        setAutomotoras(content.data);
      }
    } catch (error) {
      console.error("Error fetching automotoras:", error);
    }
  };

  const handleAutomotoraChange = async (event) => {
    const automotoraId = event.target.value;
    setAutomotoraId(event.target.value);
    console.log({automotoraId})
    try {
      const res = await axios.get(
        `${process.env.API_URL}/Sucursal?automotoraID=${automotoraId}`
      );
      const content = res.data;
      console.log({content})
      if (!content.error) setSucursales(content.data);
    } catch (error) {
      console.error("Error fetching sucursales:", error);
    }
  };

  async function MostrarSucursales() {
    const filters = filterIsEqualProperty({
      propertyName: "AutomotoraId",
      literal: automotoraId,
    });

    const response = await getFeatureWFS({
      workSpace: "RentYou",
      entidad: "Sucursal",
      filters,
    });

    if (!response.features) return;

    const features = new GeoJSON().readFeatures(response, {
      featureProjection: "EPSG:32721",
    });

    const { geomBuffers } = getEntitiesAndBuffers(response);

    areaCoberturaVectorSource.current.clear();
    geomBuffers.forEach((buffer) => {
      const bufferFeature = new Feature({
        geometry: new Polygon(buffer.geometry.coordinates).transform(
          "EPSG:4326",
          "EPSG:32721"
        ),
      });
      bufferFeature.setStyle(styles.coverageStyle);
      areaCoberturaVectorSource.current.addFeature(bufferFeature);
    });

    sucursalesVectorSource.current.clear();
    features.forEach((feature) => {
      feature.setStyle(styles.sucursalIcon);
      sucursalesVectorSource.current.addFeature(feature);
    });
  }

  const verificarRecorrido = async () => {
    return await bufferContainsRecorrido(sucursalId, recorrido.routes[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (
      !marca ||
      !modelo ||
      !tipoVehiculo ||
      !sucursalId ||
      !matricula ||
      !distanciaCobertura ||
      !originPoint ||
      !destinationPoint
    ) {
      console.error("Todos los campos son obligatorios.");
      return;
    }

    const recorridoValue = await verificarRecorrido();
    console.log({ recorridoValue });
    if (!recorridoValue) {
      console.error("Recorrido fuera del alcance de la sucursal.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found in localStorage");
      }

      // Paso 1: Guardar automóvil en la base de datos
      const automovilBody = {
        Marca: marca,
        Modelo: modelo,
        TipoVehiculo: parseInt(tipoVehiculo),
        SucursalId: parseInt(sucursalId),
        DistanciaCobertura: parseInt(distanciaCobertura),
        Matricula: matricula,
      };

      const responseAuto = await axios.post(
        `${process.env.API_URL}/Automovil`,
        automovilBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const automovilId = responseAuto.data.data.id;

      if (responseAuto.data.error) {
        throw new Error(responseAuto.data.Message);
      }

      // Paso 2: Crear viaje base para el automóvil
      const viajeBody = {
        Estado: -1,
        Base: true,
        AutomovilId: parseInt(automovilId),
      };

      const responseViaje = await axios.post(
        `${process.env.API_URL}/Viaje`,
        viajeBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const viajeId = responseViaje.data.data.id;

      try {
        // Paso 4: Guardar la geometría del recorrido en WFS
        const recorridoAux = recorrido.routes[0].geometry.coordinates.map(
          (point) => transform(point, "EPSG:4326", "EPSG:32721")
        );
        const ubicacionRecorrido = multiLineGeometry(recorridoAux);
        const ubicacionPunto = pointGeometry(originPoint);

        console.log("EL PUNTO DE ORIGEN ES: ", originPoint);
        await updateWFS({
          workSpace: "RentYou",
          entidad: "Automovil",
          properties: wfsPropSet({
            columna: "Ubicacion",
            geometry: ubicacionPunto,
          }),
          id: automovilId,
        });

        await updateWFS({
          workSpace: "RentYou",
          entidad: "Viaje",
          properties: wfsPropSet({
            columna: "Recorrido",
            geometry: ubicacionRecorrido,
          }),
          id: viajeId,
        });

        console.log("Automóvil y viaje registrados exitosamente.");
        navigate("/administrador/automoviles", { replace: true });
      } catch (error) {
        await axios.delete(`${process.env.API_URL}/Automovil/${automovilId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        console.error("Error al guardar recorrido en WFS:", error);
      }
    } catch (error) {
      console.error("Error al registrar automóvil y recorrido:", error);
    }
  };

  const handleSucursalChange = (id) => {
    setSucursalId(id);
    sucursalesVectorSource.current.clear();
    vehiculosVectorSource.current.clear();
    areaCoberturaVectorSource.current.clear();
    MostrarSucursal(id);
  };

  const MostrarSucursal = async (id) => {
    const filters = filterIsEqualProperty({
      propertyName: "Id",
      literal: id,
    });
    console.log({sucursalId})

    const response = await getFeatureWFS({
      workSpace: "RentYou",
      entidad: "Sucursal",
      filters,
    });

    console.log(response);
    if (!response.features) return;

    const features = new GeoJSON().readFeatures(response, {
      featureProjection: "EPSG:32721",
    });

    const { geomBuffers } = getEntitiesAndBuffers(response);
    console.log({ geomBuffers });

    areaCoberturaVectorSource.current.clear();
    geomBuffers.forEach((buffer) => {
      const bufferFeature = new Feature({
        geometry: new Polygon(buffer.geometry.coordinates).transform(
          "EPSG:4326",
          "EPSG:32721"
        ),
      });
      bufferFeature.setStyle(styles.coverageStyle);
      areaCoberturaVectorSource.current.addFeature(bufferFeature);
    });

    sucursalesVectorSource.current.clear();
    features.forEach((feature) => {
      feature.setStyle(styles.sucursalIcon);
      sucursalesVectorSource.current.addFeature(feature);
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <FormGroup>
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid item xs={2} sm={2}>
            <TextField
              size="small"
              fullWidth
              variant="outlined"
              label="Matricula"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={4} sm={4}>
            <TextField
              size="small"
              fullWidth
              variant="outlined"
              label="Marca"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={4} sm={4}>
            <TextField
              size="small"
              fullWidth
              variant="outlined"
              label="Modelo"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={2} sm={2}>
            <TextField
              size="small"
              fullWidth
              variant="outlined"
              label="Cobertura"
              value={distanciaCobertura}
              onChange={(e) => setDistanciaCobertura(e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={4} sm={4}>
            <FormControl size="small" required fullWidth>
              <InputLabel>Tipo de Vehículo</InputLabel>
              <Select
                value={tipoVehiculo}
                onChange={(e) => setTipoVehiculo(e.target.value)}
              >
                <MenuItem value="0" selected>
                  Desconocido
                </MenuItem>
                <MenuItem value="1">Eléctrico</MenuItem>
                <MenuItem value="2">Combustión</MenuItem>
                <MenuItem value="3">Híbrido</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={4} sm={4}>
            <FormControl size="small" required fullWidth>
              <InputLabel>Automotora</InputLabel>
              <Select value={automotoraId} onChange={handleAutomotoraChange}>
                {automotoras.map((automotora) => (
                  <MenuItem key={automotora.id} value={automotora.id}>
                    {automotora.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {sucursales.length > 0 && (
            <Grid item xs={4} sm={4}>
              <FormControl size="small" required fullWidth>
                <InputLabel>Sucursal</InputLabel>
                <Select
                  value={sucursalId}
                  onChange={(e) => handleSucursalChange(e.target.value)}
                >
                  {sucursales.map((sucursal) => (
                    <MenuItem key={sucursal.id} value={sucursal.id}>
                      {sucursal.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          <Grid item xs={12}>
            {/* Renderiza el componente RentMap y pasa originPoint y destinationPoint */}
            <RentMap
              height="70vh"
              originPoint={originPoint}
              destinationPoint={destinationPoint}
              setOriginPoint={setOriginPoint}
              setDestinationPoint={setDestinationPoint}
            />
          </Grid>
        </Grid>

        <Button onClick={handleSubmit} variant="contained" color="primary">
          Registrar automóvil
        </Button>
      </FormGroup>
    </Paper>
  );
};

export default RegistroAutos;
