import { Request, Response } from "express";
import { SocketIOManager } from "../../bootstrap/socket-io-wrapper";

interface IPipeSetMarker {
    index: number;
    location: number;
}

let stage = new Array<IPipeSetMarker>();

function generateStage(count: number): void {
    for (let i = 0; i < count; i++) {
        stage.push({
            index: stage.length,
            location: Math.random(),
	    // TODO include info about crypto badges so client can display them on pipes
        });
    }
}

export class StageController {


 public socketIO: SocketIOManager;

    constructor(socketIO: SocketIOManager) {
	    if (socketIO === undefined) {
            throw new Error("SocketIOManager instance is undefined");
        }
	console.log("StageController - socketIO:", socketIO);
        this.socketIO = socketIO;
	    if (this.socketIO === undefined) {
            throw new Error("SocketIOManager instance is undefined");
        }
    }



    public /*static*/ getStage(req: Request, res: Response): void {
	    // TODO wtf
	    //if (this.socketIO === undefined) {
            //throw new Error("SocketIOManager instance is undefined");
        //}

        let startIndex = req.query.start as unknown as string & number;
        let endIndex = req.query.end as unknown as string & number;

        if (startIndex === undefined || endIndex === undefined) {
            res.status(400).send("Start and End must not be empty");
            return;
        }

        if (isNaN(startIndex) || isNaN(endIndex)) {
            res.status(400).send("Start and End must be number");
            return;
        }

        let startIndexNumber = parseInt(startIndex, 10);
        let endIndexNumber = parseInt(endIndex, 10);

        if (startIndexNumber > endIndexNumber) {
            res.status(400).send("Start must be greater than End");
            return;
        }

	// TODO if startIndex >= 69 then grant badge
	const playerName = req.query.name as string;
	if (! playerName) {
        	res.status(400).send("Need a player name");
		return
	}
	// TODO wtf
	//if (startIndexNumber >= 69) {
        //    // Call grantBadgeToPlayer method
        //    this.socketIO.grantBadgeToPlayer(playerName);
        //}
	//if (! this.socketIO.getRemaining(playerName)) {
        //	res.status(400).send("No more remaining uses")
	//	return
        //}

        if (stage.length < endIndexNumber) {
            generateStage(Math.abs(stage.length - endIndexNumber - 1));
        }

        res.status(200).json(stage.slice(startIndexNumber, endIndexNumber + 1));
    }
}
