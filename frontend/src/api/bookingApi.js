import { api } from "./client";

export const createBooking = (data) => api.post("/bookings/", data);
export const getMyBookings = () => api.get("/bookings/me");
export const getBookingQueue = () => api.get("/bookings/queue");
export const getAssignedBookings = () => api.get("/bookings/assigned-to-me");
export const getBookingDetail = (bookingId) => api.get(`/bookings/${bookingId}`);

export const claimBooking = (bookingId) => api.post(`/bookings/${bookingId}/claim`);
export const startBooking = (bookingId) => api.post(`/bookings/${bookingId}/start`);
export const completeBooking = (bookingId) => api.post(`/bookings/${bookingId}/complete`);