package main

import (
	"errors"
	"fmt"
	"syscall/js"

	"github.com/c4dt/service-spindle"
	"github.com/ldsec/lattigo/ckks"
)

func getBytes(v js.Value) []byte {
	length := v.Length()

	bytes := make([]byte, length)
	copied := js.CopyBytesToGo(bytes, v)

	if copied != length {
		panic("array changed size during copy")
	}

	return bytes
}

type errorJS struct {
	err error
}

var _ js.Wrapper = new(errorJS)

func (e errorJS) JSValue() js.Value {
	return js.Global().Get("Error").New(e.err.Error())
}

func decode(this js.Value, args []js.Value) interface{} {
	if len(args) != 4 {
		return errorJS{errors.New("need 4 arguments")}
	}

	paramIndex := args[0].Int()
	marshalledSecretKey := getBytes(args[1])
	marshalledCiphertext := getBytes(args[2])
	messageLength := args[3].Int()

	if paramIndex < 0 || paramIndex >= len(ckks.DefaultParams) {
		return errorJS{errors.New("param index is out of range")}
	}
	if messageLength < 0 {
		return errorJS{errors.New("message length can not be negative")}
	}

	params := ckks.DefaultParams[paramIndex]
	secretKey := new(ckks.SecretKey)
	if err := secretKey.UnmarshalBinary(marshalledSecretKey); err != nil {
		return errorJS{fmt.Errorf("when unmarshaling secret key: %v", err)}
	}
	ciphertext := new(ckks.Ciphertext)
	if err := ciphertext.UnmarshalBinary(marshalledCiphertext); err != nil {
		return errorJS{fmt.Errorf("when unmarshaling ciphertext: %v", err)}
	}

	results := lib.Decode(params, secretKey, ciphertext, uint(messageLength))

	ret := make([]interface{}, len(results))
	for i, v := range results {
		ret[i] = v
	}
	return ret
}

func main() {
	js.Global().Set("spindle", map[string]interface{}{
		"decode": js.FuncOf(decode),
	})

	<-make(chan struct{})
}
