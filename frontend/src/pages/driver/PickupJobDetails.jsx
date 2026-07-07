import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AlertMessage from "../../components/AlertMessage";
import LoadingSpinner from "../../components/LoadingSpinner";
import StatusBadge from "../../components/StatusBadge";
import { assignmentService } from "../../services/assignmentService";

const PickupJobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [message, setMessage] = useState("");
  const [completeForm, setCompleteForm] = useState({ collection_notes: "", waste_quantity_collected: "", proof_photo: null });
  const [failureReason, setFailureReason] = useState("");

  const loadJob = () => {
    assignmentService.driverJobs().then((response) => {
      setJob(response.data.find((item) => String(item.id) === String(id)));
    });
  };

  useEffect(loadJob, [id]);

  const updateStatus = async (status) => {
    await assignmentService.updateStatus(id, status);
    setMessage("Status updated.");
    loadJob();
  };

  const completePickup = async (event) => {
    event.preventDefault();
    const data = new FormData();
    Object.entries(completeForm).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });
    await assignmentService.complete(id, data);
    setMessage("Pickup marked as collected.");
    loadJob();
  };

  const failPickup = async (event) => {
    event.preventDefault();
    await assignmentService.fail(id, failureReason);
    setMessage("Pickup marked as failed.");
    loadJob();
  };

  if (!job) return <LoadingSpinner />;

  return (
    <div className="content-card">
      <div className="d-flex justify-content-between gap-3">
        <div>
          <h1 className="h3">{job.location_name}</h1>
          <p className="text-muted">{job.district} · {job.waste_type}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>
      <AlertMessage type="success" message={message} />
      <p>{job.description}</p>
      <p><strong>Address:</strong> {job.address_details || "Not provided"}</p>
      <div className="d-flex flex-wrap gap-2 mb-4">
        <button className="btn btn-outline-primary" onClick={() => updateStatus("assigned")}>Assigned</button>
        <button className="btn btn-outline-secondary" onClick={() => updateStatus("on_the_way")}>On the way</button>
      </div>
      <div className="row g-4">
        <div className="col-lg-6">
          <form className="border rounded p-3" onSubmit={completePickup}>
            <h2 className="h5">Complete Pickup</h2>
            <label className="form-label">Waste quantity collected</label>
            <input className="form-control" type="number" name="waste_quantity_collected" value={completeForm.waste_quantity_collected} onChange={(e) => setCompleteForm({ ...completeForm, waste_quantity_collected: e.target.value })} />
            <label className="form-label mt-3">Collection notes</label>
            <textarea className="form-control" value={completeForm.collection_notes} onChange={(e) => setCompleteForm({ ...completeForm, collection_notes: e.target.value })}></textarea>
            <label className="form-label mt-3">Proof photo</label>
            <input className="form-control" type="file" accept="image/*" onChange={(e) => setCompleteForm({ ...completeForm, proof_photo: e.target.files[0] })} />
            <button className="btn btn-cleantrack mt-3">Mark Collected</button>
          </form>
        </div>
        <div className="col-lg-6">
          <form className="border rounded p-3" onSubmit={failPickup}>
            <h2 className="h5">Mark Failed</h2>
            <label className="form-label">Failure reason</label>
            <textarea className="form-control" value={failureReason} onChange={(e) => setFailureReason(e.target.value)} required></textarea>
            <button className="btn btn-outline-danger mt-3">Mark Failed</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PickupJobDetails;
