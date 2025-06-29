import Homey, { FlowCard, FlowCardTrigger } from "homey";
import _, { Dictionary } from "lodash";
import net from "net";
import vMixTriggers from "./triggers";
import vMixConditions from "./conditions";

module.exports = class VMixInstance extends Homey.Device {
    private _ip: string = "";

    //@ts-ignore
    private _client: net.Socket;

    /**
     * onInit is called when the device is initialized.
     */
    async onInit() {
        this.log(this.getName(), "has been initialized");
        this._ip = this.getSetting("ip");

        this.homey.flow
            .getConditionCard("is-streaming")
            .registerRunListener(
                async () => await vMixConditions(this._ip, "is-streaming")
            );

        this.homey.flow
            .getConditionCard("is-recording")
            .registerRunListener(
                async () => await vMixConditions(this._ip, "is-recording")
            );

        try {
            this.connectToVmix();
        } catch (e) {}
    }

    async connectToVmix() {
        let reconnection;
        this._client = new net.Socket();

        this._client.on("error", (e) => this.log("ERROR", e));

        try {
            this.log("Connecting...");
            this._client.connect(8099, this._ip, () => {
                this.log("Connected");
                this.setAvailable().catch(this.error);
                this._client.write("SUBSCRIBE ACTS\r\n");
            });

            clearTimeout(reconnection);
        } catch (e) {}

        this._client.on("close", async () => {
            this.log("CLOSE CONNECTION");
            this.setUnavailable().catch(this.error);
            reconnection = setTimeout(() => this.connectToVmix(), 10000);
        });

        this._client.on("data", (data) => {
            const res = data
                .toString()
                .split("\r\n")
                .filter((d) => d !== "");

            res.forEach((command) => {
                if (command.startsWith("ACTS OK ")) {
                    vMixTriggers(
                        this.homey,
                        this._ip,
                        command.split("ACTS OK ")[1]
                    );
                }
            });
        });
    }

    /**
     * onSettings is called when the user updates the device's settings.
     * @param {object} event the onSettings event data
     * @param {object} event.oldSettings The old settings object
     * @param {object} event.newSettings The new settings object
     * @param {string[]} event.changedKeys An array of keys changed since the previous version
     * @returns {Promise<string|void>} return a custom message that will be displayed
     */
    async onSettings({
        oldSettings,
        newSettings,
        changedKeys,
    }: {
        oldSettings: {
            [key: string]: boolean | string | number | undefined | null;
        };
        newSettings: {
            [key: string]: boolean | string | number | undefined | null;
        };
        changedKeys: string[];
    }): Promise<string | void> {
        if (newSettings.ip && typeof newSettings.ip === "string") {
            this.log("IP Address changed to", newSettings.ip);
            this._client.destroy();
            this._ip = newSettings.ip;
            this.connectToVmix();
        }
    }

    /**
     * onRenamed is called when the user updates the device's name.
     * This method can be used this to synchronise the name to the device.
     * @param {string} name The new name
     */
    async onRenamed(name: string) {
        this.log("vMix Instance was renamed to ", name);
    }

    /**
     * onDeleted is called when the user deleted the device.
     */
    async onDeleted() {
        this.log("vMix Instance has been deleted");
    }

    async onUninit(): Promise<void> {}
};
