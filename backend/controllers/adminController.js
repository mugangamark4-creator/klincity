const pool = require("../config/db");

const getStats = async (req, res) => {
  try {
    const [[pickupStats]] = await pool.query(
      `SELECT
        COUNT(*) AS total_pickup_requests,
        SUM(status = 'pending') AS pending_pickups,
        SUM(status = 'collected') AS completed_pickups,
        SUM(status = 'failed') AS failed_pickups
       FROM pickup_requests`
    );

    const [[truckStats]] = await pool.query("SELECT COUNT(*) AS active_trucks FROM trucks WHERE status = 'active'");
    const [[driverStats]] = await pool.query("SELECT COUNT(*) AS active_drivers FROM users WHERE role = 'driver' AND status = 'active'");
    const [[wasteStats]] = await pool.query(
      `SELECT COALESCE(SUM(waste_quantity_collected), 0) AS waste_collected_this_month
       FROM pickup_assignments
       WHERE status = 'collected'
         AND MONTH(completed_at) = MONTH(CURRENT_DATE())
         AND YEAR(completed_at) = YEAR(CURRENT_DATE())`
    );

    res.json({ ...pickupStats, ...truckStats, ...driverStats, ...wasteStats });
  } catch (error) {
    res.status(500).json({ message: "Could not retrieve stats", error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, full_name, email, phone, role, status, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Could not retrieve users", error: error.message });
  }
};

const getPickups = async (req, res) => {
  try {
    const [pickups] = await pool.query(
      `SELECT pr.*, u.full_name AS customer_name, wc.name AS waste_type, cl.location_name, cl.district
       FROM pickup_requests pr
       JOIN users u ON u.id = pr.customer_id
       JOIN waste_categories wc ON wc.id = pr.waste_category_id
       JOIN customer_locations cl ON cl.id = pr.location_id
       ORDER BY pr.created_at DESC`
    );
    res.json(pickups);
  } catch (error) {
    res.status(500).json({ message: "Could not retrieve pickups", error: error.message });
  }
};

const getCompanies = async (req, res) => {
  try {
    const [companies] = await pool.query(
      `SELECT wc.*, u.full_name AS manager_name
       FROM waste_companies wc
       JOIN users u ON u.id = wc.manager_id
       ORDER BY wc.created_at DESC`
    );
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: "Could not retrieve companies", error: error.message });
  }
};

const getTrucks = async (req, res) => {
  try {
    const [trucks] = await pool.query(
      `SELECT t.*, wc.company_name, u.full_name AS driver_name
       FROM trucks t
       JOIN waste_companies wc ON wc.id = t.company_id
       LEFT JOIN users u ON u.id = t.driver_id
       ORDER BY t.created_at DESC`
    );
    res.json(trucks);
  } catch (error) {
    res.status(500).json({ message: "Could not retrieve trucks", error: error.message });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ message: "Status must be active or inactive" });
    }

    const [result] = await pool.query("UPDATE users SET status = ? WHERE id = ?", [status, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User status updated" });
  } catch (error) {
    res.status(500).json({ message: "Could not update user status", error: error.message });
  }
};

module.exports = { getStats, getUsers, getPickups, getCompanies, getTrucks, updateUserStatus };
