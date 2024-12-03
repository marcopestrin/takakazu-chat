import React, { useState } from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Divider
} from '@mui/material';

interface RoomSelectorProps {
  handleSetRoom: (room: string) => void;
  rooms: string[];
  defaultValue: string;
}

const RoomSelector: React.FC<RoomSelectorProps> = ({
  handleSetRoom,
  rooms,
  defaultValue
}) => {

  const [ room, setRoom ] = useState<string>(defaultValue);
  const [ openDialog, setOpenDialog ] = useState(false);
  const [ newRoom, setNewRoom ] = useState<string>('');

  // in case you close dialog without add new room
  const [ previousRoom, setPreviousRoom ] = useState<string>('');

  const handleDialogOpen = () => {
    setPreviousRoom(room);
    setOpenDialog(true);
  };
  
  const handleDialogClose = () => {
    setNewRoom('');
    setOpenDialog(false);
    setRoom(previousRoom); // restore previous value
  };

  const handleChange = (value: string) => {
    handleSetRoom(value);
    setRoom(value);
  };

  const handleAddNewRoom = () => {
    if (newRoom) {
      rooms.push(newRoom);
      handleChange(newRoom);
      setNewRoom('');
      setOpenDialog(false);
    }
  };
 
  return (
    <>
      <FormControl fullWidth>
        <InputLabel id="room-select-label">Select Room</InputLabel>
        <Select
          labelId="room-select-label"
          value={room}
          label="Seleziona Stanza"
          onChange={(e) => handleChange(e.target.value)}
        >
          {rooms && rooms.map((roomName, index) => (
            <MenuItem key={index} value={roomName}>
              <Typography>
                {roomName}
              </Typography>
            </MenuItem>
          ))}
          <Divider />
          <MenuItem
            key={'newRoom'}
            onClick={handleDialogOpen}
            value={'newRoom'}
          >
            <Typography fontWeight="bold">
              Add new room...
            </Typography>
          </MenuItem>
        </Select>
      </FormControl>

      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        sx={{
          '& .MuiDialog-paper': {
            width: '600px',
            maxWidth: 'none',
          }
        }}  
      >

        <DialogTitle>Add new room</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="new-room"
            label="Name Room"
            type="text"
            fullWidth
            value={newRoom}
            onChange={(e) => setNewRoom(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">Cancel</Button>
          <Button onClick={handleAddNewRoom} color="primary">Confirm</Button>
        </DialogActions>

      </Dialog>
    </>
  );
};

export default RoomSelector;