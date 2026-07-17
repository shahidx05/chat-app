import api from "../api/axios";

export const getUsers = async () => {
  const response = await api.get("/users");
  return response.data;
}