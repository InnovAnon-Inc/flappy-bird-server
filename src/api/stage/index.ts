import { Router } from "express";
import { StageController } from "./controller";
import { SocketIOManager } from "../../bootstrap/socket-io-wrapper";

export class StageRouter {
    public router: Router;

    constructor(private socketIO : SocketIOManager) {
	    if (socketIO === undefined) {
            throw new Error("SocketIOManager instance is undefined");
        }
	console.log("StageController - socketIO:", socketIO);

	this.socketIO = socketIO;

        this.router = Router();

        this.router.get("/", new StageController(socketIO).getStage);
    }
}
