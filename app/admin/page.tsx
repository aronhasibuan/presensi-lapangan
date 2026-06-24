"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

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
  petugas_id: string | number;
  latitude: number;
  longitude: number;
  alamat: string;
  created_at: string;
  petugas: { nama: string } | null;
}

type RawPresensi = {
  id: any;
  petugas_id: any;
  latitude: any;
  longitude: any;
  alamat: any;
  created_at: any;
  petugas?: { nama: any }[] | { nama: any } | null;
};

function pickOne<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function getLocalTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function formatDateLabel(dateKey: string) {
  const [y, m, d] = dateKey.split("-");
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString(
    "id-ID",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );
}

function getRangeFromLocalDate(dateKey: string) {
  const start = new Date(`${dateKey}T00:00:00`);
  const end = new Date(`${dateKey}T23:59:59.999`);
  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}

export default function AdminPage() {
  const today = getLocalTodayKey();

  const [rawData, setRawData] = useState<PresensiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedDate, setSelectedDate] = useState(today);

  const fetchPresensi = async (date: string) => {
    setLoading(true);
    setError(null);

    const { startIso, endIso } = getRangeFromLocalDate(date);

    const { data: presensiData, error } = await supabase
      .from("presensi")
      .select(
        "id, petugas_id, latitude, longitude, alamat, created_at, petugas(nama)",
      )
      .gte("created_at", startIso)
      .lte("created_at", endIso)
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setRawData([]);
      setLoading(false);
      return;
    }

    const mapped: PresensiData[] = ((presensiData ?? []) as RawPresensi[]).map(
      (item) => {
        const petugas = pickOne(item.petugas);
        return {
          id: Number(item.id),
          petugas_id: item.petugas_id,
          latitude: Number(item.latitude),
          longitude: Number(item.longitude),
          alamat: String(item.alamat ?? ""),
          created_at: String(item.created_at ?? ""),
          petugas: petugas ? { nama: String(petugas.nama ?? "") } : null,
        };
      },
    );

    setRawData(mapped);
    setLoading(false);
  };

  useEffect(() => {
    fetchPresensi(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    setPage(1);
  }, [search, selectedDate]);

  const normalizedSearch = search.toLowerCase().trim();

  const filteredData = useMemo(() => {
    if (!normalizedSearch) return rawData;
    return rawData.filter((item) => {
      const namaPetugas = item.petugas?.nama?.toLowerCase() ?? "";
      const alamat = item.alamat?.toLowerCase() ?? "";
      const petugasId = String(item.petugas_id).toLowerCase();
      return (
        namaPetugas.includes(normalizedSearch) ||
        alamat.includes(normalizedSearch) ||
        petugasId.includes(normalizedSearch)
      );
    });
  }, [rawData, normalizedSearch]);

  const totalCount = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleRefresh = async () => {
    await fetchPresensi(selectedDate);
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-orange-50 via-amber-50 to-yellow-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl bg-white/90 backdrop-blur shadow-lg border border-white p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700">
                <UsersIcon />
                Dashboard Presensi
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Monitoring Kehadiran
                </h1>
                <p className="mt-2 text-gray-600">
                  Lihat presensi per hari, cari data petugas, dan pantau lokasi
                  dengan tampilan yang lebih rapi.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full lg:w-auto">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500">
                  Pilih tanggal
                </span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </label>

              <label className="flex flex-col gap-1 sm:col-span-1 lg:col-span-1">
                <span className="text-xs font-semibold text-gray-500">
                  Cari data
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nama, alamat, atau ID"
                  className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </label>

              <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-2">
                <button
                  onClick={() => setPage(1)}
                  className="h-11 flex-1 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
                >
                  Terapkan
                </button>
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="h-11 rounded-xl bg-white px-4 text-sm font-semibold text-gray-700 border border-gray-200 transition hover:bg-gray-50 disabled:opacity-50 inline-flex items-center gap-2"
                >
                  <RefreshIcon />
                  {loading ? "Memuat" : "Refresh"}
                </button>
                <button className="h-11 rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white transition hover:bg-gray-800 inline-flex items-center gap-2">
                  <DownloadIcon />
                  Export
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total data hari ini</p>
                <h3 className="mt-2 text-3xl font-bold text-gray-900">
                  {totalCount}
                </h3>
              </div>
              <div className="rounded-2xl bg-orange-100 p-3 text-orange-600">
                <UsersIcon />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tanggal terpilih</p>
                <h3 className="mt-2 text-lg font-bold text-gray-900">
                  {formatDateLabel(selectedDate)}
                </h3>
              </div>
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-600">
                <CalendarIcon />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Status data</p>
                <h3 className="mt-2 text-lg font-bold text-gray-900">
                  {loading
                    ? "Loading..."
                    : totalCount > 0
                      ? "Ada data"
                      : "Kosong"}
                </h3>
              </div>
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600">
                <LocationIcon />
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            Error: {error}
          </div>
        )}

        <section className="overflow-hidden rounded-3xl bg-white shadow-lg border border-gray-100">
          <div className="flex items-center justify-between border-b border-gray-100 bg-linear-to-r from-orange-500 to-amber-600 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Data Presensi
              </h2>
              <p className="text-sm text-orange-100">
                Menampilkan data untuk {formatDateLabel(selectedDate)}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-sm text-white">
              <ClockIcon />
              {filteredData.length} data
            </div>
          </div>

          {loading && !rawData.length ? (
            <div className="p-10 text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
              <p className="text-gray-600">Mengambil data presensi...</p>
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                <CalendarIcon />
              </div>
              <p className="text-lg font-semibold text-gray-800">
                Belum ada data presensi
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Coba pilih tanggal lain atau hapus filter pencarian.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      <th className="px-5 py-4">Nama</th>
                      <th className="px-5 py-4">Latitude</th>
                      <th className="px-5 py-4">Longitude</th>
                      <th className="px-5 py-4">Waktu</th>
                      <th className="px-5 py-4">Alamat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedData.map((item) => {
                      const namaPetugas =
                        item.petugas?.nama ?? "Nama Tidak Diketahui";
                      const initial = namaPetugas.charAt(0).toUpperCase();

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-orange-50/60 transition"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-semibold text-orange-700">
                                {initial}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {namaPetugas}
                                </p>
                                <p className="text-xs text-gray-500">
                                  ID: {item.petugas_id}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 font-mono text-sm text-gray-700">
                            {item.latitude.toFixed(6)}
                          </td>
                          <td className="px-5 py-4 font-mono text-sm text-gray-700">
                            {item.longitude.toFixed(6)}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <ClockIcon />
                              <span>
                                {new Date(item.created_at).toLocaleString(
                                  "id-ID",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <MapPinIcon />
                              <span className="max-w-xs truncate">
                                {item.alamat || "Tidak ada alamat"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-600">
                  Halaman{" "}
                  <span className="font-semibold text-gray-900">{page}</span>{" "}
                  dari{" "}
                  <span className="font-semibold text-gray-900">
                    {totalPages}
                  </span>
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1 || loading}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    disabled={page >= totalPages || loading}
                    onClick={() =>
                      setPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
