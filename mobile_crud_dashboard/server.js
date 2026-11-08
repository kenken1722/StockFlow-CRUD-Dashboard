const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const db = new sqlite3.Database("./dashboard.db");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    price REAL NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);
});

app.get("/api/products", (req, res) => {
  db.all("SELECT * FROM products ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post("/api/products", (req, res) => {
  const { name, category, quantity, price } = req.body;
  if (!name?.trim() || !category?.trim() || !Number.isInteger(Number(quantity)) || Number(quantity) < 0 || !Number.isFinite(Number(price)) || Number(price) < 0) {
    return res.status(400).json({ error: "Enter a name, category, valid quantity, and valid price." });
  }
  db.run(
    "INSERT INTO products (name, category, quantity, price) VALUES (?, ?, ?, ?)",
    [name.trim(), category.trim(), Number(quantity), Number(price)],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get("SELECT * FROM products WHERE id = ?", [this.lastID], (e, row) => {
        if (e) return res.status(500).json({ error: e.message });
        res.status(201).json(row);
      });
    }
  );
});

app.put("/api/products/:id", (req, res) => {
  const { name, category, quantity, price } = req.body;
  if (!name?.trim() || !category?.trim() || !Number.isInteger(Number(quantity)) || Number(quantity) < 0 || !Number.isFinite(Number(price)) || Number(price) < 0) {
    return res.status(400).json({ error: "Enter a name, category, valid quantity, and valid price." });
  }
  db.run(
    "UPDATE products SET name=?, category=?, quantity=?, price=? WHERE id=?",
    [name.trim(), category.trim(), Number(quantity), Number(price), req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (!this.changes) return res.status(404).json({ error: "Product not found." });
      db.get("SELECT * FROM products WHERE id=?", [req.params.id], (e, row) => {
        if (e) return res.status(500).json({ error: e.message });
        res.json(row);
      });
    }
  );
});

app.delete("/api/products/:id", (req, res) => {
  db.run("DELETE FROM products WHERE id=?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (!this.changes) return res.status(404).json({ error: "Product not found." });
    res.json({ message: "Product deleted." });
  });
});

app.get("/api/summary", (req, res) => {
  db.get(`SELECT COUNT(*) AS totalProducts,
    COALESCE(SUM(quantity),0) AS totalStock,
    COALESCE(SUM(quantity * price),0) AS inventoryValue
    FROM products`, [], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row);
    });
});

app.listen(PORT, "0.0.0.0", () => console.log(`Dashboard running on port ${PORT}`));
