from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator

from database import get_connection

app = FastAPI(title="Todo List API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class TaskInput(BaseModel):
    title: str

    @field_validator("title")
    @classmethod
    def title_khong_duoc_rong(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("Tiêu đề công việc không được để trống")
        return value.strip()


def bao_loi_khong_tim_thay():
    raise HTTPException(status_code=404, detail="Không tìm thấy công việc với id này")


@app.get("/tasks")
def get_tasks(search: Optional[str] = None, status: Optional[str] = None):
    conn = get_connection()
    try:
        cur = conn.cursor()

        query = "SELECT id, title, is_completed FROM tasks WHERE 1=1"
        params = []

        if search:
            query += " AND title ILIKE %s"
            params.append(f"%{search}%")

        if status == "completed":
            query += " AND is_completed = TRUE"
        elif status == "active":
            query += " AND is_completed = FALSE"

        query += " ORDER BY id ASC"

        cur.execute(query, tuple(params))
        rows = cur.fetchall()
        return [{"id": r[0], "title": r[1], "is_completed": r[2]} for r in rows]
    finally:
        conn.close()


@app.post("/tasks")
def add_task(task: TaskInput):
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO tasks (title) VALUES (%s) RETURNING id",
            (task.title,),
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        return {"message": "Đã thêm thành công", "id": new_id}
    finally:
        conn.close()


@app.put("/tasks/{task_id}/toggle")
def toggle_task(task_id: int):
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "UPDATE tasks SET is_completed = NOT is_completed WHERE id = %s",
            (task_id,),
        )
        if cur.rowcount == 0:
            bao_loi_khong_tim_thay()
        conn.commit()
        return {"message": "Đã cập nhật trạng thái"}
    finally:
        conn.close()


@app.put("/tasks/{task_id}")
def edit_task(task_id: int, task: TaskInput):
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "UPDATE tasks SET title = %s WHERE id = %s",
            (task.title, task_id),
        )
        if cur.rowcount == 0:
            bao_loi_khong_tim_thay()
        conn.commit()
        return {"message": "Đã chỉnh sửa thành công"}
    finally:
        conn.close()


@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM tasks WHERE id = %s", (task_id,))
        if cur.rowcount == 0:
            bao_loi_khong_tim_thay()
        conn.commit()
        return {"message": "Đã xóa thành công"}
    finally:
        conn.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
