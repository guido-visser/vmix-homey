import { Homey } from "homey/lib/Device";
import _ from "lodash";
import { vMixAPI } from "../../utils";

const vMixTriggers = _.debounce(
    async (homey: Homey, ip: string, command: string) => {
        const [activator, param1, param2] = command.split(" ");

        homey.log(activator, param1, param2);
        switch (activator) {
            case "Streaming":
                await recordingOrStreaming("Streaming", homey, ip, param1);
                break;

            case "Recording":
                await recordingOrStreaming("Recording", homey, ip, param1);
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
                    "overlay-active": !!parseInt(param2),
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

const recordingOrStreaming = async (
    action: "Recording" | "Streaming",
    homey: Homey,
    ip: string,
    param1: string
) => {
    let tokens: any = {};
    let option1: boolean | string = false;
    let option2: boolean | string = false;
    let option3: boolean | string = false;
    let option4: boolean | string = false;
    let option5: boolean | string = false;

    if (action === "Streaming") {
        const { streaming } = await vMixAPI(ip);
        if (streaming !== "False") {
            option1 = !!streaming.channel1;
            option2 = !!streaming.channel2;
            option3 = !!streaming.channel3;
            option4 = !!streaming.channel4;
            option5 = !!streaming.channel5;
        }

        tokens = {
            option1,
            option2,
            option3,
            option4,
            option5,
        };
    }

    if (action === "Recording") {
        const { recording } = await vMixAPI(ip);

        option1 = recording?.filename1 || "";
        option2 = recording?.filename2 || "";
        option3 = recording?.filename3 || "";
        option4 = recording?.filename4 || "";

        tokens = { option1, option2, option3, option4 };
    }

    if (param1 === "0") {
        homey.flow
            .getTriggerCard(
                `stopped-${action === "Streaming" ? "streaming" : "recording"}`
            )
            .trigger(tokens);
    }
    if (param1 === "1") {
        homey.flow
            .getTriggerCard(
                `started-${action === "Streaming" ? "streaming" : "recording"}`
            )
            .trigger(tokens);
    }
};

export default vMixTriggers;
