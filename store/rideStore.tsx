
import { create } from "zustand";

interface RideStore {
  rideDetails: any; // You can type this more strictly if needed
  setRideDetails: (data: any) => void;
}

export const useRideStore = create<RideStore>((set) => ({
  rideDetails: null,
  setRideDetails: (data) => set({ rideDetails: data }),
}));
