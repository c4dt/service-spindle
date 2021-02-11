import { List } from "immutable";

import { Component } from "@angular/core";

import { Table, fetchDataset } from "@c4dt/angular-components";

import { ConfigService } from "./config.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  public readonly dataset: Promise<Table>;
  public readonly datasets: List<Promise<Table>>;

  constructor(config: ConfigService) {
    this.datasets = List(
      config.DataProviders.map((dp) =>
        fetchDataset(dp.datasetURL, dp.datasetTypesURL)
      )
    );

    const dataset = this.datasets.first(undefined);
    if (dataset === undefined) throw new Error("no dataset");
    this.dataset = dataset;
  }
}
