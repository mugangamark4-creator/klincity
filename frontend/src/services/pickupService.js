import api from "./api";

export const pickupService = {
  create: (formData) => api.post("/pickups", formData),
  myRequests: () => api.get("/pickups/my-requests"),
  getById: (id) => api.get(`/pickups/${id}`),
  cancel: (id) => api.put(`/pickups/${id}/cancel`),
  pending: () => api.get("/pickups/pending/all"),
  getAvailable: () => api.get("/pickups/available"),
  claim: (id) => api.post(`/pickups/${id}/claim`)
};
