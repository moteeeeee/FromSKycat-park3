import { StepBar } from "./ui/StepBar";
import { SectionCard } from "./ui/SectionCard";
import { Field } from "./ui/Field";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { TimePicker } from "./ui/TimePicker";
import { ReviewRow } from "./ui/ReviewRow";
import { CAR_DATA } from "../constants/cars";
import { User, Car, Calendar, CreditCard, ClipboardList, Clock, AlertTriangle, Check, ArrowRight, ArrowLeft } from "lucide-react";
import axios from "axios";
// ─── BookingForm Component ───
// เป็น Component หลักที่แสดงฟอร์มการจองทั้งหมด แบ่งตามขั้นตอน (step)
export default function BookingForm({ booking, addNotif }: any) {
  const {
    step,
    setStep,
    form,
    handleChange,
    priceResult,
    discount,
    total,
    validateStep1,
    validateStep2,
    setSubmitted,
    formTopRef,
    scrollToForm
  } = booking;

  const uid =
  new URLSearchParams(window.location.search)
  .get("uid");

  // --- 1. ส่วนเตรียมข้อมูล & ฟังก์ชันช่วย ---
  const today = new Date().toISOString().split("T")[0];

  // ดึงข้อมูลรถจาก CAR_DATA ตามประเภทรถที่ผู้ใช้เลือกในฟอร์ม
  const carType = CAR_DATA[form.type] || CAR_DATA["รถเก๋ง (Sedan)"] || { brands: [], models: {} };
  const availableBrands = carType.brands || [];
  const availableModels = form.brand && carType.models[form.brand] ? carType.models[form.brand] : [];

  // ฟังก์ชันช่วยจัดรูปแบบตัวเลข (ใส่จุลภาค)
  const fmt = (n: number) => new Intl.NumberFormat("th-TH").format(n);
  // ฟังก์ชันช่วยจัดรูปแบบวันที่ (เป็นรูปแบบ "วัน เดือน ปี" ภาษาไทย)
  const fmtDate = (d: string) => {
    if (!d) return "—";
    // เพิ่ม T00:00:00 เพื่อป้องกันปัญหา Timezone ที่อาจทำให้วันที่แสดงผลผิดเพี้ยน
    const dt = new Date(d + "T00:00:00");
    return dt.toLocaleDateString("th-TH", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  };

  // ฟังก์ชันยืนยันการจอง
  const handleSubmit = async () => {

  try {

    await axios.post(
  "https://fencing-squeamish-repave.ngrok-free.dev",
      {
        line_user_id: uid,
        fullname: form.name,
        phone: form.phone,
        phone_alt: form.phoneAlt,
        plate_no: form.plate,
        notes: form.notes,

        vehicle_type: form.type,
        brand: form.brand,
        model: form.model,

        checkin_date: form.checkinDate,
        checkin_time:
          `${form.checkinHour}:${form.checkinMinute}`,

        checkout_date: form.checkoutDate,
        checkout_time:
          `${form.checkoutHour}:${form.checkoutMinute}`,

        coupon: form.coupon,
        total_price: total
      }
    );

    setSubmitted(true);

    addNotif(
      "ส่งข้อมูลเรียบร้อยแล้ว",
      "ระบบได้รับข้อมูลการจองแล้ว",
      "success"
    );

    if (scrollToForm) scrollToForm();

  } catch (error) {

    console.error(error);

    addNotif(
      "เกิดข้อผิดพลาด",
      "ไม่สามารถส่งข้อมูลได้",
      "error"
    );

  }
};
  return (
    <div ref={formTopRef} className="mx-auto max-w-3xl space-y-6">
      
      {/* ─── แถบแสดงขั้นตอน (Step Indicator) ─── */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <StepBar current={step} />
      </div>

      {/* ─── ขั้นตอนที่ 1: ข้อมูลลูกค้า ─── */}
      {step === 1 && (
        <div className="fade-in space-y-5">
          {/* แก้ไขตรงจุดนี้: หากต้องการเพิ่ม/ลด/สลับตำแหน่งช่องกรอกข้อมูลลูกค้า */}
          <SectionCard icon={<User className="w-5 h-5" />} title="ข้อมูลลูกค้า (Customer Information)" subtitle="กรุณากรอกข้อมูลส่วนตัวให้ครบถ้วน">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Field ชื่อ-นามสกุล */}
              <Field label="ชื่อเล่น (NickName)" required>
                <Input
                  value={form.name}
                  onChange={(e: any) => {
                    const val = e.target.value;
                    // อนุญาตเฉพาะตัวอักษรภาษาไทย ภาษาอังกฤษ ตัวเลข และช่องว่าง (ห้ามใส่อักขระพิเศษ)
                    if (/^[a-zA-Z0-9\u0E00-\u0E7F\s]*$/.test(val)) {
                      handleChange("name", val);
                    }
                  }}
                  placeholder="สมชาย ใจดี"
                />
              </Field>
              {/* Field เบอร์โทรหลัก */}
              <Field label="เบอร์โทรหลัก (Phone)" required>
                <Input
                  value={form.phone}
                  onChange={(e: any) => {
                    const val = e.target.value;
                    // อนุญาตเฉพาะตัวเลข และความยาวไม่เกิน 10 หลัก
                    if (/^\d{0,10}$/.test(val)) {
                      handleChange("phone", val);
                    }
                  }}
                  placeholder="08X-XXX-XXXX"
                  type="tel"
                  maxLength={10}
                />
              </Field>
              {/* Field เบอร์โทรสำรอง */}
              <Field label="เบอร์โทรสำรอง (Alternative Phone)">
                <Input
                  value={form.phoneAlt}
                  onChange={(e: any) => {
                    const val = e.target.value;
                    if (/^\d{0,10}$/.test(val)) {
                      handleChange("phoneAlt", val);
                    }
                  }}
                  placeholder="กรณีติดต่อไม่ได้ (Optional)"
                  type="tel"
                  maxLength={10}
                />
              </Field>
              {/* Field ทะเบียนรถ */}
              <Field label="ทะเบียนรถ (License Plate)">
                <Input
                  value={form.plate}
                  onChange={(e: any) => handleChange("plate", e.target.value.toUpperCase())}
                  placeholder="ไม่จำเป็นต้องกรอก (Optional)"
                />
              </Field>
              {/* Field หมายเหตุ */}
              <div className="sm:col-span-2">
                <Field label="หมายเหตุ (Notes)">
                  <Input
                    value={form.notes}
                    onChange={(e: any) => handleChange("notes", e.target.value)}
                    placeholder="ข้อมูลเพิ่มเติม (Optional)"
                  />
                </Field>
              </div>
            </div>
          </SectionCard>

          {/* แก้ไขตรงจุดนี้: หากต้องการเพิ่ม/ลด/สลับตำแหน่งช่องกรอกข้อมูลรถ */}
          <SectionCard icon={<Car className="w-5 h-5" />} title="ข้อมูลรถยนต์ (Vehicle Information)" subtitle="เลือกประเภทรถก่อน จากนั้นระบบจะแสดงยี่ห้อและรุ่นรถที่ตรงกัน">
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
              {/* Dropdown ประเภทรถ */}
              <Field label="ประเภทรถ (Vehicle Type)" required>
                <Select value={form.type} onChange={(e: any) => handleChange("type", e.target.value)}>
                  {Object.keys(CAR_DATA).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
              </Field>
              {/* Dropdown ยี่ห้อรถ (จะแสดงผลตามประเภทรถที่เลือก) */}
              <Field label="ยี่ห้อรถ (Brand)" required>
                <Select
                  value={form.brand}
                  onChange={(e: any) => handleChange("brand", e.target.value)}
                  disabled={!form.type}
                >
                  <option value="">-- เลือกยี่ห้อรถ --</option>
                  {availableBrands.map((b: string) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                  <option value="อื่นๆ">อื่นๆ (Other)</option>
                </Select>
              </Field>
              {/* Dropdown รุ่นรถ (จะแสดงผลตามยี่ห้อที่เลือก) */}
              <Field label="รุ่นรถ (Model)" required>
                {form.brand === "อื่นๆ" ? (
                  <Input
                    value={form.model}
                    onChange={(e: any) => handleChange("model", e.target.value)}
                    placeholder="พิมพ์รุ่นรถ"
                  />
                ) : (
                  <Select
                    value={form.model}
                    onChange={(e: any) => handleChange("model", e.target.value)}
                    disabled={!form.brand || availableModels.length === 0}
                  >
                    <option value="">-- เลือกรุ่นรถ --</option>
                    {availableModels.map((m: string) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                    <option value="อื่นๆ">อื่นๆ (Other)</option>
                  </Select>
                )}
              </Field>
            </div>
          </SectionCard>

          {/* ─── วันและเวลาการจอง (ย้ายมาจาก Step 2 เดิม) ─── */}
          <SectionCard icon={<Calendar className="w-5 h-5" />} title="วันและเวลาจอดรถ (Parking Schedule)" subtitle="กรุณาระบุวันเวลาเข้าจอดและรับรถ เปิดบริการ 08:00–21:00 น.">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-wide text-sky-700 flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-700" />
                  วันเวลาเข้าจอด (Check-in)
                </p>
                <Field label="วันที่เข้าจอด" required>
                  <Input
                    type="date"
                    value={form.checkinDate}
                    min={today}
                    onChange={(e: any) => handleChange("checkinDate", e.target.value)}
                  />
                  {form.checkinDate && (
                    <p className="mt-1.5 text-xs font-medium text-sky-600">{fmtDate(form.checkinDate)}</p>
                  )}
                </Field>
                <Field label="เวลาเข้าจอด (08:00–21:00 น.)">
                  <TimePicker
                    hour={form.checkinHour}
                    minute={form.checkinMinute}
                    onHourChange={(h: string) => handleChange("checkinHour", h)}
                    onMinuteChange={(m: string) => handleChange("checkinMinute", m)}
                  />
                  <p className="mt-1.5 text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> พิมพ์หรือกดลูกศรเพื่อเปลี่ยนชั่วโมง (08–21)
                  </p>
                </Field>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-600 flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  วันเวลารับรถ (Check-out)
                </p>
                <Field label="วันที่รับรถ" required>
                  <Input
                    type="date"
                    value={form.checkoutDate}
                    min={form.checkinDate}
                    onChange={(e: any) => handleChange("checkoutDate", e.target.value)}
                  />
                  {form.checkoutDate && (
                    <p className="mt-1.5 text-xs font-medium text-emerald-600">{fmtDate(form.checkoutDate)}</p>
                  )}
                </Field>
                <Field label="เวลารับรถ (08:00–21:00 น.)">
                  <TimePicker
                    hour={form.checkoutHour}
                    minute={form.checkoutMinute}
                    onHourChange={(h: string) => handleChange("checkoutHour", h)}
                    onMinuteChange={(m: string) => handleChange("checkoutMinute", m)}
                  />
                  <p className="mt-1.5 text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> แนะนำ 21:00 น. หรือตามเวลาเครื่องลง
                  </p>
                </Field>
              </div>
            </div>
          </SectionCard>

          <div className="flex justify-end">
            <button
              onClick={() => {
                let valid = true;
                if (validateStep1 && !validateStep1()) valid = false;
                if (valid && validateStep2 && !validateStep2()) valid = false;
                if (valid) {
                  setStep(2);
                  if (scrollToForm) scrollToForm();
                }
              }}
              className="flex items-center gap-2 rounded-2xl bg-sky-700 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-700/20 transition hover:-translate-y-0.5 hover:bg-sky-800"
            >
              ถัดไป: ยืนยันการจอง <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── ขั้นตอนที่ 2: สรุปและยืนยัน ─── */}
      {step === 2 && (
        <div className="fade-in space-y-5">
          {/* ส่วนสรุปข้อมูลทั้งหมดที่ผู้ใช้กรอกมา (แสดงผลอย่างเดียว) */}
          <SectionCard icon={<ClipboardList className="w-5 h-5" />} title="ตรวจสอบข้อมูลการจอง (Review Booking)" subtitle="กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยัน">
            <div className="flex flex-col gap-4 px-2 sm:px-6">
              {/* ข้อมูลลูกค้า */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-800 mb-1">ข้อมูลลูกค้า</p>
                <ReviewRow label="ชื่อ-นามสกุล" value={form.name} />
                <ReviewRow label="เบอร์โทร" value={`${form.phone}${form.phoneAlt ? ` / ${form.phoneAlt}` : ""}`} />
              </div>
              
              <div className="border-t border-dashed border-slate-200" />

              {/* ข้อมูลรถยนต์ */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-800 mb-1">ข้อมูลรถยนต์</p>
                <ReviewRow label="ประเภท" value={form.type} />
                <ReviewRow label="ยี่ห้อ / รุ่น" value={`${form.brand} ${form.model}`} />
                {form.plate && <ReviewRow label="ทะเบียน" value={form.plate} />}
              </div>

              <div className="border-t border-dashed border-slate-200" />

              {/* กำหนดการ */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-800 mb-1">กำหนดการ</p>
                <ReviewRow label="เข้าจอด" value={`${fmtDate(form.checkinDate)} เวลา ${form.checkinHour}:${form.checkinMinute} น.`} />
                <ReviewRow label="รับรถ" value={`${fmtDate(form.checkoutDate)} เวลา ${form.checkoutHour}:${form.checkoutMinute} น.`} />
                <ReviewRow label="ระยะเวลา" value={priceResult.label} />
              </div>

              <div className="border-t border-dashed border-slate-200" />

              {/* โค้ดส่วนลด */}
              <div className="pt-2 pb-2">
                <Field label="โค้ดส่วนลด (Coupon Code)">
                  <Input
                    value={form.coupon}
                    onChange={(e: any) => handleChange("coupon", e.target.value.toUpperCase())}
                    placeholder="(ถ้ามี)"
                    className="uppercase bg-slate-50"
                  />
                  {discount > 0 && (
                    <p className="mt-1 text-xs font-bold text-emerald-600">✓ ส่วนลด ฿{fmt(discount)} บาท</p>
                  )}
                </Field>
              </div>
            </div>

            {/* แสดงยอดรวมสุดท้ายตัวใหญ่ๆ */}
            <div className="mt-6 rounded-2xl bg-sky-700 p-4 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-right">
                <p className="text-sky-200 text-xs leading-relaxed">
                  เมื่อกดยืนยัน ระบบจะแสดงใบเสร็จ<br />เพื่อใช้เป็นหลักฐานการจอง
                </p>
              </div>
              <div>
                <p className="text-sky-200 text-sm font-medium">ยอดรวมโดยประมาณ</p>
                <p className="text-2xl font-black tracking-tight mt-1">฿{fmt(total)}</p>
              </div>
            </div>
          </SectionCard>

          {/* กล่องข้อความเตือน */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-800 leading-relaxed">
              <strong>หมายเหตุ:</strong> กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนกดยืนยัน<br />
              เมื่อยืนยันแล้ว คุณสามารถดาวน์โหลดใบเสร็จเพื่อนำไปส่งให้เจ้าหน้าที่ในภายหลังได้
            </div>
          </div>

          {/* ปุ่มย้อนกลับ และ ปุ่มยืนยันสุดท้าย */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <button
              onClick={() => { setStep(1); if (scrollToForm) scrollToForm(); }}
              className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:-translate-y-0.5"
            >
              <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:-translate-y-0.5 hover:bg-emerald-600"
            >
              <Check className="w-5 h-5" /> ยืนยันการจอง
            </button>
          </div>
        </div>
      )}
    </div>
  );
}