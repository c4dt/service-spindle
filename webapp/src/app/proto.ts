import { addJSON, registerMessage } from "@dedis/cothority/protobuf";
import { List } from "immutable";
import { Message } from "protobufjs/light";

import proto from "./proto.json";

addJSON(proto);

export class LogisticRegressionTrainRequestProtobuf extends Message<LogisticRegressionTrainRequestProtobuf> {
  readonly LearningRate?: number;
  readonly ElasticRate?: number;

  readonly NetworkIterationCount?: number;
  readonly LocalIterationCount?: number;
  readonly LocalBatchSize?: number;
}
registerMessage(
  "LogisticRegressionTrainRequest",
  LogisticRegressionTrainRequestProtobuf
);
export class LogisticRegressionTrainRequest {
  constructor(
    readonly LearningRate: number,
    readonly ElasticRate: number,

    readonly NetworkIterationCount: number,
    readonly LocalIterationCount: number,
    readonly LocalBatchSize: number
  ) {}

  toProtobuf(): LogisticRegressionTrainRequestProtobuf {
    return new LogisticRegressionTrainRequestProtobuf({
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

export class LogisticRegressionTrainResponseProtobuf extends Message<LogisticRegressionTrainResponseProtobuf> {
  readonly ModelID?: Uint8Array;
}
registerMessage(
  "LogisticRegressionTrainResponse",
  LogisticRegressionTrainResponseProtobuf
);
export class LogisticRegressionTrainResponse {
  readonly ModelID: ModelID;

  constructor(msg: LogisticRegressionTrainResponseProtobuf) {
    if (msg.ModelID === undefined) throw new Error("undefined field");

    this.ModelID = new ModelID(List(msg.ModelID));
  }
}

export class LogisticRegressionPredictRequestProtobuf extends Message<LogisticRegressionPredictRequestProtobuf> {
  readonly ModelID?: Uint8Array;
  readonly ToPredict?: number[];
}
registerMessage(
  "LogisticRegressionPredictRequest",
  LogisticRegressionPredictRequestProtobuf
);
export class LogisticRegressionPredictRequest {
  constructor(readonly ModelID: ModelID, readonly ToPredict: List<number>) {}

  toProtobuf(): LogisticRegressionPredictRequestProtobuf {
    return new LogisticRegressionPredictRequestProtobuf({
      ModelID: this.ModelID.asArray(),
      ToPredict: this.ToPredict.toArray(),
    });
  }
}

export class LogisticRegressionPredictResponseProtobuf extends Message<LogisticRegressionPredictResponseProtobuf> {
  readonly Prediction?: boolean;
}
registerMessage(
  "LogisticRegressionPredictResponse",
  LogisticRegressionPredictResponseProtobuf
);
export class LogisticRegressionPredictResponse {
  readonly Prediction: boolean;

  constructor(msg: LogisticRegressionPredictResponseProtobuf) {
    if (msg.Prediction === undefined) throw new Error("undefined field");

    this.Prediction = msg.Prediction;
  }
}
