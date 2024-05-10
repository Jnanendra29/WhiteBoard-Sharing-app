import React, { useState, useRef, useCallback } from "react";
import "./index.css";
import WhiteBoard from "../../Components/WhiteBoard";
import rough from "roughjs";
import { Socket } from "socket.io-client";

interface RoomPageProps {
  user: any;
  socket: Socket;
  users: any[];
}

//Room Page
const RoomPage: React.FC<RoomPageProps> = ({ user, socket, users }) => {
  const [tool, setTool] = useState<string>("pencil");
  const [color, setColor] = useState<string>("black");
  const [elements, setElements] = useState<Array<any>>([]);
  const [history, setHistory] = useState<Array<any>>([]);
  const [openUserTab, setOpenUserTab] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const roughCanvasRef = useRef<ReturnType<typeof rough.canvas>>(null);

  const onExportClick = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get the current content of the canvas as an image data URL
    const imageData = canvas.toDataURL("image/png");

    // Get the device pixel ratio
    const devicePixelRatio = window.devicePixelRatio || 1;

    // Create a new larger temporary canvas to draw the background and existing content
    const scaleFactor = 2; // Increase the scale factor as needed
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width * scaleFactor * devicePixelRatio;
    tempCanvas.height = canvas.height * scaleFactor * devicePixelRatio;
    tempCanvas.style.width = `${canvas.width * scaleFactor}px`;
    tempCanvas.style.height = `${canvas.height * scaleFactor}px`;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    // Fill the temporary canvas with white background
    tempCtx.fillStyle = "#FFFFFF"; // white color
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Load the existing canvas content as an image onto the temporary canvas
    const image = new Image();
    image.src = imageData;
    image.onload = () => {
      tempCtx.drawImage(image, 0, 0, tempCanvas.width, tempCanvas.height);
      // Convert the temporary canvas to data URL and trigger the download
      const tempImageData = tempCanvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = tempImageData;
      link.download = "whiteboard_with_background.png"; // Set the filename
      link.click();
    };
  }, []);

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setElements([]);
  };

  const undo = () => {
    setHistory((prev) => [...prev, elements[elements.length - 1]]);
    setElements((prev) => prev.slice(0, prev.length - 1));
    if (elements.length === 1) {
      handleClearCanvas();
    }
  };

  const redo = () => {
    setElements((prev) => [...prev, history[history.length - 1]]);
    setHistory((prev) => prev.slice(0, prev.length - 1));
    console.log(history.length);
  };

  return (
    <div className="row">
      <button
        type="button"
        className="btn btn-dark"
        style={{
          display: "block",
          position: "absolute",
          top: "5%",
          left: "5%",
          height: "40px",
          width: "100px",
        }}
        onClick={() => setOpenUserTab(!openUserTab)}
      >
        Users
      </button>
      {openUserTab && (
        <div
          className="position-fixed top-0 h-100 text-white bg-dark"
          style={{ width: "250px", left: "0%" }}
        >
          <button
            type="button"
            onClick={() => setOpenUserTab(!openUserTab)}
            className="btn btn-light btn-block w-100 mt-5"
          >
            Close
          </button>
          <div className="w-100 mt-5 pt-5">
            {users.map((usr, index) => (
              <p key={index} className="my-2 text-center w-100">
                {usr.name} {user && user.userId === usr.userId && "(You)"}
              </p>
            ))}
          </div>
        </div>
      )}
      <h1 className="text-center py-4">
        White Board Sharing App{" "}
        <span className="text-primary">[Users Online: {users.length}]</span>
      </h1>
      {user?.presenter && (
        <div className="col-md-10 mx-auto px-5 mb-3 d-flex align-items-center justify-content-between">
          <div className="d-flex col-md-2 justify-content-between gap-1">
            <div className="d-flex gap-1 align-items-center">
              <input
                type="radio"
                name="tool"
                id="pencil"
                value="pencil"
                checked={tool === "pencil"}
                className="mt-1"
                onChange={(e) => setTool(e.target.value)}
              />
              <label htmlFor="pencil">Pencil</label>
            </div>
            <div className="d-flex gap-1 align-items-center">
              <input
                type="radio"
                name="tool"
                id="line"
                value="line"
                checked={tool === "line"}
                className="mt-1"
                onChange={(e) => setTool(e.target.value)}
              />
              <label htmlFor="line">Line</label>
            </div>
            <div className="d-flex gap-1 align-items-center">
              <input
                type="radio"
                name="tool"
                id="rect"
                value="rect"
                checked={tool === "rect"}
                className="mt-1"
                onChange={(e) => setTool(e.target.value)}
              />
              <label htmlFor="rect">Rect</label>
            </div>
          </div>
          <div className="col-md-3 mx-auto">
            <div className="d-flex align-items-center">
              <label htmlFor="color">Select Color:</label>
              <input
                type="color"
                id="color"
                className="mt-1 ms-3"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3 d-flex gap-2">
            <button
              className="btn btn-primary mt-1"
              disabled={elements.length === 0}
              onClick={() => undo()}
            >
              Undo
            </button>
            <button
              className="btn btn-outline-primary mt-1"
              disabled={history.length < 1}
              onClick={() => redo()}
            >
              Redo
            </button>
          </div>
          <div className="col-md-2">
            <button className="btn btn-danger " onClick={handleClearCanvas}>
              Clear Canvas
            </button>
          </div>
          <div className="col-md-1">
            <button className="btn btn-secondary" onClick={onExportClick}>
              Download
            </button>
          </div>
        </div>
      )}

      <div className="col-md-10 mx-auto mt-4 canvas-box">
        <WhiteBoard
          tool={tool}
          canvasRef={canvasRef}
          roughCanvasRef={roughCanvasRef}
          elements={elements}
          setElements={setElements}
          color={color}
          user={user}
          socket={socket}
        />
      </div>
    </div>
  );
};

export default RoomPage;
