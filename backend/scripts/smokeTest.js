const axios = require("axios");
const FormData = require("form-data");

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000,
});

const print = (label, value) => {
  console.log(`\n=== ${label} ===`);
  if (typeof value === "string") {
    console.log(value);
  } else {
    console.dir(value, { depth: 4 });
  }
};

const login = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

const test = async () => {
  try {
    print("Customer login", "Logging in as customer@cleantrack.ug");
    const customer = await login("customer@cleantrack.ug", "password123");
    print("Customer token", customer.token.slice(0, 20) + "...");
    api.defaults.headers.common.Authorization = `Bearer ${customer.token}`;

    print("List categories", "Fetching waste categories...");
    const categoriesResponse = await api.get("/categories");
    const categories = categoriesResponse.data;
    print("Categories count", categories.length);
    const categoryId = categories.find((c) => c.status === "active")?.id;
    if (!categoryId) throw new Error("No active waste category found");

    print("Create pickup", "Submitting a new pickup request...");
    const form = new FormData();
    form.append("location_name", "Smoke Test Customer Home");
    form.append("district", "Kampala");
    form.append("waste_category_id", categoryId);
    form.append("description", "Smoke test pickup request");
    form.append("urgency", "normal");
    form.append("estimated_bin_level", "80");

    const createResponse = await api.post("/pickups", form, {
      headers: form.getHeaders(),
    });
    print("Pickup create", createResponse.data);
    const pickupId = createResponse.data.id;
    if (!pickupId) throw new Error("Pickup creation returned no ID");

    print("My pickup requests", "Fetching customer pickup requests...");
    const myRequests = await api.get("/pickups/my-requests");
    const found = myRequests.data.find((r) => r.id === pickupId);
    if (!found) throw new Error("Created pickup request not found in my requests");
    print("Created pickup status", found.status);

    print("Driver login", "Logging in as driver1@cleantrack.ug");
    const driver = await login("driver1@cleantrack.ug", "password123");
    api.defaults.headers.common.Authorization = `Bearer ${driver.token}`;

    print("Available pickups", "Fetching available pickups for driver...");
    const available = await api.get("/pickups/available");
    const availablePickup = available.data.find((r) => r.id === pickupId);
    if (!availablePickup) throw new Error("New pickup not visible to driver as available");
    print("Available pickup found", availablePickup.id);

    print("Claim pickup", "Driver claiming the new pickup...");
    const claim = await api.post(`/pickups/${pickupId}/claim`);
    print("Claim response", claim.data);

    print("Admin login", "Logging in as admin@cleantrack.ug");
    const admin = await login("admin@cleantrack.ug", "password123");
    api.defaults.headers.common.Authorization = `Bearer ${admin.token}`;

    print("Admin stats", "Fetching admin dashboard stats...");
    const stats = await api.get("/admin/stats");
    print("Admin stats response", stats.data);

    print("Success", "Smoke test completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Smoke test failed:", error.response?.data || error.message || error);
    process.exit(1);
  }
};

test();
