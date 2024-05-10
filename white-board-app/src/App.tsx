import Forms from "./Components/Forms";
import { Route, Routes } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import io from "socket.io-client";
import RoomPage from "./Pages/RoomPage";
import { useEffect, useState } from "react";

const server = "http://localhost:8060";
const connectionOptions = {
  "force new connection": true,
  reconnectionAttempts: 1000,
  timeout: 10000,
  transports: ["websocket"],
};

const socket = io(server, connectionOptions);

function App() {
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    socket.on("userIsJoined", (data: any) => {
      if (data.success) {
        console.log("userJoined");
        setUsers(data.users);
      } else {
        console.log("userJoined error");
      }
    });

    socket.on("allUsers", (data) => {
      setUsers(data);
    });

    socket.on("userJoinedMessageBroadcasted", (data) => {
      toast.info(`${data} has joined the room`)
    })

    socket.on("userLeftMessageBroadcasted", (data: any) => {
      toast.info(`${data} has left the room`)
    })
  }, []);

  const uuid = (): string => {
    var S4 = () => {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (
      S4() +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      "-" +
      S4() +
      S4() +
      S4()
    );
  };

  return (
    <>
      <div className="container">
        <ToastContainer />
        <Routes>
          <Route
            path="/"
            element={<Forms uuid={uuid} setUser={setUser} socket={socket} />}
          />
          <Route
            path="/:roomId"
            element={<RoomPage user={user} socket={socket} users={users} />}
          />
        </Routes>
      </div>
    </>
  );
}

export default App;
