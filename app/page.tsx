"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [nama, setNama] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePresensi = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLoading(true);

        const { latitude, longitude } = position.coords;

        const { error } = await supabase.from("presensi").insert({
          nama,
          latitude,
          longitude,
        });

        if (error) {
          console.error(error);
          alert(error.message);
        }

        setLoading(false);

        if (error) {
          alert("Gagal presensi");
        } else {
          alert("Presensi berhasil");
          setNama("");
        }
      },
      () => {
        alert("Izinkan akses lokasi");
      },
    );
  };

  return (
    <main className="max-w-md mx-auto p-5">
      <h1 className="text-2xl font-bold mb-4">Presensi Lapangan</h1>

      <input
        className="border p-2 w-full mb-3"
        placeholder="Nama Lengkap"
        value={nama}
        onChange={(e) => setNama(e.target.value)}
      />

      <button
        onClick={handlePresensi}
        disabled={loading}
        className="bg-blue-500 text-white p-2 rounded w-full"
      >
        {loading ? "Mengirim..." : "Presensi"}
      </button>
    </main>
  );
}
