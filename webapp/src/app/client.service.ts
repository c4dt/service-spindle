import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { WebSocketConnection } from "@dedis/cothority/network";

import { ConfigService } from "./config.service";
import {
  PredictRequest,
  PredictResponse,
  PredictResponseProtobuf,
  TrainRequest,
  TrainResponse,
  TrainResponseProtobuf,
} from "./proto/logreg";

class Client {
  private readonly connection: WebSocketConnection;

  constructor(url: URL) {
    this.connection = new WebSocketConnection(url, "SPINDLE");
    this.connection.setTimeout(60 * 60 * 1000);
  }

  logregTrain(req: TrainRequest): Observable<TrainResponse> {
    return this.connection
      .sendStream(req.toProtobuf(), TrainResponseProtobuf)
      .pipe(map((t) => new TrainResponse(t[0])));
  }

  async logregPredict(req: PredictRequest): Promise<PredictResponse> {
    return new PredictResponse(
      await this.connection.send(req.toProtobuf(), PredictResponseProtobuf)
    );
  }
}

@Injectable({
  providedIn: "root",
})
export class ClientService extends Client {
  constructor(config: ConfigService) {
    super(config.NodeURL);
  }
}
