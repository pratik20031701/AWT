const fs = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "tasks.json");

function initDatabase() {
    if (!fs.existsSync(DB_FILE)) {
        const initialData = { pending: [], completed: [] };
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    }
}

function getAllTasks() {
    try {
        const data = fs.readFileSync(DB_FILE, "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading database:", error);
        return { pending: [], completed: [] };
    }
}

function addTask(task) {
    const data = getAllTasks();
    data.pending.push(task);
    saveDatabase(data);
    return data;
}

function completeTask(id) {
    const data = getAllTasks();
    if (data.pending[id]) {
        const task = data.pending[id];
        data.completed.push(task);
        data.pending.splice(id, 1);
        saveDatabase(data);
    }
    return data;
}

function deletePendingTask(id) {
    const data = getAllTasks();
    if (data.pending[id]) {
        data.pending.splice(id, 1);
        saveDatabase(data);
    }
    return data;
}

function deleteCompletedTask(id) {
    const data = getAllTasks();
    if (data.completed[id]) {
        data.completed.splice(id, 1);
        saveDatabase(data);
    }
    return data;
}

function saveDatabase(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error writing to database:", error);
    }
}

module.exports = {
    initDatabase,
    getAllTasks,
    addTask,
    completeTask,
    deletePendingTask,
    deleteCompletedTask
};
