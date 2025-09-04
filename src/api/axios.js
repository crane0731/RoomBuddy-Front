import axios from "axios";

// 환경에 따라 baseURL 다르게 (로컬 dev vs 배포)
const baseURL =
  import.meta.env.MODE === "development"
    ? "http://localhost:8081/api/roombuddy"   // 로컬 실행할 때
    : "/api/roombuddy";                        // 서버 배포 (Nginx 프록시)

const api = axios.create({
  baseURL,
  withCredentials: true,
});

export default api;
