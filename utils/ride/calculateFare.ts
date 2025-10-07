import axiosInstance from "@/api/axiosInstance";

const calculateFare = async ({
  driver,
  distance,
  duration,
  toll = 0,
  platformFee = 0,
  district
}: {
  driver: DriverType;
  distance: number;
  duration: number;
  surgeMultiplier?: number;
  toll?: number;
  platformFee?: number;
  district?: string;
}) => {
  try {
    const res = await axiosInstance.post("/fare/calculate-fare", {
      vehicle_type: driver.vehicle_type,
      distance,
      duration,
      toll,
      platformFee,
      district
    });

    // console.log(res.data.data)
    return res.data.data; // { totalFare, platformShare, driverEarnings, fareDetails }
  } catch (error) {
    console.error("Fare calculation failed:", error);
    return null;
  }
};

export default calculateFare;
