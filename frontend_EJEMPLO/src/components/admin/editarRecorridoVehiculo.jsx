import React, { useState, useEffect, useContext } from 'react';
import { Typography, Paper, TextField, Button, MenuItem, Select, FormControl, InputLabel, Grid, FormGroup } from '@mui/material';
import axios from 'axios';
import proj4 from 'proj4';
import { useNavigate, useParams } from 'react-router-dom';
import RentMap from '../../map/RentMap';
import { AppContext } from '../../context/AppContext';
import Circle from 'ol/geom/Circle';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { MultiLineString } from 'ol/geom';
import { getRecorridoWFS, getId, updateWFS, multiLineGeometry, pointGeometry, wfsPropSet, getFiltroEquealTo } from '../../geoLogic/wsfQueries';
import { Stroke, Style } from 'ol/style';
import { bufferContainsRecorrido } from '../../geoLogic/utils';
import { transform } from 'ol/proj';



const EditarRecorridoAuto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sucursalId, setSucursalId] = useState('');
  const [automotoraId, setAutomotoraId] = useState('');
  const [automovil, setAutomovil] = useState('');
  const [automovilId, setAutomovilId] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [matricula, setMatricula] = useState('');
  const [tipoVehiculo, setTipoVehiculo] = useState('');
  const [distanciaCobertura, setDistanciaCobertura] = useState('');
  const [sucursalNombre, setSucursalNombre] = useState('');
  const [automotoraNombre, setAutomotoraNombre] = useState('');
  const [sucursales, setSucursales] = useState([]);
  const [auxSucursales, setAuxSucursales] = useState([]);
  const [viajeId, setViajeId] = useState('');
  const [viajes, setViajes] = useState('');
  const [viaje, setViaje] = useState('');
  const { setActivePage, originPoint, destinationPoint, setOriginPoint, setDestinationPoint, sucursalesVectorSource, recorridoAutomovilSource, recorrido, styles } = useContext(AppContext);

  const routeStyle = new Style({
    stroke: new Stroke({
      color: '#FF0000',  // Color rojo para que sea más visible
      width: 4,          // Grosor de la línea
    }),
  });

  useEffect(() => {
    setActivePage('editarRecorridoVehiculo');
  }, [setActivePage]);

  useEffect(() => {
     fetchVehiculo();
  }, [id]);

  useEffect(() => {
    if(id){
      fetchSucursal()
    }
  }, [sucursalId]);

  useEffect(() => {
    if(sucursalId){
      fetchAutomotora();
      MostrarSucursales();
      MostrarRecorridos();
    }
  }, [automotoraId]);



  async function MostrarRecorridos() {
  const idVehiculo = parseInt(id);
  const recorridoFilter = getFiltroEquealTo({
      propertyName: "AutomovilId",
      literal: id,
  });

  const response = await getRecorridoWFS({
      workSpace: "RentYou",
      entidad: "Viaje",
      filters: recorridoFilter,
  });

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(response, "text/xml");

  const viajes = xmlDoc.getElementsByTagName("RentYou:Viaje");

  // Limpiar la fuente vectorial de recorridos si es necesario
  recorridoAutomovilSource.current.clear();

  for (let i = 0; i < viajes.length; i++) {
      const viaje = viajes[i];
      
      const automovilId = viaje.getElementsByTagName("RentYou:AutomovilId")[0]?.textContent;

      if (automovilId == idVehiculo) {

          const gmlLineString = viaje.getElementsByTagName("gml:LineString")[0];
          if (!gmlLineString) {
              console.error("No se encontró gml:LineString");
              continue;
          }

          const posList = gmlLineString.getElementsByTagName("gml:posList")[0]?.textContent.trim();
          if (!posList) {
              console.error("No se encontró gml:posList");
              continue;
          }

          const coordinatesArray = posList.split(" ").map(Number);
          const coordinates = [];

          for (let j = 0; j < coordinatesArray.length; j += 2) {
              coordinates.push([coordinatesArray[j], coordinatesArray[j + 1]]);
          }

          const multiLineString = new MultiLineString([coordinates]);

          const feature = new Feature({
              geometry: multiLineString,
          });

          // Aplica el estilo definido para la línea del recorrido
          feature.setStyle(routeStyle);
          recorridoAutomovilSource.current.addFeature(feature);
      }
  }
}

  async function MostrarSucursales() {
    const automotoraFilter = getFiltroEquealTo({
        propertyName: "AutomotoraId",
        literal: automotoraId,
    });

    const response = await getRecorridoWFS({
        workSpace: "RentYou",
        entidad: "Sucursal",
        filters: automotoraFilter,
    });

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response, "text/xml");

    const sucursales = xmlDoc.getElementsByTagName("RentYou:Sucursal");

    sucursalesVectorSource.current.clear();

    for (let i = 0; i < sucursales.length; i++) {
        const sucursal = sucursales[i];
        const nombre = sucursal.getElementsByTagName("RentYou:Nombre")[0].textContent;
        const ubicacion = sucursal.getElementsByTagName("gml:pos")[0].textContent;
        const distanciaCobertura = sucursal.getElementsByTagName("RentYou:DistanciaCobertura")[0].textContent;

        const coordinates = ubicacion.split(" ").map(coord => parseFloat(coord));
        const sucursalCoordinates = [coordinates[0], coordinates[1]];

        const feature = new Feature({
            geometry: new Point(sucursalCoordinates),
            name: nombre
        });

        feature.setStyle(styles.sucursalIcon);
        sucursalesVectorSource.current.addFeature(feature);

        // Crear un círculo con la distancia de cobertura
        const circle = new Circle(sucursalCoordinates, parseFloat(distanciaCobertura));

        // Crear una nueva característica para el círculo
        const circleFeature = new Feature(circle);
        circleFeature.setStyle(styles.coverageStyle);

        // Añadir el círculo a la fuente vectorial
        sucursalesVectorSource.current.addFeature(circleFeature);
    }
  }

  async function fetchVehiculo() {
    const idVehiculo = parseInt(id);
    axios.get(`${process.env.API_URL}/Automovil/${idVehiculo}`)
      .then((res) => {
        const content = res.data;
        if (!content.error) {
          setAutomovil(content.data);
          setAutomovilId(content.data.id);
          setMarca(content.data.marca);
          setModelo(content.data.modelo);
          setMatricula(content.data.matricula);
          setTipoVehiculo(content.data.tipoVehiculo)
          setDistanciaCobertura(content.data.distanciaCobertura);
          setSucursalId(content.data.sucursalId);
        }
      })
      .catch((error) => {
        console.error('Error fetching automovil:', error);
      });
  }//, [id]);

  async function fetchSucursal() {
    if (sucursalId) {
      axios.get(`${process.env.API_URL}/Sucursal/${sucursalId}`)
        .then((res) => {
          const content = res.data;
          if (!content.error) {
            setSucursalNombre(content.data.nombre);
            setAutomotoraId(content.data.automotoraId);
          }
        })
        .catch((error) => {
          console.error('Error fetching sucursal:', error);
        });
    }
  }//, [sucursalId]);

  async function fetchAutomotora() {
    if (automotoraId) {
      axios.get(`${process.env.API_URL}/Automotora/${automotoraId}`)
        .then((res) => {
          const content = res.data;
          if (!content.error) {
            setAutomotoraNombre(content.data.nombre);
            axios.get(`${process.env.API_URL}/Sucursal`)
              .then((res) => {
                const content = res.data;
                if (!content.error) {
                  setAuxSucursales(content.data);
                  // Filtrar las sucursales por automotoraId
                  const sucursalesFiltradas = content.data.filter(sucursal => sucursal.automotoraId === automotoraId);
                  setSucursales(sucursalesFiltradas);
                }
              })
              .catch((error) => {
                console.error('Error fetching sucursales:', error);
              });
          }
        })
        .catch((error) => {
          console.error('Error fetching automotora:', error);
        });
    }
  }//, [automotoraId]);

  const verificarRecorrido = async() =>{
    return await bufferContainsRecorrido(sucursalId, recorrido.routes[0]);
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!sucursalId || !distanciaCobertura || !originPoint || !destinationPoint) {
      console.error('Todos los campos son obligatorios.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found in localStorage');
      }

      const recorridoValue = await verificarRecorrido();
      if(!recorridoValue){
        console.error('Recorrido fuera del alcance de la sucursal.');
        return;
      }

      const updatedVehiculo = {
        marca,
        modelo,
        matricula,
        distanciaCobertura,
        sucursalId,
        tipoVehiculo
      };

      await axios.put(`${process.env.API_URL}/Automovil/${id}`, updatedVehiculo, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Obtener el viajeId usando automovilId
    const responseViaje = await axios.get(`${process.env.API_URL}/Viaje/PorAutomovil/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const viaje = responseViaje.data.data;
    const viajeId = viaje.id;

    if (!viajeId) {
      throw new Error('No se encontró el viaje relacionado con este automóvil.');
    }
      try {
        // Paso 4: Guardar la geometría del recorrido en WFS
        const recorridoAux = recorrido.routes[0].geometry.coordinates.map(point => transform(point, "EPSG:4326", "EPSG:32721"));
      const ubicacionRecorrido = multiLineGeometry(recorridoAux);
      const ubicacionPunto = pointGeometry(originPoint);

      await updateWFS({
        workSpace: 'RentYou',
        entidad: 'Automovil',
        properties: wfsPropSet({ columna: 'Ubicacion', geometry: ubicacionPunto }),
        id: automovilId
      });

      await updateWFS({
        workSpace: 'RentYou',
        entidad: 'Viaje',
        properties: wfsPropSet({ columna: 'Recorrido', geometry: ubicacionRecorrido }),
        id: viajeId
      });

      navigate('/administrador/automoviles', { replace: true });
    } catch (error) {
      console.error('Error al guardar recorrido en WFS:', error);
    }
  } catch (error) {
    console.error('Error al registrar automóvil y recorrido:', error);
  }
};

  useEffect(() => {
    const idVehiculo = parseInt(id);

    // Obtener todos los viajes
    axios.get(`${process.env.API_URL}/Viaje`)
      .then((res) => {
        const content = res.data;
        if (!content.error) {
          const viajeFiltrado = content.data.filter(viaje => viaje.automovilId === idVehiculo);
          setViajes(content.data);
          if (viajeFiltrado.length > 0) {
            setViaje(viajeFiltrado[0]); // Suponiendo que solo haya un viaje por vehículo
          }
        }
      })
      .catch((error) => {
        console.error('Error fetching viajes:', error);
      });

  }, [id]);

  useEffect(() => {
    if (viaje) {
      const viajeId = viaje.id;
      try {
        getRecorridoWFS({
          workSpace: 'RentYou',
          entidad: 'Viaje',
          filter: getId({entidad: 'Viaje', id: viajeId}),
        })
        .then((res) => {
          // Manejar los datos del recorrido aquí
        })
        .catch((error) => {
          console.error('Error al cargar datos del recorrido:', error);
        });

      } catch (error) {
        console.error('Error al cargar datos del recorrido:', error);
      }
    }
  }, [viaje]);

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <FormGroup>
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid item xs={6}>
            <TextField fullWidth variant='outlined' label='Cobertura' value={distanciaCobertura} onChange={(e) => setDistanciaCobertura(e.target.value)} required />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth variant='outlined' value={automotoraNombre} disabled />
          </Grid>
          <Grid item xs={6}>
            <FormControl required fullWidth>
              <InputLabel>Sucursal</InputLabel>
              <Select
                value={sucursalId}
                onChange={(e) => setSucursalId(e.target.value)}
              >
                {sucursales.map((sucursal) => (
                  <MenuItem key={sucursal.id} value={sucursal.id}>{sucursal.nombre}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            {/* Renderiza el componente RentMap y pasa originPoint y destinationPoint */}
            <RentMap
              originPoint={originPoint}
              destinationPoint={destinationPoint}
              setOriginPoint={setOriginPoint}
              setDestinationPoint={setDestinationPoint}
            />
          </Grid>
        </Grid>
        <Button onClick={handleSubmit} variant='contained' color='primary'>Editar</Button>
      </FormGroup>
    </Paper>
  );
};

export default EditarRecorridoAuto;
