import React, { useState } from "react";
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
  Collapse,
} from "@mui/material";
import { Alert } from "@mui/lab";
import { Link, useNavigate } from "react-router-dom";

const CreateRoom = ({
  update,
  defaultVotesToSkip,
  defaultGuestCanPause,
  roomCode,
}) => {
  const navigate = useNavigate();

  const [guestCanPause, setGuestCanPause] = useState(defaultGuestCanPause);
  const [votesToSkip, setVotesToSkip] = useState(defaultVotesToSkip);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleVotesChange = (event) => {
    setVotesToSkip(Number(event.target.value));
  };

  const handleGuestCanPauseChange = (event) => {
    setGuestCanPause(guestCanPause ? false : true);
  };

  const handleSubmit = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guest_can_pause: guestCanPause,
        votes_to_skip: votesToSkip,
      }),
    };

    fetch("/api/create-room", requestOptions)
      .then((response) => response.json())
      .then((data) => navigate("/room/" + data.code));
  };

  const handleUpdateRoom = () => {
    const requestOptions = {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: roomCode,
        guest_can_pause: guestCanPause,
        votes_to_skip: votesToSkip,
      }),
    };

    console.log(requestOptions);

    fetch("/api/update-room", requestOptions)
      .then((request) => {
        if (request.ok) {
          setSuccessMsg("Room Settings Updated!");
        } else {
          setErrorMsg("Error updating room...");
        }
      })
      .catch((error) => console.log(error));
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} align="center">
        <Collapse in={successMsg != "" || errorMsg != ""} sx={{ width: "30%" }}>
          {successMsg != "" ? (
            <Alert
              severity="success"
              onClose={() => {
                setSuccessMsg("");
              }}
            >
              {successMsg}
            </Alert>
          ) : errorMsg != "" ? (
            <Alert
              severity="error"
              onClose={() => {
                setErrorMsg("");
              }}
            >
              {errorMsg}
            </Alert>
          ) : null}
        </Collapse>
      </Grid>
      <Grid item xs={12} align="center">
        <Typography component="h4" variant="h4">
          {update ? "Settings" : "Create Room"}
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <FormControl component="fieldset">
          <FormHelperText>
            <div align="center">Guest control of playback state</div>
          </FormHelperText>
          <RadioGroup
            row
            defaultValue={defaultGuestCanPause.toString()}
            onChange={handleGuestCanPauseChange}
          >
            <FormControlLabel
              value="true"
              control={<Radio color="primary" />}
              label="Play/Pause"
              labelPlacement="bottom"
            />
            <FormControlLabel
              value="false"
              control={<Radio color="secondary" />}
              label="No control"
              labelPlacement="bottom"
            />
          </RadioGroup>
        </FormControl>
      </Grid>
      <Grid item xs={12} align="center">
        <FormControl>
          <FormHelperText>
            <div align="center">Votes needed to skip song</div>
          </FormHelperText>
          <TextField
            required={true}
            type="number"
            defaultValue={defaultVotesToSkip.toString()}
            inputProps={{ min: 1, style: { textAlign: "center" } }}
            onChange={handleVotesChange}
          />
        </FormControl>
      </Grid>
      <Grid item xs={12} align="center">
        <Button
          color="primary"
          variant="contained"
          onClick={update ? handleUpdateRoom : handleSubmit}
        >
          {update ? "Update" : "Create"}
        </Button>
      </Grid>
      {update ? null : (
        <Grid item xs={12} align="center">
          <Button color="secondary" variant="contained" to="/" component={Link}>
            Back
          </Button>
        </Grid>
      )}
    </Grid>
  );
};

export default CreateRoom;
