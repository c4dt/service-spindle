import { Injectable } from "@angular/core";

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

  async logregTrain(req: TrainRequest): Promise<TrainResponse> {
    return new TrainResponse(
      await this.connection.send(req.toProtobuf(), TrainResponseProtobuf)
    );
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
    super(config.URL);
  }
}
