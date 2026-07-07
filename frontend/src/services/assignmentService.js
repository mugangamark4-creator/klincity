import api from "./api";

export const assignmentService = {
  create: (data) => api.post("/assignments", data),
  driverJobs: () => api.get("/assignments/driver/my-jobs"),
  companyJobs: () => api.get("/assignments/company/my-jobs"),
  updateStatus: (id, status) => api.put(`/assignments/${id}/status`, { status }),
  complete: (id, formData) => api.put(`/assignments/${id}/complete`, formData, { headers: { "Content-Type": "multipart/form-data" } }),
  fail: (id, failure_reason) => api.put(`/assignments/${id}/failed`, { failure_reason })
};
