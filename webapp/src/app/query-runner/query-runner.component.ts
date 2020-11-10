import { Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { List } from "immutable";

import { ClientService } from "../client.service";
import {
  LogisticRegressionPredictRequest,
  LogisticRegressionTrainRequest,
  ModelID,
} from "../proto";

type trainFormControlsType =
  | "learningRate"
  | "elasticRate"
  | "localIterationCount"
  | "localBatchSize"
  | "networkIterationCount";

type stateTrainResult = [count: number, modelID: ModelID];

@Component({
  selector: "app-query-runner",
  templateUrl: "./query-runner.component.html",
  styleUrls: ["./query-runner.component.css"],
})
export class QueryRunnerComponent {
  public state:
    | ["nothing ran"]
    | ["training", [count: number]]
    | ["train error", [count: number, error: Error]]
    | ["trained", stateTrainResult]
    | ["predict error", stateTrainResult, [error: Error]]
    | ["predicted", stateTrainResult, [result: boolean]] = ["nothing ran"];
  public tabIndex = 0;

  public readonly trainForm = new FormGroup({
    learningRate: new FormControl(0.01, Validators.required),
    elasticRate: new FormControl(0.01, Validators.required),
    localIterationCount: new FormControl(3, Validators.required),
    localBatchSize: new FormControl(10, Validators.required),
    networkIterationCount: new FormControl(1, Validators.required),
  });
  public readonly predictForm = new FormGroup({
    toPredict: new FormControl(
      [6, 148, 72, 35, 0, 33.6, 0.627, 50],
      Validators.required // TODO validate format
    ),
  });

  constructor(private readonly client: ClientService) {}

  private getTrainFormValue(name: trainFormControlsType): number {
    const form = this.trainForm.get(name);
    if (form === null) throw new Error(`unable to find form's field: ${name}`);
    return form.value;
  }

  private getFormValueToPredict(): List<number> {
    const form = this.predictForm.get("toPredict");
    if (form === null)
      throw new Error("unable to find form's field: toPredict");
    console.log("getFormValueToPredict <<", form.value);
    return List(form.value);
  }

  async runTrainRequest(): Promise<void> {
    const query = new LogisticRegressionTrainRequest(
      this.getTrainFormValue("learningRate"),
      this.getTrainFormValue("elasticRate"),

      this.getTrainFormValue("networkIterationCount"),
      this.getTrainFormValue("localIterationCount"),
      this.getTrainFormValue("localBatchSize")
    );

    this.state = ["training", [0]];
    this.tabIndex = 2;

    let endCounter = false;
    (async () => {
      for (let count = 0; !endCounter; count++) {
        if (this.state[0] !== "training")
          throw new Error(`unexpected state: ${this.state[0]}`);
        this.state[1][0] = count;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    })();

    try {
      const ret = await this.client.logregTrain(query);
      if (ret.ModelID === undefined)
        throw new Error("invalid response: undefined model id");

      endCounter = true;
      this.state = ["trained", [this.state[1][0], ret.ModelID]];
    } catch (e) {
      const error = e instanceof Error ? e : new Error(e);
      endCounter = true;
      this.state = ["train error", [this.state[1][0], error]];
      throw error;
    }
  }

  async runPredictRequest(): Promise<void> {
    if (
      this.state[0] !== "trained" &&
      this.state[0] !== "predict error" &&
      this.state[0] !== "predicted"
    )
      throw new Error(`unexpected state: ${this.state[0]}`);

    const query = new LogisticRegressionPredictRequest(
      this.state[1][1],
      this.getFormValueToPredict()
    );

    try {
      const ret = await this.client.logregPredict(query);
      if (ret.Prediction === undefined)
        throw new Error("invalid response: undefined prediction");

      this.state = ["predicted", this.state[1], [ret.Prediction]];
    } catch (e) {
      const error = e instanceof Error ? e : new Error(e);
      this.state = ["predict error", this.state[1], [error]];
      throw error;
    }
  }
}
