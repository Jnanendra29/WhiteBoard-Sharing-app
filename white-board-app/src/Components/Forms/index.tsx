import React from "react";
import { Socket } from "socket.io-client";
import "./index.css";
import JoinRoomForm from "./JoinRoomForm";
import CreateRoomForm from "./CreateRoomForm";

interface FormsProps {
  uuid: () => string;
  socket: Socket;
  setUser: React.Dispatch<React.SetStateAction<any>>;
}

// Forms Component parent for CreateRoom and JoinRoom Form
const Forms: React.FC<FormsProps> = ({ uuid, socket, setUser }) => {
  return (
    <div className="row h-100 pt-5">
      <div className="col-md-4 border border-black form-box rounded-2 mx-auto d-flex flex-column align-items-center p-5">
        <h2 className="text-primary fw-bold">Create Room</h2>
        <CreateRoomForm uuid={uuid} socket={socket} setUser={setUser} />
      </div>
      <div className="col-md-4 border border-black form-box rounded-2 mx-auto d-flex flex-column align-items-center p-5">
        <h2 className="text-primary fw-bold">Join Room</h2>
        <JoinRoomForm uuid={uuid} socket={socket} setUser={setUser}/>
      </div>
    </div>
  );
};

export default Forms;
