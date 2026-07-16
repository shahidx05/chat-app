import api from "../api/axios";

export const login = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const register = async (name, username, email, password) => {
  const response = await api.post("/auth/register", { name, username, email, password });
  return response.data;
}