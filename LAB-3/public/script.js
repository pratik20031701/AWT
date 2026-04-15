async function loadTasks() {
    const res = await fetch("/tasks");
    const data = await res.json();

    const pending = document.getElementById("pending");
    const completed = document.getElementById("completed");

    pending.innerHTML = "";
    completed.innerHTML = "";

    data.pending.forEach((task, i) => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${task}
            <span class="actions">
                <a class="done" href="/done/${i}">✔</a>
                <a class="delete" href="/delete-pending/${i}">✖</a>
            </span>
        `;
        pending.appendChild(li);
    });

    data.completed.forEach((task, i) => {
        const li = document.createElement("li");
        li.classList.add("completed");
        li.innerHTML = `
            ${task}
            <span class="actions">
                <a class="delete" href="/delete-completed/${i}">✖</a>
            </span>
        `;
        completed.appendChild(li);
    });
}

loadTasks();
