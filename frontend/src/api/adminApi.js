import { api } from "./client";

export const getAdminDisputes = () => api.get("/admin/disputes");
export const claimDispute = (disputeId) =>
  api.post(`/admin/disputes/${disputeId}/claim`);
export const resolveDispute = (disputeId, data) =>
  api.post(`/admin/disputes/${disputeId}/resolve`, data);

export const getAdminUsers = () => api.get("/admin/users");
export const updateUserRole = (userId, role) =>
  api.patch(`/admin/users/${userId}/role`, { role });
export const updateUserStatus = (userId, status) =>
  api.patch(`/admin/users/${userId}/status`, { status });

export const getAuditLogs = ({ limit = 100, offset = 0 } = {}) =>
  api.get(`/admin/audit-logs?limit=${limit}&offset=${offset}`);
