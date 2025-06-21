import { vMixAPI } from "../../utils";
import Homey from "homey";

const vMixConditions = async (homey: Homey.Device, ip: string, id: string) => {
    switch (id) {
        case "is-streaming":
            const vmix = await vMixAPI(ip);
            return vmix.streaming !== "False";
    }
};

export default vMixConditions;
