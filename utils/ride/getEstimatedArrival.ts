import moment from "moment";
import { parseDuration } from "../time/parse.duration";

const getEstimatedArrivalTime = (travelTime: any) => {
    const now = moment();
    const travelMinutes = parseDuration(travelTime);
    const arrivalTime = now.add(travelMinutes, "minutes");
    // console.log('arrival',arrivalTime)
    return arrivalTime.format("hh:mm A");
};


export default getEstimatedArrivalTime