import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { AppContext } from "../../context/AppContext";
import { useContext, useEffect, useState } from "react";
import {
  filterAnd,
  filterDWithin,
  filterIsEqualProperty,
  filterOr,
  getFeatureWFS,
  multiLineGeometry,
  updateWFS,
  wfsPropSet,
} from "../../geoLogic/wsfQueries";
import { Feature } from "ol";
import { LineString, Point } from "ol/geom";
import GeoJSON from "ol/format/GeoJSON";
import { BusquedaCallePuerta } from "./subComponent/BusquedaCallePuerta";
import { BusquedaPorCruces } from "./subComponent/BusquedaPorCruces";
import * as turf from "@turf/turf";
import { getNearestCar, getNearestFeature } from "../../geoLogic/utils";
import axios from "axios";
import { transform } from "ol/proj";
import { confirmAlert } from "react-confirm-alert";

const SolicitarAutoForm = () => {
  const [origenGuardado, setOrigenGuardado] = useState();
  const [destinoGuardado, setDestinoGuardado] = useState();
  const [filtroTipoVehiculo, setFiltroTipoVehiculo] = useState("-1");
  const [filtroAutomotora, setFiltroAutomotora] = useState("-1");
  const [automotoras, setAutomotoras] = useState([]);

  const [comboSelector, setComboSelector] = useState("BusquedaCallePuerta");

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

  const {
    setOriginPoint: setCoordsOrigen,
    setDestinationPoint: setCoordsDestino,
    calleOrigen,
    calleDestino,
    numeroOrigen,
    numeroDestino,
    callePrimariaOrigen,
    calleSecundariaOrigen,
    callePrimariaDestino,
    calleSecundariaDestino,
    recorridoUsuarioSource,
    vehiculosVectorSource,
    sucursalesVectorSource,
    styles,
    recorrido,
    setRecorrido,
  } = useContext(AppContext);

  const geocodeAddress = async (calle, puerta) => {
    const calleProperty = filterIsEqualProperty({
      propertyName: "NOM_CALLE",
      literal: calle,
    });
    const numeroProperty = filterIsEqualProperty({
      propertyName: "NUM_PUERTA",
      literal: puerta,
    });
    const filters = filterAnd({
      properties: `${calleProperty + numeroProperty}`,
    });

    try {
      const response = await getFeatureWFS({
        workSpace: "cite",
        entidad: "numeros_puerta",
        filters,
      });
      return response.features[0]?.geometry.coordinates;
    } catch (error) {
      console.error(error);
    }
  };

  const guardarOrigen = ({ coords }) => {
    setOrigenGuardado({
      Calle: calleOrigen.toUpperCase(),
      Numero: numeroOrigen,
      Coords: coords,
    });
    setCoordsOrigen(coords);
  };

  const guardarDestino = ({ coords }) => {
    setDestinoGuardado({
      Calle: calleDestino.toUpperCase(),
      Numero: numeroDestino,
      Coords: coords,
    });
    setCoordsDestino(coords);
  };

  async function MostrarSucursales() {
    const distanceFilter = filterDWithin({
      srsName: "EPSG:4326",
      point: `${userCoords[0]} ${userCoords[1]}`,
      valueReference: "Ubicacion",
      meters: 2000,
    });
    const response = await getFeatureWFS({
      workSpace: "RentYou",
      entidad: "Sucursal",
      filters: distanceFilter,
    });

    if(!response.features) return

    const features = new GeoJSON().readFeatures(response, {
      featureProjection: "EPSG:32721",
    });

    sucursalesVectorSource.current.clear();
    features.forEach((feature) => {
      feature.setStyle(styles.sucursalIcon);
      sucursalesVectorSource.current.addFeature(feature);
    });
  }

  async function MostrarAutomoviles() {
    const distanceFilter = filterDWithin({
      srsName: "EPSG:4326",
      point: `${userCoords[0]} ${userCoords[1]}`,
      valueReference: "Ubicacion",
      meters: 2000,
    });
    const response = await getFeatureWFS({
      workSpace: "RentYou",
      entidad: "Automovil",
      filters: distanceFilter,
    });
    
    if(!response.features) return

    const features = new GeoJSON().readFeatures(response, {
      featureProjection: "EPSG:32721",
    });

    vehiculosVectorSource.current.clear();
    features.forEach((feature) => {
      feature.setStyle(styles.carIcon);
      vehiculosVectorSource.current.addFeature(feature);
    });
  }

  const handleMarcarRecorrido = async (event) => {
    event.preventDefault();
    try {
      let origenCoordenadas;
      let destinoCoordenadas;
      // console.log({ comboSelector });
      if (comboSelector === "BusquedaCallePuerta") {
        origenCoordenadas = await getOriginFromCalleNumero();
        destinoCoordenadas = await getDestinationFromCalleNumero();
      } else if (comboSelector === "BusquedaPorCruces") {
        origenCoordenadas = await getOriginPoint();
        destinoCoordenadas = await getDestinationPoint();
      }

      const featuresArray = [];
      const route = await getRoute(
        transform(origenCoordenadas, "EPSG:32721", "EPSG:4326"),
        transform(destinoCoordenadas, "EPSG:32721", "EPSG:4326")
      );

      if (!route) return;
      // console.log({route})
      const routeCoords = route.routes[0].geometry.coordinates.map((coord) =>
        transform(coord, "EPSG:4326", "EPSG:32721")
      );
      const routeFeature = new Feature(new LineString(routeCoords));
      routeFeature.setStyle(styles.blueLine);
      featuresArray.push(routeFeature);
      const originPointFeature = new Feature(new Point(origenCoordenadas));
      const destinationPointFeature = new Feature(
        new Point(destinoCoordenadas)
      );

      originPointFeature.setStyle(styles.blueCircle);
      destinationPointFeature.setStyle(styles.blueCircle);

      featuresArray.push(originPointFeature);
      featuresArray.push(destinationPointFeature);

      recorridoUsuarioSource.current.clear();
      featuresArray.forEach((feature) =>
        recorridoUsuarioSource.current.addFeature(feature)
      );
    } catch (error) {
      console.error("Error al geocodificar las direcciones:", error);
    }
  };

  const getRoute = async (start, end) => {
    const url = `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`;

    try {
      const response = await axios.get(url);
      console.log({ getRouteResponse: response });
      setRecorrido(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching route:", error);
      return null;
    }
  };

  const getOriginFromCalleNumero = async () => {
    if (
      !origenGuardado ||
      origenGuardado.Calle !== calleOrigen.toUpperCase() ||
      origenGuardado.Numero !== numeroOrigen ||
      !origenGuardado.Coords
    ) {
      // console.log("No se encontro origen guardado");
      return geocodeAddress(calleOrigen.toUpperCase(), numeroOrigen).then(
        (coords) => {
          // console.log(coords);
          guardarOrigen({ coords });
          return coords;
        }
      );
    } else {
      console.log("Se encontro origen guardado", origenGuardado);
      return origenGuardado.Coords;
    }
  };

  const getDestinationFromCalleNumero = async () => {
    if (
      !destinoGuardado ||
      destinoGuardado.Calle !== calleDestino.toUpperCase() ||
      destinoGuardado.Numero !== numeroDestino ||
      !destinoGuardado.Coords
    ) {
      // console.log("No se encontro destino guardado");
      return geocodeAddress(calleDestino.toUpperCase(), numeroDestino).then(
        (coords) => {
          // console.log(coords);
          guardarDestino({ coords });
          return coords;
        }
      );
    } else {
      console.log("Se encontro destino guardado", destinoGuardado);
      return destinoGuardado.Coords;
    }
  };

  const handleRequestCarFromCalleNumero = async (event) => {
    event.preventDefault();
    vehiculosVectorSource.current.clear();
    sucursalesVectorSource.current.clear();
    try {
      const orgCoord = await getOriginFromCalleNumero();
      const dstCoord = await getDestinationFromCalleNumero();
      // console.log({ orgCoord, dstCoord });
      const dWithinFilter = filterDWithin({
        srsName: "EPSG:32721",
        point: `${orgCoord[0]} ${dstCoord[1]}`,
        valueReference: "Ubicacion",
      });
      let filters = filterAnd({
        properties: [dWithinFilter],
      });
      // console.log({ filtroAutomotora });
      let sucursalesFilter = null;
      if (filtroAutomotora != "-1") {
        let sucursales = await getSucursalesByAutomotora();
        // console.log({ sucursales });
        if (!sucursales || sucursales.length == 0) {
          console.warn("No hay sucursales");
          return;
        }
        let sucursalesPropertyFilters = sucursales.map((s) =>
          filterIsEqualProperty({ propertyName: "SucursalId", literal: s.id })
        );
        // console.log({ sucursalesPropertyFilters });

        sucursalesFilter = filterOr({
          properties: sucursalesPropertyFilters,
        });
      }

      let tipoVehiculoFilter = null;
      if (filtroTipoVehiculo != "-1") {
        tipoVehiculoFilter = filterIsEqualProperty({
          propertyName: "TipoVehiculo",
          literal: filtroTipoVehiculo,
        });
        // console.log({ tipoVehiculoFilter });
      }
      filters = filterAnd({
        properties: dWithinFilter + sucursalesFilter + tipoVehiculoFilter,
      });
      const response = await getFeatureWFS({
        workSpace: "RentYou",
        entidad: "Automovil",
        filters,
      });
      const featuresJSON = new GeoJSON().readFeatures(response, {
        featureProjection: "EPSG:32721",
      });
      const validFeaturesList = await GetAvailableCars(featuresJSON);
      // console.log({ validFeaturesList });
      // console.log(featuresJSON);
      const feature = await getNearestCar(validFeaturesList, orgCoord);
      CrearViaje(feature.values_.Id);
      // console.log({ requestCarFeature: feature });
      const sucursal = feature.values_.SucursalId;
      mostrarSucursal(sucursal);
      vehiculosVectorSource.current.clear();
      feature.setStyle(styles.carIcon);
      vehiculosVectorSource.current.addFeature(feature);
    } catch (error) {
      console.error(error);
    }
  };

  const CrearViaje = async (AutomovilId) => {
    console.log({ AutomovilId });
    const viajeBody = {
      Estado: 2,
      AutomovilId,
      Base: false,
    };
    const responseViaje = await axios.post(
      `${process.env.API_URL}/Viaje`,
      viajeBody,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const viajeId = responseViaje.data.data.id;
    console.log({ recorrido });
    const recorridoAux = recorrido.routes[0].geometry.coordinates.map((point) =>
      transform(point, "EPSG:4326", "EPSG:32721")
    );
    console.log({ recorridoAux });
    const ubicacionRecorrido = multiLineGeometry(recorridoAux);
    await updateWFS({
      workSpace: "RentYou",
      entidad: "Viaje",
      properties: wfsPropSet({
        columna: "Recorrido",
        geometry: ubicacionRecorrido,
      }),
      id: viajeId,
    });

    recorridoUsuarioSource.current.forEachFeature((x) => {
      x.setStyle(styles.greenLine);
    });

    const duration = recorrido.routes[0].duration * 20;
    const points = recorridoAux.length;
    const stepDuration = duration / points;
    console.log({ duration, points, stepDuration });

    for (let i = 0; i < points; i++) {
      const auto = new Feature({
        geometry: new Point(recorridoAux[i]),
      });

      vehiculosVectorSource.current.clear();
      auto.setStyle(styles.carIcon);
      vehiculosVectorSource.current.addFeature(auto);

      await sleep(stepDuration);
    }

    await TerminarViaje(viajeId);

    confirmAlert({
      title: "Viaje finalizado",
      message: "Gracias por confiar en nosotros!",
      buttons: [
        {
          label: "Cerrar",
          style:{backgroundColor:"green"}
        },
      ],
    });
  };

  const TerminarViaje = async (viajeId) => {
    console.log("Terminando viaje");
    await axios.patch(`${process.env.API_URL}/Viaje/${viajeId}?estadoViaje=3`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    recorridoUsuarioSource.current.clear();
    vehiculosVectorSource.current.clear();
    setRecorrido("");
  };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const GetAvailableCars = async (featuresJSON) => {
    const response = await Promise.all(
      featuresJSON.map(async (f) => {
        const available = await IsCarAvailable(f.values_.Id);
        return available ? f : null;
      })
    );

    // console.log({ GetAvailableCars: response });
    return response.filter((f) => f);
  };

  const IsCarAvailable = async (id) => {
    const EN_CURSO = 2;
    const res = await axios.get(
      `${process.env.API_URL}/viaje?AutomovilId=${id}&Estado=${EN_CURSO}`
    );

    let content = res.data;
    // console.log({ content });
    if (!content.error) return content.data.length == 0;

    return false;
  };

  const getSucursalesByAutomotora = async () => {
    let sucursales = await axios
      .get(`${process.env.API_URL}/sucursal?automotoraID=${filtroAutomotora}`)
      .then((res) => {
        const content = res.data;
        if (!content.error) {
          return content.data;
        }
      });
    return sucursales;
  };

  const handleRequestCarFromCruces = async (event) => {
    event.preventDefault();
    try {
      const orgCoord = await getOriginPoint();
      const dstCoord = await getDestinationPoint();

      const filters = filterDWithin({
        srsName: "EPSG:32721",
        point: `${orgCoord[0]} ${dstCoord[1]}`,
        valueReference: "Ubicacion",
      });
      const response = await getFeatureWFS({
        workSpace: "RentYou",
        entidad: "Automovil",
        filters,
      });

      const featuresJSON = new GeoJSON().readFeatures(response, {
        featureProjection: "EPSG:32721",
      });
      // console.log(featuresJSON);
      const feature = getNearestFeature(featuresJSON, orgCoord);
      CrearViaje(feature.values_.Id);
      vehiculosVectorSource.current.clear();
      feature.setStyle(styles.carIcon);
      vehiculosVectorSource.current.addFeature(feature);
    } catch (error) {
      console.error(error);
    }
  };

  const getOriginPoint = async () => {
    const featuresCallePrimariaOrigen = await getStreetMultiLine(
      callePrimariaOrigen.toUpperCase()
    );
    const featuresCalleSecundariaOrigen = await getStreetMultiLine(
      calleSecundariaOrigen.toUpperCase()
    );
    // console.log(callePrimariaOrigen);
    const pointFeature = turf.lineIntersect(
      featuresCallePrimariaOrigen,
      featuresCalleSecundariaOrigen,
      { removeDuplicates: false }
    ).features;

    let array = pointFeature.map((t) => t.geometry.coordinates);
    return array.find((item, index) =>
      array.some(
        (elem, idx) =>
          elem[0] === item[0] && elem[1] === item[1] && idx !== index
      )
    );
  };

  const getDestinationPoint = async () => {
    const featuresCallePrimariaDestino = await getStreetMultiLine(
      callePrimariaDestino.toUpperCase()
    );
    const featuresCalleSecundariaDestino = await getStreetMultiLine(
      calleSecundariaDestino.toUpperCase()
    );
    // console.log(callePrimariaDestino);
    const pointFeature = turf.lineIntersect(
      featuresCallePrimariaDestino,
      featuresCalleSecundariaDestino,
      { removeDuplicates: false }
    ).features;

    let array = pointFeature.map((t) => t.geometry.coordinates);
    return array.find((item, index) =>
      array.some(
        (elem, idx) =>
          elem[0] === item[0] && elem[1] === item[1] && idx !== index
      )
    );
  };

  const getStreetMultiLine = async (name) => {
    const filter = filterIsEqualProperty({
      propertyName: "NOM_CALLE",
      literal: name,
    });
    const response = await getFeatureWFS({
      workSpace: "cite",
      entidad: "vias",
      filters: filter,
    });
    return response;
  };

  const handleTipoBusqueda = (event) => {
    setComboSelector(event.target.value);
  };

  const mostrarSucursal = async (sucursal) => {
    const sucursalFilter = filterIsEqualProperty({
      propertyName: "Id",
      literal: sucursal,
    });
    const response = await getFeatureWFS({
      workSpace: "RentYou",
      entidad: "Sucursal",
      filters: sucursalFilter,
    });
    const features = new GeoJSON().readFeatures(response, {
      featureProjection: "EPSG:32721",
    });

    sucursalesVectorSource.current.clear();
    features.forEach((feature) => {
      feature.setStyle(styles.sucursalIcon);
      sucursalesVectorSource.current.addFeature(feature);
    });
  };

  return (
    <Box
      id="solicitarAuto"
      p={3}
      bgcolor="#D3D3D3"
      borderRadius={2}
      my={2}
      mx={{ xs: 2, sm: 2, md: 20 }}
      style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 1 }}
    >
      <Container>
        <Grid
          component="form"
          onSubmit={
            comboSelector === "BusquedaCallePuerta"
              ? handleRequestCarFromCalleNumero
              : handleRequestCarFromCruces
          }
          container
          spacing={2}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <FormControl sx={{ minWidth: 120, paddingTop: 2 }} size="small">
                <Select value={comboSelector} onChange={handleTipoBusqueda}>
                  <MenuItem value={"BusquedaCallePuerta"}>
                    Buscando por calle y número de puerta
                  </MenuItem>
                  <MenuItem value={"BusquedaPorCruces"}>
                    Buscando por cruces
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={6}>
              <FormControl sx={{ minWidth: 120 }} size="small">
                <Select
                  defaultValue=""
                  value={filtroTipoVehiculo}
                  onChange={(e) => setFiltroTipoVehiculo(e.target.value)}
                >
                  <MenuItem value={"-1"} selected>
                    Seleccione un tipo de automovil
                  </MenuItem>
                  <MenuItem value={"0"}>Desconocido</MenuItem>
                  <MenuItem value={"1"}>Eléctrico</MenuItem>
                  <MenuItem value={"2"}>Combustión</MenuItem>
                  <MenuItem value={"3"}>Híbrido</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} sm={6}>
              <FormControl sx={{ minWidth: 120 }} size="small">
                <Select
                  value={filtroAutomotora}
                  onChange={(e) => setFiltroAutomotora(e.target.value)}
                >
                  <MenuItem selected={true} value={"-1"}>
                    Seleccione una automotora
                  </MenuItem>
                  {automotoras.map((a) => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {comboSelector === "BusquedaCallePuerta" && <BusquedaCallePuerta />}
            {comboSelector === "BusquedaPorCruces" && <BusquedaPorCruces />}
            <Grid item xs={6} sm={6}>
              <Button
                onClick={handleMarcarRecorrido}
                fullWidth
                variant="contained"
                color="success"
                size="small"
              >
                Marcar recorrido
              </Button>
            </Grid>
            <Grid item xs={6} sm={6}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="small"
                disabled={recorrido.length == 0}
              >
                Solicitar Auto
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default SolicitarAutoForm;
