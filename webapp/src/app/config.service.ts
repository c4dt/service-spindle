import { List } from "immutable";

import { Injectable } from "@angular/core";

const datasetBaseURL = "https://demo.c4dt.org/drynx/datasets";

@Injectable({
  providedIn: "root",
})
export class ConfigService {
  public readonly URL = new URL("ws://localhost:1235");

  public readonly DataProviders = List.of(
    {
      datasetURL: new URL(`${datasetBaseURL}/1`),
      datasetTypesURL: new URL(`${datasetBaseURL}/1_types`),
    },
    {
      datasetURL: new URL(`${datasetBaseURL}/2`),
      datasetTypesURL: new URL(`${datasetBaseURL}/2_types`),
    },
    {
      datasetURL: new URL(`${datasetBaseURL}/3`),
      datasetTypesURL: new URL(`${datasetBaseURL}/3_types`),
    }
  );
}
