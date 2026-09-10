export const getAccessToken = (): string | null =>
  localStorage.getItem("accessToken") || localStorage.getItem("token");

export const authHeaders = (): { Authorization?: string } => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
