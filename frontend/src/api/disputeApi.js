import { api } from "./client";

export const createDispute = (bookingId, data) => 
  api.post(`/bookings/${bookingId}/dispute`, data);

export const getMyDisputes = () => 
  api.get("/disputes/me");

export const getDisputeDetail = (disputeId) => 
  api.get(`/disputes/${disputeId}`);

export const getDisputeMessages = (disputeId) => 
  api.get(`/disputes/${disputeId}/messages`);

export const sendDisputeMessage = (disputeId, data) => 
  api.post(`/disputes/${disputeId}/messages`, data);