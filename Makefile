.PHONY: prepare \
       db\:up db\:down db\:seed \
       js-deploy js-serverless-deploy js-sam-deploy \
       js-server js-serverless-server js-sam-server \
       js-build js-serverless-build js-sam-build \
       js-clean js-serverless-clean js-sam-clean \
       js-test \
       go-deploy go-serverless-deploy go-sam-deploy \
       go-server go-serverless-server go-sam-server \
       go-build go-serverless-build go-sam-build \
       go-clean go-serverless-clean go-sam-clean \
       go-test \
       test\:local test\:prod

# ── Prepare ─────────────────────────────────────────

prepare:
	@test -f /usr/local/opt/nvm/nvm.sh || (echo "Error: nvm not found. Install it first: https://github.com/nvm-sh/nvm" && exit 1)
	. /usr/local/opt/nvm/nvm.sh && nvm install 18
	. /usr/local/opt/nvm/nvm.sh && nvm use 18 && cd js && npm ci
	cd golang && go mod tidy

# ── Database ────────────────────────────────────────

db\:up:
	docker-compose up -d
	@sleep 2
	@$(MAKE) db:seed 2>/dev/null || true

db\:down:
	docker-compose down

db\:seed:
	aws dynamodb create-table \
		--table-name roastly-api-local-roastly-products \
		--attribute-definitions AttributeName=id,AttributeType=S \
		--key-schema AttributeName=id,KeyType=HASH \
		--billing-mode PAY_PER_REQUEST \
		--endpoint-url http://localhost:8000 \
		--region us-east-1 \
		--no-cli-pager

# ═══════════════════════════════════════════════════
# Js
# ═══════════════════════════════════════════════════

# ── Deploy ──────────────────────────────────────────

js-deploy: js-serverless-deploy js-sam-deploy

js-serverless-deploy:
	cd js && . /usr/local/opt/nvm/nvm.sh && nvm use 18 && npm ci && npx sls create_domain --stage prod || true && npx sls deploy --stage prod

js-sam-deploy:
	cd js && npm ci && PATH=$$PWD/node_modules/.bin:$$PATH sam build && sam deploy \
		--stack-name roastly-api-js-sam \
		--capabilities CAPABILITY_IAM \
		--region us-east-1 \
		--resolve-s3 \
		--no-confirm-changeset \
		--no-fail-on-empty-changeset \
		--parameter-overrides \
			HostedZoneId=Z05144853OREESLU099I6 \
			CertificateArn=arn:aws:acm:us-east-1:958586644302:certificate/0a94af1b-caf3-4b54-9c62-e92f472899dd

# ── Server ──────────────────────────────────────────

js-server: js-serverless-server js-sam-server

js-serverless-server:
	cd js && . /usr/local/opt/nvm/nvm.sh && nvm use 18 && npx sls offline --stage local --httpPort 3000

js-sam-server:
	cd js && PATH=$$PWD/node_modules/.bin:$$PATH sam build && sam local start-api --port 3001 --env-vars env.local.json

# ── Build ───────────────────────────────────────────

js-build: js-serverless-build js-sam-build

js-serverless-build:
	cd js && . /usr/local/opt/nvm/nvm.sh && nvm use 18 && npx sls package --stage local

js-sam-build:
	cd js && PATH=$$PWD/node_modules/.bin:$$PATH sam build

# ── Clean ───────────────────────────────────────────

js-clean: js-serverless-clean js-sam-clean

js-serverless-clean:
	rm -rf js/.serverless js/.esbuild

js-sam-clean:
	rm -rf js/.aws-sam

# ── Test ────────────────────────────────────────────

js-test:
	cd js && npm test

# ═══════════════════════════════════════════════════
# Go
# ═══════════════════════════════════════════════════

# ── Deploy ──────────────────────────────────────────

go-deploy: go-serverless-deploy go-sam-deploy

go-serverless-deploy: go-serverless-build
	cd golang && ../js/node_modules/.bin/sls create_domain --stage prod || true && ../js/node_modules/.bin/sls deploy --stage prod

go-sam-deploy:
	cd golang && sam build && sam deploy \
		--stack-name roastly-api-go-sam \
		--capabilities CAPABILITY_IAM \
		--region us-east-1 \
		--resolve-s3 \
		--no-confirm-changeset \
		--no-fail-on-empty-changeset \
		--parameter-overrides \
			HostedZoneId=Z05144853OREESLU099I6 \
			CertificateArn=arn:aws:acm:us-east-1:958586644302:certificate/0a94af1b-caf3-4b54-9c62-e92f472899dd

# ── Server ──────────────────────────────────────────

go-server: go-sam-server

go-serverless-server:
	@echo "serverless-offline doesn't support compiled runtimes like Go; it only works with Node.js/Python/etc. Use 'make go-sam-server' instead."

go-sam-server:
	cd golang && sam build && sam local start-api --port 8080 --env-vars env.local.json

# ── Build ───────────────────────────────────────────

go-build: go-serverless-build go-sam-build

go-serverless-build:
	cd golang && GOOS=linux GOARCH=arm64 go build -tags lambda.norpc -o bin/create/bootstrap ./lambdas/api/products/create && \
		GOOS=linux GOARCH=arm64 go build -tags lambda.norpc -o bin/get/bootstrap ./lambdas/api/products/get && \
		GOOS=linux GOARCH=arm64 go build -tags lambda.norpc -o bin/list/bootstrap ./lambdas/api/products/list && \
		GOOS=linux GOARCH=arm64 go build -tags lambda.norpc -o bin/update/bootstrap ./lambdas/api/products/update && \
		GOOS=linux GOARCH=arm64 go build -tags lambda.norpc -o bin/delete/bootstrap ./lambdas/api/products/delete && \
		cd bin && for dir in create get list update delete; do (cd $$dir && zip ../$$dir.zip bootstrap); done

go-sam-build:
	cd golang && sam build

# ── Clean ───────────────────────────────────────────

go-clean: go-serverless-clean go-sam-clean

go-serverless-clean:
	rm -rf golang/bin golang/.serverless

go-sam-clean:
	rm -rf golang/.aws-sam

# ── Test ────────────────────────────────────────────

go-test:
	cd golang && go test ./...

# ═══════════════════════════════════════════════════
# Integration Tests
# ═══════════════════════════════════════════════════

test\:local:
	./tests/test-all-endpoints.sh local

test\:prod:
	./tests/test-all-endpoints.sh prod