const getHost = (): string => {
  if (typeof window !== "undefined" && window.location.hostname) {
    return window.location.hostname;
  }
  return "localhost";
};

const configuredApiUrl = import.meta.env.VITE_API_URL as string | undefined;

export const BACKEND_URL = (configuredApiUrl || `http://${getHost()}:9005`).replace(/\/+$/, "");
export const FRONTEND_URL = `http://${getHost()}:5173`;
