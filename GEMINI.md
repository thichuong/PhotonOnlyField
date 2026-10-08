# Agent Rules & UI Design Guidelines

## Quy Tắc Cỡ Chữ Giao Diện (Font Size Rule)
- **Cỡ chữ tối thiểu (Minimum Font Size)**: Tuyệt đối không sử dụng cỡ chữ nhỏ hơn 12px (hoặc tương đương) trong toàn bộ mã nguồn giao diện (UI components, cards, buttons, badges, helper texts, tooltips, hướng dẫn).
- **Quy chuẩn Tailwind CSS**:
  - **NGHIÊM CẤM** sử dụng các arbitrary class nhỏ hơn 12px: `text-[8px]`, `text-[9px]`, `text-[10px]`, `text-[11px]`, v.v.
  - **Kích thước tối thiểu cho phép là `text-xs` (12px)**.
  - Khi thêm hoặc chỉnh sửa văn bản hướng dẫn, mẹo (tips), giải thích vật lý, chú thích quan trọng: ưu tiên sử dụng `text-sm` (14px) hoặc tối thiểu `text-xs` (12px) với font-weight phù hợp (`font-medium`) và độ tương phản cao (`text-slate-200`, `text-slate-300`) để đảm bảo trải nghiệm đọc và tính trực quan tốt nhất.

