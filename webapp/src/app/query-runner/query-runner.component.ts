import { Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { List } from "immutable";

import { ClientService } from "../client.service";
import { PredictRequest, TrainRequest, ModelID } from "../proto/logreg";

type trainFormControlsType =
  | "learningRate"
  | "elasticRate"
  | "localIterationCount"
  | "localBatchSize"
  | "networkIterationCount";

type trainingProgress = [local: number, global: number];

@Component({
  selector: "app-query-runner",
  templateUrl: "./query-runner.component.html",
  styleUrls: ["./query-runner.component.css"],
})
export class QueryRunnerComponent {
  public state:
    | ["nothing ran"]
    | ["training", trainingProgress | undefined]
    | ["train error", Error]
    | ["trained", ModelID]
    | ["predict error", ModelID, Error]
    | ["predicted", ModelID, boolean] = ["nothing ran"];
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
      List.of(6, 148, 72, 35, 0, 33.6, 0.627, 50).join(" "),
      Validators.required // TODO validate format
    ),
  });

  constructor(private readonly client: ClientService) {}

  public nextPage(): void {
    this.tabIndex += 1;
  }

  private getTrainFormValue(name: trainFormControlsType): number {
    const form = this.trainForm.get(name);
    if (form === null) throw new Error(`unable to find form's field: ${name}`);
    return form.value;
  }

  private getFormValueToPredict(): List<number> {
    const form = this.predictForm.get("toPredict");
    if (form === null)
      throw new Error("unable to find form's field: toPredict");
    const value: string = form.value;

    const ret = List(value.trim().split(" ")).map(Number.parseFloat);
    if (ret.some(Number.isNaN))
      throw new Error("unable to parse some elements as float");

    return ret;
  }

  async runTrainRequest(): Promise<void> {
    const localIterations = this.getTrainFormValue("localIterationCount");
    const globalIterations = this.getTrainFormValue("networkIterationCount");

    const query = new TrainRequest(
      this.getTrainFormValue("learningRate"),
      this.getTrainFormValue("elasticRate"),

      globalIterations,
      localIterations,
      this.getTrainFormValue("localBatchSize")
    );

    this.state = ["training", undefined];
    this.tabIndex = 2;

    const stream = this.client.logregTrain(query);

    stream.subscribe(
      (progress) => {
        switch (progress.Value[0]) {
          case "progress":
            this.state = [
              "training",
              [
                (progress.Value[1].Local / localIterations) * 100,
                (progress.Value[1].Global / globalIterations) * 100,
              ],
            ];
            break;
          case "error":
            // TODO can throw?
            this.state = ["train error", progress.Value[1]];
            break;
          case "result":
            this.state = ["trained", progress.Value[1]];
        }
      },
      (error) => {
        this.state = ["train error", error];
        throw error;
      }
    );
  }

  async runPredictRequest(): Promise<void> {
    if (
      this.state[0] !== "trained" &&
      this.state[0] !== "predict error" &&
      this.state[0] !== "predicted"
    )
      throw new Error(`unexpected state: ${this.state[0]}`);

    const query = new PredictRequest(
      this.state[1],
      this.getFormValueToPredict()
    );

    try {
      const ret = await this.client.logregPredict(query);
      if (ret.Prediction === undefined)
        throw new Error("invalid response: undefined prediction");

      this.state = ["predicted", this.state[1], ret.Prediction];
    } catch (e) {
      const error = e instanceof Error ? e : new Error(e);
      this.state = ["predict error", this.state[1], error];
      throw error;
    }
  }
}
