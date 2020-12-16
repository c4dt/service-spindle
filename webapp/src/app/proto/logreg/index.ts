import { registerMessage } from "@dedis/cothority/protobuf";
import { List } from "immutable";
import { Message } from "protobufjs/light";

import "..";

export class TrainRequestProtobuf extends Message<TrainRequestProtobuf> {
  readonly LearningRate?: number;
  readonly ElasticRate?: number;

  readonly NetworkIterationCount?: number;
  readonly LocalIterationCount?: number;
  readonly LocalBatchSize?: number;
}
registerMessage("TrainRequest", TrainRequestProtobuf);
export class TrainRequest {
  constructor(
    readonly LearningRate: number,
    readonly ElasticRate: number,

    readonly NetworkIterationCount: number,
    readonly LocalIterationCount: number,
    readonly LocalBatchSize: number
  ) {}

  toProtobuf(): TrainRequestProtobuf {
    return new TrainRequestProtobuf({
      LearningRate: this.LearningRate,
      ElasticRate: this.ElasticRate,
      NetworkIterationCount: this.NetworkIterationCount,
      LocalIterationCount: this.LocalIterationCount,
      LocalBatchSize: this.LocalBatchSize,
    });
  }
}

export class ModelID {
  constructor(private readonly list: List<number>) {}

  asArray(): Uint8Array {
    return Uint8Array.from(this.list);
  }

  toString(): string {
    return this.list
      .take(4)
      .map((n) => n.toString(16))
      .join("");
  }
}

export class TrainResponseProgressProtobuf extends Message<TrainResponseProgressProtobuf> {
  readonly Local?: number;
  readonly Global?: number;
}
registerMessage("TrainResponseProgress", TrainResponseProgressProtobuf);
export class TrainResponseProgress {
  readonly Local: number;
  readonly Global: number;

  constructor(msg: TrainResponseProgressProtobuf) {
    if (msg.Local === undefined) throw new Error("undefined field");
    if (msg.Global === undefined) throw new Error("undefined field");

    this.Local = msg.Local;
    this.Global = msg.Global;
  }
}

export class TrainResponseProtobuf extends Message<TrainResponseProtobuf> {
  readonly Error?: string;
  readonly Progress?: TrainResponseProgressProtobuf;

  readonly ModelID?: Uint8Array;
}
registerMessage("TrainResponse", TrainResponseProtobuf);
export class TrainResponse {
  readonly Value:
    | ["error", Error]
    | ["progress", TrainResponseProgress]
    | ["result", ModelID];

  constructor(msg: TrainResponseProtobuf) {
    const keys = Object.keys(msg);
    if (keys.length !== 1) throw new Error("must define a single field");

    switch (keys[0]) {
      case "Progress":
        this.Value = [
          "progress",
          new TrainResponseProgress(
            msg.Progress as TrainResponseProgressProtobuf
          ),
        ];
        break;
      case "Error":
        this.Value = ["error", new Error(msg.Error)];
        break;
      case "ModelID":
        this.Value = ["result", new ModelID(List(msg.ModelID as Uint8Array))];
        break;
      default:
        throw new Error("unknown field definied");
    }
  }
}

export class PredictRequestProtobuf extends Message<PredictRequestProtobuf> {
  readonly ModelID?: Uint8Array;
  readonly ToPredict?: number[];
}
registerMessage("PredictRequest", PredictRequestProtobuf);
export class PredictRequest {
  constructor(readonly ModelID: ModelID, readonly ToPredict: List<number>) {}

  toProtobuf(): PredictRequestProtobuf {
    return new PredictRequestProtobuf({
      ModelID: this.ModelID.asArray(),
      ToPredict: this.ToPredict.toArray(),
    });
  }
}

export class PredictResponseProtobuf extends Message<PredictResponseProtobuf> {
  readonly Prediction?: boolean;
}
registerMessage("PredictResponse", PredictResponseProtobuf);
export class PredictResponse {
  readonly Prediction: boolean;

  constructor(msg: PredictResponseProtobuf) {
    if (msg.Prediction === undefined) throw new Error("undefined field");

    this.Prediction = msg.Prediction;
  }
}
