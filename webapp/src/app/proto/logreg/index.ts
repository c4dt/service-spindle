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

export class TrainResponseProtobuf extends Message<TrainResponseProtobuf> {
  readonly ModelID?: Uint8Array;
}
registerMessage("TrainResponse", TrainResponseProtobuf);
export class TrainResponse {
  readonly ModelID: ModelID;

  constructor(msg: TrainResponseProtobuf) {
    if (msg.ModelID === undefined) throw new Error("undefined field");

    this.ModelID = new ModelID(List(msg.ModelID));
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
