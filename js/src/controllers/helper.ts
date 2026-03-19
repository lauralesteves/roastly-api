import { APIGatewayProxyResultV2 } from 'aws-lambda';

export const messages = {
  ALLOW: 'Allow',
  DENY: 'Deny',
};

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

interface ResponseOptions {
  payload?: unknown;
  statusCode: number;
  headers?: Record<string, string>;
}

const custom = ({ payload, statusCode, headers }: ResponseOptions): APIGatewayProxyResultV2 => {
  const result: APIGatewayProxyResultV2 = {
    statusCode,
    body: payload ? JSON.stringify(payload) : '',
    headers: headers ? { ...DEFAULT_HEADERS, ...headers } : DEFAULT_HEADERS,
  };

  console.info(`END ${JSON.stringify(result, null, 2)}`);
  return result;
};

// --- 200s
export const ok = ({ payload, headers = {} }: Pick<ResponseOptions, 'payload' | 'headers'> = {}) =>
  custom({ payload, statusCode: 200, headers });

export const created = () => custom({ statusCode: 201 });

// --- 400s
export const badRequest = ({
  payload,
  headers = {},
}: Pick<ResponseOptions, 'payload' | 'headers'> = {}) =>
  custom({ payload, statusCode: 400, headers });

export const unauthorized = ({ headers }: Pick<ResponseOptions, 'headers'> = {}) =>
  custom({ statusCode: 401, headers });

export const forbidden = ({ headers }: Pick<ResponseOptions, 'headers'> = {}) =>
  custom({ statusCode: 403, headers });

export const notFound = ({ headers }: Pick<ResponseOptions, 'headers'> = {}) =>
  custom({ statusCode: 404, headers });

export const notAcceptable = ({ headers }: Pick<ResponseOptions, 'headers'> = {}) =>
  custom({ statusCode: 406, headers });

export const unprocessableEntity = ({
  payload,
  headers = {},
}: Pick<ResponseOptions, 'payload' | 'headers'> = {}) =>
  custom({ payload, statusCode: 422, headers });

export const tooManyRequests = ({
  payload,
  headers = {},
}: Pick<ResponseOptions, 'payload' | 'headers'> = {}) =>
  custom({ payload, statusCode: 429, headers });

export const serverError = ({ headers }: Pick<ResponseOptions, 'headers'> = {}) =>
  custom({ statusCode: 500, headers });

interface AuthorizeResponseOptions {
  principalId?: string;
  effect: 'Allow' | 'Deny';
  resource: string;
  data?: Record<string, unknown>;
}

interface AuthPolicyDocument {
  Version: string;
  Statement: Array<{
    Action: string | string[];
    Effect: 'Allow' | 'Deny';
    Resource: string | string[];
  }>;
}

interface AuthResponseContext {
  context: string;
}

interface AuthResponse {
  principalId: string;
  context: AuthResponseContext;
  policyDocument?: AuthPolicyDocument;
}

export const authorizeResponse = ({
  principalId = 'user',
  effect,
  resource,
  data = {},
}: AuthorizeResponseOptions): AuthResponse => {
  const authResponse: AuthResponse = {
    principalId,
    context: {
      context: JSON.stringify(data),
    },
  };

  if (effect && resource) {
    authResponse.policyDocument = {
      Version: '2012-10-17',
      Statement: [
        {
          Action: ['execute-api:Invoke'],
          Effect: effect,
          Resource: [resource],
        },
      ],
    };
  }

  return authResponse;
};
