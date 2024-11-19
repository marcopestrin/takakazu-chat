import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid2';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import ChatRoom from 'components/ChatRoom';
import Divider from '@mui/material/Divider';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}));

export default function BasicGrid() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid size={2}>
            <Item></Item>
          </Grid>
          <Grid size={10}>
            <Item>
              <Typography variant="h5" gutterBottom>Takakazu Chat</Typography>
              <Divider />
              <ChatRoom />
            </Item>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
