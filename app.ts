"use strict";

import Homey from "homey";

module.exports = class VMix extends Homey.App {
    /**
     * onInit is called when the app is initialized.
     */
    async onInit() {
        this.log("vMix has been initialized");
    }
};
