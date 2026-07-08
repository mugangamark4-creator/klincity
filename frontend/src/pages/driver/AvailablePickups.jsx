import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { pickupService } from "../../services/pickupService";
import LoadingSpinner from "../../components/LoadingSpinner";
import StatusBadge from "../../components/StatusBadge";
import AlertMessage from "../../components/AlertMessage";

const AvailablePickups = () => {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [claimingId, setClaimingId] = useState(null);

  useEffect(() => {
    loadAvailablePickups();
  }, []);

  const loadAvailablePickups = () => {
    setLoading(true);
    pickupService
      .getAvailable()
      .then((response) => {
        setPickups(response.data);
        if (!response.data.length) {
          setMessage("No available pickups in your area");
        }
      })
      .catch((error) => {
        const errorMsg = error.response?.data?.message || "Could not load pickups";
        setMessage(errorMsg);
        console.error("Error loading pickups:", error);
      })
      .finally(() => setLoading(false));
  };

  const handleClaim = async (pickupId) => {
    setClaimingId(pickupId);
    try {
      await pickupService.claim(pickupId);
      setMessage("Pickup claimed successfully!");
      setTimeout(() => {
        loadAvailablePickups();
        setMessage("");
      }, 1500);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Could not claim pickup";
      setMessage(errorMsg);
      console.error("Error claiming pickup:", error);
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <>
      <h1 className="h3 mb-3">Available Pickups</h1>
      <AlertMessage type={message.includes("successfully") ? "success" : "danger"} message={message} />
      
      {loading ? (
        <LoadingSpinner text="Loading available pickups..." />
      ) : (
        <>
          {pickups.length === 0 ? (
            <div className="alert alert-info">No available pickups in your area right now</div>
          ) : (
            <div className="row g-3">
              {pickups.map((pickup) => (
                <div className="col-12 col-md-6" key={pickup.id}>
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title mb-0">{pickup.location_name}</h5>
                        <span className={`badge ${pickup.urgency === 'urgent' ? 'bg-danger' : 'bg-warning'}`}>
                          {pickup.urgency}
                        </span>
                      </div>
                      
                      <p className="text-muted small mb-3">
                        <strong>Customer:</strong> {pickup.customer_name}
                      </p>

                      <div className="row g-2 mb-3 small">
                        <div className="col-6">
                          <strong>Waste Type:</strong><br />
                          {pickup.waste_type}
                        </div>
                        <div className="col-6">
                          <strong>Bin Level:</strong><br />
                          {pickup.estimated_bin_level}%
                        </div>
                      </div>

                      {pickup.description && (
                        <div className="mb-3">
                          <strong>Details:</strong>
                          <p className="text-muted small mb-0">{pickup.description}</p>
                        </div>
                      )}

                      {pickup.photo && (
                        <div className="mb-3">
                          <img src={pickup.photo} alt="Bin" className="img-fluid rounded" style={{ maxHeight: "150px" }} />
                        </div>
                      )}

                      <p className="text-muted small mb-3">
                        Requested {new Date(pickup.created_at).toLocaleDateString()} at {new Date(pickup.created_at).toLocaleTimeString()}
                      </p>

                      <button
                        className="btn btn-cleantrack w-100"
                        onClick={() => handleClaim(pickup.id)}
                        disabled={claimingId === pickup.id}
                      >
                        {claimingId === pickup.id ? "Claiming..." : "Claim Pickup"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default AvailablePickups;
