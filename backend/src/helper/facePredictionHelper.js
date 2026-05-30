import axios from "axios";
import FormData from "form-data";

/**
 * Helper opsional jika nanti backend Express ingin mem-proxy gambar wajah ke AI service.
 * Saat ini endpoint AI langsung tersedia di http://localhost:5000/predict-face.
 */
export const getFacePrediction = async (imageBuffer, filename = "face.jpg", mimetype = "image/jpeg") => {
    const faceAiUrl = process.env.FACE_AI_URL;

    if (!faceAiUrl) {
        throw new Error("FACE_AI_URL belum dikonfigurasi di environment variables.");
    }

    const formData = new FormData();
    formData.append("image", imageBuffer, { filename, contentType: mimetype });

    try {
        const response = await axios.post(faceAiUrl, formData, {
            timeout: 30000,
            headers: formData.getHeaders(),
        });

        if (!response.data?.data) {
            throw new Error("Format respons AI wajah tidak valid: field 'data' tidak ditemukan.");
        }

        return response.data.data;
    } catch (error) {
        if (error.code === "ECONNABORTED") {
            throw new Error("Koneksi ke AI wajah timeout. Coba lagi nanti.");
        }
        if (error.code === "ECONNREFUSED") {
            throw new Error("Tidak dapat terhubung ke server AI wajah. Pastikan server AI aktif.");
        }
        if (error.response) {
            throw new Error(`Server AI wajah error (${error.response.status}): ${error.response.data?.message ?? "Unknown error"}`);
        }
        throw error;
    }
};
