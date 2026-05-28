import ky, { type KyInstance } from "ky";
import type { HttpClient, HttpRequestOptions } from "./HttpClient";

type CreateKyHttpClientParams = {
  baseUrl: string;
  timeoutMs?: number;
};

export function createKyHttpClient({
  baseUrl,
  timeoutMs = 10_000,
}: CreateKyHttpClientParams): HttpClient {
  const client = ky.create({
    baseUrl,
    timeout: timeoutMs,
    retry: {
      limit: 2,
      methods: ["get"],
      statusCodes: [429, 500, 502, 503, 504],
    },
    hooks: {
      beforeRequest: [
        ({ request }) => {
          request.headers.set("Accept", "application/json");
        },
      ],
    },
  });

  return new KyHttpClient(client);
}

class KyHttpClient implements HttpClient {
  constructor(private readonly client: KyInstance) {}

  async get<TResponse>(
    pathOrUrl: string,
    options?: HttpRequestOptions,
  ): Promise<TResponse> {
    return this.client
      .get(pathOrUrl, {
        searchParams: options?.searchParams,
        signal: options?.signal,
      })
      .json<TResponse>();
  }
}
