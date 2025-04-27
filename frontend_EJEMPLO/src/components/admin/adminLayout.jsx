import React from 'react'
import Navbar from '../common/Navbar'
import Footer from '../common/Footer'
import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'

const AdminLayout = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Outlet />
    </Box>
  )
}

export default AdminLayout
