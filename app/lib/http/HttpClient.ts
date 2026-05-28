export type HttpRequestOptions = {
  searchParams?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
};

export interface HttpClient {
  get<TResponse>(
    pathOrUrl: string,
    options?: HttpRequestOptions,
  ): Promise<TResponse>;
}
