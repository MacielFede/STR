import axios from 'axios'
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import { Fill, Stroke, Style } from 'ol/style';

const wfsURL = 'http://localhost:8080/geoserver/wfs';

export const montevideoLayers = async () => {
  const geoJsonEspaciosLibres = await getGeoJsonByWFS({ typeName: 'cite:espacios_libres' });
  const geoJsonManzanas = await getGeoJsonByWFS({ typeName: 'cite:manzanas' });
  const geoJsonVias = await getGeoJsonByWFS({ typeName: 'cite:vias' });
  
  const vectorSourceEspLibres = new VectorSource({
    features: new GeoJSON().readFeatures(geoJsonEspaciosLibres, {
      featureProjection: 'EPSG:32721',
    }),
  });
  const vectorSourceManzanas = new VectorSource({
    features: new GeoJSON().readFeatures(geoJsonManzanas, {
      featureProjection: 'EPSG:32721',
    }),
  });
  const vectorSourceVias = new VectorSource({
    features: new GeoJSON().readFeatures(geoJsonVias, {
      featureProjection: 'EPSG:32721',
    }),
  });

  const vectorLayerEspLibres = new VectorLayer({ 
    source: vectorSourceEspLibres,
    style: new Style({
      fill: new Fill({ color: 'rgba(224, 224, 224, 0.6)' }),
      stroke: new Stroke({ color: '#E0E0E0', width: 1 }),  
    })
  });
  
  const vectorLayerManzanas = new VectorLayer({ 
    source: vectorSourceManzanas,
    style: new Style({
      fill: new Fill({ color: 'rgba(211, 211, 211, 0.6)' }), 
      stroke: new Stroke({ color: '#D3D3D3', width: 1 }), 
    })
  });
  
  const vectorLayerVias = new VectorLayer({ 
    source: vectorSourceVias,
    style: new Style({
      fill: new Fill({ color: 'rgba(51, 51, 51, 0.6)' }),  // Color de fondo #333
      stroke: new Stroke({ color: '#333333', width: 1 }),  // Color de fondo #333
    })
  });

  return { vectorLayerEspLibres, vectorLayerManzanas, vectorLayerVias }
}

export const getGeoJsonByWFS = async ({ typeName }) => {
  const params = {
    service: 'WFS',
    version: '2.0.0',
    request: 'GetFeature',
    typeName: typeName,
    srsname: 'EPSG:32721',
    outputFormat: 'application/json',
  };

  try {
    const response = await axios.get(wfsURL, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching WFS data:', error);
    return null;
  }
};

