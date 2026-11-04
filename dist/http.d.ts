export interface HttpClientOptions {
    apiKey: string;
    baseURL: string;
    timeoutMs: number;
    maxRetries: number;
}
export declare class HttpClient {
    private readonly apiKey;
    private readonly baseURL;
    private readonly timeoutMs;
    private readonly maxRetries;
    constructor(options: HttpClientOptions);
    request<T>(method: "GET" | "POST" | "PATCH" | "DELETE", path: string, body?: unknown, customHeaders?: Record<string, string>): Promise<T>;
    private delay;
}
//# sourceMappingURL=http.d.ts.map