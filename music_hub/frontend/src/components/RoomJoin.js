import React, { useState } from "react";
import { TextField, Typography, Button, Grid } from "@material-ui/core";
import { Link, useNavigate } from "react-router-dom";

const RoomJoin = () => {
  const navigate = useNavigate();
  const [enteredCode, setEnteredCode] = useState("");
  const [error, setError] = useState("");

  const handleJoin = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: enteredCode,
      }),
    };

    fetch("/api/join-room", requestOptions)
      .then((response) => {
        if (response.ok) {
          navigate("/room/" + enteredCode);
        } else {
          setError("Invalid Code!");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} align="center">
        <Typography component="h4" variant="h4">
          Join Room
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <TextField
          error={error === "" ? false : true}
          label="Room Code"
          placeholder="XXXXXX"
          helperText={error}
          variant="outlined"
          onChange={(e) => setEnteredCode(e.target.value)}
        />
      </Grid>
      <Grid item xs={12} align="center">
        <Button color="primary" variant="contained" onClick={handleJoin}>
          Join
        </Button>
      </Grid>
      <Grid item xs={12} align="center">
        <Button color="secondary" variant="contained" to="/" component={Link}>
          Back
        </Button>
      </Grid>
    </Grid>
  );
};

export default RoomJoin;
