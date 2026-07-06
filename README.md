# Todo List Intern

Ứng dụng Quản lý công việc (Todo List) gồm:
- **Backend**: FastAPI (Python) + PostgreSQL
- **Frontend**: HTML/CSS/JavaScript thuần (không cần cài gì thêm)

## 1. Cấu trúc project

```
todolist-intern/
├── backend/
│   ├── main.py            # Chứa các API endpoint (thêm/sửa/xóa/lọc công việc)
│   ├── database.py        # Xử lý kết nối tới PostgreSQL
│   ├── schema.sql         # Script tạo database & bảng "tasks"
│   ├── requirements.txt   # Danh sách thư viện Python cần cài
│   └── .env.example       # File mẫu chứa thông tin kết nối DB
└── frontend/
    ├── index.html         # Giao diện chính
    ├── style.css           # Style + responsive
    └── app.js              # Toàn bộ logic gọi API
```

## 2. Yêu cầu cần cài trước

- Python 3.9+ : https://www.python.org/downloads/
- PostgreSQL : https://www.postgresql.org/download/

## 3. Cài đặt Backend

### Bước 1: Mở terminal tại thư mục `backend`

```bash
cd todolist-intern/backend
```

### Bước 2: Tạo môi trường ảo (venv) - để không ảnh hưởng tới Python của máy

```bash
python -m venv venv

# Bật venv:
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

### Bước 3: Cài các thư viện cần thiết

```bash
pip install -r requirements.txt
```

### Bước 4: Tạo database và bảng dữ liệu

Mở terminal khác, đăng nhập vào PostgreSQL rồi tạo database:

```bash
psql -U postgres
```

Trong màn hình `psql`, chạy:

```sql
CREATE DATABASE todolist_db;
\c todolist_db
```

Sau đó copy nội dung phần `CREATE TABLE` trong file `schema.sql` và chạy (hoặc chạy trực tiếp file bằng lệnh `\i schema.sql`).

### Bước 5: Tạo file `.env`

Copy file mẫu và đổi tên:

```bash
# Windows:
copy .env.example .env
# macOS/Linux:
cp .env.example .env
```

Mở file `.env` vừa tạo, sửa lại đúng thông tin PostgreSQL trên máy bạn:

```
DB_HOST=localhost
DB_NAME=todolist_db
DB_USER=postgres
DB_PASSWORD=mật_khẩu_của_bạn
DB_PORT=5432
```

> **Đây là điểm quan trọng nhất giúp code chạy được trên bất kỳ máy nào**: thông tin kết nối DB không còn nằm trong code (`main.py`) nữa, mà nằm trong file `.env` — mỗi máy chỉ cần sửa file này, không cần sửa code.

### Bước 6: Chạy backend

```bash
uvicorn main:app --reload
```

Nếu thành công, backend sẽ chạy ở địa chỉ: `http://127.0.0.1:8000`

Kiểm tra nhanh bằng cách mở trình duyệt vào: `http://127.0.0.1:8000/docs` (trang tài liệu API do FastAPI tự sinh ra).

## 4. Chạy Frontend

Cách đơn giản nhất: **double click vào file `frontend/index.html`** để mở bằng trình duyệt.

Nếu gặp lỗi không tải được dữ liệu, có thể do trình duyệt chặn khi mở file trực tiếp — khi đó hãy chạy 1 server tĩnh đơn giản:

```bash
cd todolist-intern/frontend
python -m http.server 5500
```

Rồi mở trình duyệt vào: `http://127.0.0.1:5500`

> **Lưu ý:** backend phải đang chạy (bước 3 mục Backend) thì frontend mới lấy được dữ liệu.

## 5. Các chức năng đã có

- Hiển thị danh sách công việc
- Thêm công việc mới
- Sửa tiêu đề công việc
- Xóa công việc
- Đánh dấu hoàn thành / chưa hoàn thành
- Tìm kiếm theo tên công việc
- Lọc theo trạng thái (Tất cả / Chưa hoàn thành / Đã hoàn thành)
- Responsive: giao diện tự co giãn tốt trên điện thoại
- Xử lý dữ liệu không hợp lệ:
  - Không cho thêm/sửa công việc với tiêu đề rỗng (báo lỗi rõ ràng)
  - Trả lỗi 404 nếu sửa/xóa một công việc không tồn tại
  - Trả lỗi 500 kèm thông báo rõ ràng nếu kết nối DB thất bại
  - Frontend hiển thị thông báo khi không kết nối được server

## 6. Danh sách API

| Method | Endpoint             | Chức năng                          |
|--------|-----------------------|-------------------------------------|
| GET    | /tasks                | Lấy danh sách (query: search, status) |
| POST   | /tasks                | Thêm công việc mới                  |
| PUT    | /tasks/{id}           | Sửa tiêu đề công việc                |
| PUT    | /tasks/{id}/toggle    | Đổi trạng thái hoàn thành            |
| DELETE | /tasks/{id}           | Xóa công việc                       |

## 7. Hướng phát triển thêm (nếu có thời gian)

- Phân trang danh sách công việc (thêm tham số `limit`, `offset` ở `GET /tasks`)
- Viết Unit Test cho các endpoint bằng `pytest` + `TestClient` của FastAPI
- Đóng gói bằng Docker (Dockerfile cho backend + docker-compose kèm PostgreSQL)
- Triển khai backend lên Render/Railway, frontend lên Vercel/Netlify
