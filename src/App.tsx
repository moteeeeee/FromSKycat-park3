import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicApp from "./components/PublicApp";
import { BOOKINGS_INIT, OCC_INIT } from "./constants/bookings";
import { Booking } from "./types/index";

export default function App() {
  // จัดการ State กลางของแอปพลิเคชัน
  const [bookings, setBookings] = useState<Booking[]>(() => JSON.parse(localStorage.getItem("bookings") || "null") || BOOKINGS_INIT);
  const [occ, setOcc] = useState<Set<string>>(() => new Set(JSON.parse(localStorage.getItem("OCCUPIED") || "null") || OCC_INIT));

  // บันทึกการเปลี่ยนแปลงลง LocalStorage เสมอ
  useEffect(() => {
    localStorage.setItem("bookings", JSON.stringify(bookings));
    localStorage.setItem("OCCUPIED", JSON.stringify(Array.from(occ)));
  }, [bookings, occ]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public-facing pages */}
        <Route path="/receipt/:bookingId" element={<PublicApp bookings={bookings} setBookings={setBookings} occ={occ} setOcc={setOcc} />} />
        <Route path="/*" element={<PublicApp bookings={bookings} setBookings={setBookings} occ={occ} setOcc={setOcc} />} />
      </Routes>
    </BrowserRouter>
  );
}