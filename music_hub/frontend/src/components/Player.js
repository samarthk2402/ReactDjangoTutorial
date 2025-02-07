import React, { useEffect, useState } from "react";
import {
  Grid,
  Typography,
  Card,
  IconButton,
  LinearProgress,
  Collapse,
} from "@mui/material";
import { Alert } from "@mui/lab";
import { PlayArrow, SkipNext, Pause } from "@mui/icons-material";

const Player = ({ song, isHost, guestCanPause, votesToSkip }) => {
  const [premium, setPremium] = useState(false);
  const [skipVotes, setSkipVotes] = useState(0);

  const isPremium = () => {
    const requestOptions = {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    };

    fetch("/spotify/is-premium", requestOptions)
      .then((response) => response.json())
      .then((data) => {
        if (data.product !== "premium") {
          setPremium(false);
        } else {
          setPremium(true);
        }
      });
  };

  const handlePause = () => {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    };

    fetch("/spotify/pause-song", requestOptions)
      .then((response) => response.json())
      .then((data) => console.log(data));
  };

  const handlePlay = () => {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    };

    fetch("/spotify/play-song", requestOptions)
      .then((response) => response.json())
      .then((data) => console.log(data));
  };

  const handleSkip = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };

    fetch("/spotify/skip", requestOptions)
      .then((response) => response.json())
      .then((data) => console.log(data));
  };

  useEffect(() => {
    isPremium();
  }, []);

  return (
    <Card align="center" style={{ maxWidth: "400px", margin: "auto" }}>
      <Grid container alignItems="center">
        <Grid item align="center" xs={4}>
          <img
            src={song.image_url}
            alt="Album Cover"
            height="100%"
            width="100%"
          />
        </Grid>
        <Grid item align="center" xs={8}>
          <Typography component="h5" variant="h5">
            {song.title}
          </Typography>
          <Typography color="textSecondary" variant="subtitle1">
            {song.artist}
          </Typography>
          <div>
            <IconButton disabled={!premium || !guestCanPause}>
              {song.isPlaying ? (
                <Pause onClick={handlePause}></Pause>
              ) : (
                <PlayArrow onClick={handlePlay}></PlayArrow>
              )}
            </IconButton>
            <IconButton disabled={!premium && isHost}>
              <SkipNext onClick={handleSkip}></SkipNext>
            </IconButton>
          </div>
          <Typography color="CaptionText" variant="subtitle1">
            Skip Votes: {song.votes}/{song.votesNeeded}
          </Typography>
        </Grid>
      </Grid>
      <Collapse in={!premium}>
        <Alert severity="warning">
          {isHost
            ? "Modifying playback state requires spotify premium account"
            : "Host does not have a spotify premium account"}
        </Alert>
      </Collapse>
      <LinearProgress
        variant="determinate"
        value={(song.playTime / song.duration) * 100}
      ></LinearProgress>
    </Card>
  );
};

export default Player;
