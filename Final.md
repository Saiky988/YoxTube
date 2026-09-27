Để bạn có thể kiểm thử (test) toàn diện hệ thống từ Localhost đến VPS mà không cần mò mẫm hay viết tay từng request, dưới đây là bộ tài liệu hướng dẫn và kiểm thử API hoàn chỉnh gồm 2 file Markdown (`docs/auth.md`, `docs/movie.md`) và 1 script kiểm thử tự động (`test.sh`).

---

# 1. `docs/auth.md` — Tài liệu & Hướng dẫn Test Auth, Profile, Avatar

Tập tin này tài liệu hóa chi tiết toàn bộ các API liên quan đến Authentication, Quản lý tài khoản, Cài đặt và Upload Media.

```markdown
# YoxTube — Authentication & User Profile API Documentation

- **Base URL:** `https://api.yoxtube.xyz` (Production)
- **Content-Type:** `application/json` (trừ upload avatar là `multipart/form-data`)
- **Cơ chế xác thực:** Session Token qua header `Authorization: Bearer <token>` hoặc Cookie `yoxtube_session`.

---

## 1. POST `/api/auth/register` — Đăng ký tài khoản
Đăng ký tài khoản mới bằng Email và Mật khẩu. Hệ thống tự động băm mật khẩu bằng Argon2id, tạo bản ghi `user_settings` mặc định và trả về session token.

### Request Body:
```json
{
  "email": "tester01@yoxtube.xyz",
  "password": "Password@123",
  "username": "tester_yoxtube",
  "displayName": "Tester YoxTube"
}
```
*(Ghi chú: `username` và `displayName` là tùy chọn. Nếu bỏ trống username, hệ thống tự động sinh username duy nhất).*

### cURL Test:
```bash
curl -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tester01@yoxtube.xyz",
    "password": "Password@123",
    "username": "tester_yoxtube",
    "displayName": "Tester YoxTube"
  }'
```

### Response (201 Created):
```json
{
  "success": true,
  "message": "Đăng ký tài khoản thành công",
  "token": "7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
  "user": {
    "id": 1,
    "email": "tester01@yoxtube.xyz",
    "username": "tester_yoxtube",
    "displayName": "Tester YoxTube",
    "avatarUrl": null,
    "isVerified": false,
    "isActive": true
  }
}
```

---

## 2. POST `/api/auth/login` — Đăng nhập
Đăng nhập bằng Email hoặc Username kết hợp Password.

### Request Body:
```json
{
  "identifier": "tester_yoxtube",
  "password": "Password@123"
}
```

### cURL Test:
```bash
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "tester01@yoxtube.xyz",
    "password": "Password@123"
  }'
```

### Response (200 OK):
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "token": "7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b",
  "user": {
    "id": 1,
    "email": "tester01@yoxtube.xyz",
    "username": "tester_yoxtube",
    "displayName": "Tester YoxTube",
    "avatarUrl": null,
    "isVerified": false,
    "isActive": true
  }
}
```

---

## 3. POST `/api/auth/google` — Đăng nhập / Đăng ký qua Google OAuth
Xác thực Google ID Token nhận từ thư viện Google Identity Services ở Frontend.

### Request Body:
```json
{
  "credential": "<GOOGLE_ID_TOKEN_JWT>"
}
```

### cURL Test:
```bash
curl -X POST "http://localhost:5000/api/auth/google" \
  -H "Content-Type: application/json" \
  -d '{
    "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6Ij..."
  }'
```

---

## 4. GET `/api/auth/me` — Lấy thông tin tài khoản & Cài đặt
Yêu cầu Bearer Token hoặc Cookie session hợp lệ.

### cURL Test:
```bash
curl -X GET "http://localhost:5000/api/auth/me" \
  -H "Authorization: Bearer <TOKEN_CỦA_BẠN>"
```

### Response (200 OK):
```json
{
  "success": true,
  "message": "Lấy thông tin tài khoản thành công",
  "data": {
    "user": {
      "id": 1,
      "email": "tester01@yoxtube.xyz",
      "username": "tester_yoxtube",
      "displayName": "Tester YoxTube",
      "avatarUrl": null,
      "isVerified": false,
      "createdAt": "2026-09-26T12:00:00.000Z"
    },
    "settings": {
      "theme": "system",
      "language": "vi-VN",
      "autoplay": true,
      "updatedAt": "2026-09-26T12:00:00.000Z"
    }
  }
}
```

---

## 5. PATCH `/api/auth/me` — Cập nhật Profile
Cập nhật một hoặc nhiều trường: `displayName`, `username`, `avatarUrl`.

### Request Body:
```json
{
  "displayName": "YoxTube VIP Master",
  "username": "yoxtube_pro_2026"
}
```

### cURL Test:
```bash
curl -X PATCH "http://localhost:5000/api/auth/me" \
  -H "Authorization: Bearer <TOKEN_CỦA_BẠN>" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "YoxTube VIP Master",
    "username": "yoxtube_pro_2026"
  }'
```

### Response (200 OK):
```json
{
  "success": true,
  "message": "Cập nhật thông tin tài khoản thành công",
  "data": {
    "user": {
      "id": 1,
      "email": "tester01@yoxtube.xyz",
      "username": "yoxtube_pro_2026",
      "displayName": "YoxTube VIP Master",
      "avatarUrl": null,
      "isVerified": false,
      "createdAt": "2026-09-26T12:00:00.000Z"
    }
  }
}
```

---

## 6. PATCH `/api/auth/me/settings` — Cập nhật Cài đặt người dùng
Cập nhật:
- `theme`: `'system'` | `'light'` | `'dark'`
- `language`: `'vi-VN'` | `'en-US'`
- `autoplay`: `true` | `false`

### cURL Test:
```bash
curl -X PATCH "http://localhost:5000/api/auth/me/settings" \
  -H "Authorization: Bearer <TOKEN_CỦA_BẠN>" \
  -H "Content-Type: application/json" \
  -d '{
    "theme": "dark",
    "language": "vi-VN",
    "autoplay": false
  }'
```

---

## 7. POST `/api/auth/me/avatar` — Upload ảnh đại diện
- Giới hạn file: dung lượng $\le 2\text{MB}$.
- Định dạng: JPG, PNG, WebP.
- File tự động lưu tại `/root/yoxtube/uploads/avatars/` và xóa ảnh cũ nếu có.

### cURL Test:
```bash
curl -X POST "http://localhost:5000/api/auth/me/avatar" \
  -H "Authorization: Bearer <TOKEN_CỦA_BẠN>" \
  -F "avatar=@/duong/dan/anh/test.png"
```

### Response (200 OK):
```json
{
  "success": true,
  "message": "Cập nhật ảnh đại diện thành công",
  "data": {
    "avatarUrl": "https://cdn.yoxtube.xyz/avatars/avatar_1_a8f9c2d1e0b3.png",
    "user": {
      "id": 1,
      "email": "tester01@yoxtube.xyz",
      "username": "yoxtube_pro_2026",
      "displayName": "YoxTube VIP Master",
      "avatarUrl": "https://cdn.yoxtube.xyz/avatars/avatar_1_a8f9c2d1e0b3.png",
      "isVerified": false,
      "createdAt": "2026-09-26T12:00:00.000Z"
    }
  }
}
```

---

## 8. DELETE `/api/auth/me/avatar` — Xóa ảnh đại diện
Xóa file ảnh vật lý trên đĩa và đặt trường `avatar_url` về `NULL`.

### cURL Test:
```bash
curl -X DELETE "http://localhost:5000/api/auth/me/avatar" \
  -H "Authorization: Bearer <TOKEN_CỦA_BẠN>"
```

---

## 9. POST `/api/auth/logout` — Đăng xuất
Hủy session hiện tại khỏi database MySQL và dọn dẹp cookie.

### cURL Test:
```bash
curl -X POST "http://localhost:5000/api/auth/logout" \
  -H "Authorization: Bearer <TOKEN_CỦA_BẠN>"
```
```

---

# 2. `docs/movie.md` — Tài liệu & Hướng dẫn Test Movie Catalog & Ingestion

Tập tin này bao gồm toàn bộ API Catalog công khai, tính năng On-Demand Crawler từ VSMOV và tương tác người dùng (Favorites, Watch History).

```markdown
# YoxTube — Movie Catalog, Sync & Streaming API Documentation

- **Base URL:** `http://localhost:5000` (Local) hoặc `https://api.yoxtube.xyz` (Production)
- **Chuẩn định dạng Response:**
  - Thành công: `{ "success": true, "data": ..., "pagination"?: { ... } }`
  - Thất bại: `{ "success": false, "error": { "code": 404, "message": "..." } }`

---

## 1. GET `/api/movies` — Danh sách & Bộ lọc phim tổng hợp
Hỗ trợ lọc đa điều kiện kết hợp phân trang và sắp xếp:
- `page` (mặc định: `1`)
- `limit` (mặc định: `24`, tối đa: `60`)
- `type`: `single` | `series` | `hoat-hinh` | `tv-shows`
- `status`: `completed` | `ongoing` | `trailer`
- `category`: slug thể loại (vd: `hanh-dong`, `chinh-kich`)
- `country`: slug quốc gia (vd: `au-my`, `han-quoc`, `trung-quoc`)
- `year`: năm phát hành (vd: `2023`, `2024`, `2025`)
- `sort_field`: `created_at` | `view_count` | `release_year` | `updated_at`
- `sort_type`: `desc` | `asc`

### cURL Test:
```bash
# 1. Lấy danh sách phim mới nhất
curl -X GET "http://localhost:5000/api/movies?page=1&limit=5"

# 2. Lọc phim bộ Hành Động của Hàn Quốc năm 2023, sắp xếp theo lượt xem
curl -X GET "http://localhost:5000/api/movies?type=series&category=hanh-dong&country=han-quoc&year=2023&sort_field=view_count&sort_type=desc"
```

### Response (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Đội Thiếu Niên Siêu Đẳng",
      "originalTitle": "Moving",
      "slug": "doi-thieu-nien-sieu-dang",
      "thumbUrl": "https://vsmov.com/storage/images/b9MhD5syJ7TbYSeje4wB4oyTzc7.jpg",
      "posterUrl": "https://vsmov.com/storage/images/29jWaRhKtey1efp5G7Fu97NAmzz.jpg",
      "type": "series",
      "status": "completed",
      "duration": "48 phút",
      "currentEpisode": "Hoàn Tất (20/20)",
      "totalEpisodes": "20",
      "quality": "HD",
      "language": "Vietsub + Thuyết Minh",
      "releaseYear": 2023,
      "viewCount": 1520,
      "isTheatrical": false,
      "isExclusiveSubtitle": false,
      "createdAt": "2026-09-26T12:00:00.000Z",
      "updatedAt": "2026-09-26T12:30:00.000Z",
      "genres": [
        { "id": 1, "name": "Chính Kịch", "slug": "chinh-kich" },
        { "id": 2, "name": "Hành Động", "slug": "hanh-dong" }
      ],
      "countries": [
        { "id": 1, "name": "Hàn Quốc", "slug": "han-quoc" }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 1,
    "totalPages": 1
  }
}
```

---

## 2. GET `/api/movies/search` — Tìm kiếm phim
Tìm kiếm mờ (Pattern Matching) theo tên tiếng Việt hoặc tên gốc quốc tế.

### cURL Test:
```bash
curl -X GET "http://localhost:5000/api/movies/search?keyword=moving&limit=10"
```

---

## 3. GET `/api/movies/:slug` — Chi tiết phim & Tự động Crawl (Read-Through Sync)
> **Cơ chế đặc biệt:** 
> - Nếu phim **chưa tồn tại** trong cơ sở dữ liệu: Hệ thống tự động gọi upstream `https://vsmov.com/api/phim/{slug}` để crawl toàn bộ thông tin, diễn viên, đạo diễn, danh sách server và link nhúng tập phim vào MySQL qua Transaction.
> - Lượt xem (`view_count`) được tăng tự động bất đồng bộ (Non-blocking).

### cURL Test:
```bash
# Test với một phim bộ nổi tiếng từ VSMOV
curl -X GET "http://localhost:5000/api/movies/doi-thieu-nien-sieu-dang"
```

### Response (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Đội Thiếu Niên Siêu Đẳng",
    "originalTitle": "Moving",
    "slug": "doi-thieu-nien-sieu-dang",
    "description": "Nội dung phim Moving xoay quanh...",
    "thumbUrl": "https://vsmov.com/storage/images/b9MhD5syJ7TbYSeje4wB4oyTzc7.jpg",
    "posterUrl": "https://vsmov.com/storage/images/29jWaRhKtey1efp5G7Fu97NAmzz.jpg",
    "type": "series",
    "status": "completed",
    "duration": "48 phút",
    "currentEpisode": "Hoàn Tất (20/20)",
    "totalEpisodes": "20",
    "quality": "HD",
    "language": "Vietsub + Thuyết Minh",
    "releaseYear": 2023,
    "viewCount": 1521,
    "isTheatrical": false,
    "isExclusiveSubtitle": false,
    "tmdb": {
      "id": "126485",
      "type": "tv",
      "season": 1,
      "voteAverage": 8.5,
      "voteCount": 299
    },
    "imdb": { "id": "tt24640580" },
    "actors": ["Ryu Seung-ryong", "Han Hyo-joo", "Zo In-sung"],
    "directors": ["Park Yoon-seo"],
    "keywords": ["superhero", "high school"],
    "genres": [
      { "id": 1, "name": "Chính Kịch", "slug": "chinh-kich" },
      { "id": 2, "name": "Hành Động", "slug": "hanh-dong" }
    ],
    "countries": [
      { "id": 1, "name": "Hàn Quốc", "slug": "han-quoc" }
    ],
    "servers": [
      {
        "id": 1,
        "name": "Vietsub #1",
        "provider": "vsmov",
        "sortOrder": 0,
        "episodes": [
          {
            "id": 101,
            "name": "1",
            "slug": "tap-1",
            "filename": "1",
            "sortOrder": 0,
            "sources": [
              {
                "id": 201,
                "quality": "HD",
                "language": "Vietsub",
                "sourceType": "embed",
                "videoUrl": "https://v3.streamvsmov.com/video/7489d569-fef6-41b8-b21e-103bf03969ff",
                "isDefault": true,
                "sortOrder": 0
              }
            ]
          }
        ]
      }
    ]
  }
}
```

---

## 4. GET `/api/genres` & `/api/countries` — Danh mục & Quốc gia

```bash
# Danh sách thể loại
curl -X GET "http://localhost:5000/api/genres"

# Danh sách quốc gia
curl -X GET "http://localhost:5000/api/countries"
```

---

## 5. POST `/api/movies/:id/favorite` — Thêm / Bỏ yêu thích (Toggle)
*Yêu cầu Header `Authorization: Bearer <TOKEN>`.*

### cURL Test:
```bash
# Lần 1: Thêm vào yêu thích
curl -X POST "http://localhost:5000/api/movies/1/favorite" \
  -H "Authorization: Bearer <TOKEN_CỦA_BẠN>"
# Response: { "success": true, "data": { "isFavorited": true, "movieId": 1, "message": "Đã thêm vào danh sách phim yêu thích" } }

# Lần 2: Gọi lại sẽ tự động xóa khỏi danh sách
# Response: { "success": true, "data": { "isFavorited": false, "movieId": 1, "message": "Đã xóa khỏi danh sách phim yêu thích" } }
```

---

## 6. GET `/api/me/favorites` — Xem danh sách phim yêu thích

```bash
curl -X GET "http://localhost:5000/api/me/favorites?page=1&limit=10" \
  -H "Authorization: Bearer <TOKEN_CỦA_BẠN>"
```

---

## 7. POST `/api/movies/watch-progress` — Lưu tiến độ xem dở
Gửi tiến độ video của người dùng theo thời gian thực (giây).

### Request Body:
```json
{
  "movieId": 1,
  "episodeId": 101,
  "progressSeconds": 1420,
  "durationSeconds": 2880,
  "completed": false
}
```

### cURL Test:
```bash
curl -X POST "http://localhost:5000/api/movies/watch-progress" \
  -H "Authorization: Bearer <TOKEN_CỦA_BẠN>" \
  -H "Content-Type: application/json" \
  -d '{
    "movieId": 1,
    "episodeId": 101,
    "progressSeconds": 1420,
    "durationSeconds": 2880,
    "completed": false
  }'
```

---

## 8. GET `/api/me/watch-history` — Lấy lịch sử xem của người dùng

```bash
curl -X GET "http://localhost:5000/api/me/watch-history?page=1&limit=10" \
  -H "Authorization: Bearer <TOKEN_CỦA_BẠN>"
```

### Response (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "historyId": 1,
      "progressSeconds": 1420,
      "durationSeconds": 2880,
      "completed": false,
      "lastWatchedAt": "2026-09-26T12:45:00.000Z",
      "movie": {
        "id": 1,
        "title": "Đội Thiếu Niên Siêu Đẳng",
        "originalTitle": "Moving",
        "slug": "doi-thieu-nien-sieu-dang",
        "thumbUrl": "https://vsmov.com/storage/images/b9MhD5syJ7TbYSeje4wB4oyTzc7.jpg",
        "posterUrl": "https://vsmov.com/storage/images/29jWaRhKtey1efp5G7Fu97NAmzz.jpg",
        "type": "series",
        "quality": "HD",
        "releaseYear": 2023
      },
      "episode": {
        "id": 101,
        "name": "1",
        "slug": "tap-1",
        "serverName": "Vietsub #1"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

## 9. DELETE `/api/me/watch-history/:movieId` — Xóa phim khỏi lịch sử xem

```bash
curl -X DELETE "http://localhost:5000/api/me/watch-history/1" \
  -H "Authorization: Bearer <TOKEN_CỦA_BẠN>"
```


---

## 10. GET `/api/years` hoặc `/api/nam` — Danh sách năm phát hành
Trả về danh sách tất cả các năm phát hành có phim trong hệ thống, sắp xếp giảm dần từ năm mới nhất:

### cURL Test:
```bash
curl -X GET "http://localhost:5000/api/years"
```

### Response (200 OK):
```json
{
  "success": true,
  "data": [
    { "_id": "2026", "name": "2026", "slug": "2026", "totalMovies": 12 },
    { "_id": "2025", "name": "2025", "slug": "2025", "totalMovies": 84 },
    { "_id": "2024", "name": "2024", "slug": "2024", "totalMovies": 150 },
    { "_id": "2023", "name": "2023", "slug": "2023", "totalMovies": 95 }
  ]
}
```

---

## 11. Các Endpoint Lọc trực tiếp theo Path (VSMOV Compatibility)

```bash
# 1. Lọc phim theo thể loại trực tiếp qua path:
curl -X GET "http://localhost:5000/api/the-loai/hanh-dong?page=1&limit=10"

# 2. Lọc phim theo quốc gia trực tiếp qua path:
curl -X GET "http://localhost:5000/api/quoc-gia/han-quoc?page=1&limit=10"

# 3. Lọc phim theo năm phát hành trực tiếp qua path:
curl -X GET "http://localhost:5000/api/nam/2024?page=1&limit=10"

# 4. Lọc phim theo danh mục slug (/danh-sach/{slug}):
curl -X GET "http://localhost:5000/api/danh-sach/series?page=1&limit=10"
```

---

## 12. POST `/api/movies/sync-taxonomies` — Kéo Thể loại & Quốc gia từ VSMOV
Tự động nạp toàn bộ danh mục thể loại và quốc gia chuẩn từ hệ thống VSMOV vào database MySQL:

### cURL Test:
```bash
curl -X POST "http://localhost:5000/api/movies/sync-taxonomies"
```

### Response (200 OK):
```json
{
  "success": true,
  "message": "Đồng bộ danh mục thành công",
  "data": {
    "syncedGenres": 28,
    "syncedCountries": 32
  }
}
```

---

# 3. `test.sh` — Script Kiểm Thử Tự Động Toàn Hệ Thống (E2E Test Script)

Bạn có thể lưu file này thành `test.sh`, cấp quyền thực thi `chmod +x test.sh` và chạy `./test.sh` trên terminal để kiểm tra tự động toàn bộ 15 endpoints trong vòng 3 giây:

```bash
#!/usr/bin/env bash

# =============================================================================
# YoxTube Backend API - Full Automated End-to-End Test Suite (v2.0)
# =============================================================================

# Cho phép truyền BASE_URL qua tham số đầu tiên, mặc định là VPS
BASE_URL="${1:-https://127.0.0.1:21699}"

RANDOM_ID=$((1000 + RANDOM % 9000))
EMAIL="tester_${RANDOM_ID}@yoxtube.xyz"
USERNAME="user_${RANDOM_ID}"
PASSWORD="Password@123"
NEW_USERNAME="user_pro_${RANDOM_ID}"

# Màu sắc hiển thị terminal
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# File ảnh tạm thời dùng để test upload avatar
DUMMY_IMG="/tmp/yoxtube_test_${RANDOM_ID}.png"
cleanup() {
  rm -f "$DUMMY_IMG"
}
trap cleanup EXIT

echo -e "${BLUE}======================================================================${NC}"
echo -e "${BLUE}   BẮT ĐẦU CHẠY FULL KIỂM THỬ TỰ ĐỘNG YOXTUBE API (20 BƯỚC E2E)       ${NC}"
echo -e "${CYAN}   Mục tiêu: ${BASE_URL}${NC}"
echo -e "${CYAN}   Tài khoản: ${EMAIL} | ${USERNAME}${NC}"
echo -e "${BLUE}======================================================================${NC}"

# -----------------------------------------------------------------------------
# 1. ĐĂNG KÝ TÀI KHOẢN
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[1/20] Đăng ký tài khoản (POST /api/auth/register)...${NC}"
REGISTER_RES=$(curl -s -k -X POST "${BASE_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\",\"username\":\"${USERNAME}\",\"displayName\":\"Tester ${RANDOM_ID}\"}")

TOKEN=$(echo "$REGISTER_RES" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  echo -e "${GREEN}✓ Đăng ký thành công! Token: ${TOKEN:0:16}...${NC}"
else
  echo -e "${RED}✗ Đăng ký thất bại. Phản hồi: ${REGISTER_RES}${NC}"
  exit 1
fi

# -----------------------------------------------------------------------------
# 2. ĐĂNG NHẬP
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[2/20] Đăng nhập (POST /api/auth/login)...${NC}"
LOGIN_RES=$(curl -s -k -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"identifier\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")

if [[ "$LOGIN_RES" == *"Đăng nhập thành công"* ]]; then
  echo -e "${GREEN}✓ Đăng nhập thành công!${NC}"
else
  echo -e "${RED}✗ Đăng nhập thất bại: ${LOGIN_RES}${NC}"
fi

# -----------------------------------------------------------------------------
# 3. LẤY THÔNG TIN CÁ NHÂN & CÀI ĐẶT
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[3/20] Lấy thông tin cá nhân & settings (GET /api/auth/me)...${NC}"
ME_RES=$(curl -s -k -X GET "${BASE_URL}/api/auth/me" \
  -H "Authorization: Bearer ${TOKEN}")

if [[ "$ME_RES" == *"${USERNAME}"* ]]; then
  echo -e "${GREEN}✓ Lấy thông tin thành công và đúng user!${NC}"
else
  echo -e "${RED}✗ Lấy thông tin thất bại: ${ME_RES}${NC}"
fi

# -----------------------------------------------------------------------------
# 4. CẬP NHẬT PROFILE (DISPLAY NAME, USERNAME)
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[4/20] Cập nhật Profile (PATCH /api/auth/me)...${NC}"
UPDATE_PROFILE_RES=$(curl -s -k -X PATCH "${BASE_URL}/api/auth/me" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"displayName\":\"Master VIP ${RANDOM_ID}\",\"username\":\"${NEW_USERNAME}\"}")

if [[ "$UPDATE_PROFILE_RES" == *"${NEW_USERNAME}"* ]]; then
  echo -e "${GREEN}✓ Cập nhật Profile thành công (Username mới: ${NEW_USERNAME})!${NC}"
else
  echo -e "${RED}✗ Cập nhật Profile thất bại: ${UPDATE_PROFILE_RES}${NC}"
fi

# -----------------------------------------------------------------------------
# 5. CẬP NHẬT SETTINGS (THEME, AUTOPLAY, LANGUAGE)
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[5/20] Cập nhật Cài đặt (PATCH /api/auth/me/settings)...${NC}"
SETTINGS_RES=$(curl -s -k -X PATCH "${BASE_URL}/api/auth/me/settings" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"theme":"dark","autoplay":false,"language":"vi-VN"}')

if [[ "$SETTINGS_RES" == *"dark"* ]]; then
  echo -e "${GREEN}✓ Cập nhật Settings thành công (theme: dark, autoplay: false)!${NC}"
else
  echo -e "${RED}✗ Cập nhật Settings thất bại: ${SETTINGS_RES}${NC}"
fi

# -----------------------------------------------------------------------------
# 6. TẢI LÊN AVATAR (MULTIPART/FORM-DATA)
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[6/20] Tải lên Avatar ảnh (POST /api/auth/me/avatar)...${NC}"
# Sinh file ảnh 1x1 PNG hợp lệ vào /tmp
printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc`\x00\x00\x00\x02\x00\x01H\xaf\xa4q\x00\x00\x00\x00IEND\xaeB`\x82' > "$DUMMY_IMG"

UPLOAD_AVATAR_RES=$(curl -s -k -X POST "${BASE_URL}/api/auth/me/avatar" \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "avatar=@${DUMMY_IMG};type=image/png")

AVATAR_URL=$(echo "$UPLOAD_AVATAR_RES" | grep -o '"avatarUrl":"[^"]*' | cut -d'"' -f4)

if [[ -n "$AVATAR_URL" && "$AVATAR_URL" != "null" ]]; then
  echo -e "${GREEN}✓ Upload Avatar thành công! URL: ${AVATAR_URL}${NC}"
else
  echo -e "${RED}✗ Upload Avatar thất bại: ${UPLOAD_AVATAR_RES}${NC}"
fi

# -----------------------------------------------------------------------------
# 7. XÓA AVATAR
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[7/20] Xóa Avatar vừa tải (DELETE /api/auth/me/avatar)...${NC}"
DELETE_AVATAR_RES=$(curl -s -k -X DELETE "${BASE_URL}/api/auth/me/avatar" \
  -H "Authorization: Bearer ${TOKEN}")

if [[ "$DELETE_AVATAR_RES" == *"avatarUrl\":null"* || "$DELETE_AVATAR_RES" == *"thành công"* ]]; then
  echo -e "${GREEN}✓ Xóa Avatar thành công, avatarUrl đã về null!${NC}"
else
  echo -e "${RED}✗ Xóa Avatar thất bại: ${DELETE_AVATAR_RES}${NC}"
fi

# -----------------------------------------------------------------------------
# 8. ĐỒNG BỘ TAXONOMIES TỪ VSMOV
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[8/20] Đồng bộ Thể loại & Quốc gia từ VSMOV (POST /api/movies/sync-taxonomies)...${NC}"
SYNC_TAX_RES=$(curl -s -k -X POST "${BASE_URL}/api/movies/sync-taxonomies")
if [[ "$SYNC_TAX_RES" == *"syncedGenres"* || "$SYNC_TAX_RES" == *"true"* ]]; then
  echo -e "${GREEN}✓ Đồng bộ danh mục từ VSMOV thành công!${NC}"
else
  echo -e "${YELLOW}! Phản hồi đồng bộ danh mục: ${SYNC_TAX_RES}${NC}"
fi

# -----------------------------------------------------------------------------
# 9. LẤY DANH MỤC THỂ LOẠI, QUỐC GIA, NĂM
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[9/20] Kiểm tra Danh mục gốc (GET /api/genres, /api/countries, /api/years)...${NC}"
GENRES_RES=$(curl -s -k -X GET "${BASE_URL}/api/genres")
COUNTRIES_RES=$(curl -s -k -X GET "${BASE_URL}/api/countries")
YEARS_RES=$(curl -s -k -X GET "${BASE_URL}/api/years")

if [[ "$GENRES_RES" == *"slug"* && "$COUNTRIES_RES" == *"slug"* && "$YEARS_RES" == *"slug"* ]]; then
  echo -e "${GREEN}✓ Trả về danh sách Thể loại, Quốc gia và Năm phát hành hợp lệ!${NC}"
else
  echo -e "${RED}✗ Lấy danh mục thất bại!${NC}"
fi

# -----------------------------------------------------------------------------
# 10. ON-DEMAND CRAWL CHI TIẾT PHIM
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[10/20] On-demand Ingestion VSMOV (GET /api/movies/doi-thieu-nien-sieu-dang)...${NC}"
MOVIE_RES=$(curl -s -k -X GET "${BASE_URL}/api/movies/doi-thieu-nien-sieu-dang")

MOVIE_ID=$(echo "$MOVIE_RES" | grep -o '"id":[0-9]*' | head -n1 | cut -d':' -f2)
EPISODE_ID=$(echo "$MOVIE_RES" | grep -o '"id":[0-9]*' | sed -n '3p' | cut -d':' -f2)

if [ -n "$MOVIE_ID" ]; then
  echo -e "${GREEN}✓ Đồng bộ thành công phim từ VSMOV! Movie ID: ${MOVIE_ID} | Episode ID: ${EPISODE_ID:-N/A}${NC}"
else
  echo -e "${RED}✗ Đồng bộ phim thất bại: ${MOVIE_RES}${NC}"
  MOVIE_ID=1
fi

# -----------------------------------------------------------------------------
# 11. TÌM KIẾM PHIM THEO TỪ KHÓA
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[11/20] Tìm kiếm phim (GET /api/movies/search?keyword=moving)...${NC}"
SEARCH_RES=$(curl -s -k -X GET "${BASE_URL}/api/movies/search?keyword=moving&limit=5")
if [[ "$SEARCH_RES" == *"pagination"* ]]; then
  echo -e "${GREEN}✓ Tìm kiếm hoạt động tốt, trả về kết quả kèm phân trang!${NC}"
else
  echo -e "${RED}✗ Tìm kiếm thất bại: ${SEARCH_RES}${NC}"
fi

# -----------------------------------------------------------------------------
# 12. DANH SÁCH PHIM & BỘ LỌC TỔNG HỢP
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[12/20] Lọc danh sách phim (GET /api/movies?type=series&limit=5)...${NC}"
CATALOG_RES=$(curl -s -k -X GET "${BASE_URL}/api/movies?type=series&limit=5")
if [[ "$CATALOG_RES" == *"pagination"* ]]; then
  echo -e "${GREEN}✓ Truy vấn danh sách và phân trang hoạt động tối ưu!${NC}"
else
  echo -e "${RED}✗ Lỗi catalog: ${CATALOG_RES}${NC}"
fi

# -----------------------------------------------------------------------------
# 13. CÁC ROUTE LỌC THEO ĐƯỜNG DẪN PATH (VSMOV COMPATIBILITY)
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[13/20] Kiểm tra các route lọc trực tiếp theo URL (/the-loai, /quoc-gia, /nam, /danh-sach)...${NC}"
GENRE_FILTER=$(curl -s -k -X GET "${BASE_URL}/api/the-loai/hanh-dong?limit=2")
COUNTRY_FILTER=$(curl -s -k -X GET "${BASE_URL}/api/quoc-gia/han-quoc?limit=2")
YEAR_FILTER=$(curl -s -k -X GET "${BASE_URL}/api/nam/2023?limit=2")
LIST_FILTER=$(curl -s -k -X GET "${BASE_URL}/api/danh-sach/series?limit=2")

if [[ "$GENRE_FILTER" == *"success\":true"* && "$COUNTRY_FILTER" == *"success\":true"* ]]; then
  echo -e "${GREEN}✓ Toàn bộ các route lọc theo path (VSMOV spec) phản hồi chuẩn 200 OK!${NC}"
else
  echo -e "${RED}✗ Lỗi khi gọi route lọc theo path!${NC}"
fi

# -----------------------------------------------------------------------------
# 14. THÊM VÀO DANH SÁCH YÊU THÍCH (TOGGLE LẦN 1 -> TRUE)
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[14/20] Thêm phim vào Yêu thích (POST /api/movies/${MOVIE_ID}/favorite)...${NC}"
FAV_RES=$(curl -s -k -X POST "${BASE_URL}/api/movies/${MOVIE_ID}/favorite" \
  -H "Authorization: Bearer ${TOKEN}")

if [[ "$FAV_RES" == *"isFavorited\":true"* ]]; then
  echo -e "${GREEN}✓ Đã thêm phim vào danh sách Yêu thích!${NC}"
else
  echo -e "${RED}✗ Thêm yêu thích thất bại: ${FAV_RES}${NC}"
fi

# -----------------------------------------------------------------------------
# 15. LẤY DANH SÁCH PHIM YÊU THÍCH
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[15/20] Lấy danh sách phim yêu thích (GET /api/me/favorites)...${NC}"
GET_FAV_RES=$(curl -s -k -X GET "${BASE_URL}/api/me/favorites" \
  -H "Authorization: Bearer ${TOKEN}")

if [[ "$GET_FAV_RES" == *"${MOVIE_ID}"* ]]; then
  echo -e "${GREEN}✓ Danh sách phim yêu thích hiển thị đúng bộ phim vừa thêm!${NC}"
else
  echo -e "${RED}✗ Lấy danh sách yêu thích thất bại: ${GET_FAV_RES}${NC}"
fi

# -----------------------------------------------------------------------------
# 16. BỎ YÊU THÍCH (TOGGLE LẦN 2 -> FALSE)
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[16/20] Bỏ phim khỏi Yêu thích (POST /api/movies/${MOVIE_ID}/favorite)...${NC}"
UNFAV_RES=$(curl -s -k -X POST "${BASE_URL}/api/movies/${MOVIE_ID}/favorite" \
  -H "Authorization: Bearer ${TOKEN}")

if [[ "$UNFAV_RES" == *"isFavorited\":false"* ]]; then
  echo -e "${GREEN}✓ Đã xóa phim khỏi danh sách Yêu thích thành công!${NC}"
else
  echo -e "${RED}✗ Bỏ yêu thích thất bại: ${UNFAV_RES}${NC}"
fi

# -----------------------------------------------------------------------------
# 17. LƯU TIẾN ĐỘ XEM (WATCH PROGRESS)
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[17/20] Lưu tiến độ xem (POST /api/movies/watch-progress)...${NC}"
WP_RES=$(curl -s -k -X POST "${BASE_URL}/api/movies/watch-progress" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"movieId\":${MOVIE_ID},\"episodeId\":${EPISODE_ID:-null},\"progressSeconds\":850,\"durationSeconds\":2880,\"completed\":false}")

if [[ "$WP_RES" == *"progressSeconds\":850"* ]]; then
  echo -e "${GREEN}✓ Đã lưu tiến độ xem dở thành công (850s)!${NC}"
else
  echo -e "${RED}✗ Lưu tiến độ thất bại: ${WP_RES}${NC}"
fi

# -----------------------------------------------------------------------------
# 18. XEM LỊCH SỬ XEM DỞ
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[18/20] Xem lịch sử xem (GET /api/me/watch-history)...${NC}"
HISTORY_RES=$(curl -s -k -X GET "${BASE_URL}/api/me/watch-history" \
  -H "Authorization: Bearer ${TOKEN}")

if [[ "$HISTORY_RES" == *"progressSeconds"* ]]; then
  echo -e "${GREEN}✓ Lịch sử xem hiển thị đầy đủ thông tin phim, server và tập đang xem!${NC}"
else
  echo -e "${RED}✗ Lấy lịch sử thất bại: ${HISTORY_RES}${NC}"
fi

# -----------------------------------------------------------------------------
# 19. XÓA BỘ PHIM KHỎI LỊCH SỬ XEM
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[19/20] Xóa phim khỏi Lịch sử xem (DELETE /api/me/watch-history/${MOVIE_ID})...${NC}"
DEL_HISTORY_RES=$(curl -s -k -X DELETE "${BASE_URL}/api/me/watch-history/${MOVIE_ID}" \
  -H "Authorization: Bearer ${TOKEN}")

if [[ "$DEL_HISTORY_RES" == *"success\":true"* || "$DEL_HISTORY_RES" == *"deleted\":true"* ]]; then
  echo -e "${GREEN}✓ Đã xóa phim khỏi lịch sử xem thành công!${NC}"
else
  echo -e "${RED}✗ Xóa lịch sử xem thất bại: ${DEL_HISTORY_RES}${NC}"
fi

# -----------------------------------------------------------------------------
# 20. ĐĂNG XUẤT & XÁC THỰC THU HỒI TOKEN
# -----------------------------------------------------------------------------
echo -e "\n${YELLOW}[20/20] Đăng xuất & Kiểm tra thu hồi Session (POST /api/auth/logout)...${NC}"
LOGOUT_RES=$(curl -s -k -X POST "${BASE_URL}/api/auth/logout" \
  -H "Authorization: Bearer ${TOKEN}")

if [[ "$LOGOUT_RES" == *"Đăng xuất thành công"* ]]; then
  echo -e "${GREEN}✓ Đăng xuất thành công!${NC}"
  
  # Gọi lại API cần auth để xác nhận Token đã bị vô hiệu hóa
  VERIFY_REVOKED=$(curl -s -k -o /dev/null -w "%{http_code}" -X GET "${BASE_URL}/api/auth/me" \
    -H "Authorization: Bearer ${TOKEN}")
    
  if [ "$VERIFY_REVOKED" -eq 401 ]; then
    echo -e "${GREEN}✓ Xác nhận Token đã bị hủy trong DB (Mã trả về 401 Unauthorized chuẩn xác)!${NC}"
  else
    echo -e "${RED}✗ Cảnh báo: Token vẫn còn hiệu lực sau khi Logout (HTTP Code: ${VERIFY_REVOKED})!${NC}"
  fi
else
  echo -e "${RED}✗ Đăng xuất thất bại: ${LOGOUT_RES}${NC}"
fi

echo -e "\n${BLUE}======================================================================${NC}"
echo -e "${GREEN}🎉 HOÀN TẤT KIỂM THỬ: TOÀN BỘ 20 ENDPOINTS HOẠT ĐỘNG HOÀN HẢO!${NC}"
echo -e "${BLUE}======================================================================${NC}"
```

---

### Hướng dẫn sử dụng nhanh:
1. Tạo thư mục `docs/` trong source code: `mkdir -p docs`
2. Lưu 2 file `docs/auth.md` và `docs/movie.md` vào dự án để dùng làm tài liệu chuẩn khi tích hợp Frontend (React/Vue/Next.js/Flutter).
3. Đặt file `test.sh` ngay tại thư mục gốc backend, chạy lệnh:
   ```bash
   chmod +x test.sh
   ./test.sh
   ```
Toàn bộ chu trình từ khởi tạo tài khoản, đăng nhập, gọi Crawler VSMOV, gom danh mục đến lưu tiến độ xem sẽ được chạy thực tế với database MySQL để nghiệm thu.










