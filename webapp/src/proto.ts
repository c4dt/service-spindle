import {addJSON, registerMessage} from '@dedis/cothority/protobuf'
import {Message} from 'protobufjs/light'

import proto from './proto.json'

addJSON(proto)

export class LogisticRegressionRequest extends Message<LogisticRegressionRequest> {
  readonly ToPredict?: number[]

  readonly LearningRate?: number
  readonly ElasticRate?: number

  readonly NetworkIterationCount?: number
  readonly LocalIterationCount?: number
  readonly LocalBatchSize?: number
}
registerMessage('LogisticRegressionRequest', LogisticRegressionRequest)

export class LogisticRegressionResponse extends Message<LogisticRegressionResponse> {
  readonly Prediction?: boolean
}
registerMessage('LogisticRegressionResponse', LogisticRegressionResponse)
