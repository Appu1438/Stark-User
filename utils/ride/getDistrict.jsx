export const getDistrict = async (latitude, longitude, setDistrict) => {
    try {
        const apiKey = process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY;
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!data.results?.length) {
            console.warn("No geocode results found");
            if (typeof setDistrict === "function") setDistrict(null);
            return null;
        }

        const addressComponents = data.results[0].address_components;

        // Try to find district in multiple levels
        const districtComp =
            addressComponents.find((comp) =>
                comp.types.includes("administrative_area_level_3")
            ) ||
            addressComponents.find((comp) =>
                comp.types.includes("administrative_area_level_2")
            ) ||
            addressComponents.find((comp) =>
                comp.types.includes("locality")
            );

        const districtName = districtComp?.long_name || null;

        if (typeof setDistrict === "function") {
            setDistrict(districtName);
        }

        return districtName;
    } catch (error) {
        console.error("Error fetching district:", error);
        if (typeof setDistrict === "function") setDistrict(null);
        return null;
    }
};
