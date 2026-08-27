import { api } from "./client";

export const getPackages = () => api.get("/packages");
export const getPackageDetail = (packageId) => api.get(`/packages/${packageId}`);