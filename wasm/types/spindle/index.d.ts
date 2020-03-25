declare namespace spindle {
  function decode(defaultParamsIndex: number, marshalledSecretKey: Uint8Array, marshalledCipherText: Uint8Array, secretMessageLength: number): number[] | Error
}
