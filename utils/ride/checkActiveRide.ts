import axiosInstance from "@/api/axiosInstance";

export const checkUserActiveRide = async () => {

    try {
        const res = await axiosInstance.get("/check-active-ride");

        console.log(res.data)

        if (!res.data.success) {
            return { hasActiveRide: false, ride: null };


        } else {
            return { hasActiveRide: true, ride: res.data.ride };

        }


    } catch (error) {
        console.log("Error checking active ride:", error);
        return { hasActiveRide: false, ride: null };
    }
};
