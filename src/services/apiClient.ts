import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:3000",
  timeout: 15_000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  transformRequest: [
    (data, headers) => {
      if (data && typeof data === "object") {
        headers["Content-Type"] = "application/json";
        return JSON.stringify(data);
      }
      return data;
    },
  ],
});

apiClient.interceptors.request.use((config) => {
  const token =
    typeof sessionStorage === "undefined"
      ? null
      : sessionStorage.getItem("aris-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  console.log("[ARIS API REQUEST]", {
    method: config.method?.toUpperCase() ?? "GET",
    url: `${config.baseURL ?? ""}${config.url ?? ""}`,
    hasBearerToken: Boolean(token),
  });

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log("[ARIS API RESPONSE]", {
      method: response.config.method?.toUpperCase() ?? "GET",
      url: `${response.config.baseURL ?? ""}${response.config.url ?? ""}`,
      status: response.status,
    });
    return response;
  },
  (error: unknown) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }
    if (axios.isAxiosError(error)) {
      console.error("[ARIS API ERROR]", {
        method: error.config?.method?.toUpperCase() ?? "GET",
        url: `${error.config?.baseURL ?? ""}${error.config?.url ?? ""}`,
        code: error.code,
        status: error.response?.status,
        response: error.response?.data,
        message: error.message,
      });
    } else {
      console.error("[ARIS API ERROR]", error);
    }
    return Promise.reject(error);
  },
);
