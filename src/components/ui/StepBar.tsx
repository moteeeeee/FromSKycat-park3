import React from "react";
import { Check } from "lucide-react";

// ─── Step Indicator (แถบสถานะขั้นตอนการจอง) ───
// หน้าที่: แถบด้านบนที่แสดงว่าผู้ใช้อยู่ขั้นที่ 1, 2 หรือ 3
export function StepBar({ current }: any) {
  // แก้ไขตรงจุดนี้: หากต้องการเปลี่ยนข้อความของแต่ละขั้นตอน
  const steps = [
    { num: 1, label: "ข้อมูลการจอง (Booking Details)" },
    { num: 2, label: "ยืนยันการจอง (Confirmation)" },
  ];
  return (
    <div className="flex items-center gap-0">
      {steps.map((s, i) => (
        <div key={s.num} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <div
              // แก้ไขตรงจุดนี้: เปลี่ยนสีจุดวงกลมของสเต็ปปัจจุบัน หรือสเต็ปที่ผ่านไปแล้ว (ปัจจุบันใช้สีฟ้า sky-700)
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ring-2 transition-all duration-300 ${
                current > s.num
                  ? "bg-sky-700 ring-sky-700 text-white"
                  : current === s.num
                  ? "bg-sky-700 ring-sky-200 text-white shadow-lg shadow-sky-700/25"
                  : "bg-white ring-slate-200 text-slate-400"
              }`}
            >
          {current > s.num ? <Check className="w-5 h-5" /> : s.num}
            </div>
            <span className={`hidden md:block text-xs font-medium whitespace-nowrap transition-colors ${current === s.num ? "text-sky-700" : current > s.num ? "text-slate-600" : "text-slate-400"}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-px mx-2 mb-5 transition-all duration-500 ${current > s.num + 1 ? "bg-sky-700" : current > s.num ? "bg-sky-300" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}