import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import CreateRoom from "./CreateRoom";
import RoomJoin from "./RoomJoin";

const Home = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="container">
              <h1>Music Hub</h1>
              <Link to="/createroom">
                <button>Create Room</button>
              </Link>
              <Link to="/joinroom">
                <button>Join Room</button>
              </Link>
            </div>
          }
        />
        <Route path="/createroom" element={<CreateRoom />} />
        <Route path="/joinroom" element={<RoomJoin />} />
      </Routes>
    </Router>
  );
};

export default Home;
