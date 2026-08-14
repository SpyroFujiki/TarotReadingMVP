# Yêu cầu phát triển Frontend

## 1. Thông tin tài liệu

| Thuộc tính | Giá trị |
| --- | --- |
| Dự án | Tarot Reading MVP |
| Phạm vi | Web frontend cho customer, reader và admin |
| Trạng thái | Draft cho MVP |
| Backend | FastAPI REST API |
| Ngôn ngữ giao diện | Tiếng Việt |

## 2. Mục tiêu

Frontend cung cấp giao diện để người dùng hoàn thành toàn bộ luồng nghiệp vụ đã có ở backend:

- Khách hàng đăng ký, đăng nhập, chọn gói và gửi chủ đề cần tư vấn.
- Reader xem hàng đợi, nhận và xử lý booking.
- Customer và reader trao đổi trong thời gian thực hiện dịch vụ.
- Người liên quan tạo và theo dõi khiếu nại.
- Admin xử lý khiếu nại, quản lý người dùng và theo dõi audit log.

Mục tiêu của MVP là giao diện rõ ràng, sử dụng được trên desktop và mobile, phản ánh đúng trạng thái từ backend và không tự giả lập các chức năng backend chưa hỗ trợ.

## 3. Phạm vi

### 3.1. Trong phạm vi MVP

- Xác thực bằng access token.
- Điều hướng và bảo vệ route theo vai trò.
- Danh sách và chi tiết gói dịch vụ.
- Tạo, xem và xử lý booking.
- Tin nhắn dịch vụ dạng văn bản.
- Tạo, xem và trao đổi trong khiếu nại.
- Dashboard riêng cho customer, reader và admin.
- Quản lý vai trò, trạng thái người dùng và audit log.
- Loading, empty, error và success state cho các thao tác chính.
- Responsive cho desktop, tablet và mobile.

### 3.2. Ngoài phạm vi MVP (Tính nang se phát triển sau)

- Thanh toán thật và xử lý chuyển tiền hoàn lại.
- Upload file hoặc hình ảnh trong tin nhắn.
- WebSocket, thông báo đẩy hoặc chat thời gian thực hoàn toàn.
- Đăng nhập qua Google/Facebook.
- Quên hoặc đặt lại mật khẩu.
- Quản trị CRUD gói dịch vụ.
- Đánh giá reader, mã giảm giá hoặc chương trình khách hàng thân thiết.
- Đa ngôn ngữ.

Nếu cần một chức năng ngoài phạm vi, phải xác nhận backend đã có API trước khi triển khai giao diện.

## 4. Công nghệ đề xuất

| Thành phần | Công nghệ |
| --- | --- |
| Build tool | Vite |
| UI framework | React |
| Ngôn ngữ | TypeScript |
| Routing | React Router |
| Server state | TanStack Query (React Query) |
| HTTP client | Axios hoặc `fetch` wrapper thống nhất |
| Styling | Tailwind CSS |
| Form validation | React Hook Form kết hợp Zod, nếu cần |
| Code quality | ESLint và Prettier |

Không bắt buộc thêm thư viện nếu React và CSS hiện có đã giải quyết được yêu cầu. Tránh đưa state từ API vào một global store khi React Query đã quản lý được.

## 5. Vai trò người dùng

| Vai trò | Khả năng chính |
| --- | --- |
| Guest | Xem gói, đăng ký, đăng nhập |
| Customer | Tạo và theo dõi booking, nhắn tin, tạo và theo dõi khiếu nại |
| Reader | Có quyền customer; xem hàng đợi, nhận và xử lý booking |
| Admin | Có quyền cấp thấp hơn; xử lý khiếu nại, quản lý người dùng và xem audit log |

Backend dùng phân quyền phân cấp `admin > reader > customer`. Frontend có thể ẩn chức năng không phù hợp với vai trò để cải thiện trải nghiệm, nhưng backend vẫn là nơi quyết định quyền cuối cùng.

## 6. Cấu trúc điều hướng

### 6.1. Route công khai

| Route frontend | Màn hình |
| --- | --- |
| `/` | Trang giới thiệu và danh sách gói nổi bật |
| `/packages` | Danh sách gói dịch vụ |
| `/packages/:packageId` | Chi tiết gói |
| `/login` | Đăng nhập |
| `/register` | Đăng ký |
| `/403` | Không có quyền truy cập |
| `*` | Không tìm thấy trang |

### 6.2. Route đã đăng nhập

| Route frontend | Màn hình | Vai trò |
| --- | --- | --- |
| `/account` | Thông tin tài khoản | Mọi tài khoản |
| `/bookings` | Danh sách booking đã tạo | Customer trở lên |
| `/bookings/new` | Tạo booking | Customer trở lên |
| `/bookings/:bookingId` | Chi tiết booking | Chủ booking |
| `/disputes` | Khiếu nại đã tạo | Mọi tài khoản |
| `/disputes/:disputeId` | Chi tiết và tin nhắn khiếu nại | Người liên quan |

### 6.3. Route dành cho reader

| Route frontend | Màn hình |
| --- | --- |
| `/reader/queue` | Hàng đợi booking |
| `/reader/bookings` | Booking reader đang phụ trách |

### 6.4. Route dành cho admin

| Route frontend | Màn hình |
| --- | --- |
| `/admin/disputes` | Hàng đợi khiếu nại |
| `/admin/disputes/:disputeId` | Xử lý khiếu nại đã nhận |
| `/admin/users` | Quản lý người dùng |
| `/admin/audit-logs` | Nhật ký quản trị |

Sau khi đăng nhập, chuyển người dùng tới dashboard tương ứng với vai trò cao nhất của họ.

## 7. Yêu cầu chức năng

### FR-01 — Đăng ký

- Form gồm email, họ tên, mật khẩu và các trường xác nhận theo schema backend.
- Validate bắt buộc trước khi gửi.
- Hiển thị lỗi email đã được sử dụng.
- Khi thành công, lưu phiên đăng nhập và điều hướng vào ứng dụng.
- Không cho phép người dùng tự chọn vai trò; tài khoản mới luôn là customer.

API: `POST /auth/register`.

### FR-02 — Đăng nhập và đăng xuất

- Form gồm email và mật khẩu.
- Hiển thị chung lỗi email hoặc mật khẩu không đúng.
- Hiển thị riêng trường hợp tài khoản không hoạt động.
- Sau đăng nhập, gọi `GET /auth/me` để khôi phục thông tin người dùng khi cần.
- Đăng xuất phải xóa token, xóa dữ liệu người dùng trong cache và chuyển về `/login`.
- Khi API trả `401`, tự kết thúc phiên và yêu cầu đăng nhập lại.

API: `POST /auth/login`, `GET /auth/me`.

### FR-03 — Xem gói dịch vụ

- Hiển thị tên, mô tả, giá và thời gian phản hồi dự kiến.
- Định dạng giá theo VND.
- Sắp xếp theo dữ liệu backend trả về.
- Mỗi gói có nút xem chi tiết và nút chọn gói.
- Nếu guest chọn gói, chuyển tới đăng nhập và giữ lại ý định quay về màn hình tạo booking.

API: `GET /packages`, `GET /packages/{package_id}`.

### FR-04 — Tạo booking

- Cho phép chọn một gói đang hoạt động.
- Form phải có trường `topic` và không chấp nhận chuỗi chỉ chứa khoảng trắng.
- Trước khi gửi, hiển thị lại tên gói, giá và thời gian phản hồi dự kiến.
- Khi thành công, chuyển tới chi tiết booking vừa tạo.
- Không gửi giá hoặc tên gói từ frontend để backend tin cậy; chỉ gửi `package_id` và `topic`.

API: `POST /bookings/`.

### FR-05 — Booking của customer

- Hiển thị danh sách mới nhất trước.
- Mỗi item hiển thị tối thiểu: mã booking rút gọn, tên gói snapshot, giá snapshot, topic, trạng thái và thời gian tạo.
- Cho phép mở trang chi tiết.
- Chi tiết hiển thị timeline trạng thái và reader nếu response schema cung cấp.
- Dùng nhãn tiếng Việt nhưng giữ mapping cố định với enum backend.

API: `GET /bookings/me`, `GET /bookings/{booking_id}`.

### FR-06 — Hàng đợi reader

- Chỉ hiển thị booking `PENDING` chưa có reader.
- Danh sách ưu tiên booking cũ hơn trước theo thứ tự backend.
- Mỗi item có nút **Nhận booking** và hộp xác nhận.
- Trong lúc claim, khóa nút để tránh gửi lặp.
- Nếu nhận `409 Conflict`, thông báo booking đã được reader khác nhận và refresh hàng đợi.
- Sau khi claim thành công, xóa item khỏi hàng đợi và cập nhật danh sách đang phụ trách.

API: `GET /bookings/queue`, `POST /bookings/{booking_id}/claim`.

### FR-07 — Xử lý booking của reader

- Hiển thị booking ở trạng thái `ASSIGNED` và `IN_PROGRESS`.
- Với `ASSIGNED`, hiển thị hành động **Bắt đầu**.
- Với `IN_PROGRESS`, hiển thị khu vực tin nhắn và hành động **Hoàn thành**.
- Mỗi hành động thay đổi trạng thái phải có xác nhận.
- Sau khi thành công, invalidate/refetch query liên quan.
- Nếu backend trả `409`, hiển thị thông báo trạng thái đã thay đổi và tải lại dữ liệu.

API:

- `GET /bookings/assigned-to-me`
- `POST /bookings/{booking_id}/start`
- `POST /bookings/{booking_id}/complete`

### FR-08 — Tin nhắn dịch vụ

- Chỉ cho customer và reader liên quan gửi khi booking là `IN_PROGRESS`.
- Tin nhắn hiển thị từ cũ đến mới.
- Phân biệt tin nhắn của người hiện tại và người còn lại bằng vị trí, màu sắc hoặc nhãn tên.
- Không gửi nội dung rỗng.
- Sau khi gửi thành công, xóa nội dung ô nhập và cập nhật danh sách.
- Khi booking không còn cho phép gửi, khóa ô nhập nhưng vẫn giữ quyền đọc nếu backend cho phép.
- MVP chỉ hỗ trợ nội dung văn bản; không hiển thị nút upload file.
- Vì backend chưa có WebSocket, dùng nút refresh hoặc polling với chu kỳ hợp lý khi màn hình chat đang mở.

API: `GET` và `POST /bookings/{booking_id}/messages`.

### FR-09 — Tạo và theo dõi khiếu nại

- Chỉ hiển thị nút tạo khiếu nại cho người liên quan và khi booking có trạng thái phù hợp.
- Form gồm loại lý do và mô tả theo schema backend.
- Cảnh báo rằng mỗi booking chỉ tạo được một khiếu nại.
- Sau khi tạo thành công, cập nhật booking thành `DISPUTING` và chuyển tới chi tiết khiếu nại.
- Trang danh sách chỉ hiển thị khiếu nại do tài khoản hiện tại tạo.

API:

- `POST /bookings/{booking_id}/dispute`
- `GET /disputes/me`
- `GET /disputes/{dispute_id}`

### FR-10 — Tin nhắn khiếu nại

- Customer, reader liên quan và admin đã nhận khiếu nại có thể xem tin nhắn.
- Chỉ cho gửi khi dispute là `OPEN` hoặc `REVIEWING`.
- Khi dispute đã `RESOLVED`, khóa ô nhập và hiển thị kết quả xử lý.
- MVP chỉ hỗ trợ tin nhắn văn bản.

API: `GET` và `POST /disputes/{dispute_id}/messages`.

### FR-11 — Admin nhận và giải quyết khiếu nại

- Danh sách hiển thị dispute `OPEN` và `REVIEWING`, cũ nhất trước.
- Dispute `OPEN` có hành động **Nhận xử lý**.
- Nếu claim nhận `409`, thông báo đã có admin khác nhận và refresh danh sách.
- Chỉ admin đã claim mới thấy form giải quyết.
- Form giải quyết gồm verdict, refund amount và resolution note.
- Quy tắc hiển thị form:
  - `REJECTED`: ẩn hoặc khóa refund amount; giá trị phải là `0` hoặc không gửi.
  - `REFUND_FULL`: refund amount bằng đúng `price_snapshot` và không cho sửa.
  - `REFUND_PARTIAL`: bắt buộc lớn hơn `0` và nhỏ hơn `price_snapshot`.
  - Resolution note bắt buộc và không được chỉ chứa khoảng trắng.
- Hiển thị hộp xác nhận trước khi resolve vì thao tác kết thúc khiếu nại.

API:

- `GET /admin/disputes`
- `POST /admin/disputes/{dispute_id}/claim`
- `POST /admin/disputes/{dispute_id}/resolve`

### FR-12 — Admin quản lý người dùng

- Hiển thị danh sách người dùng với email, họ tên, vai trò, trạng thái và ngày tạo.
- Cho phép đổi role và status bằng control có xác nhận.
- Không hiển thị hoặc khóa thao tác tự thay đổi quyền quản trị của tài khoản hiện tại.
- Vẫn phải xử lý lỗi `409` từ backend khi thao tác ảnh hưởng admin active cuối cùng.
- Sau cập nhật thành công, cập nhật đúng item trong danh sách.

API:

- `GET /admin/users`
- `PATCH /admin/users/{user_id}/role`
- `PATCH /admin/users/{user_id}/status`

### FR-13 — Audit log

- Hiển thị bảng gồm admin, action, target type, target ID, old value, new value, reason và thời gian.
- Hỗ trợ tải theo `limit` và `offset`.
- JSON trong old/new value cần được format dễ đọc.
- Đây là màn hình chỉ đọc.

API: `GET /admin/audit-logs`.

## 8. Mapping trạng thái

### 8.1. Booking status

| Giá trị backend | Nhãn giao diện | Gợi ý màu |
| --- | --- | --- |
| `PENDING` | Đang chờ reader | Xám hoặc vàng |
| `ASSIGNED` | Đã có reader nhận | Xanh dương |
| `IN_PROGRESS` | Đang thực hiện | Tím |
| `COMPLETED` | Đã hoàn thành | Xanh lá |
| `DISPUTING` | Đang khiếu nại | Cam |
| `REFUNDED` | Đã hoàn tiền | Xanh ngọc |
| `CANCELED` | Đã hủy | Đỏ hoặc xám đậm |

Frontend phải đối chiếu giá trị enum thực tế trong response. Nếu backend serialize enum thành chữ thường, giữ nguyên value nhận được và chỉ thay nhãn hiển thị.

### 8.2. Dispute status

| Giá trị backend | Nhãn giao diện |
| --- | --- |
| `OPEN` | Đang mở |
| `REVIEWING` | Đang xem xét |
| `RESOLVED` | Đã giải quyết |

### 8.3. Dispute verdict

| Giá trị backend | Nhãn giao diện |
| --- | --- |
| `REJECTED` | Từ chối khiếu nại |
| `REFUND_PARTIAL` | Hoàn tiền một phần |
| `REFUND_FULL` | Hoàn tiền toàn bộ |

## 9. Tích hợp API

### 9.1. Cấu hình

Base URL phải lấy từ biến môi trường, không hard-code:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Tạo một HTTP client dùng chung để:

- Gắn header `Authorization: Bearer <access_token>`.
- Parse response và lỗi thống nhất.
- Xử lý `401` tập trung.
- Không log token, mật khẩu hoặc dữ liệu nhạy cảm.

### 9.2. Quản lý token

Backend hiện trả access token trong response body và chưa có refresh token/cookie authentication. Với MVP có thể lưu token ở `localStorage`, nhưng phải:

- Không render nội dung HTML không tin cậy bằng `dangerouslySetInnerHTML`.
- Xóa token khi logout hoặc nhận `401`.
- Không lưu mật khẩu hay toàn bộ response nhạy cảm.

Nếu triển khai production, nên thống nhất lại với backend về cookie `HttpOnly`, refresh token và chính sách CSRF trước khi đổi cơ chế xác thực.

### 9.3. React Query

- Query key phải nhất quán, ví dụ `['packages']`, `['bookings', 'me']`, `['reader', 'queue']`.
- Mutation thành công phải invalidate đúng query bị ảnh hưởng.
- Không retry tự động cho lỗi `400`, `401`, `403`, `404`, `409`, `422`.
- Có thể retry giới hạn cho lỗi mạng hoặc lỗi server tạm thời.

## 10. Xử lý lỗi và trạng thái giao diện

Mọi màn hình lấy dữ liệu phải có đủ:

- Loading state: skeleton hoặc progress indicator.
- Empty state: mô tả rõ chưa có dữ liệu và hành động tiếp theo nếu phù hợp.
- Error state: thông báo dễ hiểu và nút thử lại.
- Success feedback: toast hoặc thông báo sau mutation.

| HTTP status | Cách xử lý frontend |
| ---: | --- |
| `400` | Hiển thị lỗi nghiệp vụ gần form hoặc bằng alert |
| `401` | Xóa phiên và chuyển về đăng nhập |
| `403` | Hiển thị không đủ quyền hoặc chuyển tới `/403` |
| `404` | Hiển thị tài nguyên không tồn tại |
| `409` | Thông báo xung đột trạng thái và refetch dữ liệu |
| `422` | Map lỗi validation vào field; nếu không map được thì hiển thị lỗi chung |
| `500+` | Hiển thị lỗi hệ thống và cho phép thử lại |

Không hiển thị stack trace hoặc object lỗi thô cho người dùng.

## 11. Yêu cầu giao diện và trải nghiệm

- Dark mode là giao diện mặc định và bắt buộc của MVP.
- Thiết kế nhất quán về màu, typography, spacing, button và form control.
- Navigation thay đổi theo trạng thái đăng nhập và vai trò.
- Trạng thái phải có cả chữ, không chỉ dựa vào màu sắc.
- Các thao tác thay đổi trạng thái quan trọng cần confirmation dialog.
- Nút submit hiển thị trạng thái đang xử lý và bị khóa để tránh gửi lặp.
- Topic, mô tả và tin nhắn dài phải wrap, không phá layout.
- ID dài nên hiển thị rút gọn nhưng cho phép sao chép đầy đủ.
- Thời gian hiển thị theo múi giờ người dùng và định dạng thống nhất.
- Giá hiển thị bằng `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`.

### 11.1. Dark theme bắt buộc

Sử dụng bộ CSS variables sau làm theme chính:

```css
:root {
  --bg-dark: #001f3f;       /* Xanh dương đậm chủ đạo */
  --gold: #ffd700;          /* Vàng gold */
  --gold-dim: rgba(255, 215, 0, 0.3);
  --text-light: #f4f4f4;
  --text-dim: #cccccc;
  --transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

Quy tắc sử dụng:

- `--bg-dark` là màu nền chủ đạo của toàn bộ ứng dụng.
- Nội dung chữ thông thường dùng `--text-light`; không dùng màu vàng cho toàn bộ phần chữ.
- `--text-dim` dùng cho mô tả phụ, placeholder, metadata và nội dung ít quan trọng hơn.
- `--gold` dùng làm màu nhấn cho heading quan trọng, icon, border, nút chính và trạng thái được chọn.
- `--gold-dim` dùng cho border nhẹ, nền hover/focus hoặc hiệu ứng trang trí có độ tương phản thấp.
- `--transition` dùng thống nhất cho hover, focus, mở/đóng menu và các thay đổi trạng thái ngắn.
- Màu vàng không được dùng thay thế nhãn trạng thái; trạng thái vẫn phải có nội dung chữ rõ ràng.
- Nếu cần bổ sung màu cho card, input, success, warning hoặc error, frontend được phép thêm biến màu nhưng phải giữ tính nhất quán với nền xanh đậm và bảo đảm độ tương phản.

### 11.2. Light mode tùy chọn

Light mode không nằm trong phạm vi bắt buộc của MVP. Nếu hoàn thành toàn bộ hạng mục P0 và P1 mà vẫn còn thời gian, frontend có thể bổ sung light mode với theme tùy chọn, miễn là:

- Không làm thay đổi hoặc phá vỡ dark theme mặc định.
- Giữ nguyên cấu trúc, thứ bậc thị giác và ý nghĩa màu trạng thái.
- Bảo đảm nội dung dễ đọc và có độ tương phản phù hợp.
- Ghi nhớ lựa chọn theme của người dùng nếu có nút chuyển đổi.

## 12. Responsive và accessibility

- Hỗ trợ tối thiểu từ chiều rộng `360px`.
- Bảng lớn trên mobile chuyển thành card hoặc cho cuộn ngang có kiểm soát.
- Mọi input có label liên kết đúng.
- Có thể sử dụng toàn bộ form bằng bàn phím.
- Focus state phải nhìn thấy rõ.
- Modal phải giữ focus và đóng được bằng `Escape` khi phù hợp.
- Icon button phải có accessible name.
- Màu chữ và nền phải có độ tương phản đủ đọc.

## 13. Cấu trúc mã nguồn đề xuất

```text
src/
├── api/             # HTTP client và API functions
├── app/             # Router, providers và cấu hình ứng dụng
├── components/      # Component dùng chung
├── features/
│   ├── auth/
│   ├── packages/
│   ├── bookings/
│   ├── messages/
│   ├── disputes/
│   └── admin/
├── layouts/         # Public, authenticated và admin layout
├── pages/           # Route-level components
├── types/           # TypeScript types dùng chung
├── utils/           # Formatter và helper thuần
└── main.tsx
```

Tách component theo nghiệp vụ. Không đặt toàn bộ API, form và UI của một màn hình lớn trong cùng một file.

## 14. Yêu cầu kiểm thử

Tối thiểu cần kiểm thử các luồng quan trọng:

- Login thành công và thất bại.
- Route guard cho guest, reader và admin.
- Customer tạo booking.
- Hai trường hợp reader claim thành công và nhận `409`.
- Chuyển `ASSIGNED → IN_PROGRESS → COMPLETED`.
- Gửi tin nhắn chỉ khi booking cho phép.
- Tạo dispute và khóa việc tạo lại.
- Validate ba verdict hoàn tiền.
- Admin không thể tự thay đổi quyền của mình.
- Xử lý phiên hết hạn.

Ưu tiên unit/component test cho validation và mapping; dùng integration/E2E cho các luồng xuyên nhiều màn hình.

## 15. Mức ưu tiên triển khai

### P0 — Bắt buộc để chạy MVP

1. Khởi tạo project, router, HTTP client và authentication.
2. Trang packages và tạo booking.
3. Customer xem booking.
4. Reader queue, claim, start và complete.
5. Tin nhắn dịch vụ.
6. Tạo và xem dispute.
7. Admin claim và resolve dispute.
8. Route guard, xử lý lỗi và responsive cơ bản.

### P1 — Cần có trước khi demo hoàn chỉnh

1. Tin nhắn khiếu nại.
2. Quản lý role/status người dùng.
3. Audit log có phân trang.
4. Empty state, skeleton, toast và confirmation dialog nhất quán.
5. Kiểm thử các luồng chính.

### P2 — Chỉ làm nếu còn thời gian

1. Bộ lọc và tìm kiếm phía client cho danh sách nhỏ.
2. Polling tin nhắn tự động.
3. Tối ưu animation và micro-interaction.
4. Light mode với theme tùy chọn; có thể bỏ qua nếu không còn thời gian.

## 16. Tiêu chí nghiệm thu MVP

Frontend được coi là đạt yêu cầu khi:

- Người dùng có thể hoàn thành luồng từ đăng ký đến tạo booking mà không dùng Swagger.
- Reader có thể nhận, bắt đầu, trao đổi và hoàn thành booking.
- Người liên quan có thể tạo khiếu nại và trao đổi trong dispute.
- Admin có thể nhận, giải quyết khiếu nại và xem thay đổi trong audit log.
- Không có route quản trị nào mở cho customer hoặc guest.
- Giao diện luôn phản ánh trạng thái backend sau mutation hoặc xung đột.
- Các lỗi phổ biến được diễn giải rõ, không hiển thị lỗi kỹ thuật thô.
- Không có secret hoặc API URL cố định bị commit vào source code.
- Các màn hình P0 sử dụng được ở desktop và mobile.
- Toàn bộ màn hình P0 sử dụng đúng dark theme mặc định; chữ thông thường dùng `--text-light`.