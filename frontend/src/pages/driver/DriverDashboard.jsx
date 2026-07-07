import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import StatusBadge from "../../components/StatusBadge";
import { assignmentService } from "../../services/assignmentService";

const DriverDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    assignmentService.driverJobs().then((response) => setJobs(response.data)).finally(() => setLoading(false));
  }, []);

  const counts = {
    assigned: jobs.filter((job) => job.status === "assigned").length,
    on_the_way: jobs.filter((job) => job.status === "on_the_way").length,
    collected: jobs.filter((job) => job.status === "collected").length,
    failed: jobs.filter((job) => job.status === "failed").length
  };

  return (
    <>
      <h1 className="h3">Driver Dashboard</h1>
      {loading ? <LoadingSpinner /> : (
        <>
          <div className="row g-3 mb-4">
            {Object.entries(counts).map(([label, value]) => (
              <div className="col-6 col-lg-3" key={label}>
                <div className="stat-card">
                  <div className="text-muted text-capitalize">{label.replaceAll("_", " ")}</div>
                  <div className="h3 mb-0">{value}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead><tr><th>Location</th><th>Urgency</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {jobs.slice(0, 6).map((job) => (
                  <tr key={job.id}>
                    <td>{job.location_name}</td>
                    <td>{job.urgency}</td>
                    <td><StatusBadge status={job.status} /></td>
                    <td><Link className="btn btn-outline-success btn-sm" to={`/driver/jobs/${job.id}`}>Open</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
};

export default DriverDashboard;
