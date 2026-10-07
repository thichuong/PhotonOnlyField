import { MathFormula } from '../common/MathFormula';
import { HelpCircle } from 'lucide-react';

export const QFTDeepDive: React.FC = () => {
  return (
    <section className="my-16 flex flex-col gap-10">
      {/* Title */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-widest">
          <HelpCircle className="w-4 h-4" />
          <span>Bản chất vật lý cốt lõi</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Tại sao lại nói: "Không có hạt nào cả, chỉ có các trường"?
        </h2>
        <p className="text-slate-400 max-w-3xl text-sm leading-relaxed">
          Nhà vật lý lượng tử nổi tiếng Art Hobson từng viết bài luận chấn động: <em>"There are no particles, there are only fields"</em>. Hãy cùng giải mã ẩn dụ này một cách đơn giản nhất.
        </p>
      </div>

      {/* Lake Analogy Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 lg:p-8 backdrop-blur-md">
        <div className="flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-3">
            <span className="px-3 py-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs font-mono font-bold w-fit">
              Ẩn dụ trực quan
            </span>
            <h3 className="text-xl font-bold text-white">
              Ẩn dụ về Mặt Hồ Nước Lượng Tử
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Hãy tưởng tượng vũ trụ là một <strong className="text-cyan-300">mặt hồ nước mênh mông</strong>.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold shrink-0">1. Chân không:</span>
                <span>Mặt hồ khi không có ai chạm vào trông phẳng lặng, nhưng ở cấp độ vi mô, các phân tử nước vẫn rung rinh nhiệt nhẹ (đây là <em>dao động chân không lượng tử</em>).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold shrink-0">2. Photon là gì:</span>
                <span>Khi ai đó ném một viên sỏi vào hồ, một <strong>gợn sóng nhấp nhô</strong> lan truyền trên mặt nước. Bạn không thể tách gợn sóng đó ra khỏi mặt hồ để cất vào túi. Bản thân gợn sóng chính là NƯỚC ĐANG DAO ĐỘNG!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold shrink-0">3. Vũ trụ:</span>
                <span>Không có hạt ánh sáng nào tự bay trong hư không cả. Photon chính là <strong>gợn sóng lan truyền trên Trường Điện Từ</strong>!</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Why do we detect it as a particle? */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-3">
            <span className="px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-mono font-bold w-fit">
              Câu hỏi kinh điển
            </span>
            <h3 className="text-xl font-bold text-white">
              Nếu là sóng/trường, tại sao máy đo lại kêu "tách" như bị một hạt bắn vào?
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Đó là do <strong className="text-amber-300">quy tắc tương tác lượng tử hóa</strong>:
            </p>
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
              Trường điện từ chỉ có thể trao đổi năng lượng với các trường vật chất (như trường electron của detector) theo từng <em>gói trọn vẹn</em> <MathFormula math="E = h\nu" />. Toàn bộ năng lượng của gói sóng trường hội tụ sụp đổ cục bộ vào một nguyên tử duy nhất.
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Ảo ảnh "hạt" sinh ra ở khoảnh khắc tương tác, chứ trên đường bay, ánh sáng hoàn toàn là một trường sóng trải rộng!
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Matrix Table */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-white">
          Bảng Đối Chiếu 3 Mô Hình Vật Lý Về Ánh Sáng
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs bg-slate-900/60">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="p-4">Tiêu chí</th>
                <th className="p-4 text-amber-300">1. Hạt Cổ Điển (Newton)</th>
                <th className="p-4 text-purple-300">2. Sóng Cổ Điển (Maxwell)</th>
                <th className="p-4 text-cyan-300">3. Trường Lượng Tử QFT (Chính xác)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr>
                <td className="p-4 font-semibold text-slate-200">Bản chất ánh sáng</td>
                <td className="p-4">Viên bi nhỏ có khối lượng</td>
                <td className="p-4">Sóng liên tục của trường E & B</td>
                <td className="p-4 text-cyan-200 font-medium">Gói dao động lượng tử của trường E & B</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-200">Không gian chân không</td>
                <td className="p-4">Hoàn toàn rỗng không</td>
                <td className="p-4">Chứa trường liên tục ở trạng thái 0</td>
                <td className="p-4 text-cyan-200 font-medium">Chứa trường lượng tử liên tục dao động (ZPE)</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-200">Năng lượng</td>
                <td className="p-4">Động năng liên tục ½mv²</td>
                <td className="p-4">Mật độ năng lượng liên tục tỉ lệ A²</td>
                <td className="p-4 text-cyan-200 font-medium">Rời rạc theo từng bậc: E = (n + ½)ℏω</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-200">Giải thích Giao thoa</td>
                <td className="p-4 text-rose-400">Không thể (Hạt không tự triệt tiêu)</td>
                <td className="p-4 text-emerald-400">Tuyệt vời (Cộng biên độ sóng)</td>
                <td className="p-4 text-emerald-400 font-medium">Hoàn hảo (Biên độ xác suất của trường giao thoa)</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-200">Giải thích Quang điện</td>
                <td className="p-4 text-rose-400">Không giải thích được phụ thuộc tần số</td>
                <td className="p-4 text-rose-400">Thất bại (Dự đoán năng lượng phụ thuộc cường độ)</td>
                <td className="p-4 text-emerald-400 font-medium">Tuyệt đối (Năng lượng truyền theo từng gói hν)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
