import React, { useState , useEffect} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

const Sucursal = ({coords, isOpen = false, setIsOpen, closeMenu}) => {
  const [open, setOpen] = useState(false);
  const [branchName, setBranchName] = useState();
  const [coverageMts, setCoverageMts] = useState();

  const handleClose = () => {
    setOpen(false);
    setIsOpen(false);
    closeMenu();
  };

  useEffect (()=>{
    setOpen(isOpen);
  },[isOpen])

  const handleSubmit = (event) => {
    event.preventDefault();
    const newBranch = {
      branchName: branchName,
      coverageMts: coverageMts,
      coordinates: [coords[0],coords[1]]
    }

    console.log(newBranch)

    handleClose();
    closeMenu();
  };

  const handleName = (e)=>{
    setBranchName(e.target.value)
  }

  const handelCoverage = (e)=>{
    setCoverageMts(e.target.value);
  }
  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Nueva sucursal</DialogTitle>
        <DialogContent>
          <TextField
            id="name"
            label="Nombre"
            variant="outlined"
            fullWidth
            margin="dense"
            onChange={handleName}
          />
          <TextField
            id="coverage"
            label="Cobertura en mts"
            variant="outlined"
            fullWidth
            margin="dense"

            onChange={handelCoverage}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button type="submit" onClick={handleSubmit}>Enviar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Sucursal;
