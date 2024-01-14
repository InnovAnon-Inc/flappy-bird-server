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

    private remainingUses: { [playerName: string]: number } = {};

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
	    const playerPassword = escape(socket.handshake.query.password);
	    //assert(playerPassword)
	    console.info("Player Password:", playerPassword)
	    //console.info("Secret:", socket.handshake.query.secret)
	    //console.info("Test:", socket.handshake.query.test)
	    //console.info("Foo:", socket.handshake.query.foo)
	    const gameID         = this.game.id;
	    console.info("Game ID:", gameID)

//		try {
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
	if (! isPasswordValid) {
		console.error("Invalid Access Code Secret");
		return;
	}

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

        // Set the remainingUses value for the player
        this.remainingUses[playerName] = codeRemaining;


        // Step 5: Check whether codeRemaining is positive
        const isCodeRemainingPositive = codeRemaining > 0;
	console.info("Is Positive:", isCodeRemainingPositive)
	if (! isCodeRemainingPositive) {
		console.error("User does not have remaining uses");
		return;
	}

        // ...
	const { data:decrementCodeData, error:decrementCodeError } = await supabase
  	.from('code')
  	.update({ remaining: codeRemaining - 1 })
          .eq("game_id", gameID)
          .eq("user_id", playerID)
  	.select()
	if(decrementCodeError) {
		console.error("Decrement Code Error:", decrementCodeError);
		return;
	}
	console.info("Decrement Code Data:", decrementCodeData);

 //     } catch (error) {
  //      console.error("Error:", error.message);
   //   }




            //socket.handshake.query.name = socket.handshake.query.name ? socket.handshake.query.name.substring(0, 30) : "Un-named";

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

            socket.on("death", async () => {
	    const gameID         = this.game.id;
	    console.info("Game ID:", gameID)

            const playerName     = escape(socket.handshake.query.name);
	    console.info("Player Name:", playerName)

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

        // Set the remainingUses value for the player
        this.remainingUses[playerName] = codeRemaining;

        // Step 5: Check whether codeRemaining is positive
        //const isCodeRemainingPositive = codeRemaining > 0;
        const isCodeRemainingPositive = codeRemaining > 1;
	console.info("Is Positive:", isCodeRemainingPositive)
	if (! isCodeRemainingPositive) {
		console.error("User does not have remaining uses");
		return;
	}

        // ...
	const { data:decrementCodeData, error:decrementCodeError } = await supabase
  	.from('code')
  	.update({ remaining: codeRemaining - 1 })
          .eq("game_id", gameID)
          .eq("user_id", playerID)
  	.select()
	if(decrementCodeError) {
		console.error("Decrement Code Error:", decrementCodeError);
		return;
	}
	console.info("Decrement Code Data:", decrementCodeData);
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

    public getRemaining(playerName: string): boolean {
	console.info("Grant Badge to Player:", playerName)
    // Check if the remaining uses for the player is positive
    const remaining = this.remainingUses[playerName] || 0;
    return remaining > 0;
    }

    public async grantBadgeToPlayer(playerName: string): Promise<void> {
	    console.info("Grant Badge to Player:", playerName)

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



	  const { data: badgeData, error:grantBadgeError } = await supabase
  .from('badge')
  .insert([
    { user_id: playerID, game_id: this.game.id },
  ])
  .select()

  	if (grantBadgeError) {
		console.error("Error granting badge:", grantBadgeError);
		return;
	}
	console.info("Grant badge data:", badgeData)
    }
}
