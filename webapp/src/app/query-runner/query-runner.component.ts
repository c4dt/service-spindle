import { Component } from "@angular/core";
import {
  FormControl,
  FormGroup,
  Validators,
  AbstractControl,
} from "@angular/forms";

import { ClientService } from "../client.service";
import { LogisticRegressionRequest } from "../proto";

type formControlsTypeForNumber =
  | "learningRate"
  | "elasticRate"
  | "localIterationCount"
  | "localBatchSize"
  | "networkIterationCount";

type formControlsType = formControlsTypeForNumber | "toPredict";

@Component({
  selector: "app-query-runner",
  templateUrl: "./query-runner.component.html",
  styleUrls: ["./query-runner.component.css"],
})
export class QueryRunnerComponent {
  public state:
    | ["nothing ran"]
    | ["loading", number]
    | ["errored", number, Error]
    | ["loaded", number, boolean] = ["nothing ran"];
  public tabIndex = 0;

  public readonly queryBuilder = new FormGroup({
    learningRate: new FormControl(0.01, Validators.required),
    elasticRate: new FormControl(0.01, Validators.required),
    localIterationCount: new FormControl(3, Validators.required),
    localBatchSize: new FormControl(10, Validators.required),
    networkIterationCount: new FormControl(1, Validators.required),

    toPredict: new FormControl(
      [6, 148, 72, 35, 0, 33.6, 0.627, 50],
      Validators.required // TODO validate format
    ),
  });

  constructor(private readonly client: ClientService) {}

  private getForm(name: formControlsType): AbstractControl {
    const form = this.queryBuilder.get(name);
    if (form === null) throw new Error(`unable to find form: ${name}`);
    return form;
  }

  private getFormValueAsNumber(
    name: formControlsTypeForNumber
  ): number | undefined {
    const form = this.getForm(name);
    return form.value;
  }

  private getFormValueToPredict(): number[] | undefined {
    const form = this.getForm("toPredict");
    return form.value;
  }

  buildQuery(): LogisticRegressionRequest | undefined {
    return new LogisticRegressionRequest({
      LearningRate: this.getFormValueAsNumber("learningRate"),
      ElasticRate: this.getFormValueAsNumber("elasticRate"),

      LocalIterationCount: this.getFormValueAsNumber("localIterationCount"),
      LocalBatchSize: this.getFormValueAsNumber("localBatchSize"),
      NetworkIterationCount: this.getFormValueAsNumber("networkIterationCount"),

      ToPredict: this.getFormValueToPredict(),
    });
  }

  throwOnUndefined<T>(val: T | undefined): T {
    if (val === undefined) throw new Error("undefined found");
    return val;
  }

  async runQuery(query: LogisticRegressionRequest): Promise<void> {
    this.state = ["loading", 0];
    this.tabIndex = 2;

    let endCounter = false;
    (async () => {
      for (let count = 0; !endCounter; count++) {
        this.state[1] = count;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    })();

    try {
      const ret = await this.client.logreg(query);
      if (ret.Prediction === undefined)
        throw new Error("invalid response: undefined prediction");

      this.state = ["loaded", this.state[1], ret.Prediction];
    } catch (e) {
      const error = e instanceof Error ? e : new Error(e);
      this.state = ["errored", this.state[1], error];
      throw error;
    } finally {
      endCounter = true;
    }
  }
}
