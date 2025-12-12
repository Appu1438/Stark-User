import moment from "moment";
import { parseDuration } from "../time/parse.duration";

const getEstimatedArrivalTime = (travelTime: any) => {
    const now = moment();
    const travelMinutes = parseDuration(travelTime);
    const arrival = now.clone().add(travelMinutes, "minutes");

    // If same day → show only time: 08:30 AM
    if (arrival.isSame(now, "day")) {
        return arrival.format("hh:mm A");
    }

    // If tomorrow → show "Tomorrow, 08:30 AM"
    if (arrival.isSame(moment().add(1, "day"), "day")) {
        return `Tomorrow, ${arrival.format("hh:mm A")}`;
    }

    // Other days → show full date + time
    return arrival.format("MMM DD, hh:mm A");
};

export default getEstimatedArrivalTime;
