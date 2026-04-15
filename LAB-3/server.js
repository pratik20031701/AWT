const express = require("express");
const path = require("path");
const db = require("./database");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Initialize database on startup
db.initDatabase();

app.get("/tasks", (req, res) => {
    const tasks = db.getAllTasks();
    res.json(tasks);
});

app.post("/add", (req, res) => {
    db.addTask(req.body.task);
    res.redirect("/");
});

app.get("/done/:id", (req, res) => {
    db.completeTask(req.params.id);
    res.redirect("/");
});

app.get("/delete-pending/:id", (req, res) => {
    db.deletePendingTask(req.params.id);
    res.redirect("/");
});

app.get("/delete-completed/:id", (req, res) => {
    db.deleteCompletedTask(req.params.id);
    res.redirect("/");
});

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});
