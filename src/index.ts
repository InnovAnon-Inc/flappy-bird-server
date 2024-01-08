import * as cors from "cors";
import * as logger from "winston";
import { PlayerRouter } from "./api/players";
import { StageRouter } from "./api/stage";
import { ApplicationWrapper } from "./bootstrap/application-wrapper";
import { SocketIOManager } from "./bootstrap/socket-io-wrapper";
import { IConfig, ProductionConfig } from "./config/index";









import * as http from "http";
import * as dotenv from "dotenv";
//import { SocketIOManager } from "./bootstrap/socket-io-wrapper";
//import { ApplicationWrapper } from "./bootstrap/application-wrapper";
//import { fetchGameId } from "./api/game";

// Load environment variables from .env file
dotenv.config();

// Get the API key from environment variables
const supabaseUrl = "https://byyokbedkfrhtftkqawp.supabase.co"

const apiKey = process.env.API_KEY.trim();
logger.info('api key: %s', apiKey)

const gameName = process.env.GAME_NAME.trim();
logger.info('game name: %s', gameName)





interface Game {
  id: number;
  // Add other columns from the 'game' table
  // column1: string;
  // column2: number;
  // ...
}





import { createClient } from "@supabase/supabase-js";

// Create a Supabase client
const supabase = createClient(supabaseUrl, apiKey);

// Function to get the game ID corresponding to a game name
async function getGameId(gameName: string): Promise<Game | null> {
  console.info('game name: ', gameName)
  try {
    // Query the 'game' table and select the 'id' column where 'name' is equal to the game name
    //const { data, error } = await supabase
    let { data: game, error } = await supabase
      .from("game")
      .select("*")
      //.select("id")
      .eq("name", gameName)
      .single();

    //console.info('data (1): ', data)
    //console.info('game: ', game);

    if (error) {
      console.error("Error retrieving game ID (1):", error);
      return null;
    }

    //if (!data) {
    //  console.error("Game not found:", gameName);
    //  return null;
    //}
    if (!game) {
      console.error("Game not found:", gameName);
      return null;
    }

    //console.info('data (2): ', data)
    console.info('game (2): ', game);

    //return data.id;
    //return null;
    //return game.id;
    return game;
  } catch (error) {
    console.error("Error retrieving game ID (2):", error.message);
    return null;
  }
}

// Global variable to store the game ID
//let globalGameId: number | null = null;

// Usage example
getGameId(gameName)
  .then((game) => {
    if (game !== null) {
	    //globalGameId = gameId; // Set the global variable with the retrieved game ID
	  	let gameId = game.id


















let config: IConfig = new ProductionConfig();

let appWrapper = new ApplicationWrapper(config);
let socketIOWrapper = new SocketIOManager(appWrapper.Server, game);

appWrapper.configure((app) => {
    app.use(cors());
    logger.info("Configuring application routes");
    let stageRouter = new StageRouter();
    app.use("/stage", stageRouter.router);
    let playerRouter = new PlayerRouter(socketIOWrapper);
    app.use("/players", playerRouter.router);
});

appWrapper.start();
socketIOWrapper.start();

process.on("SIGTERM", () => {
    logger.info("Gracefully terminating");
    process.exit();
});
process.on("uncaughtException", (exception: Error) => {
    logger.error(exception.toString());
    logger.info(`Server stopped because of: ${exception.message}`);
    throw exception;
});







      //console.log("Game ID:", globalGameId); // Log the retrieved game ID
      console.log("Game ID:", gameId); // Log the retrieved game ID
    }
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });
