//@ts-nocheck
import axios from "axios";
import i18n from "i18n";
import { API_URL } from "constants/constants";
import { getCookieFromBrowser, removeCookie } from "utils/session";
import { error as toastError } from "components/alert/toast";

const request = axios.create({
  baseURL: API_URL,
  // timeout: 16000,
});

// Add request interceptor
request.interceptors.request.use(
  (config) => {
    const token = getCookieFromBrowser("access_token");
    const locale = i18n.language;
    if (token) {
      config.headers.Authorization = token;
    }
    config.params = { lang: locale, ...config.params };
    return config;
  },
  (error) => Promise.reject(error)
);

// Centralized error handler
function errorHandler(error) {
  if (error?.response) {
    const { status } = error.response;

    // Handle unauthorized errors for authenticated pages only
    if (status === 401) {
      const isAuthRequired = error.config.headers?.Authorization; // Check if the request used an auth token
      if (isAuthRequired) {
        toastError(i18n.t("unauthorized"), { toastId: "unauthorized" });
        removeCookie("user");
        removeCookie("access_token");
        window.location.replace("/login");
      }
    } else if (status === 403) {
      toastError(i18n.t("forbidden_access"), { toastId: "forbidden" });
    }
  }

  console.error("Error =>", error);
  return Promise.reject(error.response || error);
}

// Add response interceptor
request.interceptors.response.use((response) => response.data, errorHandler);

export default request;
