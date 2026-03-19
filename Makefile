.PHONY: prepare \
       db\:up db\:down db\:seed \
       js-deploy js-serverless-deploy js-sam-deploy \
       js-server js-serverless-server js-sam-server \
       js-build js-serverless-build js-sam-build \
       js-clean js-serverless-clean js-sam-clean \
       js-test

# ── Prepare ─────────────────────────────────────────

prepare:
	. /usr/local/opt/nvm/nvm.sh && nvm install 18

# ── Database ────────────────────────────────────────

db\:up:
	docker-compose up -d

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

# ── Deploy ──────────────────────────────────────────

js-deploy: js-serverless-deploy js-sam-deploy

js-serverless-deploy:
	cd js && . /usr/local/opt/nvm/nvm.sh && nvm use 18 && npm ci && npx sls create_domain --stage prod || true && npx sls deploy --stage prod

js-sam-deploy:
	cd js && npm ci && PATH=$$PWD/node_modules/.bin:$$PATH sam build && sam deploy \
		--stack-name roastly-js-sam \
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
