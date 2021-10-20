// import { WebSocketServer } from "ws";

// const wss = new WebSocketServer({ port: 8080 });

// wss.on("connection", function connection(ws) {
//   ws.on("message", function incoming(message) {
//     console.log("received: %s", message);
//   });

//   ws.send("something");

//   setTimeout(() => {
//     ws.send("n");
//   }, 20000);
// });
import { v4 } from "uuid";
import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });
const connections = new Map();

wss.on("connection", (conn) => {
  const id = v4();
  connections.set(id, conn);

  conn.send(JSON.stringify({ value: id, type: "id" }));

  connections.forEach((c) => {
    c.send(JSON.stringify({ type: "friends", value: [...connections.keys()] }));
  });

  conn.on("close", () => {
    connections.delete(id);
  });

  conn.on("message", function incoming(data, isBinary) {
    const msg = JSON.parse(data.toString());
    if (msg.type === "msg") {
      connections.get(msg.to).send(data.toString());
    }
  });
});
