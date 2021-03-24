import { List } from "immutable";

import { Component } from "@angular/core";

import {
  BreadCrumb,
  Table,
  fetchDataset,
  ColumnTypes,
  NumberColumn,
} from "@c4dt/angular-components";

import { ConfigService } from "./config.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  public readonly datasets: List<Promise<Table>>;
  public selectedRow: List<ColumnTypes> | undefined;

  public readonly showcaseBreadCrumb: BreadCrumb = {
    label: "SPINDLE",
    link: new URL("https://incubator.c4dt.org/spindle.html"),
  };

  constructor(config: ConfigService) {
    this.datasets = List(
      config.DataProviders.map((dp) =>
        fetchDataset(dp.datasetURL, dp.datasetTypesURL)
      )
    );

    const dataset = this.datasets.first(undefined);
    if (dataset === undefined) throw new Error("no dataset");

    dataset.then((dataset) => {
      this.selectedRow = dataset.columns.pop().map((column) => {
        if (!(column instanceof NumberColumn))
          throw new Error("only supports number's only dataset");
        const elem = column.rows.first(undefined);
        if (elem === undefined) throw new Error("no elements");
        return new NumberColumn(
          column.name,
          List.of(elem),
          column.decimalCount
        );
      });
    });
  }
}
