"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { supabase } from "@/lib/supabase";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// SVG Icons
const MapIcon = () => (
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
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 15 9 18 3 15" />
    <line x1="9" x2="9" y1="3" y2="18" />
    <line x1="15" x2="15" y1="6" y2="21" />
  </svg>
);

const UsersIcon = () => (
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
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

const LocationIcon = () => (
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

const ClockIcon = () => (
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
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

type Presensi = {
  id: number;
  nama: string;
  latitude: number;
  longitude: number;
  alamat: string;
  created_at: string;
};

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function MapPage() {
  const [data, setData] = useState<Presensi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const center: [number, number] = [1.4748, 124.8421];

  async function fetchData() {
    setLoading(true);
    setError(null);

    try {
      // Add sorting by created_at descending (terbaru pertama)
      const { data: presensiData, error } = await supabase
        .from("presensi")
        .select("*")
        .order("created_at", { ascending: false });

      console.log("DATA:", presensiData);
      console.log("ERROR:", error);

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
  }

  useEffect(() => {
    fetchData();
  }, []);

  const totalMarkers = data.filter(
    (item) => item.latitude && item.longitude,
  ).length;
  const latestPresensi = data.length > 0 ? data[0] : null;

  return (
    <main className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-linear-to-br from-orange-500 to-amber-600 p-3 rounded-xl">
                <MapIcon />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Peta Lokasi Presensi
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Visualisasi lokasi kehadiran lapangan secara realtime
                </p>
              </div>
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all disabled:opacity-50"
            >
              <RefreshIcon />
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <LocationIcon />
              </div>
              <p className="text-gray-600 font-medium">Total Lokasi</p>
            </div>
            <p className="text-3xl font-bold text-gray-800">{totalMarkers}</p>
            <p className="text-xs text-gray-500 mt-1">Marker pada peta</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <UsersIcon />
              </div>
              <p className="text-gray-600 font-medium">Total Presensi</p>
            </div>
            <p className="text-3xl font-bold text-gray-800">{data.length}</p>
            <p className="text-xs text-gray-500 mt-1">
              Total kehadiran tercatat
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <ClockIcon />
              </div>
              <p className="text-gray-600 font-medium">Terbaru</p>
            </div>
            {latestPresensi ? (
              <>
                <p className="text-xl font-bold text-gray-800">
                  {latestPresensi.nama}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(latestPresensi.created_at).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </>
            ) : (
              <p className="text-gray-400">Belum ada data</p>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 flex items-center gap-3">
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

        {/* Map Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-linear-to-r from-orange-500 to-amber-600 p-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <MapIcon />
              Peta Interaktif Lokasi Presensi
            </h2>
          </div>

          {loading && !data.length ? (
            <div className="h-[70vh] flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Memuat peta...</p>
                <p className="text-gray-400 text-sm mt-1">
                  Mengambil data lokasi presensi
                </p>
              </div>
            </div>
          ) : !data.length ? (
            <div className="h-[70vh] flex items-center justify-center">
              <div className="text-center">
                <div className="bg-gray-100 p-6 rounded-full inline-block mb-4">
                  <MapIcon />
                </div>
                <p className="text-gray-600 font-medium text-lg">
                  Belum ada data lokasi
                </p>
                <p className="text-gray-400 text-sm mt-1 max-w-md">
                  Data lokasi akan muncul setelah orang melakukan presensi
                  dengan lokasi GPS
                </p>
              </div>
            </div>
          ) : (
            <MapContainer
              center={center}
              zoom={13}
              style={{
                height: "70vh",
                zIndex: "1",
              }}
            >
              <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {data
                .filter((item) => item.latitude && item.longitude)
                .map((item) => (
                  <Marker
                    key={item.id}
                    position={[Number(item.latitude), Number(item.longitude)]}
                  >
                    <Popup>
                      <div className="text-center">
                        <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 font-bold">
                          {item.nama.charAt(0).toUpperCase()}
                        </div>
                        <b className="text-gray-800">{item.nama}</b>
                        <br />
                        <p className="text-gray-600 text-sm mt-1">
                          {item.alamat}
                        </p>
                        {item.created_at && (
                          <p className="text-gray-400 text-xs mt-2">
                            {new Date(item.created_at).toLocaleString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          )}

          {/* Map Footer */}
          {data.length > 0 && (
            <div className="bg-gray-50 p-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Menampilkan{" "}
                  <span className="font-semibold text-gray-800">
                    {totalMarkers}
                  </span>{" "}
                  lokasi dari{" "}
                  <span className="font-semibold text-gray-800">
                    {data.length}
                  </span>{" "}
                  total presensi
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <LocationIcon />
                  <span>OpenStreetMap</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-4 text-xs text-gray-400">
          <p>Sistem Peta Lokasi Presensi Lapangan 2024</p>
        </div>
      </div>
    </main>
  );
}
