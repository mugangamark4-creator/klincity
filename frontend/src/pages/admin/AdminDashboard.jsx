import { useEffect, useState } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { adminService } from "../../services/adminService";

const labels = {
  total_pickup_requests: "Total pickups",
  pending_pickups: "Pending",
  completed_pickups: "Completed",
  failed_pickups: "Failed",
  active_trucks: "Active trucks",
  active_drivers: "Active drivers",
  waste_collected_this_month: "Waste this month"
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminService.stats().then((response) => setStats(response.data));
  }, []);

  if (!stats) return <LoadingSpinner />;

  return (
    <>
      <h1 className="h3">Admin Dashboard</h1>
      <div className="row g-3">
        {Object.entries(labels).map(([key, label]) => (
          <div className="col-6 col-lg-3" key={key}>
            <div className="stat-card">
              <div className="text-muted">{label}</div>
              <div className="h3 mb-0">{stats[key] || 0}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default AdminDashboard;
