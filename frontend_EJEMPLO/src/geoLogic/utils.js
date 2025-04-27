import turfDistance from '@turf/distance'
import { fromLonLat, transform } from "ol/proj";
import GeoJSON from "ol/format/GeoJSON";
import { Feature } from "ol";
import { Circle, Polygon, Point, MultiPolygon } from "ol/geom";
import { getFeatureWFS, filterDWithin, filterIsEqualProperty } from "../geoLogic/wsfQueries";
import * as turf from "@turf/turf";

export const sortFeaturesByDistance = (features, referencePoint) => {
  const transformedReference = transform(referencePoint, "EPSG:32721", "EPSG:4326");
  
  features.forEach(feature => {
    const transformedFeature = transform(feature.values_.geometry.flatCoordinates, "EPSG:32721", "EPSG:4326");
    const distance = turfDistance(transformedReference, transformedFeature, { units: "miles" })
    feature.values_['distance'] = distance * 1000
  })

  features.sort((a, b) => a.values_.distance - b.values_.distance);

  return features;
}

export const getNearestFeature = (features, referencePoint) => {
  const sortedFeatures = sortFeaturesByDistance(features, referencePoint)
  // console.log({sortedFeatures})
  return sortedFeatures[0]
}

export const getNearestCar = async (features, referencePoint) => {
  const sucursalesInRange = await getSucursalesInRange(referencePoint);
  // console.log({sucursalesInRange});
  const sortedFeatures = sortFeaturesByDistance(features, referencePoint);
  // console.log({sortedFeatures});
  return sortedFeatures.find(
    feature => feature.values_.distance <= feature.values_.DistanciaCobertura 
    && sucursalesInRange.includes(feature.values_.SucursalId));
}

const getSucursalesInRange = async (point) => {
  const response = await getFeatureWFS({
    workSpace: "RentYou",
    entidad: "Sucursal"
  });

  const features = new GeoJSON().readFeatures(response, {
    featureProjection: "EPSG:32721",
  });

  const sortedSucursales = sortFeaturesByDistance(features,point);
  const sucursalesInRange = sortedSucursales.filter(feature => feature.values_.distance <= feature.values_.DistanciaCobertura);
  return sucursalesInRange.map(suc => suc.values_.Id);
}

export const getNearestDoorNumber = (features, referencePoint) => {
  features.forEach(feature => {
    const distance = turfDistance(referencePoint, feature.geometry.coordinates)
    feature['distance'] = distance
  })
  features.sort((a, b) => a.distance - b.distance);

  return features[0]
}

export const getEntitiesAndBuffers = (jsonPointsResponse) => {
  const features = new GeoJSON().readFeatures(jsonPointsResponse, { featureProjection: "EPSG:32721" });
  
  const entities = []
  const buffers = []
  const geomBuffers = []

  features.forEach((feature) => {
    // console.log({feature})
    const coordinates = feature.getGeometry().getCoordinates()
    const point = turf.point(transform(coordinates, "EPSG:32721", "EPSG:4326"))
    
    // Crea un buffer alrededor del punto
    const buffered = turf.buffer(point, feature.get("DistanciaCobertura"), { units: "meters" })
    const bufferFeature = new Feature({ geometry: new Polygon(buffered.geometry.coordinates).transform( "EPSG:4326", "EPSG:32721") })
    buffers.push(bufferFeature)
    entities.push(feature)
    geomBuffers.push(buffered)

  })

  return {entities, buffers, geomBuffers}
}

export const getMultilinesAndBuffers = (jsonPointsResponse) => {
  const features = new GeoJSON().readFeatures(jsonPointsResponse, { featureProjection: "EPSG:32721" });
  
  const multilines = []
  const buffers = []
  const geomBuffers = []

  features.forEach((feature) => {
    const coordinates = feature.getGeometry().getCoordinates()

    const transformedCoords = coordinates.map(ml => ml.map(l => transform(l, "EPSG:32721", "EPSG:4326")))

    const point = turf.multiLineString(transformedCoords)
    
    // Crea un buffer alrededor de la multilinea
    const buffered = turf.buffer(point, feature.get("DistanciaCobertura"), { units: "meters" })
    const bufferFeature = new Feature({ geometry: new Polygon(buffered.geometry.coordinates).transform( "EPSG:4326", "EPSG:32721") })

    buffers.push(bufferFeature)
    multilines.push(feature)
    geomBuffers.push(buffered)
  })

  return {multilines, buffers, geomBuffers}
}

export  const getZonaSinCobertura = async (jsonPointsResponse) => {

  const {geomBuffers} = getEntitiesAndBuffers(jsonPointsResponse) 

  const filters = filterIsEqualProperty({propertyName:"GID", literal:40 })
  const data = await getFeatureWFS({
    workSpace: "cite",
    entidad: "limite",
    filters
    
  });
  const montevideo =  new GeoJSON().readFeatures(data, { featureProjection: "EPSG:32721" })[0];
  const montevideoCoords = (montevideo.getGeometry().getCoordinates())
  // console.log(montevideo.getGeometry().getCoordinates())
  const transformedCoords = montevideoCoords.map(
    m1 => m1.map(
      m2 => m2.map(
       
          coord => transform(coord, "EPSG:32721", "EPSG:4326"))))


  const mp = turf.multiPolygon(transformedCoords)

//  console.log(transformedCoords)
  //console.log(geomBuffers)

  let buffered =mp
  geomBuffers.forEach( geom =>  buffered = turf.difference(turf.featureCollection([buffered, geom])) )
 
  const bufferFeature = new Feature({ geometry: new MultiPolygon(buffered.geometry.coordinates).transform( "EPSG:4326", "EPSG:32721") })
  return bufferFeature
    
}

export const bufferContainsRecorrido = async ( sucursalId, recorrido ) => {
  // console.log({recorrido});
  const filters = filterIsEqualProperty({propertyName:"Id", literal:sucursalId })
  const data = await getFeatureWFS({
    workSpace: "RentYou",
    entidad: "Sucursal",
    filters  
  });

  const {geomBuffers} = getEntitiesAndBuffers(data); 
  // console.log({geomBuffers});
  const coordinates = recorrido.geometry.coordinates

  //const transformedCoords = coordinates.map(ml => ml.map(l => transform(l, "EPSG:32721", "EPSG:4326")))

  const multiLine = turf.multiLineString(coordinates)

  // Verificar si cada punto de la multilínea está dentro del polígono
  let allPointsContained = true;
  
  multiLine.geometry.coordinates.forEach(point => {
      if (!turf.booleanPointInPolygon(turf.point(point), geomBuffers[0])) {
        allPointsContained = false;
      }
    });

  return allPointsContained;
}