import api from "./api";

export const feedbackService = {
  create: (data) => api.post("/feedback", data),
  byPickup: (pickupId) => api.get(`/feedback/pickup/${pickupId}`)
};
