import stressProgressServices from "../services/stressProgressServices.js";
import response from "../utils/response.js";

const stressProgressController = {
    async getMyStressProgress(req, res, next) {
        try {
            const progress = await stressProgressServices.getCurrentProgress(req.userId);
            return response.success(res, 200, "Progress stres berhasil diambil.", progress);
        } catch (error) {
            next(error);
        }
    }
};

export default stressProgressController;
