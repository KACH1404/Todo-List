const API_URL = "http://127.0.0.1:8000/tasks";

document.addEventListener("DOMContentLoaded", loadTasks);

async function loadTasks() {
    const searchKeyword = document.getElementById("searchInput").value;
    const statusType = document.getElementById("statusFilter").value;
    const list = document.getElementById("taskList");

    try {
        const url = `${API_URL}?search=${encodeURIComponent(searchKeyword)}&status=${statusType}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Không tải được danh sách công việc");

        const tasks = await res.json();
        list.innerHTML = "";

        if (tasks.length === 0) {
            list.innerHTML = `<li class="empty-state">Không có công việc nào</li>`;
            return;
        }

        tasks.forEach((task) => list.appendChild(renderTaskItem(task)));
    } catch (err) {
        list.innerHTML = `<li class="empty-state">Không kết nối được tới server. Kiểm tra lại backend đã chạy chưa.</li>`;
        console.error(err);
    }
}

function renderTaskItem(task) {
    const li = document.createElement("li");

    const content = document.createElement("div");
    content.className = "task-content";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.is_completed;
    checkbox.onclick = () => toggleTask(task.id);

    const span = document.createElement("span");
    span.className = task.is_completed ? "completed" : "";
    span.textContent = task.title;

    content.appendChild(checkbox);
    content.appendChild(span);

    const btnGroup = document.createElement("div");
    btnGroup.className = "btn-group";

    const editBtn = document.createElement("button");
    editBtn.className = "edit-btn";
    editBtn.textContent = "Sửa";
    editBtn.onclick = () => editTask(task.id, task.title);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Xóa";
    deleteBtn.onclick = () => deleteTask(task.id);

    btnGroup.appendChild(editBtn);
    btnGroup.appendChild(deleteBtn);

    li.appendChild(content);
    li.appendChild(btnGroup);
    return li;
}

async function addTask() {
    const input = document.getElementById("taskInput");
    const title = input.value.trim();

    if (!title) {
        alert("Vui lòng nhập công việc!");
        return;
    }

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title }),
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(layThongBaoLoi(data, "Thêm công việc thất bại"));
        }

        input.value = "";
        loadTasks();
    } catch (err) {
        alert(err.message);
    }
}

async function toggleTask(id) {
    try {
        const res = await fetch(`${API_URL}/${id}/toggle`, { method: "PUT" });
        if (!res.ok) throw new Error("Không thể cập nhật trạng thái");
        loadTasks();
    } catch (err) {
        alert(err.message);
    }
}

async function editTask(id, currentTitle) {
    const newTitle = prompt("Chỉnh sửa tiêu đề công việc:", currentTitle);
    if (newTitle === null) return;
    if (!newTitle.trim()) {
        alert("Tiêu đề sửa không được để trống!");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle }),
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(layThongBaoLoi(data, "Sửa công việc thất bại"));
        }

        loadTasks();
    } catch (err) {
        alert(err.message);
    }
}

async function deleteTask(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa công việc này?")) return;

    try {
        const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Không thể xóa công việc");
        loadTasks();
    } catch (err) {
        alert(err.message);
    }
}

function layThongBaoLoi(data, fallback) {
    if (!data) return fallback;
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail) && data.detail[0]?.msg) return data.detail[0].msg;
    return fallback;
}
