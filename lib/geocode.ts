import axios from "axios";

export async function getAddress(lat: number, lon: number) {
  const response = await axios.get(
    "https://nominatim.openstreetmap.org/reverse",
    {
      params: {
        format: "json",
        lat,
        lon,
      },
      headers: {
        "User-Agent": "presensi-lapangan",
      },
    },
  );

  return response.data.display_name;
}
