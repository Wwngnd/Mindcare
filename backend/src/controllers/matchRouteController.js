import axios from "axios";

// ─── Downsampling merata ke maksimal N titik ──────────────────────────────────
function downsample(coords, maxPoints) {
    if (coords.length <= maxPoints) return coords;
    const result = [];
    const step = (coords.length - 1) / (maxPoints - 1);
    for (let i = 0; i < maxPoints; i++) {
        const idx = Math.round(i * step);
        result.push(coords[Math.min(idx, coords.length - 1)]);
    }
    return result;
}

const matchRouteController = {
    async matchRoute(req, res) {
        try {
            const { coords } = req.body;

            // Validasi dasar
            if (!Array.isArray(coords) || coords.length < 2) {
                return res.status(200).json({
                    success: true,
                    msg: "Titik tidak cukup untuk map matching.",
                    payload: { geometry: null },
                });
            }

            // Downsample ke maks 100 titik (batas public OSRM)
            const sampled = downsample(coords, 100);

            // OSRM butuh format: lng,lat (bukan lat,lng!)
            const coordString = sampled
                .map((p) => `${p.lng},${p.lat}`)
                .join(";");

            const osrmUrl = `http://router.project-osrm.org/match/v1/foot/${coordString}?geometries=geojson&overview=full&annotations=false`;

            const osrmRes = await axios.get(osrmUrl, { timeout: 15000 });
            const matchings = osrmRes.data?.matchings;

            if (!matchings || matchings.length === 0) {
                return res.status(200).json({
                    success: true,
                    msg: "OSRM tidak menemukan rute yang cocok.",
                    payload: { geometry: null },
                });
            }

            // Ambil geometry dari matching pertama (yang terpanjang)
            const geometry = matchings[0].geometry;

            return res.status(200).json({
                success: true,
                msg: "Map matching berhasil.",
                payload: { geometry },
            });
        } catch (error) {
            console.error("[matchRoute] Error:", error?.message || error);

            // Jangan crash — return null geometry agar frontend tetap bisa lanjut
            return res.status(200).json({
                success: true,
                msg: "Map matching gagal (OSRM error), rute raw digunakan.",
                payload: { geometry: null },
            });
        }
    },
};

export default matchRouteController;
