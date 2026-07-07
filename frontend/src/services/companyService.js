import api from "./api";

export const companyService = {
  create: (data) => api.post("/companies", data),
  myCompany: () => api.get("/companies/my-company"),
  update: (id, data) => api.put(`/companies/${id}`, data)
};
