import axios from 'axios'

const backendBaseURL = 'http://127.0.0.1:8080/api/'
// const geoserverBaseURL = 'http://localhost:8080'

const api = axios.create({ baseURL: backendBaseURL })

export default api
