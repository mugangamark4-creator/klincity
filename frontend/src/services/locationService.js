import api from "./api";

export const locationService = {
  create: (data) => api.post("/locations", data),
  myLocations: () => api.get("/locations/my-locations"),
  getById: (id) => api.get(`/locations/${id}`),
  update: (id, data) => api.put(`/locations/${id}`, data),
  remove: (id) => api.delete(`/locations/${id}`)
};
