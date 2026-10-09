import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { viTranslations } from '../src/i18n/locales/vi.ts';
import { enTranslations } from '../src/i18n/locales/en.ts';
import { TIMELINE_MILESTONES_VI, TIMELINE_MILESTONES_EN } from '../src/data/timelineData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.resolve(rootDir, 'public');
const distDir = path.resolve(rootDir, 'dist');
const publicDocsDir = path.resolve(publicDir, 'docs');

// Ensure directories exist
for (const dir of [publicDir, publicDocsDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// -------------------------------------------------------------
// 1. Generate robots.txt
// -------------------------------------------------------------
function generateRobotsTxt(): string {
  return `# Robots.txt for Photon: Only Field
User-agent: *
Allow: /

# LLM & AI Model Agent Endpoints
Allow: /llms.txt
Allow: /llms-full.txt
Allow: /docs/
Allow: /sitemap.xml

# Explicit authorization for AI Model crawlers
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

Sitemap: https://photon-only-field.pages.dev/sitemap.xml
`;
}

// -------------------------------------------------------------
// 2. Generate sitemap.xml
// -------------------------------------------------------------
function generateSitemapXml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://photon-only-field.pages.dev/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://photon-only-field.pages.dev/llms.txt</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://photon-only-field.pages.dev/llms-full.txt</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://photon-only-field.pages.dev/docs/theory-vi.md</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://photon-only-field.pages.dev/docs/theory-en.md</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
`;
}

// -------------------------------------------------------------
// 3. Generate llms.txt (llmstxt.org standard)
// -------------------------------------------------------------
function generateLlmsTxt(): string {
  return `# Photon: Only Field - Bản Chất Trường Lượng Tử (Quantum Field Theory)

> Photon: Only Field là nền tảng trực quan hóa vật lý lượng tử hiện đại, giải thích nguyên lý cốt lõi của Thuyết Trường Lượng Tử (QFT): Trong tự nhiên KHÔNG CÓ hạt cơ học độc lập (như hạt bi nhỏ). Vũ trụ ngập tràn các Trường Lượng Tử liên tục, và photon chính là các gói dao động lượng tử gián đoạn (quantum excitation, Fock state |n⟩) của Trường Điện Từ.

## Thông Tin Dự Án (Project Summary)
- Tên dự án: Photon: Only Field
- Khẩu hiệu: "Photon không phải hạt bi bay đi. Vũ trụ chỉ có các Trường."
- Cơ sở lý thuyết: Thuyết Điện Từ Maxwell, Thuyết Lượng Tử Năng Lượng Planck-Einstein, Lượng Tử Hóa Lần Hai (Dirac 1927), Điện Động Lực Học Lượng Tử (QED - Feynman/Schwinger/Tomonaga).
- Trích dẫn nổi tiếng: "There are no particles, there are only fields." — Art Hobson, American Journal of Physics.
- Bản quyền & Tài nguyên: Tài nguyên giáo dục mở (Open Educational Physics Resource).

## Các Điểm Truy Cập Dữ Liệu Cho AI Agent & LLM
- [/llms-full.txt](https://photon-only-field.pages.dev/llms-full.txt): Toàn văn tài liệu lý thuyết song ngữ, công thức toán LaTeX, chi tiết 4 phòng lab photon cốt lõi, bảng so sánh 3 mô hình, giải mã 4 hiểu lầm, lộ trình 4 bước và biên niên sử 14 mốc.
- [/docs/theory-vi.md](https://photon-only-field.pages.dev/docs/theory-vi.md): Tài liệu chuyên sâu tiếng Việt (Bản chất trường, Bảng so sánh 3 mô hình, Toán tử sinh hủy Dirac, Giao thoa kế Mach-Zehnder, Lựa chọn trễ Wheeler, 4 trụ cột phản biện hiện đại).
- [/docs/theory-en.md](https://photon-only-field.pages.dev/docs/theory-en.md): Comprehensive English Theory Guide (Field reality, 3-paradigm comparison table, Fock state ladder, Mach-Zehnder delayed-choice, 4 modern critique pillars, Chronological milestones).

## Các Khái Niệm Vật Lý Cốt Lõi (Core Concepts)
1. **Bản chất Trường Lượng Tử vs Hạt cơ học**:
   - Không gian không chứa các viên bi ánh sáng. Trường Điện Từ là thực thể vật lý cơ bản tồn tại liên tục khắp không - thời gian.
   - Photon xuất hiện khi trường bị kích thích một lượng năng lượng $E = \hbar\omega$.
2. **Trạng thái Fock |n⟩ & Toán tử Dirac**:
   - Toán tử Sinh $a^\dagger$: Bơm 1 lượng tử kích thích vào mode trường ($a^\dagger|n\rangle = \sqrt{n+1}|n+1\rangle$).
   - Toán tử Hủy $a$: Rút 1 lượng tử khỏi mode trường ($a|n\rangle = \sqrt{n}|n-1\rangle$).
   - Năng lượng Điểm Không (ZPE): Tại trạng thái chân không $|0\rangle$, trường vẫn duy trì năng lượng dao động nội tại $\frac{1}{2}\hbar\omega$.
3. **Giao thoa Kế Mach-Zehnder & Lựa chọn Trễ Wheeler**:
   - Một photon đơn lẻ vẫn tự giao thoa với chính mode trường của nó ($P(D1) = \cos^2(\Delta\phi/2)$).
   - Bộ tách chùm BS1 không chẻ đôi photon thành 2 viên bi, mà phân nhánh biên độ xác suất $|\psi\rangle = (|d_1\rangle + i|d_2\rangle)/\sqrt{2}$.
4. **Giải mã 4 Hiểu lầm kinh điển**:
   - Hiểu lầm 1: "Ánh sáng biến hình: lúc bay là sóng, khi chạm thì thành hạt bi".
   - Hiểu lầm 2: "Photon không khối lượng, tại sao bị lỗ đen bẻ cong?".
   - Hiểu lầm 3: "Chân không hoàn toàn trống rỗng không có gì".
   - Hiểu lầm 4: "Photon có thể dừng lại đứng yên".
5. **Góc Nhìn Phản Biện & Các Lý Thuyết Mở Rộng (Beyond "Photon: Only Field")**:
   - Bản thể luận: Trường phái Steven Weinberg (Hạt là xuất phát điểm S-matrix, Trường là công cụ toán học); Cảnh báo từ Định lý Haag (1955); Bài toán định xứ của photon (không có toán tử vị trí chuẩn).
   - Phản biện Casimir (Robert Jaffe, MIT 2005): Lực Casimir có thể suy ra từ lực Van der Waals tương đối tính mà không bắt buộc có năng lượng điểm không độc lập; Khủng hoảng Hằng số Vũ trụ (sai lệch 10¹²⁰).
   - Ranh giới Bán cổ điển (Lamb & Scully 1969): Hiệu ứng quang điện có thể giải thích bằng sóng liên tục Maxwell + nguyên tử lượng tử hóa; Bằng chứng lượng tử hóa trường thực thụ là Photon Anti-bunching (g⁽²⁾(0) < 1) và Vi phạm Bất đẳng thức Bell (Nobel 2022).
   - Bài toán Đo đạc & Vật lý mở rộng: Giải kết hợp lượng tử (Decoherence), Lý thuyết Dây (Photon là mode dao động dây hở), Lượng tử Hấp dẫn Vòng (LQG), Đối ngẫu Toàn ảnh AdS/CFT.

## Bảng So Sánh 3 Mô Hình Vật Lý Về Ánh Sáng
| Tiêu chí | 1. Hạt Cổ Điển (Newton) | 2. Sóng Cổ Điển (Maxwell) | 3. Trường Lượng Tử QFT (Chính xác) |
|---|---|---|---|
| **Bản chất** | Hạt vi mô có khối lượng | Sóng liên tục trường E & B | Lượng tử kích thích của trường E & B |
| **Chân không** | Rỗng tuyệt đối | Trường liên tục ở mức 0 | Trạng thái đáy với dao động ZPE |
| **Năng lượng** | Động năng cơ học ½mv² | Mật độ năng lượng liên tục ∝ A² | Rời rạc hóa: E = (n + ½)ℏω |
| **Giao thoa** | Thất bại (hạt không triệt tiêu) | Đúng (chồng chập biên độ sóng) | Đúng (chồng chập biên độ xác suất) |
| **Quang điện** | Thất bại trước ngưỡng tần số | Thất bại (sai về vai trò biên độ) | Đúng (trao đổi năng lượng hν) |
`;
}

// -------------------------------------------------------------
// 4. Generate theory-vi.md
// -------------------------------------------------------------
function generateTheoryVi(): string {
  const t = viTranslations;
  let md = `# Photon: Only Field — Bản Chất Trường Lượng Tử (Tài Liệu Toàn Văn Tiếng Việt)

> **Tuyên ngôn:** "${t.hero.mainTitleLine1} ${t.hero.mainTitleLine2}"
> 
> *${t.hero.description}*

---

## 1. Bản Chất Hiện Đại: Thuyết Trường Lượng Tử (QFT)

### 1.1 Khái niệm Cốt lõi
${t.controls.bannerDescription}

- **Nhiễu chân không (Zero-Point Energy - ZPE):**
  ${t.controls.vacuumFluctuationsExplainer}
- **Công thức năng lượng của 1 gói sóng lượng tử (1 Photon excitation):**
  $$E = h\\nu = \\hbar\\omega$$

---

## 2. Bảng Đối Chiếu 3 Mô Hình Vật Lý Về Ánh Sáng

| ${t.qftDeepDive.thCriteria} | ${t.qftDeepDive.thNewton} | ${t.qftDeepDive.thMaxwell} | ${t.qftDeepDive.thQft} |
|---|---|---|---|
| **${t.qftDeepDive.row1Criteria}** | ${t.qftDeepDive.row1Newton} | ${t.qftDeepDive.row1Maxwell} | ${t.qftDeepDive.row1Qft} |
| **${t.qftDeepDive.row2Criteria}** | ${t.qftDeepDive.row2Newton} | ${t.qftDeepDive.row2Maxwell} | ${t.qftDeepDive.row2Qft} |
| **${t.qftDeepDive.row3Criteria}** | ${t.qftDeepDive.row3Newton} | ${t.qftDeepDive.row3Maxwell} | ${t.qftDeepDive.row3Qft} |
| **${t.qftDeepDive.row4Criteria}** | ${t.qftDeepDive.row4Newton} | ${t.qftDeepDive.row4Maxwell} | ${t.qftDeepDive.row4Qft} |
| **${t.qftDeepDive.row5Criteria}** | ${t.qftDeepDive.row5Newton} | ${t.qftDeepDive.row5Maxwell} | ${t.qftDeepDive.row5Qft} |

### 2.1 Bốn Điểm Nhận Thức Chuyên Sâu Của QFT
1. **${t.qftDeepDive.fieldNatureTitle}:** ${t.qftDeepDive.fieldNatureIntro}
   - *${t.qftDeepDive.fieldPoint1Title}* ${t.qftDeepDive.fieldPoint1Text}
   - *${t.qftDeepDive.fieldPoint2Title}* ${t.qftDeepDive.fieldPoint2Text}
   - *${t.qftDeepDive.fieldPoint3Title}* ${t.qftDeepDive.fieldPoint3Text}

2. **${t.qftDeepDive.detectorQuestionTitle}:**
   ${t.qftDeepDive.detectorRuleText}
   > ${t.qftDeepDive.detectorConclusion}

3. **${t.qftDeepDive.dualityResolutionTitle}:**
   ${t.qftDeepDive.dualityResolutionText}

4. **${t.qftDeepDive.vacuumFluctuationsTitle}:**
   ${t.qftDeepDive.vacuumFluctuationsIntro}
   - *${t.qftDeepDive.vacuumPoint1Title}* ${t.qftDeepDive.vacuumPoint1Text}
   - *${t.qftDeepDive.vacuumPoint2Title}* ${t.qftDeepDive.vacuumPoint2Text}
   - *${t.qftDeepDive.vacuumPoint3Title}* ${t.qftDeepDive.vacuumPoint3Text}

---

## 3. Lộ Trình 4 Bước Khám Phá Bản Chất Photon (Story Mode)

`;

  t.tour.steps.forEach((s) => {
    md += `### Bước ${s.step}: ${s.title}
*${s.badge}*

${s.description}

> **${t.tour.takeawayLabel}:** ${s.takeaway}

`;
  });

  md += `---

## 4. Giải Mã 4 Hiểu Lầm Kinh Điển Về Photon

`;

  t.myths.items.forEach((item, index) => {
    md += `### Hiểu lầm #${index + 1}: ${item.myth}

- **Thực tế theo QFT:**
  ${item.reality}
- **Ẩn dụ đời sống:**
  ${item.analogy}
- **Chân lý QFT cốt lõi:**
  > ${item.qftTruth}

`;
  });

  md += `---

## 5. Năm Phòng Thí Nghiệm & Bằng Chứng Thực Nghiệm

### 5.1 Phòng Lab 1: ${t.labs.doubleSlit.title}
*${t.labs.doubleSlit.badge}*

${t.labs.doubleSlit.description}

- **Bản chất theo QFT:**
  ${t.labs.doubleSlit.qftInsightBody}
- **Kiểm chứng từng photon đơn lẻ:**
  ${t.labs.doubleSlit.singlePhotonCheck}
- **Kiểm chứng đầu dò Which-Way:**
  ${t.labs.doubleSlit.whichWayCheck}

### 5.2 Phòng Lab 2: ${t.labs.photoelectric.title}
*${t.labs.photoelectric.badge}*

${t.labs.photoelectric.description}

- **Công thức Einstein:**
  $$K_{\\max} = h\\nu - \\Phi = e V_{\\text{stop}}$$
- **Giải thích Lượng tử:**
  ${t.labs.photoelectric.quantumExplanation}
- **Hạn chế của mô hình sóng cổ điển:**
  ${t.labs.photoelectric.classicalExplanation}
- **${t.labs.photoelectric.academicCaveatTitle}:**
  ${t.labs.photoelectric.academicCaveatDesc}

### 5.3 Phòng Lab 3: ${t.labs.fockState.title}
*${t.labs.fockState.badge}*

${t.labs.fockState.description}

- **Toán tử Hamilton của mode trường:**
  $$\\hat{H} = \\hbar\\omega\\left(a^\\dagger a + \\frac{1}{2}\\right)$$
- **Toán tử Sinh $a^\\dagger$:** ${t.labs.fockState.creationDesc}
  $$a^\\dagger |n\\rangle = \\sqrt{n+1} |n+1\\rangle$$
- **Toán tử Hủy $a$:** ${t.labs.fockState.annihilationDesc}
  $$a |n\\rangle = \\sqrt{n} |n-1\\rangle, \\quad a |0\\rangle = 0$$
- **Tại sao Chân không ($n=0$) vẫn có năng lượng $\\frac{1}{2}\\hbar\\omega$?**
  ${t.labs.fockState.zpeDeepDiveDesc}
- **Bất định lượng tử số hạt và pha:**
  $$\\Delta n \\cdot \\Delta\\phi \\ge \\frac{1}{2}$$
  ${t.labs.fockState.phaseUncertaintyDesc}

### 5.4 Phòng Lab 4: ${t.labs.machZehnder.title}
*${t.labs.machZehnder.badge}*

${t.labs.machZehnder.description}

- **Công thức xác suất ghi nhận:**
  $$P(D1) = \cos^2\left(\frac{\Delta\phi}{2}\right), \quad P(D2) = \sin^2\left(\frac{\Delta\phi}{2}\right)$$
- **Cơ chế can nhiễu pha:**
  ${t.labs.machZehnder.howItWorksDesc}
- **Photon có bị chẻ đôi hạt khi qua bộ tách chùm BS1?**
  ${t.labs.machZehnder.whyWavepacketDesc}

---

## 6. Biên Niên Sử Khái Niệm Photon (1704 - Nay)

`;

  TIMELINE_MILESTONES_VI.forEach((m) => {
    md += `### Năm ${m.year} — ${m.scientist}: ${m.title}
- **Giai đoạn:** ${m.era} | **Học thuyết:** ${m.theoryName}
- **Chuyển dịch nhận thức:** ${m.paradigmShift}
- **Công thức:** $${m.formulaLatex}$ (${m.formulaMeaning})
- **Thí nghiệm then chốt:** ${m.keyExperiment}
- **Giải thích chi tiết:** ${m.fullExplanation}
- *Trích dẫn:* "${m.quote}"

`;
  });

  const mp = t.modernPerspectives;
  const p = mp.pillars;
  md += `---

## 7. ${mp.sectionTitle} (${mp.headerBadge})

> *${mp.sectionDescription}*

### 7.1 ${p.ontology.title}
*${p.ontology.badge} — ${p.ontology.subtitle}*

${p.ontology.intro}

- **${p.ontology.hobsonViewTitle}** ${p.ontology.hobsonViewText}
- **${p.ontology.weinbergViewTitle}** ${p.ontology.weinbergViewText}
- **${p.ontology.haagTheoremTitle}** ${p.ontology.haagTheoremText}
- **${p.ontology.localizationTitle}** ${p.ontology.localizationText}

> **${p.ontology.takeaway}**

### 7.2 ${p.vacuumCrisis.title}
*${p.vacuumCrisis.badge} — ${p.vacuumCrisis.subtitle}*

${p.vacuumCrisis.intro}

- **${p.vacuumCrisis.casimirStandardTitle}** ${p.vacuumCrisis.casimirStandardText}
- **${p.vacuumCrisis.jaffeCritiqueTitle}** ${p.vacuumCrisis.jaffeCritiqueText}
- **${p.vacuumCrisis.cosmologicalCrisisTitle}** ${p.vacuumCrisis.cosmologicalCrisisText}

> **${p.vacuumCrisis.takeaway}**

### 7.3 ${p.semiclassical.title}
*${p.semiclassical.badge} — ${p.semiclassical.subtitle}*

${p.semiclassical.intro}

- **${p.semiclassical.lambScullyTitle}** ${p.semiclassical.lambScullyText}
- **${p.semiclassical.antibunchingTitle}** ${p.semiclassical.antibunchingText}
- **${p.semiclassical.bellEntanglementTitle}** ${p.semiclassical.bellEntanglementText}

> **${p.semiclassical.takeaway}**

### 7.4 ${p.beyondQft.title}
*${p.beyondQft.badge} — ${p.beyondQft.subtitle}*

${p.beyondQft.intro}

- **${p.beyondQft.decoherenceTitle}** ${p.beyondQft.decoherenceText}
- **${p.beyondQft.stringTheoryTitle}** ${p.beyondQft.stringTheoryText}
- **${p.beyondQft.loopGravityTitle}** ${p.beyondQft.loopGravityText}
- **${p.beyondQft.holographyTitle}** ${p.beyondQft.holographyText}

> **${p.beyondQft.takeaway}**

`;

  return md;
}

// -------------------------------------------------------------
// 5. Generate theory-en.md
// -------------------------------------------------------------
function generateTheoryEn(): string {
  const t = enTranslations;
  let md = `# Photon: Only Field — Quantum Field Theory (Full Documentation)

> **Manifesto:** "${t.hero.mainTitleLine1} ${t.hero.mainTitleLine2}"
> 
> *${t.hero.description}*

---

## 1. Modern Quantum Reality: Quantum Field Theory (QFT)

### 1.1 Core Paradigm
${t.controls.bannerDescription}

- **Zero-Point Energy (ZPE):**
  ${t.controls.vacuumFluctuationsExplainer}
- **Single Photon Excitation Energy:**
  $$E = h\\nu = \\hbar\\omega$$

---

## 2. 3-Paradigm Comparative Framework of Light

| ${t.qftDeepDive.thCriteria} | ${t.qftDeepDive.thNewton} | ${t.qftDeepDive.thMaxwell} | ${t.qftDeepDive.thQft} |
|---|---|---|---|
| **${t.qftDeepDive.row1Criteria}** | ${t.qftDeepDive.row1Newton} | ${t.qftDeepDive.row1Maxwell} | ${t.qftDeepDive.row1Qft} |
| **${t.qftDeepDive.row2Criteria}** | ${t.qftDeepDive.row2Newton} | ${t.qftDeepDive.row2Maxwell} | ${t.qftDeepDive.row2Qft} |
| **${t.qftDeepDive.row3Criteria}** | ${t.qftDeepDive.row3Newton} | ${t.qftDeepDive.row3Maxwell} | ${t.qftDeepDive.row3Qft} |
| **${t.qftDeepDive.row4Criteria}** | ${t.qftDeepDive.row4Newton} | ${t.qftDeepDive.row4Maxwell} | ${t.qftDeepDive.row4Qft} |
| **${t.qftDeepDive.row5Criteria}** | ${t.qftDeepDive.row5Newton} | ${t.qftDeepDive.row5Maxwell} | ${t.qftDeepDive.row5Qft} |

---

## 3. 4-Step Story Tour: Discovering the Nature of Photons

`;

  t.tour.steps.forEach((s) => {
    md += `### Step ${s.step}: ${s.title}
*${s.badge}*

${s.description}

> **${t.tour.takeawayLabel}:** ${s.takeaway}

`;
  });

  md += `---

## 4. 4 Classic Misconceptions Debunked

`;

  t.myths.items.forEach((item, index) => {
    md += `### Misconception #${index + 1}: ${item.myth}

- **QFT Reality:**
  ${item.reality}
- **Everyday Analogy:**
  ${item.analogy}
- **Supreme QFT Truth:**
  > ${item.qftTruth}

`;
  });

  md += `---

## 5. Five Interactive Physics Laboratories

### 5.1 Lab 1: ${t.labs.doubleSlit.title}
*${t.labs.doubleSlit.badge}*

${t.labs.doubleSlit.description}

- **QFT Insight:**
  ${t.labs.doubleSlit.qftInsightBody}
- **Single Photon Accumulation:**
  ${t.labs.doubleSlit.singlePhotonCheck}
- **Which-Way Detector Effect:**
  ${t.labs.doubleSlit.whichWayCheck}

### 5.2 Lab 2: ${t.labs.photoelectric.title}
*${t.labs.photoelectric.badge}*

${t.labs.photoelectric.description}

- **Einstein's Photoelectric Formula:**
  $$K_{\\max} = h\\nu - \\Phi = e V_{\\text{stop}}$$
- **Quantum Theory:**
  ${t.labs.photoelectric.quantumExplanation}
- **Classical Wave Theory Failure:**
  ${t.labs.photoelectric.classicalExplanation}
- **${t.labs.photoelectric.academicCaveatTitle}:**
  ${t.labs.photoelectric.academicCaveatDesc}

### 5.3 Lab 3: ${t.labs.fockState.title}
*${t.labs.fockState.badge}*

${t.labs.fockState.description}

- **Field Mode Hamiltonian:**
  $$\\hat{H} = \\hbar\\omega\\left(a^\\dagger a + \\frac{1}{2}\\right)$$
- **Creation Operator $a^\\dagger$:** ${t.labs.fockState.creationDesc}
- **Annihilation Operator $a$:** ${t.labs.fockState.annihilationDesc}
- **Zero-Point Vacuum Energy ($n=0$):**
  ${t.labs.fockState.zpeDeepDiveDesc}
- **Number-Phase Uncertainty:**
  ${t.labs.fockState.phaseUncertaintyDesc}

### 5.4 Lab 4: ${t.labs.machZehnder.title}
*${t.labs.machZehnder.badge}*

${t.labs.machZehnder.description}

- **Probability Formulas:**
  $$P(D1) = \cos^2\left(\frac{\Delta\phi}{2}\right), \quad P(D2) = \sin^2\left(\frac{\Delta\phi}{2}\right)$$
- **Interference Mechanism:**
  ${t.labs.machZehnder.howItWorksDesc}
- **Does the photon split into two halves at BS1?**
  ${t.labs.machZehnder.whyWavepacketDesc}

---

## 6. Chronological Timeline of the Photon Concept (1704 - Present)

`;

  TIMELINE_MILESTONES_EN.forEach((m) => {
    md += `### ${m.year} — ${m.scientist}: ${m.title}
- **Era:** ${m.era} | **Theory:** ${m.theoryName}
- **Paradigm Shift:** ${m.paradigmShift}
- **Formula:** $${m.formulaLatex}$ (${m.formulaMeaning})
- **Key Experiment:** ${m.keyExperiment}
- **Full Explanation:** ${m.fullExplanation}
- *Quote:* "${m.quote}"

`;
  });

  const mp = t.modernPerspectives;
  const p = mp.pillars;
  md += `---

## 7. ${mp.sectionTitle} (${mp.headerBadge})

> *${mp.sectionDescription}*

### 7.1 ${p.ontology.title}
*${p.ontology.badge} — ${p.ontology.subtitle}*

${p.ontology.intro}

- **${p.ontology.hobsonViewTitle}** ${p.ontology.hobsonViewText}
- **${p.ontology.weinbergViewTitle}** ${p.ontology.weinbergViewText}
- **${p.ontology.haagTheoremTitle}** ${p.ontology.haagTheoremText}
- **${p.ontology.localizationTitle}** ${p.ontology.localizationText}

> **${p.ontology.takeaway}**

### 7.2 ${p.vacuumCrisis.title}
*${p.vacuumCrisis.badge} — ${p.vacuumCrisis.subtitle}*

${p.vacuumCrisis.intro}

- **${p.vacuumCrisis.casimirStandardTitle}** ${p.vacuumCrisis.casimirStandardText}
- **${p.vacuumCrisis.jaffeCritiqueTitle}** ${p.vacuumCrisis.jaffeCritiqueText}
- **${p.vacuumCrisis.cosmologicalCrisisTitle}** ${p.vacuumCrisis.cosmologicalCrisisText}

> **${p.vacuumCrisis.takeaway}**

### 7.3 ${p.semiclassical.title}
*${p.semiclassical.badge} — ${p.semiclassical.subtitle}*

${p.semiclassical.intro}

- **${p.semiclassical.lambScullyTitle}** ${p.semiclassical.lambScullyText}
- **${p.semiclassical.antibunchingTitle}** ${p.semiclassical.antibunchingText}
- **${p.semiclassical.bellEntanglementTitle}** ${p.semiclassical.bellEntanglementText}

> **${p.semiclassical.takeaway}**

### 7.4 ${p.beyondQft.title}
*${p.beyondQft.badge} — ${p.beyondQft.subtitle}*

${p.beyondQft.intro}

- **${p.beyondQft.decoherenceTitle}** ${p.beyondQft.decoherenceText}
- **${p.beyondQft.stringTheoryTitle}** ${p.beyondQft.stringTheoryText}
- **${p.beyondQft.loopGravityTitle}** ${p.beyondQft.loopGravityText}
- **${p.beyondQft.holographyTitle}** ${p.beyondQft.holographyText}

> **${p.beyondQft.takeaway}**

`;

  return md;
}

// -------------------------------------------------------------
// 6. Generate llms-full.txt
// -------------------------------------------------------------
function generateLlmsFull(): string {
  const vi = generateTheoryVi();
  const en = generateTheoryEn();

  return `# PHOTON: ONLY FIELD — COMPLETE REPOSITORY KNOWLEDGE BASE
# Modern Quantum Field Theory (QFT) & The Quantum Nature of Radiation
# Formatted for Large Language Model Agents & Autonomous Reasoners

================================================================================
PART I: VIETNAMESE THEORETICAL DOCUMENTATION (PHẦN I: TÀI LIỆU TIẾNG VIỆT)
================================================================================

${vi}

================================================================================
PART II: ENGLISH THEORETICAL DOCUMENTATION (PHẦN II: TÀI LIỆU TIẾNG ANH)
================================================================================

${en}
`;
}

// -------------------------------------------------------------
// 7. Generate Schema.org JSON-LD
// -------------------------------------------------------------
function generateJsonLd(): object {
  const faqItems = viTranslations.myths.items.map((m) => ({
    '@type': 'Question',
    name: m.myth,
    acceptedAnswer: {
      '@type': 'Answer',
      text: `${m.reality} Ẩn dụ trực quan: ${m.analogy} Chân lý cốt lõi QFT: ${m.qftTruth}`,
    },
  }));

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://photon-only-field.pages.dev/#website',
        url: 'https://photon-only-field.pages.dev/',
        name: 'Photon: Only Field',
        description:
          'Trực quan hóa trực quan Photon dưới góc nhìn Thuyết Trường Lượng Tử (QFT) - Photon không phải hạt bi, photon là dao động của trường!',
        inLanguage: ['vi', 'en'],
      },
      {
        '@type': 'TechArticle',
        '@id': 'https://photon-only-field.pages.dev/#article',
        headline: 'Bản Chất Trường Lượng Tử: Photon Không Phải Hạt Bi',
        description:
          'Nghiên cứu và mô phỏng trực quan: Trong Thuyết Trường Lượng Tử, không gian ngập tràn Trường Điện Từ. Photon là lượng tử kích thích gián đoạn (Fock state |n>) của mode trường.',
        about: [
          'Quantum Field Theory',
          'Photon',
          'Fock State',
          'Casimir Effect',
          'Mach-Zehnder Interferometer',
          'Photoelectric Effect',
        ],
        educationalLevel: 'Advanced / Undergraduate Physics',
      },
      {
        '@type': 'FAQPage',
        '@id': 'https://photon-only-field.pages.dev/#faq',
        mainEntity: faqItems,
      },
    ],
  };
}

// -------------------------------------------------------------
// 8. Generate Semantic HTML Fallback for Agents / Crawlers
// -------------------------------------------------------------
function generateSemanticHtmlFallback(): string {
  const t = viTranslations;
  let html = `
    <!-- Static Semantic Content for AI Model Agents and Web Crawlers (HTTP GET / No-JS fallback) -->
    <noscript>
      <div style="padding: 24px; max-width: 900px; margin: 0 auto; color: #f8fafc; background: #020617; font-family: system-ui, sans-serif;">
        <p style="color: #38bdf8; font-weight: bold; font-size: 14px;">[Chế độ thuần văn bản dành cho AI Agent / Bot / Thiết bị không chạy JavaScript]</p>
      </div>
    </noscript>

    <div id="ai-agent-readable-layer" style="display: none;" aria-hidden="false">
      <main itemscope itemtype="https://schema.org/TechArticle">
        <header>
          <h1 itemprop="headline">Photon: Only Field — Bản chất Trường Lượng Tử</h1>
          <p itemprop="description">
            ${t.hero.mainTitleLine1} ${t.hero.mainTitleLine2}
          </p>
          <p>${t.hero.description}</p>
        </header>

        <section id="ai-qft-core">
          <h2>1. Bản Chất Hiện Đại: Thuyết Trường Lượng Tử (QFT)</h2>
          <p>${t.controls.bannerDescription}</p>
          <p><strong>Nhiễu chân không (Zero-Point Energy):</strong> ${t.controls.vacuumFluctuationsExplainer}</p>
          <p><strong>Công thức năng lượng photon:</strong> E = h·ν = ℏ·ω</p>
        </section>

        <section id="ai-myths">
          <h2>2. Giải Mã 4 Hiểu Lầm Kinh Điển Về Photon</h2>
  `;

  t.myths.items.forEach((m, idx) => {
    html += `
          <article>
            <h3>Hiểu lầm #${idx + 1}: ${m.myth}</h3>
            <p><strong>Thực tế theo QFT:</strong> ${m.reality}</p>
            <p><strong>Ẩn dụ trực quan:</strong> ${m.analogy}</p>
            <blockquote>${m.qftTruth}</blockquote>
          </article>
    `;
  });

  html += `
        </section>

        <section id="ai-labs">
          <h2>3. Bốn Phòng Thí Nghiệm & Bằng Chứng Thực Nghiệm</h2>
          <article>
            <h3>${t.labs.doubleSlit.title}</h3>
            <p>${t.labs.doubleSlit.description}</p>
            <p>${t.labs.doubleSlit.qftInsightBody}</p>
          </article>

          <article>
            <h3>${t.labs.photoelectric.title}</h3>
            <p>${t.labs.photoelectric.description}</p>
            <p>Công thức: K_max = h·ν - Φ = e·V_stop</p>
          </article>

          <article>
            <h3>${t.labs.fockState.title}</h3>
            <p>${t.labs.fockState.description}</p>
            <p>Hamiltonian: H = ℏ·ω·(a†a + 1/2)</p>
            <p>Toán tử Sinh a†: ${t.labs.fockState.creationDesc}</p>
            <p>Toán tử Hủy a: ${t.labs.fockState.annihilationDesc}</p>
            <p>Năng lượng điểm không (ZPE): ${t.labs.fockState.zpeDeepDiveDesc}</p>
          </article>

          <article>
            <h3>${t.labs.machZehnder.title}</h3>
            <p>${t.labs.machZehnder.description}</p>
            <p>Xác suất: P(D1) = cos²(Δφ/2), P(D2) = sin²(Δφ/2)</p>
            <p>${t.labs.machZehnder.whyWavepacketDesc}</p>
          </article>
        </section>

        <section id="ai-timeline">
          <h2>4. 14 Mốc Tiến Hóa Khái Niệm Photon (1704 - Nay)</h2>
          <dl>
  `;

  TIMELINE_MILESTONES_VI.forEach((m) => {
    html += `
            <dt><strong>Năm ${m.year} — ${m.scientist}: ${m.title}</strong> (${m.theoryName})</dt>
            <dd>
              <p>Chuyển dịch nhận thức: ${m.paradigmShift}</p>
              <p>Công thức: ${m.formulaLatex} — ${m.formulaMeaning}</p>
              <p>Thí nghiệm: ${m.keyExperiment}</p>
              <p>${m.fullExplanation}</p>
            </dd>
    `;
  });

  html += `
          </dl>
        </section>
      </main>
    </div>
  `;

  return html;
}

// -------------------------------------------------------------
// 9. Patch index.html (Source & Dist)
// -------------------------------------------------------------
function patchHtmlFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf-8');

  const jsonLdScript = `\n    <script type="application/ld+json">\n${JSON.stringify(generateJsonLd(), null, 2)}\n    </script>`;
  const altLinks = `\n    <link rel="alternate" type="text/markdown" href="/llms.txt" title="LLM Summary Documentation" />\n    <link rel="alternate" type="text/markdown" href="/llms-full.txt" title="Full Theoretical Documentation" />\n    <link rel="alternate" type="text/markdown" href="/docs/theory-vi.md" title="Vietnamese Theoretical Guide" />\n    <link rel="alternate" type="text/markdown" href="/docs/theory-en.md" title="English Theoretical Guide" />`;

  // Inject into <head> if not already present
  if (!content.includes('rel="alternate" type="text/markdown"')) {
    content = content.replace('</head>', `${altLinks}${jsonLdScript}\n  </head>`);
  } else if (!content.includes('application/ld+json')) {
    content = content.replace('</head>', `${jsonLdScript}\n  </head>`);
  }

  // Inject semantic fallback inside <div id="root">
  const semanticFallback = generateSemanticHtmlFallback();
  if (content.includes('<div id="root"></div>')) {
    content = content.replace(
      '<div id="root"></div>',
      `<div id="root">\n${semanticFallback}\n    </div>`
    );
  } else if (content.includes('<div id="root">') && !content.includes('ai-agent-readable-layer')) {
    content = content.replace(
      '<div id="root">',
      `<div id="root">\n${semanticFallback}`
    );
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`[Agent Docs] Patched HTML successfully: ${filePath}`);
}

// -------------------------------------------------------------
// Main execution
// -------------------------------------------------------------
function main() {
  console.log('[Agent Docs] Generating AI Agent and LLM documentation files...');

  const robots = generateRobotsTxt();
  const sitemap = generateSitemapXml();
  const llms = generateLlmsTxt();
  const llmsFull = generateLlmsFull();
  const theoryVi = generateTheoryVi();
  const theoryEn = generateTheoryEn();

  // 1. Write to public/
  fs.writeFileSync(path.resolve(publicDir, 'robots.txt'), robots, 'utf-8');
  fs.writeFileSync(path.resolve(publicDir, 'sitemap.xml'), sitemap, 'utf-8');
  fs.writeFileSync(path.resolve(publicDir, 'llms.txt'), llms, 'utf-8');
  fs.writeFileSync(path.resolve(publicDir, 'llms-full.txt'), llmsFull, 'utf-8');
  fs.writeFileSync(path.resolve(publicDocsDir, 'theory-vi.md'), theoryVi, 'utf-8');
  fs.writeFileSync(path.resolve(publicDocsDir, 'theory-en.md'), theoryEn, 'utf-8');
  console.log('[Agent Docs] Wrote artifacts to public/ directory');

  // 2. If dist exists, also copy directly to dist/
  if (fs.existsSync(distDir)) {
    const distDocsDir = path.resolve(distDir, 'docs');
    if (!fs.existsSync(distDocsDir)) {
      fs.mkdirSync(distDocsDir, { recursive: true });
    }
    fs.writeFileSync(path.resolve(distDir, 'robots.txt'), robots, 'utf-8');
    fs.writeFileSync(path.resolve(distDir, 'sitemap.xml'), sitemap, 'utf-8');
    fs.writeFileSync(path.resolve(distDir, 'llms.txt'), llms, 'utf-8');
    fs.writeFileSync(path.resolve(distDir, 'llms-full.txt'), llmsFull, 'utf-8');
    fs.writeFileSync(path.resolve(distDocsDir, 'theory-vi.md'), theoryVi, 'utf-8');
    fs.writeFileSync(path.resolve(distDocsDir, 'theory-en.md'), theoryEn, 'utf-8');

    // Patch dist/index.html
    patchHtmlFile(path.resolve(distDir, 'index.html'));
    console.log('[Agent Docs] Synced artifacts to dist/ directory');
  }

  console.log('[Agent Docs] All agent documentation and static targets generated successfully!');
}

main();

