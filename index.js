"use strict";
const xmlrpc = require('xmlrpc');
const Homematic = require('./homematic');

class HomematicRpc extends Homematic {

    constructor (host, port) {
        super(host);
        this.port = port;
        this.listeningPort = 9111;
        this.localIP = "0.0.0.0";
        this.client = xmlrpc.createClient({
            host: this.host,
            port: port
        });

    }

    registerEventServerInCCU (nameToRegister) {
        console.log("Init Call on host %s and port %s", this.host, this.port);
        this.client.methodCall("init", ["http://" + this.host + ":" + this.listeningPort, "homematicRpc_" + nameToRegister], function (error, value) {
            console.log("CCU Response ...Value (%s) Error : (%s)", JSON.stringify(value), error);

        });
    }

    removeEventServerFromCCU () {
        console.log("Removing Event Server");
        this.client.methodCall("init", ["http://" + this.host + ":" + this.listeningPort], function (error, value) {
        });
    }

    createEventServer () {
        this.localIP = this.getIPAddress();
        if (this.localIP == "0.0.0.0") {
            console.log("Cannot assign IP Address");
            return;
        }

        const server = xmlrpc.createServer({ host: this.localIP, port: this.listeningPort });

        server.on("NotFound", function(method, params) {
            console.log("Method %s does not exist. - %s",method, JSON.stringify(params));
        });

        server.on("system.listMethods", function(err, params, callback) {
            console.log("Method call params for 'system.listMethods': %s" ,  JSON.stringify(params));
            callback(null, ["event","system.listMethods", "system.multicall"]);
        });

        server.on("listDevices", function(err, params, callback) {
            console.log('rpc <- listDevices on %s - Zero Reply',that.interface);
            callback(null,[]);
        });


        server.on("newDevices", function(err, params, callback) {
            console.log('rpc <- newDevices on %s nobody is interested in newdevices ... ',that.interface);
            // we are not intrested in new devices cause we will fetch them at launch
            callback(null,[]);
        });


        server.on("event", function(err, params, callback) {
            console.log('rpc <- event  on %s'  , this.interface );
            this.lastMessage = Math.floor((new Date()).getTime() / 1000);
            const channel = that.interface + params[1];
            const datapoint = params[2];
            const value = params[3];
            console.log("Ok here is the Event" + JSON.stringify(params));
            console.log("RPC single event for %s %s with value %s",channel,datapoint,value);

            callback(null,[]);
        });

        server.on("system.multicall", function(err, params, callback) {
            console.log('rpc <- system.multicall on %s'  , that.interface);
            this.lastMessage = Math.floor((new Date()).getTime() / 1000);
            params.map(function(events) {
                try {
                    events.map(function(event) {
                        if ((event["methodName"] == "event") && (event["params"] !== undefined)) {
                            const params = event["params"];
                            const channel = that.interface + params[1];
                            const datapoint = params[2];
                            const value = params[3];
                            console.log("RPC event for %s %s with value %s",channel,datapoint,value);
                        }
                    });
                } catch (err) {}
            });
            callback(null);
        });
        console.log("XML-RPC server is listening on port %s.", this.listeningPort);
    }

    getIPAddress () {
        const interfaces = require("os").networkInterfaces();
        for (let devName in interfaces) {
            const iface = interfaces[devName];
            for (let i = 0; i < iface.length; i++) {
                const alias = iface[i];
                if (alias.family === "IPv4" && alias.address !== "127.0.0.1" && !alias.internal)
                    return alias.address;
            }
        }
        return "0.0.0.0";
    }

    getValue (channel, attribute, callback) {
        this.client.methodCall('getValue', [channel, attribute], function (error, response) {
            if(callback) callback(error, response);
        });
    }

    setValue (channel, attribute, value, callback) {
        this.client.methodCall('setValue', [channel, attribute, value], function (error, response) {
            if(callback) callback(error, response);
        });
    }

}

module.exports = HomematicRpc;