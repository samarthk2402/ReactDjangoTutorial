import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const Room = () => {
  const { roomCode } = useParams();
  const [votesToSkip, setVotesToSkip] = useState(-1);
  const [guestCanPause, setGuestCanPause] = useState(null);
  const [isHost, setIsHost] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const getRoomDetails = () => {
      fetch("/api/get-room?code=" + roomCode)
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          setVotesToSkip(data.votes_to_skip);
          setGuestCanPause(data.guest_can_pause);
          setIsHost(data.is_host);
          setLoading(false);
        });
    };

    getRoomDetails();
  }, [roomCode]);

  return (
    <div>
      {loading ? (
        "Loading..."
      ) : (
        <>
          <h1>Code: {roomCode}</h1>
          <h2>Guest Can Pause: {guestCanPause.toString()}</h2>
          <h2>Votes to skip: {votesToSkip}</h2>
          <h2>Host: {isHost.toString()}</h2>
        </>
      )}
    </div>
  );
};

export default Room;
