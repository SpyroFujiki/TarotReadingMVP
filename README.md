# Tarot Reading MVP API

Backend API cho nền tảng cung cấp dịch vụ xem Tarot trực tuyến. Hệ thống cho phép khách hàng chọn gói và gửi chủ đề cần tư vấn, reader chủ động nhận và xử lý yêu cầu, hai bên trao đổi qua tin nhắn, đồng thời hỗ trợ khiếu nại, hoàn tiền và quản trị người dùng.

> README này mô tả phần backend dựa trên các API hiện có trong dự án.

## Authors

- **Nguyen Gia Hung** — Project lead, system design, database design and backend development.
- **Ngo Minh Duc** — Frontend development.

## Tính năng chính

- Đăng ký, đăng nhập và xác thực bằng JWT Bearer Token.
- Phân quyền theo ba vai trò: `customer`, `reader`, `admin`.
- Quản lý các gói xem Tarot đang hoạt động.
- Tạo booking và lưu snapshot thông tin gói tại thời điểm đặt.
- Reader xem hàng đợi, nhận booking, bắt đầu và hoàn thành dịch vụ.
- Customer và reader trao đổi trong quá trình thực hiện booking.
- Người liên quan có thể tạo và trao đổi trong khiếu nại.
- Admin nhận, xem xét và giải quyết khiếu nại.
- Admin quản lý vai trò, trạng thái người dùng và xem audit log.

## Công nghệ

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic
- JWT authentication
- Pydantic

## Vai trò và phân quyền

Hệ thống sử dụng mô hình phân quyền phân cấp:

| Vai trò | Cấp | Quyền chính |
| --- | ---: | --- |
| `customer` | 1 | Xem gói, tạo và theo dõi booking, trao đổi với reader, tạo khiếu nại |
| `reader` | 2 | Có quyền của customer; xem hàng đợi, nhận và xử lý booking |
| `admin` | 3 | Có quyền cấp thấp hơn; quản lý khiếu nại, người dùng và audit log |

Các tài khoản không ở trạng thái `active` không thể đăng nhập hoặc sử dụng endpoint yêu cầu xác thực.

## Luồng nghiệp vụ

### Booking

```mermaid
stateDiagram-v2
    [*] --> PENDING: Customer tạo booking
    PENDING --> ASSIGNED: Reader nhận booking
    ASSIGNED --> IN_PROGRESS: Reader bắt đầu
    IN_PROGRESS --> COMPLETED: Reader hoàn thành
    ASSIGNED --> DISPUTING: Tạo khiếu nại
    IN_PROGRESS --> DISPUTING: Tạo khiếu nại
    COMPLETED --> DISPUTING: Tạo khiếu nại
    DISPUTING --> COMPLETED: Admin từ chối khiếu nại
    DISPUTING --> REFUNDED: Admin chấp nhận hoàn tiền
```

Khi tạo booking, backend lưu `package_name_snapshot`, `price_snapshot` và `expected_response_minutes_snapshot`. Vì vậy, thay đổi gói dịch vụ sau này không làm sai dữ liệu của các booking cũ.

### Khiếu nại

1. Customer hoặc reader liên quan tạo khiếu nại cho booking hợp lệ.
2. Booking chuyển sang `DISPUTING`, khiếu nại bắt đầu ở trạng thái `OPEN`.
3. Một admin nhận khiếu nại; trạng thái chuyển thành `REVIEWING`.
4. Customer, reader và admin đang phụ trách có thể trao đổi trong khiếu nại.
5. Chính admin đã nhận khiếu nại đưa ra một trong ba kết quả:
   - `REJECTED`: không hoàn tiền, booking trở về `COMPLETED`.
   - `REFUND_PARTIAL`: hoàn một phần, booking chuyển thành `REFUNDED`.
   - `REFUND_FULL`: hoàn toàn bộ giá booking, booking chuyển thành `REFUNDED`.
6. Thao tác nhận và giải quyết khiếu nại được lưu vào audit log.

Mỗi booking chỉ có tối đa một khiếu nại. Khiếu nại đã được giải quyết không thể nhận thêm tin nhắn.

## Danh sách API

### Authentication

| Method | Endpoint | Quyền | Mô tả |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Công khai | Đăng ký customer mới và nhận access token |
| `POST` | `/auth/login` | Công khai | Đăng nhập và nhận access token |
| `GET` | `/auth/me` | Đã đăng nhập | Lấy thông tin tài khoản hiện tại |

### Reading packages

| Method | Endpoint | Quyền | Mô tả |
| --- | --- | --- | --- |
| `GET` | `/packages` | Công khai | Danh sách gói đang hoạt động, sắp xếp theo giá tăng dần |
| `GET` | `/packages/{package_id}` | Công khai | Chi tiết một gói đang hoạt động |

### Bookings

| Method | Endpoint | Quyền | Mô tả |
| --- | --- | --- | --- |
| `POST` | `/bookings/` | Customer trở lên | Tạo booking mới |
| `GET` | `/bookings/me` | Customer trở lên | Danh sách booking do tài khoản hiện tại tạo |
| `GET` | `/bookings/{booking_id}` | Chủ booking | Xem chi tiết booking |
| `GET` | `/bookings/queue` | Reader trở lên | Xem các booking đang chờ được nhận |
| `GET` | `/bookings/assigned-to-me` | Reader trở lên | Xem booking được giao và đang xử lý |
| `POST` | `/bookings/{booking_id}/claim` | Reader trở lên | Nhận một booking đang chờ |
| `POST` | `/bookings/{booking_id}/start` | Reader phụ trách | Bắt đầu thực hiện booking |
| `POST` | `/bookings/{booking_id}/complete` | Reader phụ trách | Hoàn thành booking |

Việc nhận booking sử dụng câu lệnh cập nhật có điều kiện để hạn chế race condition: chỉ reader đầu tiên nhận thành công, các yêu cầu đến sau nhận phản hồi `409 Conflict`.

### Tin nhắn dịch vụ

| Method | Endpoint | Quyền | Mô tả |
| --- | --- | --- | --- |
| `POST` | `/bookings/{booking_id}/messages` | Customer hoặc reader liên quan | Gửi tin nhắn khi booking đang `IN_PROGRESS` |
| `GET` | `/bookings/{booking_id}/messages` | Người liên quan | Đọc tin nhắn theo thứ tự thời gian |

Admin có thể đọc tin nhắn dịch vụ khi booking đang ở trạng thái `DISPUTING`, nhưng không thể gửi tin nhắn vào cuộc trò chuyện dịch vụ.

### Khiếu nại và tin nhắn khiếu nại

| Method | Endpoint | Quyền | Mô tả |
| --- | --- | --- | --- |
| `POST` | `/bookings/{booking_id}/dispute` | Customer hoặc reader liên quan | Tạo khiếu nại |
| `GET` | `/disputes/me` | Đã đăng nhập | Danh sách khiếu nại do tài khoản hiện tại tạo |
| `GET` | `/disputes/{dispute_id}` | Người liên quan hoặc admin phụ trách | Xem chi tiết khiếu nại |
| `POST` | `/disputes/{dispute_id}/messages` | Người liên quan hoặc admin phụ trách | Gửi tin nhắn khi khiếu nại còn mở |
| `GET` | `/disputes/{dispute_id}/messages` | Người liên quan hoặc admin phụ trách | Đọc tin nhắn khiếu nại |

### Admin

| Method | Endpoint | Quyền | Mô tả |
| --- | --- | --- | --- |
| `GET` | `/admin/disputes` | Admin | Danh sách khiếu nại `OPEN` hoặc `REVIEWING` |
| `POST` | `/admin/disputes/{dispute_id}/claim` | Admin | Nhận phụ trách khiếu nại |
| `POST` | `/admin/disputes/{dispute_id}/resolve` | Admin phụ trách | Giải quyết khiếu nại |
| `GET` | `/admin/users` | Admin | Danh sách người dùng |
| `PATCH` | `/admin/users/{user_id}/role` | Admin | Thay đổi vai trò người dùng |
| `PATCH` | `/admin/users/{user_id}/status` | Admin | Thay đổi trạng thái người dùng |
| `GET` | `/admin/audit-logs` | Admin | Xem audit log, hỗ trợ `limit` và `offset` |

Admin không thể tự hạ quyền hoặc vô hiệu hóa chính mình. Hệ thống cũng ngăn việc hạ quyền/vô hiệu hóa admin đang hoạt động cuối cùng.

## Xác thực

Sau khi đăng ký hoặc đăng nhập, API trả về access token. Gửi token trong các request cần xác thực:

```http
Authorization: Bearer <access_token>
```

JWT hiện chứa các claim chính:

- `sub`: UUID của người dùng.
- `iat`: thời điểm phát hành.
- `exp`: thời điểm hết hạn.

## Cài đặt và chạy local

### 1. Yêu cầu

- Python 3.13 hoặc phiên bản tương thích với dependencies của dự án.
- PostgreSQL.
- Git.

### 2. Clone và tạo môi trường ảo

```bash
git clone <repository-url>
cd TarotReadingMVP
python -m venv .venv
```

Kích hoạt môi trường trên Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

Trên macOS hoặc Linux:

```bash
source .venv/bin/activate
```

### 3. Cài dependencies

```bash
pip install -r requirements.txt
```

### 4. Cấu hình môi trường

Tạo file `.env` theo các trường mà `app/core/config.py` yêu cầu. Tối thiểu cần cấu hình kết nối PostgreSQL và JWT, ví dụ:

```env
DATABASE_URL=postgresql+psycopg://postgres:your_password@localhost:5432/tarot_reading_mvp
JWT_SECRET_KEY=replace_with_a_long_random_secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Không commit `.env` hoặc secret thật lên Git.

### 5. Chạy migration và seed data

Thực hiện trong thư mục chứa `alembic.ini`:

```bash
alembic upgrade head
python -m app.db.seed
```

### 6. Khởi động API

Thực hiện trong thư mục backend:

```bash
uvicorn app.main:app --reload
```

Mặc định:

- API: `http://127.0.0.1:8000`
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## Cách thử nhanh trên Swagger UI

1. Gọi `POST /auth/register` hoặc `POST /auth/login`.
2. Sao chép `access_token` trong response.
3. Nhấn **Authorize** và nhập token theo hướng dẫn của Swagger UI.
4. Gọi `GET /auth/me` để kiểm tra xác thực.
5. Gọi `GET /packages`, lấy `package_id`, rồi tạo booking qua `POST /bookings/`.
6. Đăng nhập bằng tài khoản reader để nhận và xử lý booking.
7. Nếu cần kiểm thử khiếu nại, đăng nhập lại bằng customer/reader liên quan rồi tạo dispute.

## Cấu trúc module API

```text
app/
├── api/
│   ├── admin.py
│   ├── auth.py
│   ├── booking.py
│   ├── dependencies.py
│   ├── dispute.py
│   ├── dispute_message.py
│   ├── packages.py
│   └── service_message.py
├── core/          # Cấu hình và bảo mật
├── db/            # Session, migration support và seed
├── models/        # SQLAlchemy models
├── schemas/       # Pydantic request/response schemas
└── main.py        # Khởi tạo FastAPI và đăng ký router
```

## Quy ước phản hồi lỗi

| HTTP status | Ý nghĩa thường gặp |
| ---: | --- |
| `400 Bad Request` | Dữ liệu đầu vào không hợp lệ theo nghiệp vụ |
| `401 Unauthorized` | Thiếu token, token sai hoặc đã hết hạn |
| `403 Forbidden` | Đã xác thực nhưng không đủ quyền hoặc tài khoản không hoạt động |
| `404 Not Found` | Không tìm thấy tài nguyên hoặc tài nguyên không thuộc phạm vi được phép xem |
| `409 Conflict` | Trạng thái tài nguyên không cho phép thao tác hoặc tài nguyên đã được người khác nhận |
| `422 Unprocessable Entity` | Dữ liệu không vượt qua validation hoặc quy tắc xử lý |

## Ghi chú cho người đóng góp

- Không đưa mật khẩu, JWT secret hoặc chuỗi kết nối thật vào source code.
- Mọi thay đổi schema cơ sở dữ liệu phải đi kèm Alembic migration.
- Endpoint mới phải áp dụng dependency xác thực/phân quyền phù hợp.
- Các thao tác admin quan trọng nên được ghi vào audit log trong cùng transaction với thay đổi dữ liệu.
- Với các thao tác `claim`, tiếp tục dùng cập nhật có điều kiện ở database để tránh hai người nhận cùng một tài nguyên.
- Nên bổ sung hoặc cập nhật test cho các nhánh thành công, sai quyền và xung đột trạng thái.

## Trạng thái dự án

Backend MVP hiện đã bao phủ luồng nghiệp vụ cốt lõi. Các phần phù hợp để phát triển tiếp gồm bộ test tự động đầy đủ, phân trang/lọc danh sách, upload tệp đính kèm, tích hợp thanh toán thật, thông báo thời gian thực và triển khai production.

## License

Copyright © 2026 Nguyen Gia Hung and Ngo Minh Duc. All rights reserved.

This project is proprietary. See [LICENSE](LICENSE) for details.
