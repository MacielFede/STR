import { Box, Button, Grid } from "@mui/material";
import { AppContext } from "../../context/AppContext";
import RentMap from "../../map/RentMap";
import { useContext, useEffect } from "react";
import { getFeatureWFSSinFiltro } from "../../geoLogic/wsfQueries";
import { getZonaSinCobertura } from "../../geoLogic/utils";

const ZonaSinCoberturaBox = () => {
  const {
    areaCoberturaVectorSource,
    recorridoUsuarioSource,
    vehiculosVectorSource,
    sucursalesVectorSource,
    areaCoberturaVehiculoVectorSource,
    areaCoberturaSucursalVectorSource,
    styles,
    setActivePage,
    recorridoAutomovilSource
  } = useContext(AppContext);

  useEffect(() => {
    setActivePage("zona-sin-cobertura");
    areaCoberturaVectorSource.current.clear();
    recorridoUsuarioSource.current.clear();
    vehiculosVectorSource.current.clear();
    recorridoAutomovilSource.current.clear();
    areaCoberturaVehiculoVectorSource.current.clear();
    areaCoberturaSucursalVectorSource.current.clear();
    sucursalesVectorSource.current.clear();
  }, []);

  const fetchCoverageAreas = async (event) => {
    event.preventDefault();
    try {
      const data = await getFeatureWFSSinFiltro({
        workSpace: "RentYou",
        entidad: "Sucursal",
      });
      console.log({ data });
      const zona = await getZonaSinCobertura(data);
      zona.setStyle(styles.unCoverageStyle);
      areaCoberturaVectorSource.current.clear();
      areaCoberturaVectorSource.current.addFeature(zona);
    } catch (error) {
      console.error("Error No hay vehiculos para marcar cobertura", error);
    }
  };

  return (
    <>
      <Box className="App">
        <RentMap height="100vh" />
      </Box>

      <Box
        id="cobertura"
        p={3}
        bgcolor="#D3D3D3"
        borderRadius={2}
        my={1}
        mx={{ xs: 2, sm: 2, md: 20 }}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1,
        }}
      >
        <Grid container spacing={0} item>
          <Grid item xs={6} sm={12}>
            <Button
              onClick={fetchCoverageAreas}
              fullWidth
              variant="contained"
              color="error"
            >
              Mostrar zonas sin cobertura
            </Button>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default ZonaSinCoberturaBox;
