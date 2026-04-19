import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

interface RetryConfig extends AxiosRequestConfig {
  __slowTimer?: ReturnType<typeof setTimeout>;
  __retryCount?: number;
}

let onSlowResponse: ((isSlow: boolean) => void) | null = null;

export const setSlowResponseHandler = (handler: (isSlow: boolean) => void) => {
  onSlowResponse = handler;
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 65000,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const retryConfig = config as RetryConfig;
  const timer = setTimeout(() => {
    onSlowResponse?.(true);
  }, 3000);
  retryConfig.__slowTimer = timer;
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const retryConfig = response.config as RetryConfig;
    clearTimeout(retryConfig.__slowTimer);
    onSlowResponse?.(false);
    return response;
  },
  async (error) => {
    const config = error.config as RetryConfig;
    clearTimeout(config.__slowTimer);

    if (error.response?.status === 500 && (config.__retryCount ?? 0) < 2) {
      config.__retryCount = (config.__retryCount ?? 0) + 1;
      onSlowResponse?.(true);
      await new Promise((res) => setTimeout(res, 5000));
      return apiClient(config);
    }

    onSlowResponse?.(false);
    return Promise.reject(error);
  },
);
