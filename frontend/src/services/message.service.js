import api from "../api/axios";

export const getMessages = async (id) => {
    const response = await api.get(`/messages/${id}`);
    return response.data;
};
