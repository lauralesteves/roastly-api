.PHONY: build test clean fmt lint

build:
	sam build

test:
	go test ./...

clean:
	rm -rf .aws-sam

fmt:
	go fmt ./...

lint:
	golangci-lint run ./...
