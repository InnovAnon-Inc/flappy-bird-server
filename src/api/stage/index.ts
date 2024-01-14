import { Router } from "express";
import { StageController } from "./controller";

export class StageRouter {
    public router: Router;

    constructor(private socketIO : SocketIOManager) {
        this.router = Router();

        this.router.get("/", StageController.getStage);

	this.socketIO = socketIO;
    }
}
