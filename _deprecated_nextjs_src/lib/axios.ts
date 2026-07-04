import axios from "axios";

const api = axios.create({
  baseURL:
    typeof window === "undefined" ? process.env.NEXT_PUBLIC_API_BASE_URL : "",
  withCredentials: true,
});

export default api;
