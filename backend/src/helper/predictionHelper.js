import axios from "axios";

export const getAIRecommendation = async (inputData) => {
    const res = await axios.post(process.env.AI_URL, inputData);
    return res.data.data;
};