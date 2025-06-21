import { Homey } from "homey/lib/Device";
import _ from "lodash";
import { vMixAPI } from "../../utils";

const vMixTriggers = _.debounce(
    async (homey: Homey, ip: string, command: string) => {
        const [activator, param1, param2] = command.split(" ");

        homey.log(activator, param1, param2);
        switch (activator) {
            case "Streaming":
                let channel1 = false;
                let channel2 = false;
                let channel3 = false;
                let channel4 = false;
                let channel5 = false;

                const { streaming } = await vMixAPI(ip);
                if (streaming !== "False") {
                    channel1 = !!streaming.channel1;
                    channel2 = !!streaming.channel2;
                    channel3 = !!streaming.channel3;
                    channel4 = !!streaming.channel4;
                    channel5 = !!streaming.channel5;
                }

                const tokens = {
                    channel1,
                    channel2,
                    channel3,
                    channel4,
                    channel5,
                };

                if (param1 === "0") {
                    homey.flow
                        .getTriggerCard("stopped-streaming")
                        .trigger(tokens);
                }
                if (param1 === "1") {
                    homey.flow
                        .getTriggerCard("started-streaming")
                        .trigger(tokens);
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

            case "InputPlaying":
                homey.flow.getTriggerCard("input-playing").trigger({
                    "input-number": parseInt(param1),
                    playing: parseInt(param2),
                });
                break;
        }
    },
    150
);

export default vMixTriggers;
