import axios from "axios";
import { clearStoredTokens, getStoredTokens, setStoredTokens, syncAccessTokenCookie } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const { access } = getStoredTokens();
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  // Multipart (CIN, photos produit) : laisser axios définir le boundary
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const { refresh } = getStoredTokens();
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refresh,
          });
          setStoredTokens(data.access_token, data.refresh_token);
          syncAccessTokenCookie();
          original.headers.Authorization = `Bearer ${data.access_token}`;
          return api(original);
        } catch {
          clearStoredTokens();
        }
      }
    }
    return Promise.reject(error);
  }
);

export function formatPrice(amount: number, locale = "fr"): string {
  return (
    new Intl.NumberFormat(locale === "ar" ? "ar-MA" : "fr-MA", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + " DH"
  );
}
