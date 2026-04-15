const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

//middleweres
app.use(express.json());
app.use(express.static('public'));

const createdTasksPath = path.join(__dirname, 'task_created.json');
const completedTasksPath = path.join(__dirname, 'task_completed.json');

// Helper function to read tasks from a file
const readTasks = (filePath, callback) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return callback(null, []);
            }
            return callback(err);
        }
        try {
            const tasks = JSON.parse(data);
            callback(null, tasks);
        } catch (parseErr) {
            callback(parseErr);
        }
    });
};

// Helper function to write tasks to a file
const writeTasks = (filePath, tasks, callback) => {
    fs.writeFile(filePath, JSON.stringify(tasks, null, 2), callback);
};

// Get all created tasks
//app.get('/tasks', (req, res) 
app.get('/tasks', (req, res) => {
    readTasks(createdTasksPath, (err, tasks) => {
        if (err) {
            return res.status(500).send({ message: 'Error reading tasks.' });
        }
        res.send(tasks);
    });
});

// Create a new task
app.post('/tasks', (req, res) => {
    const { task, dueDate } = req.body;
    if (!task || !dueDate) {
        return res.status(400).send({ message: 'Task and due date are required.' });
    }

    readTasks(createdTasksPath, (err, tasks) => {
        if (err) {
            return res.status(500).send({ message: 'Error reading tasks.' });
        }

        const newTask = {
            id: Date.now(),
            createdDate: new Date().toISOString(),
            task,
            dueDate
        };

        tasks.push(newTask);

        writeTasks(createdTasksPath, tasks, (writeErr) => {
            if (writeErr) {
                return res.status(500).send({ message: 'Error saving task.' });
            }
            res.status(201).send(newTask);
        });
    });
});

// Complete a task
app.post('/tasks/complete/:id', (req, res) => {
    const taskId = parseInt(req.params.id, 10);

    readTasks(createdTasksPath, (err, createdTasks) => {
        if (err) {
            return res.status(500).send({ message: 'Error reading created tasks.' });
        }

        const taskIndex = createdTasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) {
            return res.status(404).send({ message: 'Task not found.' });
        }

        const [completedTask] = createdTasks.splice(taskIndex, 1);
        completedTask.completedDate = new Date().toISOString();

        readTasks(completedTasksPath, (readCompletedErr, completedTasks) => {
            if (readCompletedErr) {
                return res.status(500).send({ message: 'Error reading completed tasks.' });
            }

            completedTasks.push(completedTask);

            writeTasks(createdTasksPath, createdTasks, (writeCreatedErr) => {
                if (writeCreatedErr) {
                    return res.status(500).send({ message: 'Error updating created tasks.' });
                }

                writeTasks(completedTasksPath, completedTasks, (writeCompletedErr) => {
                    if (writeCompletedErr) {
                        return res.status(500).send({ message: 'Error saving completed task.' });
                    }
                    res.status(200).send(completedTask);
                });
            });
        });
    });
});

app.listen(port, () => {
    console.log(`Task manager app listening at http://localhost:${port}`);
});
