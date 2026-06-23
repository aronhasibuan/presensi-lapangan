"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix icon leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type Presensi = {
  id: number;
  petugas_id: number | null;
  latitude: number;
  longitude: number;
  alamat: string;
  created_at: string;
  petugas: {
    nama: string;
  } | null;
};

export default function MapView({ data }: { data: Presensi[] }) {
  const center: [number, number] = [1.4748, 124.8421];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{
        height: "70vh",
        width: "100%",
        zIndex: 1,
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
                <b>{item.petugas?.nama ?? "Tidak diketahui"}</b>

                <br />

                <span>{item.alamat}</span>

                <br />

                <small>
                  {new Date(item.created_at).toLocaleString("id-ID")}
                </small>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
