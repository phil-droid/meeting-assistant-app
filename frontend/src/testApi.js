import api from "./api/client";

export const testBackend = async () => {
  const res = await api.get("/health");
  console.log("Backend response:", res.data);
};