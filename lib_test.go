package lib

import (
	"testing"

	"github.com/stretchr/testify/require"

	"github.com/ldsec/lattigo/bfv"
)

func TestEncodeDecode(t *testing.T) {
	secretMessage := []uint64{42}
	secretMessageLength := uint(len(secretMessage))
	params := bfv.DefaultParams[bfv.PN13QP218]

	kgen := bfv.NewKeyGenerator(params)
	secretKey, publicKey := kgen.GenKeyPair()

	encoded := Encode(params, publicKey, secretMessage)
	decoded := Decode(params, secretKey, encoded, secretMessageLength)

	require.Equal(t, secretMessage, decoded)
}
