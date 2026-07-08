const pool = require("../config/db");

const createLocation = async (req, res) => {
  try {
    const {
      location_name,
      location_type,
      district,
      division_or_subcounty,
      parish,
      village_or_zone,
      address_details,
      latitude,
      longitude
    } = req.body;

    if (!location_name || !location_type || !district) {
      return res.status(400).json({ message: "Location name, type, and district are required" });
    }

    // The logged-in user's id becomes user_id, so customers cannot create locations for others.
    const [result] = await pool.query(
      `INSERT INTO customer_locations
       (user_id, location_name, location_type, district, division_or_subcounty, parish, village_or_zone, address_details, latitude, longitude)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        location_name,
        location_type,
        district,
        division_or_subcounty || null,
        parish || null,
        village_or_zone || null,
        address_details || null,
        latitude || null,
        longitude || null
      ]
    );

    res.status(201).json({ message: "Location created", id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: "Could not create location", error: error.message });
  }
};

const getMyLocations = async (req, res) => {
  try {
    const [locations] = await pool.query(
      "SELECT * FROM customer_locations WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: "Could not retrieve locations", error: error.message });
  }
};

const getLocationById = async (req, res) => {
  try {
    const [locations] = await pool.query(
      "SELECT * FROM customer_locations WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    if (!locations.length) return res.status(404).json({ message: "Location not found" });
    res.json(locations[0]);
  } catch (error) {
    res.status(500).json({ message: "Could not retrieve location", error: error.message });
  }
};

const updateLocation = async (req, res) => {
  try {
    const {
      location_name,
      location_type,
      district,
      division_or_subcounty,
      parish,
      village_or_zone,
      address_details,
      latitude,
      longitude
    } = req.body;

    if (!location_name || !location_type || !district) {
      return res.status(400).json({ message: "Location name, type, and district are required" });
    }

    const [result] = await pool.query(
      `UPDATE customer_locations
       SET location_name = ?, location_type = ?, district = ?, division_or_subcounty = ?, parish = ?,
           village_or_zone = ?, address_details = ?, latitude = ?, longitude = ?
       WHERE id = ? AND user_id = ?`,
      [
        location_name,
        location_type,
        district,
        division_or_subcounty || null,
        parish || null,
        village_or_zone || null,
        address_details || null,
        latitude || null,
        longitude || null,
        req.params.id,
        req.user.id
      ]
    );

    if (!result.affectedRows) return res.status(404).json({ message: "Location not found" });
    res.json({ message: "Location updated" });
  } catch (error) {
    res.status(500).json({ message: "Could not update location", error: error.message });
  }
};

const deleteLocation = async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM customer_locations WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: "Location not found" });
    res.json({ message: "Location deleted" });
  } catch (error) {
    res.status(500).json({ message: "Could not delete location", error: error.message });
  }
};

module.exports = { createLocation, getMyLocations, getLocationById, updateLocation, deleteLocation };
