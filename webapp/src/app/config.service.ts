import { List } from "immutable";

import { Injectable } from "@angular/core";

let locationStripped = globalThis.location.href;
if (locationStripped.endsWith("/"))
  locationStripped = locationStripped.substr(0, locationStripped.length - 1);
const datasetBaseURL = `${locationStripped}/datasets`;

@Injectable({
  providedIn: "root",
})
export class ConfigService {
  public readonly URL = new URL(
    `${locationStripped.replace(/^http/, "ws")}/leader`
  );

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
