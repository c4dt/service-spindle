import { Component, OnInit } from "@angular/core";

import { ConfigService } from "./config.service";
import { Client } from "../client";

import "geco-cryptolib/geco-cryptolib";
import { LogisticRegressionRequest } from "../proto";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  constructor(private readonly config: ConfigService) {}

  async ngOnInit() {
    const geco_url = new URL(
      "assets/geco-cryptolib.wasm",
      globalThis.location.href
    );
    await GeCoCryptoLibLoad(geco_url);

    const client = new Client(this.config.URL);

    const ret = await client.logreg(
      new LogisticRegressionRequest({
        ToPredict: [6, 148, 72, 35, 0, 33.6, 0.627, 50],

        LearningRate: 0.01,
        ElasticRate: 0.01,

        LocalIterationCount: 3,
        LocalBatchSize: 10,
        NetworkIterationCount: 1,
      })
    );

    if (ret.Prediction === undefined) {
      throw new Error("invalid response: prediction undefined");
    }

    console.log(ret.Prediction);

    /*
    const encodedCKKS = 'Ag0MQdAAAAAAAABACZmZmZmZmgYBAAAAAf_-wAEAAAAAP_9AAQAAAAA__oABAAAAAEACAAEAAAAAQAOAAQAAAAA__AABAAAACAAAQAE='
    const ckks = this.throwOnError(GeCoCryptoLib.decodeBase64Url(encodedCKKS))
    this.throwOnError(GeCoCryptoLib.loadCryptoSystem(ckks))
    const loaded = this.throwOnError(GeCoCryptoLib.isCryptoSystemLoaded())
    if (!loaded)
      throw new Error('crypto not loaded?')

    const toEncrypt = [-5,-4,-3,-2,-1,0,1,2,3,4,5]

    const [priv,pub] = this.throwOnError(GeCoCryptoLib.genKeyPair())
    const encrypted = this.throwOnError(GeCoCryptoLib.encryptInts(toEncrypt, pub))
    const decrypted = this.throwOnError(GeCoCryptoLib.decryptInts(encrypted, priv))

    for (let i = 0; i < toEncrypt.length; i++)
      if (toEncrypt[i] !== decrypted[i])
        throw new Error(`${toEncrypt[i]} !== ${decrypted}`)
    */
  }

  private throwOnError<T>(toCheck: T | Error): T {
    if (toCheck instanceof Error) throw toCheck;
    return toCheck;
  }
}
