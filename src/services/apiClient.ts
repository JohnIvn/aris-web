import axios from "axios";
import getBaseUrl from "@/utils/GetBaseUrl";

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15_000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  transformRequest: [
    (data, headers) => {
      if (typeof FormData !== "undefined" && data instanceof FormData) {
        delete headers["Content-Type"];
        return data;
      }
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
    typeof window === "undefined"
      ? null
      : localStorage.getItem("aris-token") || sessionStorage.getItem("aris-token");
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

      if (error.response?.status === 401) {
        const url = error.config?.url ?? "";
        if (!url.includes("/auth/signin") && !url.includes("/auth/verify")) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("aris-user");
            localStorage.removeItem("aris-token");
            sessionStorage.removeItem("aris-user");
            sessionStorage.removeItem("aris-token");
            window.dispatchEvent(new CustomEvent("aris:session-expired"));
          }
        }
      }
    } else {
      console.error("[ARIS API ERROR]", error);
    }
    return Promise.reject(error);
  },
);
