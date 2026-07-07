import api from "./api";

export const truckService = {
  create: (data) => api.post("/trucks", data),
  companyTrucks: () => api.get("/trucks/company"),
  update: (id, data) => api.put(`/trucks/${id}`, data),
  remove: (id) => api.delete(`/trucks/${id}`)
};
