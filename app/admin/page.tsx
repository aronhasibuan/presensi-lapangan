"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// SVG Icons (no external library)
const MapPinIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
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

const RefreshIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);

const DownloadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

const UsersIcon = () => (
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
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CalendarIcon = () => (
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
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const ClockIcon = () => (
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
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const LocationIcon = () => (
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

interface PresensiData {
  id: number;
  nama: string;
  latitude: number;
  longitude: number;
  alamat: string;
  created_at: string;
}

export default function AdminPage() {
  const [data, setData] = useState<PresensiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPresensi = async () => {
      try {
        const { data: presensiData, error } = await supabase
          .from("presensi")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          setError(error.message);
        } else {
          setData(presensiData || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    fetchPresensi();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    const { data: presensiData, error } = await supabase
      .from("presensi")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setData(presensiData || []);
    }
    setLoading(false);
  };

  const totalPresensi = data.length;
  const todayCount = data.filter(
    (item) =>
      new Date(item.created_at).toDateString() === new Date().toDateString(),
  ).length;

  return (
    <main className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-linear-to-br from-orange-500 to-amber-600 p-3 rounded-xl">
                <UsersIcon />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Dashboard Presensi
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Monitoring kehadiran lapangan realtime
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                <RefreshIcon />
                {loading ? "Loading..." : "Refresh"}
              </button>
              <button className="flex items-center gap-2 bg-linear-to-r from-orange-500 to-amber-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all">
                <DownloadIcon />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <UsersIcon />
              </div>
              <p className="text-gray-600 font-medium">Total Presensi</p>
            </div>
            <p className="text-3xl font-bold text-gray-800">{totalPresensi}</p>
            <p className="text-xs text-gray-500 mt-1">
              Total kehadiran semua waktu
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <CalendarIcon />
              </div>
              <p className="text-gray-600 font-medium">Hari Ini</p>
            </div>
            <p className="text-3xl font-bold text-gray-800">{todayCount}</p>
            <p className="text-xs text-gray-500 mt-1">
              Kehadiran tanggal{" "}
              {new Date().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <LocationIcon />
              </div>
              <p className="text-gray-600 font-medium">Lokasi Aktif</p>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {totalPresensi > 0 ? "Active" : "N/A"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Sistem presensi beroperasi
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 flex items-center gap-3">
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
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
            <span className="font-medium">Error: {error}</span>
          </div>
        )}

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-linear-to-r from-orange-500 to-amber-600 p-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <ClockIcon />
              Data Kehadiran Terbaru
            </h2>
          </div>

          {loading && !data.length ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Mengambil data presensi...</p>
            </div>
          ) : !data.length ? (
            <div className="p-8 text-center">
              <div className="bg-gray-100 p-4 rounded-full inline-block mb-4">
                <UsersIcon />
              </div>
              <p className="text-gray-600 font-medium">
                Belum ada data presensi
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Data akan muncul setelah orang melakukan presensi
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">
                      Nama
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">
                      <div className="flex items-center gap-1">
                        <MapPinIcon />
                        Latitude
                      </div>
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">
                      <div className="flex items-center gap-1">
                        <MapPinIcon />
                        Longitude
                      </div>
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">
                      Waktu Presensi
                    </th>
                    <th className="text-left p-4 font-semibold text-gray-700 text-sm">
                      Alamat
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`border-t hover:bg-orange-50 transition-all ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-orange-100 w-8 h-8 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 font-semibold text-sm">
                              {item.nama.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-gray-800">
                            {item.nama}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-600 text-sm font-mono">
                          {item.latitude.toFixed(6)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-600 text-sm font-mono">
                          {item.longitude.toFixed(6)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <ClockIcon />
                          <span>
                            {new Date(item.created_at).toLocaleString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPinIcon />
                          <span className="max-w-xs truncate">
                            {item.alamat || "Tidak ada alamat"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer */}
          {data.length > 0 && (
            <div className="bg-gray-50 p-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Menampilkan{" "}
                <span className="font-semibold text-gray-800">
                  {data.length}
                </span>{" "}
                data presensi
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-400">
          <p>Sistem Presensi Sensus Ekonomi 2026 BPS Kota Manado</p>
        </div>
      </div>
    </main>
  );
}
