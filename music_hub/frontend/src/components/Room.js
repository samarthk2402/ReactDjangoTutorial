import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useResolvedPath } from "react-router-dom";
import { Typography, Button, Grid } from "@mui/material";
import CreateRoom from "./CreateRoom";

const Room = () => {
  const navigate = useNavigate();
  const { roomCode } = useParams();
  const [votesToSkip, setVotesToSkip] = useState(-1);
  const [guestCanPause, setGuestCanPause] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [needRoomDetails, setNeedRoomDetails] = useState(true);

  const [spotifyAuthenticated, setSpotifyAuthenticated] = useState(false);

  const [loading, setLoading] = useState(true);

  const handleLeaveRoom = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };

    fetch("/api/leave-room", requestOptions).then((_response) => {
      navigate("/");
    });
  };

  const handleSettingsClicked = (value) => {
    setShowSettings(value);
  };

  const handleRoomUpdate = () => {
    setShowSettings(false);
    setNeedRoomDetails(true);
  };

  useEffect(() => {
    if (needRoomDetails) {
      setLoading(true);

      const authenticateSpotify = () => {
        console.log(
          "spotify authentication: " + spotifyAuthenticated.toString()
        );
        fetch("/spotify/is-authenticated")
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
            setSpotifyAuthenticated(data.status);
            if (!data.status) {
              fetch("/spotify/get-auth-url")
                .then((response) => response.json())
                .then((data) => {
                  window.location.replace(data.url);
                });
            }
          });
      };

      const getRoomDetails = () => {
        fetch("/api/get-room?code=" + roomCode)
          .then((response) => {
            if (!response.ok) {
              navigate("/");
            }
            return response.json();
          })
          .then((data) => {
            console.log(data);
            setVotesToSkip(data.votes_to_skip);
            setGuestCanPause(data.guest_can_pause);
            setIsHost(data.is_host);
            setLoading(false);

            if (data.is_host) {
              authenticateSpotify();
            }
          });
      };

      getRoomDetails();
      setNeedRoomDetails(false);
    }
  }, [roomCode, needRoomDetails]);

  return (
    <div>
      {loading ? (
        "Loading..."
      ) : showSettings ? (
        <>
          <CreateRoom
            update={true}
            roomCode={roomCode}
            defaultVotesToSkip={votesToSkip}
            defaultGuestCanPause={guestCanPause}
          />
          <Grid item xs={12} align="center">
            <Button
              color="secondary"
              variant="contained"
              onClick={handleRoomUpdate}
              sx={{ margin: "10px" }}
            >
              Back
            </Button>
          </Grid>
        </>
      ) : (
        <Grid container spacing={1}>
          <Grid item xs={12} align="center">
            <Typography component="h3" variant="h3">
              Code: {roomCode}
            </Typography>
          </Grid>
          <Grid item xs={12} align="center">
            <Typography component="h6" variant="h6">
              Guest Can Pause: {guestCanPause.toString()}
            </Typography>
          </Grid>
          <Grid item xs={12} align="center">
            <Typography component="h6" variant="h6">
              Votes to skip: {votesToSkip}
            </Typography>
          </Grid>
          <Grid item xs={12} align="center">
            <Typography component="h6" variant="h6">
              Host: {isHost.toString()}
            </Typography>
          </Grid>
          {isHost ? (
            <Grid item xs={12} align="center">
              <Button
                color="primary"
                variant="contained"
                onClick={() => handleSettingsClicked(true)}
              >
                Settings
              </Button>
            </Grid>
          ) : null}
          <Grid item xs={12} align="center">
            <Button
              color="secondary"
              variant="contained"
              onClick={handleLeaveRoom}
            >
              Leave Room
            </Button>
          </Grid>
        </Grid>
      )}
    </div>
  );
};

export default Room;
