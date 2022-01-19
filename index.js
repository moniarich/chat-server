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
//event name= connection
wss.on("connection", (conn) => {
  const id = v4();
  connections.set(id, { conn, name: "" });

  conn.send(JSON.stringify({ value: id, type: "id" }));

  conn.on("close", () => {
    connections.delete(id);
  });

  conn.on("message", function incoming(data, isBinary) {
    console.log("msg rcv", data.toString());
    const msg = JSON.parse(data.toString());
    if (msg.type === "msg" && connections.has(msg.to)) {
      connections.get(msg.to).conn.send(data.toString());
    }

    if (msg.type === "setName") {
      if (msg.value === "") {
        msg.value = `Bilbo ${connections.size}`;
      }
      connections.set(id, { conn, name: msg.value });

      conn.send(JSON.stringify({ type: "setName", success: true, value: msg.value}));

      connections.forEach((c) => {
        c.conn.send(
          JSON.stringify({
            type: "friends",
            value: Array.from(connections, ([key, value]) => ({
              id: key,
              name: value.name,
            })),
          })
        );
      });
    }
  });
});

// const arr = [{conn: {}, name: "Joe"}, {conn: {}, name: "Jan"}, {conn: {}, name: "John"}]
// const m = new Map([["1", {conn: {}, name: "Joe"}], ["2", {conn: {}, name: "Jan"}], ["3", {conn: {}, name: "John"}]])
//Array.from(m, ([key, value]) => ({ key, value }))
//Array.from(m, ([key, value]) => ({ key, value })).map(
