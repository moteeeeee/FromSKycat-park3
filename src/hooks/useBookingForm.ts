import { useState, useRef } from "react";
// ดึงฟังก์ชันคำนวณราคามาจากไฟล์ constants
import { calcSkyPrice } from "../constants/pricing";
// ดึงชนิดข้อมูล (Type) สำหรับใบเสร็จ
import { ReceiptData } from "../components/ReceiptCard";

// ตัว Hook หลักที่เป็น "สมอง" ของฟอร์มการจอง (รับฟังก์ชัน addNotif เข้ามาเพื่อสั่งแสดงแจ้งเตือน Error)
export function useBookingForm(addNotif: (title: string, message: string, type?: string) => void) {
  // --- 1. จัดการ State (ข้อมูลสถานะ) ---
  // step: ตอนนี้อยู่ขั้นตอนไหน (1, 2, หรือ 3)
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  // form: เก็บข้อมูลทุกอย่างที่ผู้ใช้พิมพ์เข้ามาในฟอร์ม (ถ้าเพิ่มช่องกรอกใน UI ต้องมาเพิ่มตัวแปรรับค่าตรงนี้ด้วย)
  const [form, setForm] = useState({
    name: "",
    phone: "",
    phoneAlt: "",
    plate: "",
    type: "รถเก๋ง (Sedan)",
    brand: "",
    model: "",
    checkinDate: today,
    checkinHour: "08",
    checkinMinute: "00",
    checkoutDate: today,
    checkoutHour: "08",
    checkoutMinute: "00",
    coupon: "",
    specialNote: "",
  });

  // --- 2. ฟังก์ชันจัดการเมื่อพิมพ์กรอกข้อมูล (onChange) ---
  const handleChange = (field: string, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // ลอจิกพิเศษ: ถ้าเปลี่ยน "ประเภทรถ" ให้เคลียร์ "ยี่ห้อ" กับ "รุ่นรถ" ทิ้ง เพื่อให้เลือกใหม่
      if (field === "type") { next.brand = ""; next.model = ""; }
      // ลอจิกพิเศษ: ถ้าเปลี่ยน "ยี่ห้อรถ" ให้เคลียร์ "รุ่นรถ" ทิ้ง
      if (field === "brand") { next.model = ""; }
      return next;
    });
  };

  // --- 3. ฟังก์ชันคำนวณวัน-เวลา ---
  const getTotalHours = (): number => {
    // แปลงวันที่และเวลาเข้า-ออก ให้อยู่ในรูป Timestamp แล้วลบกันเพื่อหาจำนวนชั่วโมง
    const dIn = new Date(`${form.checkinDate}T${form.checkinHour.padStart(2, "0")}:${form.checkinMinute}:00`).getTime();
    const dOut = new Date(`${form.checkoutDate}T${form.checkoutHour.padStart(2, "0")}:${form.checkoutMinute}:00`).getTime();
    return Math.max(0, (dOut - dIn) / 3600000);
  };

  const totalHours = getTotalHours();
  const inDateObj = new Date(`${form.checkinDate}T${form.checkinHour.padStart(2, "0")}:${form.checkinMinute}:00`);
  const outDateObj = new Date(`${form.checkoutDate}T${form.checkoutHour.padStart(2, "0")}:${form.checkoutMinute}:00`);
  
  // เรียกใช้สูตรคำนวณราคาจากไฟล์ pricing.ts (ถ้าแก้กฎราคา ไม่ต้องแก้ที่นี่ ให้ไปแก้ที่ pricing.ts)
  const priceResult = calcSkyPrice(totalHours, inDateObj, outDateObj);

  // --- 4. ลอจิกคูปองและส่วนลด ---
  // (ถ้ามีโค้ดส่วนลดใหม่ๆ เพิ่มเข้ามา สามารถเติมใน Object นี้ได้เลย)
  const COUPONS: Record<string, number> = { PROMO50: 50, WELCOME100: 100, SAVE20: 20 };
  const discount = COUPONS[form.coupon] ?? 0;
  const total = Math.max(0, priceResult.price - discount);

  // --- 5. ฟังก์ชันตรวจสอบความถูกต้อง (Validation) ก่อนกด Next ---
  // ถ้ามีช่องไหนห้ามว่าง หรือกรอกผิด ให้เด้ง Notif และ return false
  const validateStep1 = () => {
    if (!form.name.trim()) { addNotif("กรุณากรอกชื่อ-นามสกุล", "ชื่อเป็นข้อมูลสำคัญสำหรับการจอง", "error"); return false; }
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 9) { addNotif("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง", "ต้องมีเลขอย่างน้อย 9 หลัก", "error"); return false; }
    if (!form.brand) { addNotif("กรุณาเลือกยี่ห้อรถ", "เลือกประเภทรถก่อน จากนั้นเลือกยี่ห้อรถ", "error"); return false; }
    if (!form.model) { addNotif("กรุณาเลือกรุ่นรถ", "เลือกยี่ห้อรถก่อน จากนั้นเลือกรุ่นรถ", "error"); return false; }
    return true;
  };

  const validateStep2 = () => {
    // เวลาเข้า-ออกต้องไม่ติดลบ (ออกก่อนเข้าไม่ได้)
    if (totalHours <= 0) { addNotif("วันที่/เวลาออกรถไม่ถูกต้อง", "วันที่ออกรถต้องมาหลังวันที่เข้าจอด", "error"); return false; }
    return true;
  };

  // --- 6. สร้างเลข Booking ID และจัดเตรียมข้อมูลใบเสร็จ ---
  // useRef เพื่อให้ ID ถูกสร้างแค่ครั้งเดียว ไม่ถูกสุ่มใหม่เวลาพิมพ์ช่องอื่น
  const bookingIdRef = useRef(`SKY-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`);

  const receiptData: ReceiptData = {
    bookingId: bookingIdRef.current,
    form,
    priceResult,
    discount,
    total,
  };

  // --- 7. ฟังก์ชันอำนวยความสะดวก UI ---
  const formTopRef = useRef<HTMLDivElement>(null);
  const scrollToForm = () => {
    if (formTopRef.current) {
      const y = formTopRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // ล้างค่าฟอร์มกลับเป็นค่าเริ่มต้น (ใช้ตอนกรอกข้อมูลเสร็จและต้องการจองคันใหม่)
  const resetForm = () => {
    setSubmitted(false);
    setStep(1);
    setForm((f) => ({ ...f, name: "", phone: "", phoneAlt: "", plate: "", coupon: "", specialNote: "" }));
    bookingIdRef.current = `SKY-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  };

  return {
    step, setStep, form, handleChange, submitted, setSubmitted, 
    totalHours, priceResult, discount, total, 
    validateStep1, validateStep2, receiptData, 
    formTopRef, scrollToForm, resetForm
  };
}