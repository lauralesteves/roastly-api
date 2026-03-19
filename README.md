# Roastly API

A CRUD API for managing coffee shop products, built with **AWS Lambda** and **DynamoDB**.

This is a **dual-language monorepo** with implementations in both **TypeScript (Node.js)** and **Go**, deployable via Serverless Framework or AWS SAM.

## Repository Structure

```
roastly-api/
├── .github/workflows/  # Path-filtered CI/CD per language
├── docker-compose.yml  # Shared DynamoDB Local
├── golang/             # Go implementation
├── js/                 # TypeScript / Node.js implementation
└── postman/            # Shared Postman collections & environments
```

## Getting Started

### Prerequisites

**nvm** is required to manage Node.js versions. If you don't have it installed:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

Then run:

```bash
make prepare
```

This installs Node 18 via nvm, JS dependencies (`npm ci`), and Go dependencies (`go mod tidy`).

### Database

| Command | Description |
| --- | --- |
| `make db:up` | Start DynamoDB Local (Docker) |
| `make db:down` | Stop DynamoDB Local |
| `make db:seed` | Create local DynamoDB table |

## JavaScript / TypeScript

All JS commands are available via `make` from the project root.

### Local Development

| Command | Description | Port |
| --- | --- | --- |
| `make js-serverless-server` | Start Serverless offline | 3000 |
| `make js-sam-server` | Start SAM local API | 3001 |
| `make js-server` | Start both (sequentially) | — |

### Build

| Command | Description |
| --- | --- |
| `make js-serverless-build` | Package Serverless |
| `make js-sam-build` | Build SAM |
| `make js-build` | Build both |

### Test

```bash
make js-test
```

### Deploy

| Command | Description |
| --- | --- |
| `make js-serverless-deploy` | Deploy via Serverless Framework |
| `make js-sam-deploy` | Deploy via AWS SAM |
| `make js-deploy` | Deploy both |

### Clean

| Command | Description |
| --- | --- |
| `make js-serverless-clean` | Remove `.serverless/` and `.esbuild/` |
| `make js-sam-clean` | Remove `.aws-sam/` |
| `make js-clean` | Clean both |

## Go

All Go commands are available via `make` from the project root.

### Local Development

| Command | Description | Port |
| --- | --- | --- |
| `make go-serverless-server` | Start Serverless offline | 8080 |
| `make go-sam-server` | Start SAM local API | 8081 |
| `make go-server` | Start both (sequentially) | — |

### Build

| Command | Description |
| --- | --- |
| `make go-serverless-build` | Cross-compile and zip for Serverless |
| `make go-sam-build` | Build SAM |
| `make go-build` | Build both |

### Test

```bash
make go-test
```

### Deploy

| Command | Description |
| --- | --- |
| `make go-serverless-deploy` | Deploy via Serverless Framework |
| `make go-sam-deploy` | Deploy via AWS SAM |
| `make go-deploy` | Deploy both |

### Clean

| Command | Description |
| --- | --- |
| `make go-serverless-clean` | Remove `bin/` and `.serverless/` |
| `make go-sam-clean` | Remove `.aws-sam/` |
| `make go-clean` | Clean both |

## Integration Tests

Run all 5 CRUD operations against all endpoints:

| Command | Description |
| --- | --- |
| `make test:prod` | Test all 4 production endpoints |
| `make test:local` | Test local servers (JS Serverless, JS SAM, Go SAM) |

## Shared Resources

- **DynamoDB Local** — `make db:up` / `make db:down` from the repo root
- **Postman** — collections and environments live in `postman/`

## API Reference

| Method | Path             | Description       |
| ------ | ---------------- | ----------------- |
| POST   | `/products`      | Create a product  |
| GET    | `/products`      | List all products |
| GET    | `/products/{id}` | Get product by ID |
| PUT    | `/products/{id}` | Update product    |
| DELETE | `/products/{id}` | Delete product    |

## IDE Support

The `.idea/` configuration supports opening the project root in both **WebStorm** (JS module) and **GoLand** (Go module). Each IDE recognizes its own module type and ignores the other.
