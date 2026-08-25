const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error("VITE_API_BASE_URL chưa được cấu hình.");
}

export const env = {
  apiBaseUrl: apiBaseUrl.replace(/\/+$/, ""),
};