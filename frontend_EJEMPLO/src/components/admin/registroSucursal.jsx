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

const RegistroSucursal = () => {
  const [nombre, setNombre] = useState("");
  const [cobertura, setCobertura] = useState("");
  const navigate = useNavigate();
  let { idAutomotora } = useParams();

  const { originPoint, setActivePage, styles, sucursalesVectorSource } =
    useContext(AppContext);

  useEffect(() => {
    setActivePage("registroSucursal");
    MostrarSucursales();
  }, []);

  async function MostrarSucursales() {
    const automotoraFilter = filterIsEqualProperty({
      propertyName: "AutomotoraId",
      literal: idAutomotora,
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
    if (!nombre || !cobertura || !originPoint) {
      return console.error("Todos los campos son obligatorios.");
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found in localStorage");
      }
      const body = {
        Nombre: nombre,
        AutomotoraId: idAutomotora,
        DistanciaCobertura: cobertura,
      };

      const responseSucursal = await axios.post(
        `${process.env.API_URL}/Sucursal`,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const sucursalId = responseSucursal.data.data.id;

      if (responseSucursal.data.error)
        throw new Error(responseSucursal.data.Message);

      try {
        // const recorridoMultiLine = multiLineGeometry([originPoint, originPoint])
        // const recorridoWfsPropSet = wfsPropSet({ columna: 'Patrulla', geometry: recorridoMultiLine})
        const ubicacionPoint = pointGeometry(originPoint);

        await updateWFS({
          workSpace: "RentYou",
          entidad: "Sucursal",
          properties: wfsPropSet({
            columna: "Ubicacion",
            geometry: ubicacionPoint,
          }),
          id: sucursalId,
        });

        console.log("Sucursal guardado con exito");
        navigate(`/administrador/editar-automotoras/${idAutomotora}`, {
          replace: true,
        });
      } catch (error) {
        console.log({ error });
        await axios.delete(
          `${process.env.API_URL}/Sucursal/${sucursalId}`,
          body,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }
    } catch (error) {
      console.error(error);
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
            />
          </Grid>

          <Grid item xs={12}>
            <RentMap />
          </Grid>
        </Grid>

        <Button onClick={handleSubmit} variant="contained" color="primary">
          Registrar Sucursal
        </Button>
      </FormGroup>
    </Paper>
  );
};

// const App = () => (
//   <RegistroSucursal />
// )

export default RegistroSucursal;
