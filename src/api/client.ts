import axios, {
  isAxiosError,
  type AxiosError,
  type AxiosRequestConfig,
} from "axios";
import type {
  ApiCallResponse,
  ServerDownEventDetail,
} from "../lib/data/http.types";

export function getBaseUrl(): string {
  const raw = import.meta.env.VITE_SERVER_URL || import.meta.env.VITE_LOCAL_URL;

  if (raw && typeof raw === "string") {
    return raw.startsWith("http://") || raw.startsWith("https://")
      ? raw
      : `http://${raw}`;
  }

  return "http://localhost:3000";
}

const SERVER_DOWN_EVENT = "app:server-down";
const DEFAULT_TIMEOUT_MS = 15_000;

function devLog(...args: unknown[]) {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
}

function dispatchServerDown(endpoint: string, reason: "network" | "timeout") {
  window.dispatchEvent(
    new CustomEvent<ServerDownEventDetail>(SERVER_DOWN_EVENT, {
      detail: { endpoint, reason, timestamp: Date.now() },
    }),
  );
}

let getAccessToken: () => string | null = () => null;
export function registerAccessTokenGetter(getter: () => string | null) {
  getAccessToken = getter;
}

export const apiClient = axios.create({
  timeout: DEFAULT_TIMEOUT_MS,
});

apiClient.interceptors.request.use((config) => {
  config.baseURL = getBaseUrl();

  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

interface RawEnvelope<T> {
  ok?: boolean;
  status?: string;
  data?: T;
  message?: string;
  error?: string;
}

interface ApiCallOptions<T> extends Omit<AxiosRequestConfig, "url"> {
  transformCallback?: (data: unknown) => T;
  src?: string;
  timeoutMs?: number;
}

export async function httpRequest<T>(
  endpoint: string,
  options: ApiCallOptions<T> = {},
): Promise<ApiCallResponse<T> & { serverDown?: boolean }> {
  const { transformCallback, src, timeoutMs, method, ...rest } = options;

  if (src) {
    devLog(`API Call From: ${src}`);
  }

  try {
    const response = await apiClient.request<RawEnvelope<T>>({
      url: endpoint,
      method: method ?? "GET",
      timeout: timeoutMs ?? DEFAULT_TIMEOUT_MS,
      ...rest,
    });

    devLog("API Response:", { endpoint, options, response });

    if (
      response.status === 204 ||
      response.data == null ||
      response.data === ("" as never)
    ) {
      return { status: "success", ok: true, data: null as T, error: null };
    }

    const responseData = response.data;

    if (responseData.ok === false || responseData.error) {
      return {
        status: responseData.status ?? "error",
        ok: false,
        data: (responseData.data ?? null) as T,
        error: responseData.message ?? responseData.error ?? "Request failed",
      };
    }

    const transformedData = transformCallback
      ? transformCallback(responseData.data)
      : responseData.data;

    return {
      status: responseData.status ?? "success",
      ok: true,
      data: transformedData as T,
      error: null,
    };
  } catch (error) {
    return handleError<T>(error, endpoint, options);
  }
}

function handleError<T>(
  error: unknown,
  endpoint: string,
  options: ApiCallOptions<T>,
): ApiCallResponse<T> & { serverDown?: boolean } {
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<RawEnvelope<T>>;

    if (axiosError.response) {
      const body = axiosError.response.data;
      devLog("API Response:", {
        endpoint,
        options,
        response: axiosError.response,
      });
      return {
        status: body?.status ?? "error",
        ok: false,
        data: (body?.data ?? null) as T,
        error:
          body?.message ??
          body?.error ??
          axiosError.message ??
          "Request failed",
      };
    }

    if (axiosError.code === "ERR_CANCELED") {
      return {
        status: "error",
        ok: false,
        data: null as T,
        error: "Request canceled",
      };
    }

    const timedOut = axiosError.code === "ECONNABORTED";
    console.error("Fetch failed:", axiosError);
    dispatchServerDown(endpoint, timedOut ? "timeout" : "network");

    return {
      status: "error",
      ok: false,
      data: null as T,
      error: timedOut
        ? "Request timed out"
        : axiosError.message || "Error fetching data",
      serverDown: true,
    };
  }

  console.error("Fetch failed:", error);
  return {
    status: "error",
    ok: false,
    data: null as T,
    error: error instanceof Error ? error.message : "Error fetching data",
  };
}
