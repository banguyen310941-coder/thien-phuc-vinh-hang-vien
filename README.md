# Thiên Phúc Vĩnh Hằng Viên

Website giới thiệu dự án Thiên Phúc Vĩnh Hằng Viên.

## Phiên bản V1
- Trang chủ responsive
- Giới thiệu dự án
- Sản phẩm và dịch vụ
- Tiện ích, vị trí, thư viện hình ảnh
- Tin tức và form đăng ký tư vấn

Website đang trong quá trình hoàn thiện nội dung và hình ảnh chính thức.

## Kiểm tra SEO

Chạy `node --test tests/news-seo.test.js` tại thư mục gốc, không cần cài thêm thư viện.
Bộ kiểm tra đối chiếu các URL sitemap với HTML, canonical, H1, JSON-LD và liên kết nội bộ.

Trang `/tin-tuc` được rewrite đến `api/news?view=page` qua `lib/news-page.js`. Handler dùng `tin-tuc.html`
làm mẫu và render toàn bộ bài đã xuất bản từ `lib/news-store.js` vào HTML.
Giữ các marker `NEWS_GRID_START`, `NEWS_GRID_END` và `NEWS_BOOTSTRAP` khi sửa mẫu.
Bộ lọc phía trình duyệt dùng tóm tắt bài viết được nhúng sẵn, không phụ thuộc `/api/news`.

Sau khi triển khai, kiểm tra HTML gốc của `/tin-tuc` có đủ bài đã xuất bản,
thử tìm kiếm/lọc trên desktop và mobile, kiểm tra hai redirect `/khu-mo-gia-toc`
và `/tin-tuc/gia-mo-don`, rồi đối chiếu lại `/sitemap.xml`.
