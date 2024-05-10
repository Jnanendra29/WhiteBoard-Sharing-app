import React, { useEffect, useState, useLayoutEffect } from "react";
import rough from "roughjs";
import { Socket } from "socket.io-client";

const roughGenerator = rough.generator();

interface WhiteboardProps {
  tool: string;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  roughCanvasRef: React.MutableRefObject<ReturnType<
    typeof rough.canvas
  > | null>;
  elements: Array<any>;
  setElements: React.Dispatch<React.SetStateAction<Array<any>>>;
  color: string;
  user: any;
  socket: Socket;
}

const WhiteBoard: React.FC<WhiteboardProps> = ({
  tool,
  canvasRef,
  roughCanvasRef,
  elements,
  setElements,
  color,
  user,
  socket,
}) => {
  const [img, setImg] = useState<any>(null);

  useEffect(() => {
    socket.on("whiteBoardDataResponse", (data) => {
      setImg(data.imgURL);
    });
  }, []);

  if (!user?.presenter) {
    return (
      <div className="border border-dark border-3 h-100 w-100 overflow-hidden">
        <img
          src={img}
          alt="Real time white board image shared by presentor"
          // className="w-100 h-100"
          style={{
            height: window.innerHeight * 2,
            width: "300%"
          }}
        />
      </div>
    );
  }

  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.height = window.innerHeight * 2;
    canvas.width = window.innerWidth * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    const roughCanvas = rough.canvas(canvas);
    roughCanvasRef.current = roughCanvas;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = color;
  }, [color]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;
    const roughCanvas = rough.canvas(canvasRef.current);

    if (elements.length > 0) {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    elements.forEach((element) => {
      if (element.type === "pencil") {
        roughCanvas.linearPath(element.path, {
          stroke: element.stroke,
          strokeWidth: 5,
          roughness: 0,
        });
      } else if (element.type === "line") {
        roughCanvas.draw(
          roughGenerator.line(
            element.offsetX,
            element.offsetY,
            element.width,
            element.height,
            {
              stroke: element.stroke,
              strokeWidth: 5,
              roughness: 0,
            }
          )
        );
      } else if (element.type === "rect") {
        roughCanvas.draw(
          roughGenerator.rectangle(
            element.offsetX,
            element.offsetY,
            element.width,
            element.height,
            {
              stroke: element.stroke,
              strokeWidth: 5,
              roughness: 0,
            }
          )
        );
      }
    });

    const canvasImage = canvasRef.current.toDataURL();
    socket.emit("whiteboardData", canvasImage);
  }, [elements]);

  const handleMouseDown = (e: any) => {
    // console.log("mouse down", e.nativeEvent);
    const { offsetX, offsetY } = e.nativeEvent;
    setIsDrawing(true);

    if (tool === "pencil") {
      setElements((prev) => [
        ...prev,
        {
          type: "pencil",
          offsetX,
          offsetY,
          path: [[offsetX, offsetY]],
          stroke: color,
        },
      ]);
    } else if (tool === "line") {
      setElements((prev) => [
        ...prev,
        {
          type: "line",
          offsetX,
          offsetY,
          width: offsetX,
          height: offsetY,
          stroke: color,
        },
      ]);
    } else if (tool === "rect") {
      setElements((prev) => [
        ...prev,
        {
          type: "rect",
          offsetX,
          offsetY,
          width: 0,
          height: 0,
          stroke: color,
        },
      ]);
    }

    // console.log(offsetX, offsetY, "mouseDown");
  };

  const handleMouseMove = (e: any) => {
    // console.log("mouse move", e);
    const { offsetX, offsetY } = e.nativeEvent;

    if (isDrawing) {
      if (tool === "pencil") {
        const { path } = elements[elements.length - 1];
        const newPath = [...path, [offsetX, offsetY]];
        setElements((prev) =>
          prev.map((ele, index) => {
            if (index === elements.length - 1) {
              return {
                ...ele,
                path: newPath,
              };
            } else {
              return ele;
            }
          })
        );
      } else if (tool === "line") {
        setElements((prev) =>
          prev.map((ele, index) => {
            if (index === elements.length - 1) {
              return {
                ...ele,
                width: offsetX,
                height: offsetY,
              };
            } else {
              return ele;
            }
          })
        );
      } else if (tool === "rect") {
        setElements((prev) =>
          prev.map((ele, index) => {
            if (index === elements.length - 1) {
              return {
                ...ele,
                width: offsetX - ele.offsetX,
                height: offsetY - ele.offsetY,
              };
            } else {
              return ele;
            }
          })
        );
      }
    }
  };

  const handleMouseUp = (e: any) => {
    // console.log("mouse up", e);
    const { offsetX, offsetY } = e.nativeEvent;
    console.log(offsetX, offsetY, "mouseUp");
    setIsDrawing(false);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="border border-dark border-3 h-100 w-100 overflow-hidden"
    >
      <canvas ref={canvasRef} />
    </div>
  );
};

export default WhiteBoard;
