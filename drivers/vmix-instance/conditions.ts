import { vMixAPI } from "../../utils";

const vMixConditions = async (ip: string, id: string) => {
    const vmix = await vMixAPI(ip);
    switch (id) {
        case "is-streaming":
            return vmix.streaming !== "False";
        case "is-recording":
            return vmix.recording["_@ttribute"] !== "False";
    }
};

export default vMixConditions;
