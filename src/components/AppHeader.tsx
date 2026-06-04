import lineIcon from "../assets/LINE_Brand_icon.png";
export default function AppHeader() {
  return (
    // ─── ส่วนหัวของเว็บไซต์ (Header) ───
    // `sticky top-0`: ทำให้ Header "เกาะ" อยู่ด้านบนสุดของจอเสมอเมื่อผู้ใช้เลื่อนเว็บลงมา
    // `z-40`: จัดลำดับให้ Header อยู่เหนือเนื้อหาส่วนใหญ่
    // `bg-white/90 backdrop-blur-md`: ทำให้พื้นหลังเป็นสีขาวกึ่งโปร่งใสและเบลอฉากหลัง
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      {/* Container จัดเนื้อหาให้อยู่ตรงกลางและมีระยะขอบที่เหมาะสม */}
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:px-6">
        {/* ─── ส่วนด้านซ้าย: โลโก้และชื่อแบรนด์ ─── */}
        <div className="flex items-center">
          {/* แก้ไขตรงจุดนี้: หากต้องการเปลี่ยนไฟล์โลโก้ */}
          <img src="/logo.png" alt="Sky Car Park Logo" className="h-20 w-20 object-contain" />
          <div className="ml-3">
            {/* แก้ไขตรงจุดนี้: หากต้องการเปลี่ยนชื่อบริษัทหรือสโลแกน */}
            <p className="text-sm font-bold text-slate-900 leading-tight">Sky Car Park</p>
            <p className="text-xs text-slate-500">ที่จอดรถใกล้สนามบิน</p>
          </div>
        </div>
        
          {/* ─── ส่วนด้านขวา: ปุ่มติดต่อ ─── */}
          <div className="flex flex-col items-center gap-1">
            {/* แก้ไขตรงจุดนี้: หากต้องการเปลี่ยนลิงก์ LINE Official Account */}
            <a href="https://lin.ee/lMMDtMx" target="_blank" rel="noreferrer" className="transition-all hover:scale-105 hover:opacity-90 active:scale-95">
              <img src={lineIcon} alt="LINE OA" className="h-10 w-10 object-contain drop-shadow-sm" />
            </a>
            <p className="text-xs text-slate-500">ติดต่อเรา: 082-325-8380</p>
          </div>
      </div>
    </header>
  );
}