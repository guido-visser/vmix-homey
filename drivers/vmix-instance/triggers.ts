import { Homey } from "homey/lib/Device";
import _ from "lodash";

const vMixTriggers = _.debounce(async (homey: Homey, command: string) => {
    const [activator, param1, param2] = command.split(" ");

    homey.log(activator, param1, param2);
    switch (activator) {
        case "Streaming":
            if (param1 === "0") {
                homey.flow.getTriggerCard("stopped-streaming").trigger();
            }
            if (param1 === "1") {
                homey.flow.getTriggerCard("started-streaming").trigger();
            }
            break;

        case "InputPreview":
            homey.flow.getTriggerCard("input-preview-changed").trigger({
                "preview-input": parseInt(param1),
                "live-input": parseInt(param2),
            });
            break;

        case "Overlay1":
        case "Overlay2":
        case "Overlay3":
        case "Overlay4":
            const overlayNumber = activator.split("Overlay")[1];
            homey.flow.getTriggerCard("overlay-changed").trigger({
                "overlay-number": parseInt(overlayNumber),
                "overlay-active": parseInt(param2),
                "overlay-input": parseInt(param1),
            });
            break;
    }
}, 150);

export default vMixTriggers;
