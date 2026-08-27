import { api } from "./client";

export const getServiceMessages = (bookingId) => 
  api.get(`/bookings/${bookingId}/messages`);

export const sendServiceMessage = (bookingId, data) => 
  api.post(`/bookings/${bookingId}/messages`, data);