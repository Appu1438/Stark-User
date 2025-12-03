// store/driverStore.ts
import { create } from 'zustand';

export const useDriverStore = create((set) => ({
  driverLists: [],
  setDriverLists: (lists) => set({ driverLists: lists }),
  updateDriverLocation: (updates) =>
    set((state) => ({
      driverLists: state.driverLists.map((driver) => {
        const update = updates.find((d) => d.id === driver.id);
        if (update && driver.animatedLocation) {
          const { latitude, longitude } = update.current;
          driver.animatedLocation.timing({
            latitude,
            longitude,
            duration: 1000,
            useNativeDriver: false,
          }).start();

          return {
            ...driver,
            latitude,
            longitude,
            heading: update.heading ,
          };
        }
        return driver;
      }),
    })),
}));
