import api from "./axiosConfig";

export const pingBackend = async () => {
  const response = await api.get("/api/ping");
  return response.data;
};