const pool = require("../config/db");

const getCategories = async (req, res) => {
  try {
    const [categories] = await pool.query("SELECT * FROM waste_categories ORDER BY name ASC");
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Could not retrieve categories", error: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description, status = "active" } = req.body;
    if (!name) return res.status(400).json({ message: "Category name is required" });

    const [result] = await pool.query(
      "INSERT INTO waste_categories (name, description, status) VALUES (?, ?, ?)",
      [name, description || null, status]
    );

    res.status(201).json({ message: "Waste category created", id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: "Could not create category", error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const [result] = await pool.query(
      "UPDATE waste_categories SET name = ?, description = ?, status = ? WHERE id = ?",
      [name, description || null, status || "active", req.params.id]
    );

    if (!result.affectedRows) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Waste category updated" });
  } catch (error) {
    res.status(500).json({ message: "Could not update category", error: error.message });
  }
};

module.exports = { getCategories, createCategory, updateCategory };
