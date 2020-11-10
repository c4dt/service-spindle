import { Injectable } from "@angular/core";

import { WebSocketConnection } from "@dedis/cothority/network";

import { ConfigService } from "./config.service";
import {
  LogisticRegressionPredictRequest,
  LogisticRegressionPredictResponse,
  LogisticRegressionPredictResponseProtobuf,
  LogisticRegressionTrainRequest,
  LogisticRegressionTrainResponse,
  LogisticRegressionTrainResponseProtobuf,
} from "./proto";

class Client {
  private readonly connection: WebSocketConnection;

  constructor(url: URL) {
    this.connection = new WebSocketConnection(url, "SPINDLE");
    this.connection.setTimeout(60 * 60 * 1000);
  }

  async logregTrain(
    req: LogisticRegressionTrainRequest
  ): Promise<LogisticRegressionTrainResponse> {
    return new LogisticRegressionTrainResponse(
      await this.connection.send(
        req.toProtobuf(),
        LogisticRegressionTrainResponseProtobuf
      )
    );
  }

  async logregPredict(
    req: LogisticRegressionPredictRequest
  ): Promise<LogisticRegressionPredictResponse> {
    return new LogisticRegressionPredictResponse(
      await this.connection.send(
        req.toProtobuf(),
        LogisticRegressionPredictResponseProtobuf
      )
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
