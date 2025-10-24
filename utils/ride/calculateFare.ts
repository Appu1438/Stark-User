import axiosInstance from "@/api/axiosInstance";

const calculateFare = async ({
  driver,
  distance,
  district
}: {
  driver: DriverType;
  distance: number;
  district?: string;
}) => {
  try {
    const res = await axiosInstance.post("/fare/calculate-fare", {
      vehicle_type: driver.vehicle_type,
      distance,
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
