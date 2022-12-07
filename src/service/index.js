import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.SERVER_URL || "https://localhost:3001",
  timeout: 3000,
});

export const axiosRequest = axios.CancelToken.source();

export default axiosInstance;
