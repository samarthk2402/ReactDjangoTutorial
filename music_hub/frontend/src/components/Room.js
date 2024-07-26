import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useResolvedPath } from "react-router-dom";
import { Typography, Button, Grid } from "@mui/material";
import CreateRoom from "./CreateRoom";
import Player from "./Player";
const Room = () => {
  const navigate = useNavigate();
  const { roomCode } = useParams();
  const [votesToSkip, setVotesToSkip] = useState(-1);
  const [guestCanPause, setGuestCanPause] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [needRoomDetails, setNeedRoomDetails] = useState(true);

  const [spotifyAuthenticated, setSpotifyAuthenticated] = useState(false);
  const [song, setSong] = useState({});
  const [songPlaying, setSongPlaying] = useState(false);

  const [loading, setLoading] = useState(true);

  const getCurrentSong = () => {
    fetch("/spotify/get-current-song")
      .then((response) => {
        if (!response.ok) {
          return {};
        } else if (response.status === 204) {
          console.log("no song playing");
          setSongPlaying(false);
          return {};
        } else {
          return response.json();
        }
      })
      .then((data) => {
        setSong(data);
        setSongPlaying(true);
        console.log(data);
      });
  };

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
    getCurrentSong();
    let interval = setInterval(getCurrentSong, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (needRoomDetails) {
      setLoading(true);

      const authenticateSpotify = () => {
        fetch("/spotify/is-authenticated")
          .then((response) => response.json())
          .then((data) => {
            console.log("Authenticated: " + data.status.toString());
            setSpotifyAuthenticated(data.status);
            if (!data.status) {
              fetch("/spotify/get-auth-url")
                .then((response) => response.json())
                .then((data) => {
                  window.location.replace(data.url);
                })
                .catch((err) => console.log(err));
            }
          })
          .catch((err) => console.log(err));
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
          })
          .catch((err) => console.log(err));
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
        <Grid container spacing={2}>
          <Grid item xs={12} align="center">
            <Typography component="h4" variant="h4">
              Room Code: {roomCode}
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            container
            alignItems="center"
            justifyContent="center"
          >
            {songPlaying ? (
              <Player song={song} />
            ) : (
              <Typography color="textSecondary" variant="subtitle1">
                No song is playing on your spotify account!
              </Typography>
            )}
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
