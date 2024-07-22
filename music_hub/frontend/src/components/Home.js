import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import CreateRoom from "./CreateRoom";
import RoomJoin from "./RoomJoin";
import Room from "./Room";
import {
  TextField,
  Typography,
  Button,
  Grid,
  FormHelperText,
  FormControl,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@material-ui/core";

const HomeContent = () => (
  <Grid container spacing={2}>
    <Grid item xs={12} align="center">
      <Typography component={"h2"} variant={"h2"}>
        Music Hub
      </Typography>
    </Grid>
    <Grid item xs={12} align="center">
      <Button
        color="secondary"
        variant="contained"
        to="/createroom"
        component={Link}
      >
        Create a room
      </Button>
    </Grid>
    <Grid item xs={12} align="center">
      <Button
        color="primary"
        variant="contained"
        to="/joinroom"
        component={Link}
      >
        Join a room
      </Button>
    </Grid>
  </Grid>
);

const Home = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeContent />} />
        <Route path="/createroom" element={<CreateRoom />} />
        <Route path="/joinroom" element={<RoomJoin />} />
        <Route path="/room/:roomCode" element={<Room />} />
      </Routes>
    </Router>
  );
};

export default Home;
