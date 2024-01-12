import * as escape from "escape-html";
import * as http from "http";
import * as socketIo from "socket.io";
import * as logger from "winston";

interface IPlayer {
    id: string;
    name: string;
    color: number;
}



import * as dotenv from "dotenv";
dotenv.config();
const supabaseUrl = "https://byyokbedkfrhtftkqawp.supabase.co"
const apiKey = process.env.API_KEY.trim();
const gameName = process.env.GAME_NAME.trim();
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(supabaseUrl, apiKey);
interface Game {
  id: number;
  // Add other columns from the 'game' table
  // column1: string;
  // column2: number;
  // ...
}

export class SocketIOManager {
    private io: SocketIO.Server;

    constructor(private server: http.Server, private game: Game) {
        this.io = socketIo.listen(this.server);
	this.game = game;
    }

    public start(): void {
        //this.io.on("connection", (socket) => {
        this.io.on("connection", async (socket) => {
            logger.info(`User ${socket.id} connected. With name: ${socket.handshake.query.name}`);


            const playerName     = escape(socket.handshake.query.name);
	    console.info("Player Name:", playerName)
	    const playerColor    = escape(socket.handshake.query.color);
	    console.info("Player Color:", playerColor)
	    // TODO this should not be undefined
	    const playerPassword = escape(socket.handshake.query.secret);
	    assert(playerPassword)
	    console.info("Player Password:", playerPassword)
	    const gameID         = this.game.id;
	    console.info("Game ID:", gameID)

            // TODO get playerID from REST API `user.id` using playerName
	    // TODO get codeSecret from REST API `code.secret` using gameID, playerID
	    // TODO check whether playerPassword matches codeSecret
	    // TODO get codeRemaining from REST API `code.remaining` using gameID, playerID
	    // TODO check whether codeRemaining is positive
	    
		try {
        // Step 1: Get playerID from REST API using playerName
        const { data: playerData, error: getPlayerIdError } = await supabase
          .from("user")
          .select("id")
          .eq("name", playerName)
          .single();
        const playerID = playerData?.id;

        if (getPlayerIdError) {
          console.error("Error retrieving player ID:", getPlayerIdError);
          return;
        }
          console.info("Player ID:", playerID)

        // Step 2: Get codeSecret from REST API using gameID and playerID
        const { data: codeSecretData, error: getCodeSecretError } = await supabase
          .from("code")
          .select("secret")
          .eq("game_id", gameID)
          .eq("user_id", playerID)
          .single();
        const codeSecret = codeSecretData?.secret;

        if (getCodeSecretError) {
          console.error("Error retrieving code secret:", getCodeSecretError);
          return;
        }
	console.info("Secret: ", codeSecret)

        // Step 3: Check whether playerPassword matches codeSecret
        const isPasswordValid = playerPassword === codeSecret;
	console.info("is password valid:", isPasswordValid)

        // Step 4: Get codeRemaining from REST API using gameID and playerID
        const { data: codeRemainingData, error: getCodeRemainingError } = await supabase
          .from("code")
          .select("remaining")
          .eq("game_id", gameID)
          .eq("user_id", playerID)
          .single();
        const codeRemaining = codeRemainingData?.remaining;

        if (getCodeRemainingError) {
          console.error("Error retrieving code remaining:", getCodeRemainingError);
          return;
        }
	console.info("Remaining:", codeRemaining)

        // Step 5: Check whether codeRemaining is positive
        const isCodeRemainingPositive = codeRemaining > 0;
	console.info("Is Positive:", isCodeRemainingPositive)

        // ...

      } catch (error) {
        console.error("Error:", error.message);
      }


















            socket.handshake.query.name = socket.handshake.query.name ? socket.handshake.query.name.substring(0, 30) : "Un-named";

            this.sendChatMessage(`User ${socket.handshake.query.name} connected.`, "Announcement");

            socket.broadcast.emit("new-player", {
                color: socket.handshake.query.color,
                id: socket.id,
                name: socket.handshake.query.name,
            });

            socket.on("disconnect", (data: string) => {
                logger.info(`User ${socket.id} disconnected.`);
                socket.broadcast.emit("disconnected", {
                    id: socket.id,
                });
                this.sendChatMessage(`User ${socket.handshake.query.name} disconnected.`, "Announcement");
            });

            socket.on("jump", () => {
                logger.debug(`User ${socket.id} jumped.`);
                socket.broadcast.emit("jump", {
                    id: socket.id,
                });
            });

            socket.on("death", () => {
                logger.debug(`User ${socket.id} died.`);
                socket.broadcast.emit("death", {
                    id: socket.id,
                });
            });

            socket.on("position", (position: { x: number, y: number, angle: number }) => {
                socket.broadcast.emit("position", {
                    angle: position.angle,
                    id: socket.id,
                    x: position.x,
                    y: position.y,
                });
            });

            socket.on("chat-message", (message: string) => {
                logger.debug(`User ${socket.id} sent message. ${message}`);
                this.sendChatMessage(message, socket.handshake.query.name);
            });
        });
    }

    public get currentPlayers(): Array<IPlayer> {
        let players = new Array<IPlayer>();
        let sockets = this.io.sockets.sockets;

        for (let socketId of Object.keys(sockets)) {
            let socket = sockets[socketId];

            players.push({
                color: socket.handshake.query.color,
                id: socket.id,
                name: socket.handshake.query.name,
            });
        }

        return players;
    }

    private sendChatMessage(message: string, name: string): void {
        this.io.emit("chat-message", {
            message: escape(message),
            name: escape(name),
        });
    }
}
