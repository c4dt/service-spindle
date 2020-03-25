// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="wasm_exec" />
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="spindle" />

import { paramsIndex, privateKey, encoded, messageLength } from './generated'

async function run (): Promise<void> {
  const go = new Go()
  const fetching = fetch('main.wasm')
  const result = await WebAssembly.instantiateStreaming(fetching, go.importObject)
  const running = go.run(result.instance)

  while (!('spindle' in globalThis)) {
    await new Promise(resolve => setTimeout(resolve))
  }

  const decoded = spindle.decode(paramsIndex, privateKey, encoded, messageLength)
  if (decoded instanceof Error) {
    throw decoded
  }
  console.log(decoded)

  await running
}

run().catch(console.error)
