import { useState, useEffect, useContext } from "react";
import { Paper, FormGroup, TextField, Button, Grid } from "@mui/material";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import RentMap from "../../map/RentMap";
import { AppContext } from "../../context/AppContext";
import {
  updateWFS,
  pointGeometry,
  wfsPropSet,
  getFeatureWFS,
  filterIsEqualProperty,
} from "../../geoLogic/wsfQueries";
import GeoJSON from "ol/format/GeoJSON";

const EditarSucursal = () => {
  const [nombre, setNombre] = useState("");
  const [cobertura, setCobertura] = useState("");
  const [idAutomotora, SetIdAutomotora] = useState(-1);
  const navigate = useNavigate();
  let { idSucursal } = useParams();

  const { originPoint, setActivePage, styles, sucursalesVectorSource } =
    useContext(AppContext);

  useEffect(() => {
    setActivePage("registroSucursal");
    ObtenerDatosSucursal();
    MostrarSucursales();
  }, []);

  async function ObtenerDatosSucursal() {
    axios.get(`${process.env.API_URL}/sucursal/${idSucursal}`).then((res) => {
      let content = res.data;
      if (!content.error) {
        // console.log(content.data);
        setNombre(content.data.nombre);
        setCobertura(content.data.distanciaCobertura);
        SetIdAutomotora(content.data.automotoraId);
      }
    });
  }

  async function MostrarSucursales() {
    const automotoraFilter = filterIsEqualProperty({
      propertyName: "Id",
      literal: idSucursal,
    });
    const response = await getFeatureWFS({
      workSpace: "RentYou",
      entidad: "Sucursal",
      filters: automotoraFilter,
    });
    const features = new GeoJSON().readFeatures(response, {
      featureProjection: "EPSG:32721",
    });

    sucursalesVectorSource.current.clear();
    features.forEach((feature) => {
      feature.setStyle(styles.sucursalIcon);
      sucursalesVectorSource.current.addFeature(feature);
    });
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!nombre || !cobertura || !originPoint)
      return console.error("Todos los campos son obligatorios.");

    try {
      const ubicacionPoint = pointGeometry(originPoint);

      await updateWFS({
        workSpace: "RentYou",
        entidad: "Sucursal",
        properties: wfsPropSet({
          columna: "Ubicacion",
          geometry: ubicacionPoint,
        }),
        id: idSucursal,
      });

      console.log("Sucursal actualizada con exito");
      navigate(`/administrador/editar-automotoras/${idAutomotora}`, {
        replace: true,
      });
    } catch (error) {
      console.error({ error });
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <FormGroup>
        <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          <Grid item xs={8} sm={7}>
            <TextField
              fullWidth
              variant="outlined"
              label="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              disabled={true}
            />
          </Grid>
          <Grid item xs={4} sm={5}>
            <TextField
              fullWidth
              variant="outlined"
              label="Cobertura"
              value={cobertura}
              onChange={(e) => setCobertura(e.target.value)}
              required
              disabled={true}
            />
          </Grid>

          <Grid item xs={12}>
            <RentMap height='73vh'/>
          </Grid>
        </Grid>

        <Button onClick={handleSubmit} variant="contained" color="primary">
          Editar Sucursal
        </Button>
      </FormGroup>
    </Paper>
  );
};

export default EditarSucursal;
