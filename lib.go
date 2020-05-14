package lib

import (
	"github.com/ldsec/lattigo/ckks"
)

func complexToFloat(arr []complex128) []float64 {
	ret := make([]float64, len(arr))
	for i, v := range arr {
		ret[i] = real(v)
	}
	return ret
}

func floatToComplex(arr []float64) []complex128 {
	ret := make([]complex128, len(arr))
	for i, v := range arr {
		ret[i] = complex(v, 0)
	}
	return ret
}

func Encode(params *ckks.Parameters, publicKey *ckks.PublicKey, message []float64) *ckks.Ciphertext {
	encoder := ckks.NewEncoder(params)
	slots := uint64(len(message))
	plaintext := encoder.EncodeNew(floatToComplex(message), slots)

	encryptor := ckks.NewEncryptorFromPk(params, publicKey)
	return encryptor.EncryptNew(plaintext)
}

func Decode(params *ckks.Parameters, secretKey *ckks.SecretKey, ciphertext *ckks.Ciphertext, messageLength uint) []float64 {
	decryptor := ckks.NewDecryptor(params, secretKey)
	receivedPlaintext := decryptor.DecryptNew(ciphertext)

	encoder := ckks.NewEncoder(params)
	decoded := encoder.Decode(receivedPlaintext, uint64(messageLength))
	return complexToFloat(decoded)
}
