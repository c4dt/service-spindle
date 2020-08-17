import {Component, OnInit} from '@angular/core'

import 'geco-cryptolib/geco-cryptolib'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  async ngOnInit() {
    console.log('>>')

    const geco_url = new URL('assets/geco-cryptolib.wasm', globalThis.location.href)
    await GeCoCryptoLibLoad(geco_url)

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

    console.log('<<')
  }

  private throwOnError<T>(toCheck: T | Error): T {
    if (toCheck instanceof Error)
      throw toCheck
    return toCheck
  }
}
