import { useContext, useEffect, useState } from "react";
import { Box, Button, Container, Grid, MenuItem, Select } from "@mui/material";
import RentMap from "../../map/RentMap";
import {
  getFeatureWFS,
  filterIsEqualProperty,
  filterAnd,
  filterOr,
} from "../../geoLogic/wsfQueries";
import { GeoJSON } from "ol/format";
import { AppContext } from "../../context/AppContext";
import { set } from "ol/transform";
import AdminFooter from "./adminFooter";
import { Height } from "@mui/icons-material";
import AdminAside from "./adminAside";
import {
  getEntitiesAndBuffers,
  getMultilinesAndBuffers,
} from "../../geoLogic/utils";
import { Polygon } from "ol/geom";
import { Feature } from "ol";
import { feature } from "turf";

const AdminDashboard = () => {
  const {
    styles,
    sucursalesVectorSource,
    setActivePage,
    vehiculosVectorSource,
    areaCoberturaSucursalVectorSource,
    areaCoberturaVehiculoVectorSource,
    recorridoAutomovilSource
  } = useContext(AppContext);
  const [idSucursal, setIdSucursal] = useState(-1);
  const [idVehiculo, setIdVehiculo] = useState(-1);
  const [idAutomotora, setIdAutomotora] = useState(-1);
  const [sucursales, setSucursales] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [automotoras, setAutomotoras] = useState([]);
  const [tipoVehiculo, setTipoVehiculo] = useState("Todos los tipos");
  const tiposDeVehiculos = [
    { id: 4, tipo: "Desconocido" },
    { id: 1, tipo: "Eléctrico" },
    { id: 2, tipo: "Combustión" },
    { id: 3, tipo: "Híbrido" },
  ];

  async function MostrarSucursales() {
    sucursalesVectorSource.current.clear();
    const filters = [];
    // console.log({idSucursal,idAutomotora})
    if (idSucursal !== -1)
      filters.push(
        filterIsEqualProperty({ propertyName: "Id", literal: idSucursal })
      );
    if (idAutomotora !== -1)
      filters.push(
        filterIsEqualProperty({
          propertyName: "AutomotoraId",
          literal: idAutomotora,
        })
      );
    const combinedFilter =
      filters.length > 1
        ? filterAnd({ properties: filters.join("") })
        : filters[0] || null;
    // console.log(combinedFilter)
    const response = await getFeatureWFS({
      workSpace: "RentYou",
      entidad: "Sucursal",
      filters: combinedFilter,
    });
    if (!response.features) return;
    const features = parseGeoJSONFeatures(response);

    const { geomBuffers } = getEntitiesAndBuffers(response);
    // console.log({ geomBuffers })
    sucursalesVectorSource.current.clear();
    features.forEach((feature) => {
      feature.setStyle(styles.sucursalIcon);
      sucursalesVectorSource.current.addFeature(feature);
    });

    areaCoberturaSucursalVectorSource.current.clear();
    geomBuffers.forEach((buffer) => {
      const bufferFeature = new Feature({
        geometry: new Polygon(buffer.geometry.coordinates).transform(
          "EPSG:4326",
          "EPSG:32721"
        ),
      });
      bufferFeature.setStyle(styles.coverageStyle);
      areaCoberturaSucursalVectorSource.current.addFeature(bufferFeature);
    });
  }

  const obtenerSucursales = async (automotoraId) => {
    let properties = "/";
    if (automotoraId !== -1) properties = `?automotoraID=${automotoraId}`;
    const response = await fetch(`${process.env.API_URL}/Sucursal${properties}`);
    const data = await response.json();
    const sucursalesArray = data.data.map((sucursal) => ({
      id: sucursal.id,
      nombre: sucursal.nombre,
    }));
    setSucursales(sucursalesArray);
  };

  const obtenerAutomotoras = async () => {
    const response = await fetch(`${process.env.API_URL}/Automotora`);
    const data = await response.json();
    const automotoras = data.data.map((automotora) => ({
      id: automotora.id,
      nombre: automotora.nombre,
      sucursales: automotora.sucursales.map((x) => x.id),
    }));
    setAutomotoras(automotoras);
  };

  const parseGeoJSONFeatures = (response) => {
    return new GeoJSON().readFeatures(response, {
      featureProjection: "EPSG:32721",
    });
  };

  const esperarRecorrido = (recorridos, features) => {
    const featuresList = recorridos.features.filter((x) =>
      features.some((z) => z.values_.Id === x.properties.AutomovilId)
    );
    recorridos.features = featuresList;
    recorridos.features.map((recorrido) => {
      const caracteristicas = features.find(
        (feature) => feature.values_.Id === recorrido.properties.AutomovilId
      );
      // console.log({ caracteristicas });
      const distancia = caracteristicas.values_.DistanciaCobertura;
      recorrido.properties["DistanciaCobertura"] = distancia;
    });
    return recorridos;
  };

  async function MostrarAutomoviles() {
    vehiculosVectorSource.current.clear();
    const filtersAnd = [];

    if (idSucursal && idSucursal !== -1)
      filtersAnd.push(
        filterIsEqualProperty({
          propertyName: "SucursalId",
          literal: idSucursal,
        })
      );
    else if (idAutomotora && idAutomotora !== -1) {
      const automotorasId = automotoras.find(
        (x) => x.id === idAutomotora
      ).sucursales;
      const automotorasFilter = [];
      automotorasId.forEach((x) =>
        automotorasFilter.push(
          filterIsEqualProperty({ propertyName: "SucursalId", literal: x })
        )
      );
      const automotorasFilterOr = filterOr({
        properties: automotorasFilter.join(""),
      });
      filtersAnd.push(automotorasFilterOr);
    }
    if (idVehiculo && idVehiculo !== -1)
      filtersAnd.push(
        filterIsEqualProperty({ propertyName: "Id", literal: idVehiculo })
      );
    if (tipoVehiculo && tipoVehiculo !== "Todos los tipos")
      filtersAnd.push(
        filterIsEqualProperty({
          propertyName: "TipoVehiculo",
          literal: tipoVehiculo,
        })
      );
    const combinedFilters =
      filtersAnd.length > 1
        ? filterAnd({ properties: filtersAnd })
        : filtersAnd[0] || "";
    const response = await getFeatureWFS({
      workSpace: "RentYou",
      entidad: "Automovil",
      filters: combinedFilters,
      print: true,
    });

    // console.log({ response })

    const features = new GeoJSON().readFeatures(response, {
      featureProjection: "EPSG:32721",
    });

    const recorridos = await getFeatureWFS({
      workSpace: "RentYou",
      entidad: "Viaje",
      filters: filterIsEqualProperty({ propertyName: "Estado", literal: -1 }),
    });

    // console.log({ recorridos, features });

    const recorridosConCobertura = esperarRecorrido(recorridos, features);
    const { buffers } = getMultilinesAndBuffers(recorridosConCobertura);

    areaCoberturaVehiculoVectorSource.current.clear();
    buffers.forEach((buffer) => {
      buffer.setStyle(styles.blueCoverageStyle);
      areaCoberturaVehiculoVectorSource.current.addFeature(buffer);
    });

    const recorridosParseados = parseGeoJSONFeatures(recorridosConCobertura);
    recorridoAutomovilSource.current.clear();
    recorridosParseados.forEach((recorrido) => {
      recorrido.setStyle(styles.blueLine);
      recorridoAutomovilSource.current.addFeature(recorrido);
    });

    features.forEach((feature) => {
      feature.setStyle(styles.carIcon);
      vehiculosVectorSource.current.addFeature(feature);
    });
  }

  const fetchVehicles = async (sucursalId, automotoraId) => {
    // TODO: Filtrar autos por sucursal
    if (sucursalId !== -1)
      return await fetch(
        `${process.env.API_URL}/Automovil?sucursalId=${sucursalId}`
      );
    return await fetch(`${process.env.API_URL}/Automovil`);
  };

  const obtenerAutomoviles = async (sucursalId, automotoraId, tipoVehiculo) => {
    try {
      // Verifica si se proporcionó un sucursalId
      // console.log({ sucursalId, automotoraId })

      const response = await fetchVehicles(sucursalId, automotoraId);
      const data = await response.json().then((data) => data.data);

      // Filtra los vehículos por sucursalId si está definido
      // console.log({data,sucursalId})
      const vehiculosFiltrados =
        sucursalId !== -1
          ? data.filter((vehiculo) => vehiculo.sucursalId === sucursalId)
          : data;

      const vehiculosPorTipo =
        tipoVehiculo !== undefined
          ? vehiculosFiltrados.filter(
              (vehiculo) => vehiculo.tipoVehiculo === tipoVehiculo
            )
          : vehiculosFiltrados;

      const vehiculos = vehiculosPorTipo.map((vehiculo) => ({
        id: vehiculo.id,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        tipoVehiculo: vehiculo.tipoVehiculo,
        sucursalId: vehiculo.sucursalId,
        distanciaCobertura: vehiculo.distanciaCobertura,
        matricula: vehiculo.matricula,
        viajeActivo_Id: vehiculo.viajeActivo,
      }));

      setVehiculos(vehiculos);
    } catch (error) {
      console.error("Error al obtener los automóviles:", error);
    }
  };

  useEffect(() => {
    setActivePage("Dashboard");
    obtenerAutomotoras();
    obtenerSucursales();
    obtenerAutomoviles();
  }, []);

  useEffect(() => {
    // console.log({idAutomotora,idSucursal})
    obtenerSucursales(idAutomotora);
    obtenerAutomoviles(idSucursal, idAutomotora);
  }, [idAutomotora]);

  useEffect(() => {
    MostrarSucursales();
    obtenerAutomoviles(idSucursal, idAutomotora);
  }, [idSucursal]);

  useEffect(() => {
    MostrarSucursales();
    MostrarAutomoviles();
  }, [sucursales]);

  useEffect(() => {
    MostrarAutomoviles();
  }, [vehiculos]);

  useEffect(() => {
    MostrarSucursales();
    MostrarAutomoviles();
  }, [tipoVehiculo, idVehiculo]);

  const Selects = (labelId, id, value, label, onchange, all, menuItems) => {
    return (
      <Grid item xs={3} sm={3}>
        <Select
          labelId={labelId}
          id={id}
          value={value}
          label={label}
          onChange={onchange}
        >
          {/* map de resultados de una consulta para mostrar todos las posibles sucursales */}
          <MenuItem value={id === "tipoVehiculo" ? all : -1}>{all}</MenuItem>
          {menuItems}
        </Select>
      </Grid>
    );
  };

  const handleAutomotoraChange = (e) => {
    setIdAutomotora(e.target.value);
    setIdSucursal(-1);
    setIdVehiculo(-1);
  };

  const handleSucursalChange = (e) => {
    setIdSucursal(e.target.value);
    setIdVehiculo(-1);
  };

  const handleVehiculoChange = (e) => {
    setIdVehiculo(e.target.value);
  };

  const handleTipoVehiculoChange = (e) => {
    setTipoVehiculo(e.target.value);
  };

  return (
    <>
      {/* <AdminAside>
        Hola
      </AdminAside> */}
      <Box className="App">
        <RentMap height="93vh" />
      </Box>
      <AdminFooter>
        <Grid container spacing={2}>
          {Selects(
            "automotora-label",
            "automotora",
            idAutomotora,
            "Automotora",
            (e) => handleAutomotoraChange(e),
            "Todas las automotoras",
            automotoras.map((automotora) => (
              <MenuItem key={automotora.id} value={automotora.id}>
                {automotora.nombre}
              </MenuItem>
            ))
          )}

          {Selects(
            "sucursal-label",
            "sucursal",
            idSucursal,
            "Sucursal",
            (e) => handleSucursalChange(e),
            "Todas las sucursales",
            sucursales.map((sucursal) => (
              <MenuItem key={sucursal.id} value={sucursal.id}>
                {sucursal.nombre}
              </MenuItem>
            ))
          )}

          {Selects(
            "vehiculo-label",
            "vehiculo",
            idVehiculo,
            "Vehiculo",
            (e) => handleVehiculoChange(e),
            "Todos los vehiculos",
            vehiculos.map((vehiculo) => (
              <MenuItem key={vehiculo.id} value={vehiculo.id}>
                {vehiculo.marca} {vehiculo.modelo}
              </MenuItem>
            ))
          )}

          {Selects(
            "tipoVehiculo-label",
            "tipoVehiculo",
            tipoVehiculo,
            "Tipo de Vehiculo",
            (e) => handleTipoVehiculoChange(e),
            "Todos los tipos",
            tiposDeVehiculos.map((vehiculo) => (
              <MenuItem key={vehiculo.id} value={vehiculo.id}>
                {vehiculo.tipo}
              </MenuItem>
            ))
          )}
        </Grid>
      </AdminFooter>
    </>
  );
};

export default AdminDashboard;
