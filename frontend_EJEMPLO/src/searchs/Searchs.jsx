import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'

// import SearchIcon from '@mui/icons-material/Search'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import GpsFixedIcon from '@mui/icons-material/GpsFixed'
import HighlightAltIcon from '@mui/icons-material/HighlightAlt'
import CarRentalIcon from '@mui/icons-material/CarRental'

export const Searchs = () => {
  // Your code here

  return (
    <div className='grid p-3 bg-gray-50 gap-7'>
      <Tooltip title='Seleccione donde quiere encontrar cobertura'>
        <TextField id='outlined-basic' label='En esta zona' variant='outlined' />
      </Tooltip>
      <ButtonGroup variant='outlined' aria-label='Basic button group'>
        <Button startIcon={<GpsFixedIcon />}>Cercanos</Button>
        <Button startIcon={<HighlightAltIcon />}>Area</Button>
        <Button startIcon={<CarRentalIcon />}>Sucursales</Button>
      </ButtonGroup>

    </div>
  )
}
