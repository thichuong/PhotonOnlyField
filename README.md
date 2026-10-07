# Photon: Only Field 🌌

> **"There are no particles, there are only fields."** — Art Hobson, *American Journal of Physics*

Ứng dụng web tương tác trực quan hóa bản chất của **Photon dưới lăng kính Thuyết Trường Lượng Tử (Quantum Field Theory - QFT)**: *Photon không phải là một hạt bi bay trong chân không, mà là lượng tử kích thích (quantum excitation) của Trường Điện Từ.*

🌐 **Trải nghiệm trực tuyến**: [photon-only-field.pages.dev](https://photon-only-field.pages.dev)

---

## 🌟 Tính Năng Nổi Bật

### 1. Mô Phỏng 3D Trường Lượng Tử (Three.js WebGL Engine)
* **Dao động Chân Không (Zero-Point Energy / Quantum Vacuum Fluctuation):** Không gian không bao giờ rỗng mà luôn có nhiễu lượng tử mức $0$ ($E_0 = \frac{1}{2}\hbar\omega$).
* **Kích Thích Photon ($a^\dagger|0\rangle$):** Bấm phát photon để quan sát gói sóng cục bộ (localized wavepacket) trồi lên và lan truyền trên mặt lưới trường.
* **Chế độ so sánh 3 mô hình:**
  * *Hạt Newton (1704):* Mô hình vi hạt bay theo quỹ đạo đạn thẳng.
  * *Sóng Maxwell (1865):* Sóng hình sin vô hạn của trường điện từ cổ điển.
  * *Trường QFT (Hiện đại):* Gói sóng lượng tử kích thích từ trường nền.
* **Tương tác 3D:** Xoay tự do 360°, phóng to/thu nhỏ bằng chuột, nhấp đúp vào mặt lưới để tạo sóng xáo động (Field Perturbation).

### 2. Dòng Thời Gian Lịch Sử & Chuyển Dịch Hệ Tư Tưởng (Paradigm Shifts)
Hành trình 300 năm lịch sử qua 7 cột mốc vĩ đại:
1. **1704 - Isaac Newton:** Thuyết hạt ánh sáng (Corpuscular Theory).
2. **1801 - Thomas Young:** Thí nghiệm 2 khe & Khẳng định bản chất sóng.
3. **1865 - James Clerk Maxwell:** Thống nhất Điện - Từ & Phương trình sóng điện từ.
4. **1900 - Max Planck:** Lượng tử hóa năng lượng vật đen ($E = nh\nu$).
5. **1905 - Albert Einstein:** Hiệu ứng quang điện & Khái niệm gói lượng tử ánh sáng.
6. **1927 - Paul Dirac:** Lượng tử hóa bức xạ điện từ (Second Quantization, $a^\dagger, a$).
7. **1948 - Feynman, Schwinger, Tomonaga:** Điện động lực học lượng tử (QED) & Trao đổi photon ảo.

*Mỗi cột mốc đều có nút kích hoạt ngay trạng thái mô phỏng 3D tương ứng.*

### 3. Phòng Thí Nghiệm Ảo Tương Tác
* **Lab 1: Khe kép với Photon đơn lẻ:** Bắn từng photon một, quan sát sự tích tụ ngẫu nhiên từng điểm nhưng dần dần tạo nên vân giao thoa xác suất $|\psi|^2$.
* **Lab 2: Hiệu ứng quang điện (Einstein):** Thay đổi kim loại catốt (Cs, K, Na, Zn, Cu), điều chỉnh bước sóng từ UV tới ánh sáng đỏ, chứng minh năng lượng $h\nu$ độc lập với cường độ sáng.
* **Lab 3: Trạng thái Fock $|n\rangle$:** Khám phá thang năng lượng dao động tử điều hòa $E = (n + \frac{1}{2})\hbar\omega$, thử nghiệm toán tử sinh $a^\dagger$ và hủy $a$.

---

## 🛠️ Công Nghệ Sử Dụng

* **Frontend:** React 19, TypeScript, Vite
* **Đồ họa 3D:** Three.js (WebGL 60fps dynamic mesh deformation)
* **Styling & Icons:** Tailwind CSS v4, Lucide React
* **Công thức toán:** KaTeX
* **Testing:** Node.js native test runner (`node:test`, `node:assert`)

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy

### 1. Khởi chạy môi trường phát triển (Dev Server)
```bash
npm run dev
```
Mở trình duyệt tại: `http://localhost:5173`

### 2. Chạy bộ kiểm thử (Unit & Physics Logic Tests)
```bash
npm test
```

### 3. Đóng gói cho Production
```bash
npm run build
```
Thư mục xuất xưởng: `dist/`

### 4. Triển khai lên Cloudflare Pages (CLI)
Ứng dụng được triển khai trực tiếp lên **Cloudflare Pages**:

* **Demo Trực Tuyến**: [https://photon-only-field.pages.dev](https://photon-only-field.pages.dev)

* **Lệnh deploy (tự động build & deploy)**:
  ```bash
  npm run deploy
  ```

* **Deploy thủ công bằng Wrangler CLI**:
  ```bash
  # Đăng nhập lần đầu nếu cần
  npx wrangler login

  # Triển khai bản build lên Cloudflare Pages
  npx wrangler pages deploy dist --project-name=photon-only-field
  ```

