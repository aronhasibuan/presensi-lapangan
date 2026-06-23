"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getAddress } from "@/lib/geocode";

interface Location {
  latitude: number;
  longitude: number;
}

type Petugas = {
  id: string | number;
  nama: string;
};

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
  const router = useRouter();

  const [petugas, setPetugas] = useState<Petugas[]>([]);
  const [query, setQuery] = useState("");
  const [selectedPetugas, setSelectedPetugas] = useState<Petugas | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | null;
    message: string | null;
  }>({
    type: null,
    message: null,
  });

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const todayLocal = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  useEffect(() => {
    async function loadPetugas() {
      const { data, error } = await supabase
        .from("petugas")
        .select("*")
        .order("nama");

      if (!error && data) setPetugas(data);
    }

    loadPetugas();
  }, []);

  const filteredPetugas = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return petugas;
    return petugas.filter((item) => item.nama.toLowerCase().includes(q));
  }, [petugas, query]);

  const handleSelectPetugas = (item: Petugas) => {
    setSelectedPetugas(item);
    setQuery(item.nama);
    setShowDropdown(false);
  };

  const handlePresensi = () => {
    const nama = selectedPetugas?.nama || query.trim();

    if (!nama) {
      setFeedback({ type: "error", message: "Mohon pilih petugas" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLoading(true);
        setFeedback({ type: null, message: null });

        const { latitude, longitude } = position.coords;

        try {
          const alamat = await getAddress(latitude, longitude);
          const today = todayLocal();

          const { data: existing, error: checkError } = await supabase
            .from("presensi")
            .select("id")
            .eq("nama", nama)
            .eq("presensi_date", today)
            .maybeSingle();

          if (checkError) {
            setFeedback({ type: "error", message: checkError.message });
            setLoading(false);
            return;
          }

          if (existing) {
            setFeedback({
              type: "error",
              message: "Petugas ini sudah presensi hari ini.",
            });
            setLoading(false);
            return;
          }

          const { error } = await supabase.from("presensi").insert({
            nama,
            latitude,
            longitude,
            alamat,
            presensi_date: today,
          });

          if (error) {
            if (error.message.toLowerCase().includes("duplicate")) {
              setFeedback({
                type: "error",
                message: "Petugas ini sudah presensi hari ini.",
              });
            } else {
              setFeedback({ type: "error", message: error.message });
            }
          } else {
            setFeedback({ type: "success", message: "Presensi berhasil! 🎉" });
            setQuery("");
            setSelectedPetugas(null);

            setTimeout(() => {
              router.replace("/presensi-sukses");
            }, 1200);
          }
        } catch (err: unknown) {
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
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-linear-to-br from-orange-500 to-amber-600 p-3 rounded-xl text-white">
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

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="mb-5" ref={wrapperRef}>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
              Nama Lengkap
            </label>

            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <UserIcon />
              </div>

              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedPetugas(null);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Ketik nama petugas..."
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-gray-800 shadow-sm outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
              />
            </div>

            {showDropdown && (
              <div className="mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                {filteredPetugas.length > 0 ? (
                  <ul className="max-h-60 overflow-auto py-1">
                    {filteredPetugas.map((item) => (
                      <li
                        key={item.id}
                        onClick={() => handleSelectPetugas(item)}
                        className="cursor-pointer px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700"
                      >
                        <div className="font-medium">{item.nama}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    Petugas tidak ditemukan
                  </div>
                )}
              </div>
            )}

            {selectedPetugas && (
              <p className="mt-2 text-xs text-green-600">
                Terpilih: {selectedPetugas.nama}
              </p>
            )}
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

        <div className="text-center mt-6 text-xs text-gray-400">
          <p>Sistem Presensi Sensus Ekonomi 2026 BPS Kota Manado</p>
        </div>
      </div>
    </main>
  );
}
