package main

import (
	"encoding/base64"
	"fmt"
	"os"
	"strconv"

	"github.com/ldsec/lattigo/bfv"

	"github.com/c4dt/service-spindle"
)

func main() {
	if err := run(os.Args[1:]); err != nil {
		fmt.Println("error:", err)
		os.Exit(1)
	}
}

func run(args []string) error {
	secretMessage := make([]uint64, len(args))
	for i, a := range args {
		u, err := strconv.ParseUint(a, 10, 64)
		if err != nil {
			return fmt.Errorf("when converting argument %v to uint: %v", i, err)
		}
		secretMessage[i] = u
	}

	secretMessageLength := uint(len(secretMessage))

	const paramIndex = bfv.PN12QP109
	params := bfv.DefaultParams[paramIndex]

	kgen := bfv.NewKeyGenerator(params)
	secretKey, publicKey := kgen.GenKeyPair()

	encoded := lib.Encode(params, publicKey, secretMessage)

	secretKeyMarshalled, err := secretKey.MarshalBinary()
	if err != nil {
		return fmt.Errorf("when marshalling the secret key: %v", err)
	}

	encodedMarshalled, err := encoded.MarshalBinary()
	if err != nil {
		return fmt.Errorf("when marshalling the encoded message: %v", err)
	}

	fmt.Println("param index:", paramIndex)
	fmt.Println("secret key:", base64.StdEncoding.EncodeToString(secretKeyMarshalled))
	fmt.Println("encoded:", base64.StdEncoding.EncodeToString(encodedMarshalled))
	fmt.Println("encoded length:", secretMessageLength)

	return nil
}
