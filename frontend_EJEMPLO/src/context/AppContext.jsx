import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Fill, Icon, Stroke, Style } from "ol/style";
import CircleStyle from "ol/style/Circle";
import { useState, createContext, useRef } from "react";

export const AppContext = createContext();

// eslint-disable-next-line react/prop-types
export const AppProvider = ({ children }) => {
  const [originPoint, setOriginPoint] = useState(null);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [destinationPoint, setDestinationPoint] = useState(null);
  const [automovilPosition, setAutomovilPosition] = useState(null);
  const [activePage, setActivePage] = useState("homePage");
  const [calleOrigen, setCalleOrigen] = useState(null);
  const [calleDestino, setCalleDestino] = useState(null);
  const [numeroOrigen, setNumeroOrigen] = useState(null);
  const [numeroDestino, setNumeroDestino] = useState(null);
  const [callePrimariaOrigen, setCallePrimariaOrigen] = useState("");
  const [calleSecundariaOrigen, setCalleSecundariaOrigen] = useState("");
  const [callePrimariaDestino, setCallePrimariaDestino] = useState("");
  const [calleSecundariaDestino, setCalleSecundariaDestino] = useState("");
  const [recorrido, setRecorrido] = useState("");

  const recorridoUsuarioSource = useRef(new VectorSource());
  const vehiculosVectorSource = useRef(new VectorSource());
  const sucursalesVectorSource = useRef(new VectorSource());
  const areaCoberturaVectorSource = useRef(new VectorSource());
  const recorridoAutomovilSource = useRef(new VectorSource());
  const areaCoberturaVectorLayer = useRef(new VectorLayer());
  const areaCoberturaVehiculoVectorSource = useRef(new VectorSource());
  const areaCoberturaVehiculoVectorLayer = useRef(new VectorLayer());
  const areaCoberturaSucursalVectorSource = useRef(new VectorSource());
  const areaCoberturaSucursalVectorLayer = useRef(new VectorLayer());
  const recorridoAutomovilVectorLayer = useRef(new VectorLayer());
  const sucursalesVectorLayer = useRef(new VectorLayer());
  const automovilesVectorLayer = useRef(new VectorLayer());

  const blueLine = new Style({
    fill: new Fill({ color: "#1565C0", width: 6 }),
    stroke: new Stroke({ color: "#1565C0", width: 6 }),
  });

  const greenLine = new Style({
    fill: new Fill({ color: "green", width: 6 }),
    stroke: new Stroke({ color: "green", width: 6 }),
  });

  const blueCircle = new Style({
    image: new CircleStyle({
      fill: new Fill({ color: "#1565C0" }),
      stroke: new Stroke({ color: "#1565C0", width: 2 }),
      radius: 5,
    }),
    fill: new Fill({ color: "#1565C0" }),
    stroke: new Stroke({ color: "#1565C0", width: 2 }),
    anchor: [0.5, 1],
  });

  const carIcon = new Style({
    image: new Icon({
      src: "https://static.vecteezy.com/system/resources/thumbnails/019/526/917/small_2x/modern-car-isolated-on-transparent-background-3d-rendering-illustration-png.png",
      size: [500, 400],
      scale: 0.08,
    }),
  });

  const coverageStyle = new Style({
    fill: new Fill({
      color: "rgba(119, 163, 69, 0.3)", // Color y transparencia del buffer
    }),
    stroke: new Stroke({
      color: "green", // Color del borde del buffer
      width: 1,
    }),
  });

  const blueCoverageStyle = new Style({
    fill: new Fill({
      color: "rgba(0, 49, 202, 0.5)", // Color y transparencia del buffer
    }),
    stroke: new Stroke({
      color: "rgba(0, 49, 202, 0.8)", // Color del borde del buffer
      width: 1,
    }),
  });

  const unCoverageStyle = new Style({
    fill: new Fill({
      color: "rgba(190, 7, 43, 0.2)", // Color y transparencia del buffer
    }),
    stroke: new Stroke({
      color: "red", // Color del borde del buffer
      width: 1,
    }),
  });

  const sucursalIcon = new Style({
    image: new Icon({
      src: "https://static-00.iconduck.com/assets.00/map-marker-icon-342x512-gd1hf1rz.png",
      size: [342, 512],
      scale: 0.05,
    }),
  });

  const styles = {
    blueLine,
    greenLine,
    blueCircle,
    carIcon,
    sucursalIcon,
    coverageStyle,
    unCoverageStyle,
    blueCoverageStyle,
  };

  return (
    <AppContext.Provider
      value={{
        originPoint,
        setOriginPoint,
        destinationPoint,
        setDestinationPoint,
        automovilPosition,
        setAutomovilPosition,
        activePage,
        setActivePage,
        calleOrigen,
        setCalleOrigen,
        calleDestino,
        setCalleDestino,
        numeroOrigen,
        setNumeroOrigen,
        numeroDestino,
        setNumeroDestino,
        callePrimariaOrigen,
        setCallePrimariaOrigen,
        calleSecundariaOrigen,
        setCalleSecundariaOrigen,
        callePrimariaDestino,
        setCallePrimariaDestino,
        calleSecundariaDestino,
        setCalleSecundariaDestino,
        recorridoUsuarioSource,
        vehiculosVectorSource,
        styles,
        sucursalesVectorSource,
        areaCoberturaVectorSource,
        polygonPoints,
        setPolygonPoints,
        recorrido,
        setRecorrido,
        recorridoAutomovilSource,
        recorridoAutomovilVectorLayer,
        areaCoberturaVectorLayer,
        automovilesVectorLayer,
        areaCoberturaVehiculoVectorSource,
        sucursalesVectorLayer,
        areaCoberturaVehiculoVectorLayer,
        areaCoberturaSucursalVectorSource,
        areaCoberturaSucursalVectorLayer,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
