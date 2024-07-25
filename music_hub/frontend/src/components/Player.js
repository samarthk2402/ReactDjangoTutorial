import React from "react";
import {
  Grid,
  Typography,
  Card,
  IconButton,
  LinearProgress,
} from "@mui/material";
import { PlayArrow, SkipNext, Pause } from "@mui/icons-material";

const Player = ({ song }) => {
  const handlePause = () => {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    };

    fetch("/spotify/pause-song", requestOptions)
      .then((response) => response.json())
      .then((data) => console.log(data));
  };

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
            <IconButton>
              {song.isPlaying ? (
                <Pause onClick={handlePause}></Pause>
              ) : (
                <PlayArrow></PlayArrow>
              )}
            </IconButton>
            <IconButton>
              <SkipNext></SkipNext>
            </IconButton>
          </div>
        </Grid>
      </Grid>
      <LinearProgress
        variant="determinate"
        value={(song.playTime / song.duration) * 100}
      ></LinearProgress>
    </Card>
  );
};

export default Player;
