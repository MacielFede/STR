import axios from 'axios'

const backendBaseURL = 'http://localhost:8080/api/'
// const geoserverBaseURL = 'http://localhost:8080'

const api = axios.create({ baseURL: backendBaseURL })

export default api
