"use strict";
class Homematic {

    constructor (host) {
        this.host = host;
        this.DECREASING = 0;
        this.INCREASING = 1;
        this.STOPPED = 2;
    }

    getState (channel, callback) {
        this.getValue(channel, "STATE", function (error, response) {
            const isPowerOn = response == "true";
            if(callback) callback(error, isPowerOn);
        });
    }

    setState (channel, value, callback) {
        const powerOn = value ? "true" : "false";
        this.setValue(channel, "STATE", value, callback);
    }

    isLevelOn (channel, callback) {
        this.getValue(channel, "LEVEL", function (error, response) {
            const isPowerOn = parseFloat(response) > 0;
            if(callback) callback(error, isPowerOn);
        });
    }

    getLevel (channel, callback) {
        this.getValue(channel, "LEVEL", function (error, response) {
            let value = parseFloat(response) * 100;
            if(callback) callback(error, value);
        });
    }

    setLevel (channel, value, callback) {
        let levelString;
        if (typeof value == "boolean") {
            levelString = value ? "1" : "0";
        } else if (typeof value == "string" || typeof value == "number") {
            levelString = (parseFloat(value) / 100).toString();
        }
        this.setValue(channel, "LEVEL", levelString, callback);
    }

    getTargetTemperature (channel, callback) {
        this.getValue(channel, "SET_TEMPERATURE", callback);
    }

    setTargetTemperature (channel, value, callback) {
        this.setValue(channel, "SET_TEMPERATURE", value, callback);
    }

    getCurrentTemperature (channel, callback) {
        this.getValue(channel, "ACTUAL_TEMPERATURE", callback);
    }

    getWindowCoveringPositionState (channel, callback) {
        this.getValue(channel, "DIRECTION", function (error, response) {
            let positionState = this.STOPPED;
            switch (response) {
                case 1:
                    positionState = this.INCREASING;
                    break;
                case 2:
                    positionState = this.DECREASING;
                    break;
            }
            if(callback) callback(error, positionState);
        });
    }

}

module.exports = Homematic;