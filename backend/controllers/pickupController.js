const pool = require("../config/db");

const createPickup = async (req, res) => {
  try {
    const { location_name, district, waste_category_id, description, urgency = "normal", estimated_bin_level } = req.body;

    if (!location_name || !district || !waste_category_id || !estimated_bin_level) {
      return res.status(400).json({ message: "Location name, district, waste type, and bin level are required" });
    }

    const photo = req.file ? `/uploads/pickup-photos/${req.file.filename}` : null;

    // Pickup requests start as pending until a driver claims them
    const [result] = await pool.query(
      `INSERT INTO pickup_requests
       (customer_id, location_name, district, waste_category_id, description, photo, urgency, estimated_bin_level, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [req.user.id, location_name, district, waste_category_id, description || null, photo, urgency, estimated_bin_level]
    );

    res.status(201).json({ message: "Pickup request created", id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: "Could not create pickup request", error: error.message });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const [requests] = await pool.query(
      `SELECT pr.id, pr.customer_id, pr.location_name, pr.district, pr.waste_category_id, 
              pr.description, pr.photo, pr.urgency, pr.estimated_bin_level, pr.status,
              pr.requested_at, pr.completed_at, pr.created_at, pr.updated_at,
              wc.name AS waste_type
       FROM pickup_requests pr
       JOIN waste_categories wc ON wc.id = pr.waste_category_id
       WHERE pr.customer_id = ?
       ORDER BY pr.created_at DESC`,
      [req.user.id]
    );
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Could not retrieve pickup requests", error: error.message });
  }
};

const getPickupById = async (req, res) => {
  try {
    const params = [req.params.id];
    let ownerClause = "";

    if (req.user.role === "customer") {
      ownerClause = "AND pr.customer_id = ?";
      params.push(req.user.id);
    } else if (req.user.role === "driver") {
      ownerClause = "AND (pa.driver_id = ? OR pr.status = 'pending')";
      params.push(req.user.id);
    }

    const [requests] = await pool.query(
      `SELECT pr.id, pr.customer_id, pr.location_name, pr.district, pr.waste_category_id, 
              pr.description, pr.photo, pr.urgency, pr.estimated_bin_level, pr.status,
              pr.requested_at, pr.completed_at, pr.created_at, pr.updated_at,
              wc.name AS waste_type,
              pa.id AS assignment_id, pa.driver_id, pa.truck_id, pa.status AS assignment_status,
              pa.collection_notes, pa.failure_reason, pa.waste_quantity_collected, pa.proof_photo
       FROM pickup_requests pr
       JOIN waste_categories wc ON wc.id = pr.waste_category_id
       LEFT JOIN pickup_assignments pa ON pa.pickup_request_id = pr.id
       WHERE pr.id = ? ${ownerClause}`,
      params
    );

    if (!requests.length) return res.status(404).json({ message: "Pickup request not found" });
    res.json(requests[0]);
  } catch (error) {
    res.status(500).json({ message: "Could not retrieve pickup request", error: error.message });
  }
};

const cancelPickup = async (req, res) => {
  try {
    const [result] = await pool.query(
      "UPDATE pickup_requests SET status = 'cancelled' WHERE id = ? AND customer_id = ? AND status = 'pending'",
      [req.params.id, req.user.id]
    );
    if (!result.affectedRows) {
      return res.status(400).json({ message: "Only your pending pickup requests can be cancelled" });
    }
    res.json({ message: "Pickup request cancelled" });
  } catch (error) {
    res.status(500).json({ message: "Could not cancel pickup request", error: error.message });
  }
};

const getPendingPickups = async (req, res) => {
  try {
    const [requests] = await pool.query(
      `SELECT pr.id, pr.customer_id, pr.location_name, pr.district, pr.waste_category_id, 
              pr.description, pr.photo, pr.urgency, pr.estimated_bin_level, pr.status,
              pr.requested_at, pr.created_at, pr.updated_at,
              wc.name AS waste_type, u.full_name AS customer_name
       FROM pickup_requests pr
       JOIN waste_categories wc ON wc.id = pr.waste_category_id
       JOIN users u ON u.id = pr.customer_id
       WHERE pr.status = 'pending'
       ORDER BY FIELD(pr.urgency, 'urgent', 'normal'), pr.created_at ASC`
    );
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Could not retrieve pending pickups", error: error.message });
  }
};

const getAvailablePickups = async (req, res) => {
  try {
    // Get driver's company info
    const [trucks] = await pool.query(
      `SELECT DISTINCT wc.district
       FROM trucks t
       JOIN waste_companies wc ON wc.id = t.company_id
       WHERE t.driver_id = ?`,
      [req.user.id]
    );

    if (!trucks.length) {
      return res.status(403).json({ message: "You are not assigned to any company" });
    }

    const district = trucks[0].district;

    // Get available pickups in the driver's district
    const [pickups] = await pool.query(
      `SELECT pr.id, pr.customer_id, pr.location_name, pr.district, pr.waste_category_id, 
              pr.description, pr.photo, pr.urgency, pr.estimated_bin_level, pr.status,
              pr.requested_at, pr.created_at, pr.updated_at,
              wc.name AS waste_type, u.full_name AS customer_name
       FROM pickup_requests pr
       JOIN waste_categories wc ON wc.id = pr.waste_category_id
       JOIN users u ON u.id = pr.customer_id
       WHERE pr.status = 'pending' AND pr.district = ?
       ORDER BY FIELD(pr.urgency, 'urgent', 'normal'), pr.created_at ASC`,
      [district]
    );

    res.json(pickups);
  } catch (error) {
    res.status(500).json({ message: "Could not retrieve available pickups", error: error.message });
  }
};

const claimPickup = async (req, res) => {
  try {
    const pickupId = req.params.id;

    // Verify driver belongs to a company
    const [trucks] = await pool.query(
      `SELECT t.company_id, wc.district
       FROM trucks t
       JOIN waste_companies wc ON wc.id = t.company_id
       WHERE t.driver_id = ?
       LIMIT 1`,
      [req.user.id]
    );

    if (!trucks.length) {
      return res.status(403).json({ message: "You are not assigned to any company" });
    }

    const companyId = trucks[0].company_id;
    const district = trucks[0].district;

    // Get the pickup and verify it exists and is in same district
    const [pickups] = await pool.query(
      `SELECT id, status, district FROM pickup_requests WHERE id = ?`,
      [pickupId]
    );

    if (!pickups.length) {
      return res.status(404).json({ message: "Pickup request not found" });
    }

    if (pickups[0].status !== 'pending') {
      return res.status(400).json({ message: "Pickup is no longer available" });
    }

    if (pickups[0].district !== district) {
      return res.status(403).json({ message: "This pickup is not in your service area" });
    }

    // Get an available truck for the driver
    const [availableTrucks] = await pool.query(
      `SELECT id FROM trucks WHERE driver_id = ? AND company_id = ? AND status = 'active' LIMIT 1`,
      [req.user.id, companyId]
    );

    if (!availableTrucks.length) {
      return res.status(400).json({ message: "No active truck assigned to you" });
    }

    const truckId = availableTrucks[0].id;

    // Create assignment
    const [result] = await pool.query(
      `INSERT INTO pickup_assignments (pickup_request_id, company_id, truck_id, driver_id, assigned_by, status)
       VALUES (?, ?, ?, ?, ?, 'assigned')`,
      [pickupId, companyId, truckId, req.user.id, req.user.id]
    );

    // Update pickup status
    await pool.query(
      `UPDATE pickup_requests SET status = 'assigned' WHERE id = ?`,
      [pickupId]
    );

    res.status(201).json({ message: "Pickup claimed successfully", assignmentId: result.insertId });
  } catch (error) {
    res.status(500).json({ message: "Could not claim pickup", error: error.message });
  }
};

module.exports = { createPickup, getMyRequests, getPickupById, cancelPickup, getPendingPickups, getAvailablePickups, claimPickup };
