import { Margin } from '@mui/icons-material'
import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Typography
} from '@mui/material'

const AdminAside = ({ children }) => {
  return (
    <Box
      id='footerAdmin'
      p={3}
      bgcolor='#D3D3D3'
      borderRadius={2}
      my={2}
      mx={{ xs: 2, sm: 2, md: 20 }}
      style={{ position: 'fixed', top: 120, bottom: 0, left: 0, right: 0, margin: 0, width: '20vw', height: '80vh', zIndex: 100 }}
    >
      {children}
    </Box>
  )
}

export default AdminAside
