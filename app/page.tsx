"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getAddress } from "@/lib/geocode";

// Type untuk lokasi
interface Location {
  latitude: number;
  longitude: number;
}

// SVG Icons components (no external library needed)
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MapPinIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="M22 4 12 14.01l-3-3" />
  </svg>
);

const XCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </svg>
);

const LoaderIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="animate-spin"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default function Home() {
  const [nama, setNama] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | null;
    message: string | null;
  }>({ type: null, message: null });

  // Get current location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Location access denied:", error);
        },
      );
    }
  }, []);

  const handlePresensi = () => {
    if (!nama.trim()) {
      setFeedback({ type: "error", message: "Mohon masukkan nama lengkap" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLoading(true);
        setFeedback({ type: null, message: null });

        const { latitude, longitude } = position.coords;

        try {
          const alamat = await getAddress(latitude, longitude);

          const { error } = await supabase.from("presensi").insert({
            nama,
            latitude,
            longitude,
            alamat,
          });

          if (error) {
            console.error(error);
            setFeedback({ type: "error", message: error.message });
          } else {
            setFeedback({ type: "success", message: "Presensi berhasil! 🎉" });
            setNama("");
            setTimeout(() => setFeedback({ type: null, message: null }), 3000);
          }
        } catch (err: unknown) {
          // Type casting: check jika err adalah Error object
          const errorMessage =
            err instanceof Error
              ? err.message
              : "Terjadi kesalahan yang tidak diketahui";
          setFeedback({
            type: "error",
            message: "Gagal mendapatkan alamat: " + errorMessage,
          });
        }

        setLoading(false);
      },
      () => {
        setFeedback({
          type: "error",
          message: "Izinkan akses lokasi untuk presensi",
        });
      },
    );
  };

  const feedbackStyles = {
    success: "bg-green-50 border-green-200 text-green-700",
    error: "bg-red-50 border-red-200 text-red-700",
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-linear-to-br from-orange-500 to-amber-600 p-3 rounded-xl">
              <CheckCircleIcon />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              Presensi Lapangan
            </h1>
          </div>
          <p className="text-gray-600 text-sm ml-1">
            Catat kehadiran Anda dengan lokasi otomatis
          </p>
        </div>

        {/* Location Info Card */}
        {currentLocation && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-4 border border-gray-100">
            <div className="flex items-start gap-2">
              <div className="text-orange-500 mt-0.5">
                <MapPinIcon />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Lokasi Saat Ini
                </p>
                <p className="text-xs text-gray-500">
                  {currentLocation.latitude.toFixed(6)},{" "}
                  {currentLocation.longitude.toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Alert */}
        {feedback?.type && (
          <div
            className={`rounded-xl border p-4 mb-4 flex items-center gap-3 ${feedbackStyles[feedback.type]}`}
          >
            {feedback.type === "success" ? (
              <CheckCircleIcon />
            ) : (
              <XCircleIcon />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
              Nama Lengkap
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <UserIcon />
              </div>
              <input
                className="border border-gray-200 p-3 w-full pl-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-gray-700"
                placeholder="Masukkan nama lengkap Anda"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button
            onClick={handlePresensi}
            disabled={loading}
            className="w-full bg-linear-to-r from-orange-500 to-amber-600 text-white p-4 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <LoaderIcon />
                Mengirim...
              </>
            ) : (
              <>
                <CheckCircleIcon />
                Presensi Sekarang
              </>
            )}
          </button>

          <p className="text-xs text-gray-400 text-center mt-4">
            Lokasi Anda akan otomatis tercatat saat presensi
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-400">
          <p>Sistem Presensi Sensus Ekonomi 2026 BPS Kota Manado</p>
        </div>
      </div>
    </main>
  );
}
