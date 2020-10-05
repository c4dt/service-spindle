import { Injectable } from "@angular/core";

import { WebSocketConnection } from "@dedis/cothority/network";

import { LogisticRegressionRequest, LogisticRegressionResponse } from "./proto";
import { ConfigService } from "./config.service";

class Client {
  private readonly connection: WebSocketConnection;

  constructor(url: URL) {
    this.connection = new WebSocketConnection(url, "SPINDLE");
    this.connection.setTimeout(60 * 60 * 1000);
  }

  async logreg(
    req: LogisticRegressionRequest
  ): Promise<LogisticRegressionResponse> {
    return await this.connection.send(req, LogisticRegressionResponse);
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
