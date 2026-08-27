import { api } from "./client";

// Hàm này chuyên đi lấy danh sách các gói dịch vụ
export const getPackages = async () => {
    const response = await api.get("/packages");
    return response.data?.data || response.data; 
};

// Lấy chi tiết MỘT gói dựa vào ID
export const getPackageById = async (id) => {
  const response = await api.get(`/packages/${id}`);
  return response.data?.data || response.data;
};