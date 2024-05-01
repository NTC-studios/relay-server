import http from "http";
import WebSocket from "ws";
import { makeLobbyID } from "./utils.js";

const PORT = 8080;
const server = http.createServer();
const wss = new WebSocket.Server({ server });
const id_length = 5;

type Lobbies = {
    [key: string]: {
        clients: Set<WebSocket>
    }
}
const lobbies: Lobbies = {};

wss.on("connection", (ws, req) => {
    if (!req?.url) return;

    const requestURL = new URL(req.url, `http://${req.headers.host}`);
    const lobbyID = requestURL.searchParams.get("lobby_id");

    if (requestURL.pathname !== "/join_lobby" || !lobbyID) {
        ws.close(1002, "Invalid request");
        return;
    }

    const lobby = lobbies[lobbyID];
    lobby.clients.add(ws);

    ws.on("message", (message) => {
        lobby.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message.toString()); // Raw data doesn't work (to our knowledge)
            }
        })
    })

    ws.on("close", () => {
        lobby.clients.delete(ws);
    })
})

server.on("request", (req, res) => {
    if (req.url !== "/create_lobby" && req.method !== "POST") return;

    let lobbyID = makeLobbyID(id_length);
    while (lobbyID in lobbies) lobbyID = makeLobbyID(id_length);

    lobbies[lobbyID] = { clients: new Set() };
    const response = {
        lobby_id: lobbyID
    };
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(response))
})

server.listen(PORT, () => {
    console.log(`Server started with port ${PORT}`);
})