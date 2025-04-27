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

const AdminFooter = ({ children }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', position: 'absolute', zIndex: 1, bottom: '10px' }}>
      <Box
        id='footerAdmin'
        p={3}
        bgcolor='#D3D3D3'
        borderRadius={2}
        my={2}
        mx={2}
        width={'full'}
        marginX='auto'
      >
        {children}
      </Box>
    </div>
  )
}

export default AdminFooter
