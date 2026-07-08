import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AlertMessage from "../../components/AlertMessage";

const roleHome = {
  admin: "/admin",
  customer: "/customer",
  driver: "/driver",
  manager: "/manager"
};

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer"
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const validateForm = () => {
    if (!form.full_name.trim()) {
      setMessage("Full name is required");
      return false;
    }
    if (!form.email.trim()) {
      setMessage("Email is required");
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setMessage("Please enter a valid email address");
      return false;
    }
    if (!form.password || form.password.length < 6) {
      setMessage("Password must be at least 6 characters long");
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
      // Register also logs the user in because the backend returns a JWT.
      const user = await register(form);
      navigate(roleHome[user.role]);
    } catch (error) {
      // Handle different types of errors for better user feedback
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else if (error.response?.status) {
        setMessage(`Registration failed: ${error.response.status} error. Please try again.`);
      } else if (error.message) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage("Registration failed. Please check your connection and try again.");
      }
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="content-card">
            <h1 className="h3">Create Account</h1>
            <AlertMessage type="danger" message={message} />
            <form onSubmit={handleSubmit}>
              <label className="form-label mt-3">Full name</label>
              <input className="form-control" name="full_name" value={form.full_name} onChange={handleChange} required />
              <label className="form-label mt-3">Email</label>
              <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} required />
              <label className="form-label mt-3">Phone</label>
              <input className="form-control" name="phone" value={form.phone} onChange={handleChange} />
              <label className="form-label mt-3">Role</label>
              <select className="form-select" name="role" value={form.role} onChange={handleChange}>
                <option value="customer">Resident/Customer</option>
                <option value="driver">Driver/Collector</option>
                <option value="manager">Waste Company Manager</option>
              </select>
              <label className="form-label mt-3">Password</label>
              <input className="form-control" type="password" name="password" value={form.password} onChange={handleChange} required />
              <button className="btn btn-cleantrack w-100 mt-4" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </button>
            </form>
            <p className="mt-3 mb-0">Already have an account? <Link to="/login">Login</Link></p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Register;
