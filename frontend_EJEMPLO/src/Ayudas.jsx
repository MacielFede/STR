import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider'
import HighlightAltIcon from '@mui/icons-material/HighlightAlt'
export default function Ayudas () {
  <>
    <TextField
      error
      id='filled-error-helper-text'
      label='Error'
      defaultValue='Hello World'
      helperText='Incorrect entry.'
      variant='outlined'
    />
    <Divider orientation='vertical' flexItem />
    <HighlightAltIcon />
  </>
}
