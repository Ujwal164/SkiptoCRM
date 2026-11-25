import { Router } from "express";
import { pool } from "../config/db.js";

const router = Router();
const allowedStatuses = ["Lead", "Contacted", "Customer"];

function validateCustomer(body) {
  const { name, email, status = "Lead" } = body;
  if (!name?.trim() || !email?.trim()) {
    return "Name and email are required.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Please provide a valid email address.";
  }
  if (!allowedStatuses.includes(status)) {
    return "Status must be Lead, Contacted, or Customer.";
  }
  return null;
}

// GET /api/customers?search=...
router.get("/", async (req, res, next) => {
  try {
    const search = `%${(req.query.search || "").trim()}%`;
    const result = await pool.query(
      `SELECT * FROM customers
       WHERE name ILIKE $1 OR email ILIKE $1 OR company ILIKE $1
       ORDER BY created_at DESC`,
      [search]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// GET /api/customers/:id
router.get("/:id", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM customers WHERE id = $1",
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Customer not found." });
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST /api/customers
router.post("/", async (req, res, next) => {
  const validationError = validateCustomer(req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  const { name, email, phone, company, status = "Lead" } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO customers (name, email, phone, company, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name.trim(), email.trim().toLowerCase(), phone || null, company || null, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ error: "A customer with this email already exists." });
    next(error);
  }
});

// PUT /api/customers/:id
router.put("/:id", async (req, res, next) => {
  const validationError = validateCustomer(req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  const { name, email, phone, company, status = "Lead" } = req.body;
  try {
    const result = await pool.query(
      `UPDATE customers
       SET name = $1, email = $2, phone = $3, company = $4, status = $5
       WHERE id = $6 RETURNING *`,
      [name.trim(), email.trim().toLowerCase(), phone || null, company || null, status, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Customer not found." });
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ error: "A customer with this email already exists." });
    next(error);
  }
});

// DELETE /api/customers/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const result = await pool.query(
      "DELETE FROM customers WHERE id = $1 RETURNING id",
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: "Customer not found." });
    res.json({ message: "Customer deleted successfully." });
  } catch (error) {
    next(error);
  }
});

export default router;
