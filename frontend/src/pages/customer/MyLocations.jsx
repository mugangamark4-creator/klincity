import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { locationService } from "../../services/locationService";
import AlertMessage from "../../components/AlertMessage";
import LoadingSpinner from "../../components/LoadingSpinner";

const MyLocations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadLocations = async () => {
    setLoading(true);
    try {
      const response = await locationService.myLocations();
      setLocations(response.data);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Could not load locations";
      setMessage(errorMsg);
      console.error("Error loading locations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(loadLocations, []);

  const removeLocation = async (id) => {
    if (!window.confirm("Delete this location?")) return;
    try {
      await locationService.remove(id);
      setMessage("Location deleted.");
      await loadLocations();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Could not delete location";
      setMessage(errorMsg);
      console.error("Error deleting location:", error);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">My Locations</h1>
        <Link className="btn btn-cleantrack" to="/customer/locations/new">Add Location</Link>
      </div>
      <AlertMessage type={message.includes("deleted") ? "success" : "danger"} message={message} />
      {loading ? <LoadingSpinner /> : (
        <div className="row g-3">
          {locations.map((location) => (
            <div className="col-md-6 col-xl-4" key={location.id}>
              <div className="content-card h-100">
                <h2 className="h5">{location.location_name}</h2>
                <p className="text-muted mb-1">{location.location_type} · {location.district}</p>
                <p>{location.address_details || "No extra address details."}</p>
                <button className="btn btn-outline-danger btn-sm" onClick={() => removeLocation(location.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default MyLocations;
