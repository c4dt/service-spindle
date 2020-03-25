package lib

import (
	"github.com/ldsec/lattigo/bfv"
)

func Encode(params *bfv.Parameters, publicKey *bfv.PublicKey, message []uint64) *bfv.Ciphertext {
	encoder := bfv.NewEncoder(params)

	plaintext := bfv.NewPlaintext(params)
	encoder.EncodeUint(message, plaintext)

	encryptor := bfv.NewEncryptorFromPk(params, publicKey)
	return encryptor.EncryptNew(plaintext)
}

func Decode(params *bfv.Parameters, secretKey *bfv.SecretKey, ciphertext *bfv.Ciphertext, messageLength uint) []uint64 {
	encoder := bfv.NewEncoder(params)

	decryptor := bfv.NewDecryptor(params, secretKey)
	receivedPlaintext := decryptor.DecryptNew(ciphertext)

	decoded := encoder.DecodeUint(receivedPlaintext)

	ret := make([]uint64, messageLength)
	copy(ret, decoded)
	return ret
}
