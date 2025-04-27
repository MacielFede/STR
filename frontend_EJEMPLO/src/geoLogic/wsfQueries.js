import axios from "axios";

const wfsUrl = "http://localhost:8080/geoserver/wfs";

// Points [[x1, y1], [x2, y2]] => 'x1,y1 x2,y2'
const generateCoordinates = (points) => {
  return points.map((point) => `${point[0]},${point[1]}`).join(' ');
};



export const multiLineGeometry = (points) => {
  // Example "-34.24587,-57.12313213,-35.24587,-60.12313213"
  const coordinates = generateCoordinates(points);
  return `<gml:MultiLineString srsName="EPSG:32721">
              <gml:lineStringMember>
                  <gml:LineString>
                    <gml:coordinates>${coordinates}</gml:coordinates>
                  </gml:LineString>
              </gml:lineStringMember>
            </gml:MultiLineString>`;
};

export const pointGeometry = (point) => {
  return `<gml:Point srsName="EPSG:32721">
    <gml:pos>${point[0]} ${point[1]}</gml:pos>
  </gml:Point>`;
};

export const wfsPropSet = ({ columna, geometry }) => {
  return `<wfs:Property>
        <wfs:Name>${columna}</wfs:Name>
        <wfs:Value>
            ${geometry}
        </wfs:Value>
    </wfs:Property>`;
};

export const updateWFS = async ({ workSpace, properties, id, entidad }) => {
  const body = `<wfs:Transaction service="WFS" version="1.1.0"
                    xmlns:topp="http://www.openplans.org/topp"
                    xmlns:ogc="http://www.opengis.net/ogc"
                    xmlns:wfs="http://www.opengis.net/wfs"
                    xmlns:gml="http://www.opengis.net/gml">  
                    <wfs:Update typeName="${workSpace + ":" + entidad}">
                        ${properties}
                        <ogc:Filter>
                            <ogc:FeatureId fid="${entidad}.${id}"/>
                        </ogc:Filter>
                    </wfs:Update>
                    </wfs:Transaction>`;
  console.log(body);
  return axios
    .post(wfsUrl, body, { headers: { "Content-Type": "application/xml" } })
    .then((response) => {
      // console.log(response);
      return response.data;
    }); // Sin catch para catchearlo más arriba
};

export const getFeatureWFS = async ({ workSpace, entidad, filters, limit, sort, print }) => {
  const body = `<wfs:GetFeature service="WFS" version="1.1.0"
    ${limitBy(limit) ?? ""}
    outputFormat="application/json"
    xmlns:topp="http://www.openplans.org/topp"
    xmlns:wfs="http://www.opengis.net/wfs"
    xmlns:ogc="http://www.opengis.net/ogc"
    xmlns:fes="http://www.opengis.net/fes"
    xmlns:gml="http://www.opengis.net/gml"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.opengis.net/wfs
                        http://schemas.opengis.net/wfs/1.1.0/wfs.xsd">
    <wfs:Query typeName="${workSpace + ":" + entidad}">
      <ogc:Filter>
         ${filters}
      </ogc:Filter>
      ${sort ?? ''}
      </wfs:Query>
  </wfs:GetFeature>`;

  if (print) console.log(body)
  return axios
    .post(wfsUrl, body, { headers: { "Content-Type": "application/xml" } })
    .then((response) => {
      return response.data;
    }); // Sin catch para catchearlo más arriba
};

export const filterAnd = ({ properties }) => {
  return `<ogc:And>${properties}</ogc:And>`;
};

export const filterOr = ({ properties }) => {
  return `<ogc:Or>${properties}</ogc:Or>`;
};

export const filterIsEqualProperty = ({ propertyName, literal }) => {
  return genericFilterProperty({
    type: "PropertyIsEqualTo",
    propertyName,
    literal,
  });
};

export const filterIsNotEqualProperty = ({ propertyName, literal }) => {
  return genericFilterProperty({
    type: "PropertyIsNotEqualTo",
    propertyName,
    literal,
  });
};

export const filterIsLessThanProperty = ({ propertyName, literal }) => {
  return genericFilterProperty({
    type: "PropertyIsLessThan",
    propertyName,
    literal,
  });
};

export const filterIsLessThanOrEqualToProperty = ({
  propertyName,
  literal,
}) => {
  return genericFilterProperty({
    type: "PropertyIsLessThanOrEqualTo",
    propertyName,
    literal,
  });
};

export const filterIsGreaterThanProperty = ({ propertyName, literal }) => {
  return genericFilterProperty({
    type: "PropertyIsGreaterThan",
    propertyName,
    literal,
  });
};

export const filterIsGreaterThanOrEqualToProperty = ({
  propertyName,
  literal,
}) => {
  return genericFilterProperty({
    type: "PropertyIsGreaterThanOrEqualTo",
    propertyName,
    literal,
  });
};

const genericFilterProperty = ({ type, propertyName, literal }) => {
  return `<ogc:${type}><ogc:PropertyName>${propertyName}</ogc:PropertyName>
    <ogc:Literal>${literal}</ogc:Literal></ogc:${type}>`;
};

// Point: 231234.131123 213547.124157
export const filterDWithin = ({ srsName, point, valueReference, meters }) => {
  return `<ogc:DWithin>
  <ogc:PropertyName>${valueReference}</ogc:PropertyName>
  <gml:Point srsName="${srsName}">
    <gml:pos>${point}</gml:pos>
  </gml:Point>
  <ogc:Distance uom="meters">${meters ?? "100000"}</ogc:Distance>
</ogc:DWithin>`;
};


export const polygonIntersect = ({ srsName, propertyName, pointsList }) => {
  return `<ogc:Intersects>
        <PropertyName>${propertyName}</PropertyName>
        <gml:Polygon>
          <gml:exterior>
            <gml:LinearRing>
              <gml:posList>
                        ${pointsList}
              </gml:posList>
            </gml:LinearRing>
          </gml:exterior>
        </gml:Polygon>
      </ogc:Intersects>`;
};

export const sortBy = ({ valueReference, sortOrder }) => {
  return `<ogc:SortBy>
    <ogc:SortProperty>
      <ogc:PropertyName>${valueReference}</ogc:PropertyName>
      <ogc:SortOrder>${sortOrder ?? "ASC"}</ogc:SortOrder>
    </ogc:SortProperty>
  </ogc:SortBy>`;
};

export const limitBy = (number) => {
  return number ? `maxFeatures="${number}"` : "";
};

export const getFeatureWFSSinFiltro = async ({ workSpace, entidad }) => {
  const body = `<wfs:GetFeature service="WFS" version="1.1.0"
    outputFormat="application/json"
    xmlns:topp="http://www.openplans.org/topp"
    xmlns:wfs="http://www.opengis.net/wfs"
    xmlns:ogc="http://www.opengis.net/ogc"
    xmlns:fes="http://www.opengis.net/fes"
    xmlns:gml="http://www.opengis.net/gml"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.opengis.net/wfs
                        http://schemas.opengis.net/wfs/1.1.0/wfs.xsd">
    <wfs:Query typeName="${workSpace + ":" + entidad}">
      </wfs:Query>
  </wfs:GetFeature>`;

  return axios
    .post(wfsUrl, body, { headers: { "Content-Type": "application/xml" } })
    .then((response) => {
      return response.data;
    }); 
};

export const getId = ({entidad, id}) => {
  return `<ogc:FeatureId fid="${entidad}.${id}"/>`
}
export const getRecorridoWFS = ({workSpace, entidad, filter}) => {
  const body = `<wfs:GetFeature service="WFS" version="1.1.0"
xmlns:topp="http://www.openplans.org/topp"
xmlns:wfs="http://www.opengis.net/wfs"
xmlns:ogc="http://www.opengis.net/ogc"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xmlns:gml="http://www.opengis.net/gml"
xsi:schemaLocation="http://www.opengis.net/wfs
                    http://schemas.opengis.net/wfs/1.1.0/wfs.xsd">
<wfs:Query typeName="${workSpace}:${entidad}">
  <ogc:Filter>
     ${filter}
  </ogc:Filter>
  </wfs:Query>
</wfs:GetFeature>`;

console.log(body);
return axios.post(wfsUrl, body, { headers: { 'Content-Type': 'application/xml' } })
  .then(response => response.data); // Sin catch para catchearlo más arriba
}

export const getFiltroEquealTo = ({ propertyName, literal}) => {
  const body = `<ogc:PropertyIsEqualTo>
                  <ogc:PropertyName>${propertyName}</ogc:PropertyName>
                  <ogc:Literal>${literal}</ogc:Literal>
                </ogc:PropertyIsEqualTo>`
console.log(body);
return axios.post(wfsUrl, body, { headers: { 'Content-Type': 'application/xml' } })
  .then(response => response.data); // Sin catch para catchearlo más arriba
}
