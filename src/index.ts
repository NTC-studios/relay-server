import http from "http";
import WebSocket from "ws";
import { generateID } from "./utils.js";

const PORT = 8080;
const server = http.createServer();
const wss = new WebSocket.Server({ server });
const id_length = 5;

type WSMessage = {
    sender: string;
    message: string;
};

type Client = {
    id: string;
    socket: WebSocket;
};

// we could use a Map instead for the clients but isn't really needed
// since we are just broadcasting messages to all clients (so they all have current state)
// maybe will change in the future
type Lobby = {
    host: Client | null;
    clients: Set<Client>;
};

type Lobbies = {
    [key: string]: Lobby;
};

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
    if (!lobby) {
        ws.close(1003, "Lobby not found");
        return;
    }

    let clientID = generateID(10);
    while (clientID in lobby.clients) {
        clientID = generateID(id_length);
    }

    let currentClient: Client = { id: clientID, socket: ws };

    // client will become host if there is existing no host
    if (!lobby.host) {
        lobby.host = currentClient;
        console.log(`Host ${clientID} joined lobby ${lobbyID}`);
    } else {
        lobby.clients.add(currentClient);
        console.log(`Client ${clientID} joined lobby ${lobbyID}`);
    }

    ws.on("message", (message) => {
        const messageObj: WSMessage = {
            sender: clientID,
            message: message.toString(),
        };
        const messageJSONString = JSON.stringify(messageObj);

        if (ws === lobby.host!.socket) {
            lobby.clients.forEach((client) => {
                if (
                    client.socket !== ws &&
                    client.socket.readyState === WebSocket.OPEN
                ) {
                    client.socket.send(messageJSONString); // Raw data doesn't work (to our knowledge)
                }
            });
        } else {
            lobby.host!.socket.send(messageJSONString);
        }
    });

    ws.on("close", () => {
        if (ws === lobby.host!.socket) {
            lobby.clients.forEach((client) =>
                client.socket.close(4444, "Host ended connection.")
            );
            delete lobbies[lobbyID];
            console.log(`Deleted lobby with ID ${lobbyID}`);
        } else lobby.clients.delete(currentClient);
    });
});

server.on("request", (req, res) => {
    if (req.url !== "/create_lobby" && req.method !== "POST") return;

    let lobbyID = generateID(id_length);
    while (lobbyID in lobbies) lobbyID = generateID(id_length);

    lobbies[lobbyID] = { clients: new Set(), host: null };
    const response = {
        lobby_id: lobbyID,
    };

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(response));

    console.log(`Created lobby with ID ${lobbyID}`);
});

server.listen(PORT, () => {
    console.log(`Server started with port ${PORT}`);
});
