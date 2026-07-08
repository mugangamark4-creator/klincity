import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AlertMessage from "../../components/AlertMessage";
import LoadingSpinner from "../../components/LoadingSpinner";
import { categoryService } from "../../services/categoryService";
import { pickupService } from "../../services/pickupService";

const ReportFullBin = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [form, setForm] = useState({
    location_name: "",
    district: "Kampala",
    waste_category_id: "",
    description: "",
    urgency: "normal",
    estimated_bin_level: 80,
    photo: null
  });

  useEffect(() => {
    categoryService.list()
      .then((categoryResponse) => {
        setCategories(categoryResponse.data.filter((item) => item.status === "active"));
      })
      .catch((error) => {
        const errorMsg = error.response?.data?.message || "Could not load categories";
        setMessage(errorMsg);
        console.error("Error loading data:", error);
      })
      .finally(() => setLoadingData(false));
  }, []);

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  const validateForm = () => {
    if (!form.location_name.trim()) {
      setMessage("Location name is required");
      return false;
    }
    if (!form.waste_category_id) {
      setMessage("Please select a waste type");
      return false;
    }
    if (!form.estimated_bin_level || form.estimated_bin_level < 1 || form.estimated_bin_level > 100) {
      setMessage("Estimated bin level must be between 1 and 100");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!validateForm()) {
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });

    setLoading(true);
    try {
      // FormData is used here because the pickup report can include a photo upload.
      await pickupService.create(data);
      navigate("/customer/pickups");
    } catch (error) {
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else if (error.message) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage("Could not report full bin. Please try again.");
      }
      console.error("Error creating pickup:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-card">
      <h1 className="h3">Report Full Bin</h1>
      <AlertMessage type="danger" message={message} />
      
      {loadingData ? (
        <LoadingSpinner text="Loading categories..." />
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Location Name *</label>
            <input 
              className="form-control" 
              type="text"
              name="location_name" 
              value={form.location_name} 
              onChange={handleChange}
              placeholder="Enter bin location (e.g., Main Street, Home, Office)"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">District *</label>
            <input 
              className="form-control" 
              type="text"
              name="district" 
              value={form.district} 
              onChange={handleChange}
              placeholder="Enter district (e.g., Kampala, Wakiso)"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Waste Type *</label>
            <select 
              className="form-select" 
              name="waste_category_id" 
              value={form.waste_category_id} 
              onChange={handleChange} 
              required
            >
              <option value="">Select waste type</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Urgency</label>
            <select 
              className="form-select" 
              name="urgency" 
              value={form.urgency} 
              onChange={handleChange}
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Estimated Bin Level (%) *</label>
            <input 
              className="form-control" 
              type="number" 
              min="1" 
              max="100" 
              name="estimated_bin_level" 
              value={form.estimated_bin_level} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea 
              className="form-control" 
              name="description" 
              value={form.description} 
              onChange={handleChange}
              placeholder="Provide any additional details about the full bin"
              rows="3"
            ></textarea>
          </div>

          <div className="mb-3">
            <label className="form-label">Photo</label>
            <input 
              className="form-control" 
              type="file" 
              name="photo" 
              accept="image/*" 
              onChange={handleChange} 
            />
          </div>

          <div className="mb-3">
            <button 
              type="submit"
              className="btn btn-cleantrack w-100"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Pickup Request"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ReportFullBin;
