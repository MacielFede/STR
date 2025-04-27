import React, { useContext, useEffect, useRef, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { fromLonLat, transform } from "ol/proj";
import proj4 from "proj4";
import { register } from "ol/proj/proj4";
import { Fill, Stroke, Style, Circle as CircleStyle } from "ol/style";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import GeoJSON from "ol/format/GeoJSON";
import axios from "axios";
import {
  Checkbox,
  FormControlLabel,
  FormGroup,
  Menu,
  MenuItem,
  Paper,
} from "@mui/material";
import Sucursal from "../components/Sucursal/Sucursal"; // Asegúrate de tener este componente o adaptarlo según tu implementación
import { montevideoLayers } from "../geoLogic/montevideoLayer"; // Importa tu función para obtener datos WFS
import { AppContext } from "../context/AppContext";

import {
  filterAnd,
  filterDWithin,
  filterIsEqualProperty,
  getFeatureWFS,
  polygonIntersect,
} from "../geoLogic/wsfQueries";
import { getNearestDoorNumber } from "../geoLogic/utils";
import * as turf from "@turf/turf";
import { LineString, MultiLineString, Polygon } from "ol/geom";
import { Overlay } from "ol";
import "./RentMap.css";

// Define y registra la proyección EPSG:32721
proj4.defs(
  "EPSG:32721",
  "+proj=utm +zone=21 +south +datum=WGS84 +units=m +no_defs"
);
register(proj4);

const RentMap = ({ height }) => {
  // Referencia para el mapa y capas vectoriales
  const mapRef = useRef(null);
  const vectorSourceRef = useRef(new VectorSource());
  const vectorLayerRef = useRef(
    new VectorLayer({ source: vectorSourceRef.current })
  );

  // Inicializar recorridoAutomovilSource como una referencia de VectorSource
  const recorridoAutomovilSourceRef = useRef(new VectorSource());

  // Estado para manejar varias variables
  const [menuPosition, setMenuPosition] = useState(null);
  const [clickCoords, setClickCoords] = useState(null);
  const {
    setRecorrido,
    activePage,
    originPoint,
    setOriginPoint,
    polygonPoints,
    setPolygonPoints,
    destinationPoint,
    setDestinationPoint,
    setCalleOrigen,
    setNumeroOrigen,
    recorridoUsuarioSource,
    vehiculosVectorSource,
    styles,
    sucursalesVectorSource,
    areaCoberturaVectorSource,
    recorridoAutomovilSource, // Asegúrate de usar recorridoAutomovilSource de AppContext
    recorridoAutomovilVectorLayer,
    areaCoberturaVectorLayer,
    automovilesVectorLayer,
    sucursalesVectorLayer,
    areaCoberturaVehiculoVectorSource,
    areaCoberturaVehiculoVectorLayer,
    areaCoberturaSucursalVectorSource,
    areaCoberturaSucursalVectorLayer,
  } = useContext(AppContext);

  const [open, setIsOpen] = useState(false);
  const [userCoords, setUserCoords] = useState(null);

  // Obtiene la ubicación del usuario y la transforma a EPSG:32721
  useEffect(() => {
    if (recorridoUsuarioSource) recorridoUsuarioSource.current.clear();
    if (vehiculosVectorSource) vehiculosVectorSource.current.clear();
    if (recorridoAutomovilSource) recorridoAutomovilSource.current.clear();

    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = [pos.coords.longitude, pos.coords.latitude];
      setUserCoords(coords);
      const feature = new Feature(
        new Point(transform(coords, "EPSG:4326", "EPSG:32721"))
      );

      const redCircleStyle = new Style({
        image: new CircleStyle({
          fill: new Fill({ color: "#FF0000" }),
          stroke: new Stroke({ color: "#000000", width: 2 }),
          radius: 7,
        }),
        fill: new Fill({ color: "#FF0000" }),
        stroke: new Stroke({ color: "#000000", width: 2 }),
        anchor: [0.5, 1],
      });
      feature.setStyle(redCircleStyle);
      vectorSourceRef.current.addFeature(feature);

      if (activePage === "homePage") {
        const plainCoords = transform(coords, "EPSG:4326", "EPSG:32721");
        const filters = filterDWithin({
          srsName: "EPSG:32721",
          point: `${plainCoords[0]} ${plainCoords[1]}`,
          valueReference: "the_geom",
          meters: 300,
        });

        const getUbication = async () => {
          const response = await getFeatureWFS({
            workSpace: "cite",
            entidad: "numeros_puerta",
            filters,
          });
          const nearestFeature = getNearestDoorNumber(
            response.features,
            plainCoords
          );

          setCalleOrigen(nearestFeature?.properties.NOM_CALLE);
          setNumeroOrigen(nearestFeature?.properties.NUM_PUERTA);
        };

        getUbication();
      }
    });
  }, []);

  // Obtiene la ruta utilizando OSRM
  const getRoute = async (start, end) => {
    const url = `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`;

    try {
      const response = await axios.get(url);
      setRecorrido(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching route:", error);
      return null;
    }
  };

  // Carga las capas vectoriales y crea el mapa una vez obtenidas las coordenadas del usuario
  useEffect(() => {
    if (userCoords) {
      // Popup variables
      const popupContainer = document.getElementById("popup");
      const popupContent = document.getElementById("popup-content");
      const popupCloser = document.getElementById("popup-closer");
      const overlay = new Overlay({
        element: popupContainer,
      });

      const fetchData = async () => {
        const { vectorLayerEspLibres, vectorLayerManzanas, vectorLayerVias } =
          await montevideoLayers();
        // Crea el mapa con las capas y la vista centrada en las coordenadas del usuario transformadas
        sucursalesVectorLayer.current = new VectorLayer({
          source: sucursalesVectorSource?.current,
        });
        automovilesVectorLayer.current = new VectorLayer({
          source: vehiculosVectorSource?.current,
        });
        areaCoberturaVehiculoVectorLayer.current = new VectorLayer({
          source: areaCoberturaVehiculoVectorSource?.current,
        });
        areaCoberturaSucursalVectorLayer.current = new VectorLayer({
          source: areaCoberturaSucursalVectorSource?.current,
        });
        areaCoberturaVectorLayer.current = new VectorLayer({
          source: areaCoberturaVectorSource.current,
        });
        recorridoAutomovilVectorLayer.current = new VectorLayer({
          source: recorridoAutomovilSource.current,
        });
        const recorridoUsuario = new VectorLayer({
          source: recorridoUsuarioSource.current,
        });
        const mapInstance = new Map({
          target: mapRef.current,
          layers: [
            vectorLayerEspLibres,
            vectorLayerManzanas,
            vectorLayerVias,
            vectorLayerRef.current,
            recorridoAutomovilVectorLayer.current,
            areaCoberturaVectorLayer.current,
            areaCoberturaVehiculoVectorLayer.current,
            areaCoberturaSucursalVectorLayer.current,
            recorridoUsuario,
            automovilesVectorLayer.current,
            sucursalesVectorLayer.current,
          ],
          view: new View({
            center: transform(userCoords, "EPSG:4326", "EPSG:32721"),
            projection: "EPSG:32721",
            zoom: 15,
          }),
          overlays: [overlay],
        });
        createSucursalEvent(
          mapInstance,
          overlay,
          sucursalesVectorLayer.current,
          popupContent
        );
        createVehiculoEvent(
          mapInstance,
          overlay,
          automovilesVectorLayer.current,
          popupContent
        );
        popupCloser.onclick = () => {
          overlay.setPosition(undefined);
        };
        mapRef.current = mapInstance;
      };
      fetchData();
      if (activePage == "homePage") {
        MostrarAutomoviles();
        MostrarSucursales();
      }
      return () => {
        if (mapRef.current) {
          mapRef.current.setTarget(null);
        }
      };
    }
  }, [
    userCoords,
    recorridoUsuarioSource,
    vehiculosVectorSource,
    sucursalesVectorSource,
    areaCoberturaVectorSource,
    recorridoAutomovilSource,
  ]);

  function createSucursalEvent(
    mapInstance,
    overlay,
    sucursalesVectorLayer,
    popupContent
  ) {
    mapInstance.on("click", async function (evt) {
      var feature = mapInstance.forEachFeatureAtPixel(
        evt.pixel,
        function (feature, layer) {
          if (layer == sucursalesVectorLayer) return feature;
        }
      );
      if (feature) {
        const featureData = feature.values_;
        const automoviles = await getAutomovilesBySucursal(featureData.Id);
        let automovilesPorTipo = {
          0: 0,
          1: 0,
          2: 0,
          3: 0,
        };
        automoviles.forEach(
          (a) =>
            (automovilesPorTipo[a.tipoVehiculo] =
              automovilesPorTipo[a.tipoVehiculo] + 1)
        );
        console.log({ featureData });
        console.log({ automoviles });
        var content = `
        <h2>Id: ${featureData.Id}</h2>
        <h3>Nombre: ${featureData.Nombre}</h3>
        <p>Distancia de cobertura: ${featureData.DistanciaCobertura}</p>
        <p>Total de autos: ${automoviles.length}</p>
      `;
        if (automoviles.length > 0) {
          content += `
        <br/>
        <p><b>Tipos de autos:</b></p>
        <p>Desconocidos: ${automovilesPorTipo[0]}</p>        
        <p>Electrico: ${automovilesPorTipo[1]}</p>        
        <p>Combustión: ${automovilesPorTipo[2]}</p>        
        <p>Híbrido: ${automovilesPorTipo[3]}</p>        
        `;
        }
        popupContent.innerHTML = content;
        const coordinate = evt.coordinate;
        overlay.setPosition(coordinate);
      }
    });
  }

  function createVehiculoEvent(
    mapInstance,
    overlay,
    vehiculosVectorLayer,
    popupContent
  ) {
    mapInstance.on("click", async function (evt) {
      var feature = mapInstance.forEachFeatureAtPixel(
        evt.pixel,
        function (feature, layer) {
          if (layer == vehiculosVectorLayer) return feature;
        }
      );
      if (feature) {
        const featureData = feature.values_;
        // console.log({testFeature:featureData})
        const enumTipoVehiculo = {
          0: "Desconocido",
          1: "Eléctrico",
          2: "Combustión",
          3: "Híbrido",
        };
        var content = `
        <h2>Id: ${featureData.Id}</h2>
        <h3>Matricula: ${featureData.Matricula}</h3>
        <h3>Marca: ${featureData.Marca}</h3>
        <h3>Modelo: ${featureData.Modelo}</h3>
        <h3>Tipo: ${enumTipoVehiculo[featureData.TipoVehiculo]}</h3>
        <p>Distancia de cobertura: ${featureData.DistanciaCobertura}</p>
      `;
        popupContent.innerHTML = content;
        const coordinate = evt.coordinate;
        overlay.setPosition(coordinate);
      }
    });
  }

  async function getAutomovilesBySucursal(sucursalId) {
    return axios
      .get(`${process.env.API_URL}/automovil?sucursalId=${sucursalId}`)
      .then((res) => {
        if (res.data.error) null;
        console.log({ res: res.data.data });
        return res.data.data;
      });
  }

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

    if (!response.features) return;

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

    if (!response.features) return;

    const features = new GeoJSON().readFeatures(response, {
      featureProjection: "EPSG:32721",
    });

    vehiculosVectorSource.current.clear();
    features.forEach((feature) => {
      feature.setStyle(styles.carIcon);
      vehiculosVectorSource.current.addFeature(feature);
    });
  }

  // Maneja el menú contextual al hacer clic derecho en el mapa
  const handleContextMenu = (event) => {
    event.preventDefault();
    setMenuPosition({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });

    const map = mapRef.current;
    const pixel = map.getEventPixel(event);
    const coords = map.getCoordinateFromPixel(pixel);
    setClickCoords(coords);
  };

  const handleMenuClose = () => {
    setMenuPosition(null);
  };

  // Agrega un punto de origen en las coordenadas del clic
  const handleAddOrigin = () => {
    setOriginPoint(clickCoords);
    handleMenuClose();
  };

  const handleAddPolygonPoint = async () => {
    handleMenuClose();
    try {
      var newPolygonPoints = polygonPoints.concat([clickCoords]);
      setPolygonPoints(newPolygonPoints);
      var polygon = null;
      // console.log({ newPolygonPoints });

      if (newPolygonPoints.length >= 3) {
        const fullPolygonPoints = newPolygonPoints.concat([
          newPolygonPoints[0],
        ]);
        const turfCollection = turf.featureCollection([]);
        fullPolygonPoints.forEach((p) => {
          turfCollection.features.push(
            turf.point(transform(p, "EPSG:32721", "EPSG:4326"))
          );
        });
        polygon = turf.convex(turfCollection);

        // console.log({ polygon });
      }

      if (!polygon) return;
      const transformedPolygon = new Polygon(
        polygon.geometry.coordinates
      ).transform("EPSG:4326", "EPSG:32721");
      // console.log({ transformedPolygon });
      const coverageFeature = new Feature({
        geometry: transformedPolygon,
      });
      areaCoberturaVectorSource.current.clear();
      coverageFeature.setStyle(styles.coverageStyle);
      areaCoberturaVectorSource.current.addFeature(coverageFeature);

      let polygonCoordinates = "";
      transformedPolygon.flatCoordinates.forEach(
        (x) => (polygonCoordinates += `${x} `)
      );
      // console.log({ polygonCoordinates });

      const filters = filterIsEqualProperty({
        propertyName: "Estado",
        literal: -1,
      });
      const response = await getFeatureWFS({
        workSpace: "RentYou",
        entidad: "Viaje",
        filters,
      });
      // console.log({ response });
      if (!response.features) return;

      const features = response.features;

      const containedFeatures = [];
      features.forEach((f) => {
        const transformedCoords = f.geometry.coordinates.map((ml) =>
          ml.map((l) => transform(l, "EPSG:32721", "EPSG:4326"))
        );
        const multiLine = turf.multiLineString(transformedCoords);
        if (turf.booleanIntersects(multiLine, polygon)) {
          containedFeatures.push(f);
        }
      });
      // console.log({ containedFeatures });
      recorridoAutomovilSource.current.clear();
      vehiculosVectorSource.current.clear();
      containedFeatures.forEach((feature) => {
        const parsedFeature = new Feature(
          new MultiLineString(feature.geometry.coordinates)
        );
        parsedFeature.setStyle(styles.blueLine);
        recorridoAutomovilSource.current.addFeature(parsedFeature);

        // console.log({coordinates:feature.geometry})
        const carPoint = new Feature(
          new Point(feature.geometry.coordinates[0][0])
        );
        // console.log({carPoint})
        carPoint.setStyle(styles.carIcon);
        vehiculosVectorSource.current.addFeature(carPoint);
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeletePoints = () => {
    setPolygonPoints([]);
    areaCoberturaVectorSource.current.clear();
    vehiculosVectorSource.current.clear();
    recorridoAutomovilSource.current.clear();
    handleMenuClose();
  };

  // Agrega un punto de destino en las coordenadas del clic
  const handleAddDestination = async () => {
    setDestinationPoint(clickCoords);
    if (originPoint && clickCoords) {
      const start = transform(originPoint, "EPSG:32721", "EPSG:4326");
      const end = transform(clickCoords, "EPSG:32721", "EPSG:4326");
      const route = await getRoute(start, end);
      if (route) {
        const routeCoords = route.routes[0].geometry.coordinates.map((coord) =>
          transform(coord, "EPSG:4326", "EPSG:32721")
        );
        const routeFeature = new Feature(new LineString(routeCoords));
        routeFeature.setStyle(styles.blueLine);
        recorridoUsuarioSource.current.clear();
        recorridoUsuarioSource.current.addFeature(routeFeature);
      }
    }
    handleMenuClose();
  };

  const getMapHeight = () => {
    if (height) return height;
    return activePage === "homePage" ? "100vh" : "50vh";
  };

  const handleSucursales = (event) => {
    sucursalesVectorLayer.current.setVisible(event.target.checked);
    areaCoberturaSucursalVectorLayer.current.setVisible(event.target.checked);
  };

  const handleAutomoviles = (event) => {
    automovilesVectorLayer.current.setVisible(event.target.checked);
    areaCoberturaVehiculoVectorLayer.current.setVisible(event.target.checked);
    recorridoAutomovilVectorLayer.current.setVisible(event.target.checked);
  };

  return (
    <>
      {activePage === "Dashboard" && (
        <Paper
          sx={{
            zIndex: 100,
            width: "20%",
            position: "fixed",
            top: "100px",
            right: "20px",
            padding: "17px",
            bgcolor: "RGBA(224, 224, 224, 0.9)",
          }}
          elevation={3}
        >
          <FormGroup>
            <FormControlLabel
              id="sucursalesCheckbox"
              control={<Checkbox defaultChecked />}
              label="Sucursales"
              onChange={handleSucursales}
            />
            <FormControlLabel
              id="automovilesCheckbox"
              control={<Checkbox defaultChecked />}
              label="Automóviles"
              onChange={handleAutomoviles}
            />
          </FormGroup>
        </Paper>
      )}

      <div
        id="map"
        ref={mapRef}
        className="map-container"
        onContextMenu={handleContextMenu}
        style={{
          backgroundColor: "#333333",
          width: "100%",
          height: getMapHeight(),
          position: activePage === "homePage" ? "absolute" : "static",
          zIndex: activePage === "homePage" ? 1 : "auto",
        }}
      >
        <Sucursal />
        {activePage === "registroVehiculo" && (
          <Menu
            open={menuPosition !== null}
            onClose={handleMenuClose}
            anchorReference="anchorPosition"
            anchorPosition={
              menuPosition !== null
                ? { top: menuPosition.mouseY, left: menuPosition.mouseX }
                : undefined
            }
          >
            <MenuItem onClick={handleAddOrigin}>Origen</MenuItem>
            <MenuItem onClick={handleAddDestination}>Destino</MenuItem>
          </Menu>
        )}
        {activePage === "editarRecorridoVehiculo" && (
          <Menu
            open={menuPosition !== null}
            onClose={handleMenuClose}
            anchorReference="anchorPosition"
            anchorPosition={
              menuPosition !== null
                ? { top: menuPosition.mouseY, left: menuPosition.mouseX }
                : undefined
            }
          >
            <MenuItem onClick={handleAddOrigin}>Origen</MenuItem>
            <MenuItem onClick={handleAddDestination}>Destino</MenuItem>
          </Menu>
        )}
        {activePage === "registroSucursal" && (
          <Menu
            open={menuPosition !== null}
            onClose={handleMenuClose}
            anchorReference="anchorPosition"
            anchorPosition={
              menuPosition !== null
                ? { top: menuPosition.mouseY, left: menuPosition.mouseX }
                : undefined
            }
          >
            <MenuItem onClick={handleAddOrigin}>Ubicación</MenuItem>
          </Menu>
        )}
        {activePage === "homePage" && (
          <Menu
            open={menuPosition !== null}
            onClose={handleMenuClose}
            anchorReference="anchorPosition"
            anchorPosition={
              menuPosition !== null
                ? { top: menuPosition.mouseY, left: menuPosition.mouseX }
                : undefined
            }
          >
            <MenuItem onClick={handleAddPolygonPoint}>Agregar Punto</MenuItem>
            <MenuItem onClick={handleDeletePoints}>Eliminar poligono</MenuItem>
          </Menu>
        )}

        {open && (
          <Sucursal
            coords={clickCoords}
            isOpen={open}
            setIsOpen={setIsOpen}
            closeMenu={handleMenuClose}
          />
        )}
      </div>

      <div id="popup" className="ol-popup">
        <a href="#" id="popup-closer" className="ol-popup-closer"></a>
        <div id="popup-content"></div>
      </div>
    </>
  );
};

export default RentMap;
