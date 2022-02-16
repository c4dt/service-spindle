import { List, Map } from "immutable";

import { Component, Input, OnChanges } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ColumnTypes } from "@c4dt/angular-components";

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
export class QueryRunnerComponent implements OnChanges {
  @Input() public selectedRow: List<ColumnTypes> | null | undefined;

  public state:
    | ["nothing ran"]
    | ["training", trainingProgress | undefined]
    | ["train error", Error]
    | ["trained", ModelID]
    | ["predict error", ModelID, Error]
    | ["predicted", ModelID, boolean] = ["nothing ran"];
  public tabIndex = 0;
  public settingsOpened = false;

  public readonly trainForm = new FormGroup({
    localIterationCount: new FormControl(3, Validators.required),
    networkIterationCount: new FormControl(2, Validators.required),

    learningRate: new FormControl(0.01, Validators.required),
    elasticRate: new FormControl(0.01, Validators.required),
    localBatchSize: new FormControl(50, Validators.required),
  });
  public predict:
    | {
        form: FormGroup;
        fields: List<{ name: string; value: unknown }>;
      }
    | undefined;

  constructor(private readonly client: ClientService) {}

  public ngOnChanges(): void {
    if (this.selectedRow === null || this.selectedRow === undefined) return;
    if (this.selectedRow.some((column) => column.rows.size !== 1))
      throw new Error("selectedRow isn't a single row");

    this.predict = {
      form: new FormGroup(
        this.selectedRow
          .reduce((acc, column) => {
            const value = (column.rows.first as () => unknown)();
            return acc.set(
              column.name,
              new FormControl(value, Validators.required)
            );
          }, Map<string, FormControl>())
          .toObject()
      ),
      fields: this.selectedRow.map((column) => {
        return {
          name: column.name,
          value: (column.rows.first as () => unknown)(),
        };
      }),
    };
  }

  public nextPage(): void {
    this.tabIndex += 1;
  }

  public toggleSettings(): void {
    this.settingsOpened = !this.settingsOpened;
  }

  private getTrainFormValue(name: trainFormControlsType): number {
    const form = this.trainForm.get(name);
    if (form === null) throw new Error(`unable to find form's field: ${name}`);
    return form.value;
  }

  private getFormValueToPredict(): List<number> {
    if (this.predict === undefined || this.predict === null)
      throw new Error("no to-predict definied");
    const predict = this.predict;

    return this.predict.fields.map((field) => {
      const form = predict.form.get(field.name);
      if (form === null)
        throw new Error(`unable to find form's field: {field.label}`);

      if (typeof form.value === "number") return form.value;
      // TODO avoid magical parse
      else if (typeof form.value === "string") return parseFloat(form.value);
      throw new Error("can only predict with numbers");
    });
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
      const error = e instanceof Error ? e : new Error(`{e}`);
      this.state = ["predict error", this.state[1], error];
      throw error;
    }
  }
}
