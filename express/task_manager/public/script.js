document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const dueDateInput = document.getElementById('due-date-input');
    const taskList = document.getElementById('task-list');

    // Fetch and display tasks
    const fetchTasks = async () => {
        try {
            const response = await fetch('/tasks');
            const tasks = await response.json();
            renderTasks(tasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    // Render tasks in the list
    const renderTasks = (tasks) => {
        taskList.innerHTML = '';
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.setAttribute('data-id', task.id);

            const taskDetails = document.createElement('div');
            taskDetails.className = 'task-details';

            const taskText = document.createElement('div');
            taskText.className = 'task-text';
            taskText.textContent = task.task;

            const dueDate = document.createElement('div');
            dueDate.className = 'due-date';
            dueDate.textContent = `Due: ${new Date(task.dueDate).toLocaleDateString()}`;

            taskDetails.appendChild(taskText);
            taskDetails.appendChild(dueDate);

            const actions = document.createElement('div');
            actions.className = 'actions';

            const completeButton = document.createElement('button');
            completeButton.className = 'complete-btn';
            completeButton.textContent = 'Complete';
            completeButton.addEventListener('click', () => completeTask(task.id));

            actions.appendChild(completeButton);

            li.appendChild(taskDetails);
            li.appendChild(actions);

            taskList.appendChild(li);
        });
    };

    // Create a new task
    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const task = taskInput.value;
        const dueDate = dueDateInput.value;

        try {
            const response = await fetch('/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ task, dueDate }),
            });

            if (response.ok) {
                taskInput.value = '';
                dueDateInput.value = '';
                fetchTasks();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error creating task:', error);
        }
    });

    // Complete a task
    const completeTask = async (id) => {
        try {
            const response = await fetch(`/tasks/complete/${id}`, {
                method: 'POST',
            });

            if (response.ok) {
                fetchTasks();
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error completing task:', error);
        }
    };

    // Initial fetch of tasks
    fetchTasks();
});
