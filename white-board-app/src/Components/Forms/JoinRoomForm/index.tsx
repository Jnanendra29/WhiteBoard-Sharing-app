import React, { useState } from "react";
import { Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";

interface JoinRoomProps {
  uuid: () => string;
  socket: Socket;
  setUser: React.Dispatch<React.SetStateAction<any>>;
}

//Join room Form
const JoinRoomForm: React.FC<JoinRoomProps> = ({ socket, setUser, uuid }) => {
  const [roomId, setRoomId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const navigate = useNavigate();

  const handleJoinRoom = (e: any) => {
    e.preventDefault();

    const roomData = {
      name,
      roomId,
      userId: uuid(),
      host: false,
      presenter: false,
    };
    setUser(roomData);
    navigate(`${roomId}`);
    socket.emit("userJoined", roomData);
    console.log(roomData)
  };

  return (
    <form className="form col-md-12 mt-5">
      <div className="form-group">
        <input
          type="text"
          className="form-control my-2"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="form-group ">
        <input
          type="text"
          className="form-control my-2"
          placeholder="Enter room code"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="mt-4 btn btn-primary btn-block form-control"
        onClick={handleJoinRoom}
      >
        Join Room
      </button>
    </form>
  );
};

export default JoinRoomForm;
