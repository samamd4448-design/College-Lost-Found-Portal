const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./database");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve public folder
const publicFolder = path.join(__dirname, "public");
app.use(express.static(publicFolder));

// HTML pages
app.get("/", (req, res) => {
    res.sendFile(path.join(publicFolder, "index.html"));
});

app.get("/lost.html", (req, res) => {
    res.sendFile(path.join(publicFolder, "lost.html"));
});

app.get("/found.html", (req, res) => {
    res.sendFile(path.join(publicFolder, "found.html"));
});

app.get("/search.html", (req, res) => {
    res.sendFile(path.join(publicFolder, "search.html"));
});

// Test backend
app.get("/api/test", (req, res) => {
    res.json({ message: "Backend is working!" });
});

// Get all items
app.get("/api/items", (req, res) => {
    try {
        const items = db.prepare(
            "SELECT * FROM items ORDER BY id DESC"
        ).all();
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add Lost or Found item
app.post("/api/items", (req, res) => {
    const {
        student_name,
        item_name,
        category,
        location,
        item_date,
        description,
        type
    } = req.body;

    if (!student_name || !item_name || !type) {
        return res.status(400).json({
            message: "Please enter required details."
        });
    }

    try {
        const result = db.prepare(`
            INSERT INTO items
            (student_name, item_name, category, location,
             item_date, description, type)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            student_name,
            item_name,
            category || "",
            location || "",
            item_date || "",
            description || "",
            type
        );

        res.json({
            message: "Item saved successfully!",
            id: result.lastInsertRowid
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Lost items
app.get("/api/lost", (req, res) => {
    try {
        const items = db.prepare(
            "SELECT * FROM items WHERE type = ? ORDER BY id DESC"
        ).all("Lost");
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Found items
app.get("/api/found", (req, res) => {
    try {
        const items = db.prepare(
            "SELECT * FROM items WHERE type = ? ORDER BY id DESC"
        ).all("Found");
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Edit item
app.put("/api/items/:id", (req, res) => {
    try {
        const id = Number(req.params.id);
        const {
            student_name,
            item_name,
            category,
            location,
            item_date,
            description
        } = req.body;

        const result = db.prepare(`
            UPDATE items
            SET student_name = ?,
                item_name = ?,
                category = ?,
                location = ?,
                item_date = ?,
                description = ?
            WHERE id = ?
        `).run(
            student_name,
            item_name,
            category || "",
            location || "",
            item_date || "",
            description || "",
            id
        );

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Item not found!"
            });
        }

        res.json({ message: "Item updated successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete item
app.delete("/api/items/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        const result = db.prepare(
            "DELETE FROM items WHERE id = ?"
        ).run(id);

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Item not found!"
            });
        }

        res.json({ message: "Item deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log("Database connected successfully!");
    console.log(`Server running at http://localhost:${PORT}`);
});