import Homey from "homey";

module.exports = class VMixDriver extends Homey.Driver {
    /**
     * onInit is called when the driver is initialized.
     */
    async onInit() {
        this.log("vMix has been initialized");
    }

    async onPair(session: Homey.Driver.PairSession): Promise<void> {
        await session.showView("vmix_pair");
    }
};
