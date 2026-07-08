import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { locationService } from "../../services/locationService";
import AlertMessage from "../../components/AlertMessage";

const AddLocation = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [locationName, setLocationName] = useState("");

  const validateForm = () => {
    if (!locationName.trim()) {
      setMessage("Location name is required");
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

    setLoading(true);
    try {
      await locationService.create({ location_name: locationName });
      navigate("/customer/locations");
    } catch (error) {
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else if (error.message) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage("Could not save location. Please try again.");
      }
      console.error("Location creation error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-card">
      <h1 className="h3">Add Location</h1>
      <AlertMessage type="danger" message={message} />
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Location Name *</label>
          <input 
            type="text"
            className="form-control" 
            value={locationName} 
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="Enter location name (e.g., Home, Office, School)"
            autoComplete="off"
          />
        </div>

        <div className="mb-3">
          <button 
            type="submit"
            className="btn btn-cleantrack w-100" 
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Location"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddLocation;
