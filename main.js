"use strict";
/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");
const ModbusRTU = require("modbus-serial").default;
const fs = require('fs');
const client = new ModbusRTU();

const registers = require('./register/ve.register.victronenergy');

const ve = registers.getRegisters();

const activeInputSource ={
	//0=Unknown;1=Grid;2=Generator;3=Shore power;240=Not connected
	0: "Unknown",
	1: "Grid",
	2: "Generator",
	3: "Shore power",
	240: "Not connected"
};
const batteryErrors = {
    0:"No error",
    1:"Battery initialization error",
    2:"No batteries connected",
    3:"Unknown battery connected",
    4:"Different battery type",
    5:"Number of batteries incorrect",
    6:"Lynx Shunt not found",
    7:"Battery measure error",
    8:"Internal calculation error",
    9:"Batteries in series not ok",
    10:"Number of batteries incorrect",
    11:"Hardware error",
    12:"Watchdog error",
    13:"Over voltage",
    14:"Under voltage",
    15:"Over temperature",
    16:"Under temperature",
    17:"Hardware fault",
    18:"Standby shutdown",
    19:"Pre-charge charge error",
    20:"Safety contactor check error",
    21:"Pre-charge discharge error",
    22:"ADC error",
    23:"Slave error",
    24:"Slave warning",
    25:"Pre-charge error",
    26:"Safety contactor error",
    27:"Over current",
    28:"Slave update failed",
    29:"Slave update unavailable",
    30:"Calibration data lost",
    31:"Settings invalid",
    32:"BMS cable",
    33:"Reference failure",
    34:"Wrong system voltage",
    35:"Pre-charge timeout"
};

// Load your modules here, e.g.:
// const fs = require("fs");

function checkIfValidIP(str) {
	// Regular expression to check if string is a IP address
	const regexExp = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/gi;

	return regexExp.test(str);
}

function signedToNumber(bits, value) {
    return value & (1 << (bits - 1)) ? value - (1 << bits) : value;
  }

function convertRegister(sType, nValue){
    let returnValue = 0;
    let hexString = "";
    
    try{
        if(sType === "int16"){ // vorzeichen!
            hexString = nValue[0].toString(16);

            switch(hexString.length){
                case 1: hexString = "000" + hexString;
                break;
                case 2: hexString = "00" + hexString;
                break;
                case 3: hexString = "0" + hexString;
                break;
            }

            hexString = "0x" + hexString
            returnValue = signedToNumber(16, hexString);
        }
        else{
            returnValue = nValue[0]; 
        }        
    }
    catch{
    } 
    return returnValue;
}

class Ve extends utils.Adapter {
	
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: "ve",
		});
		this.on("ready", this.onReady.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		
		this.on("unload", this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		
		// The adapters config (in the instance object everything under the attribute "native") is accessible via
		// this.config:
		this.log.info("config IP: " + this.config.victronIp);
		this.log.info("config port: " + this.config.victronPort); 

		
		// Check IP-Address
		if(!checkIfValidIP(this.config.victronIp)){
			this.log.error(`Your IP-Address '${this.config.victronIp}' is not valid. Restart the Adapter.`);
			this.log.error(`Your IP-Address '${this.config.victronIp}' is not valid. Restart the Adapter.`);
			this.log.error(`Your IP-Address '${this.config.victronIp}' is not valid. Restart the Adapter.`);

			this.getAdapterObjects(data => {
				this.log.warn(data.toString());
			})
		}

		// Connect to VE-Device
		client.connectTCP(this.config.victronIp, { port: this.config.victronPort });

		this.setInterval(() =>{
			this.log.debug("Started interval...");
			

			Object.entries(ve).forEach(async register => {
				
				let deviceCount = 1;
				var sRegisterName = register.toString().split(',')[0];
				let nRegisterNumber = register[1].Register;
				let nRegisterLength = register[1].Length;
				let nRegisterId = register[1].Id;
				let sRegisterUnit = register[1].Unit;
				let nRegisterFactor = register[1].Factor; 
				let sRegisterType = register[1].Type; 
				let writeValue = null;
						
				for(let i = 0; i < deviceCount; i++){
					this.log.debug(`Read ID: '${nRegisterId + i}'`); // DEBUG
					client.setID(nRegisterId + i);    
					const data = await client.readHoldingRegisters(nRegisterNumber, nRegisterLength)
					if(data !== undefined && data != null){
						if(data !== undefined)
						{
							let out = "";
							let nV = data.data;
							let nValue = convertRegister(sRegisterType, nV);
		
							if(nRegisterFactor > 0)
							{
								out = (nValue * nRegisterFactor).toFixed(2).toString();
							}
							else{
								out = nValue.toString();
							}
							
							if(sRegisterName == "ActiveInputSource")
							{
								out = activeInputSource[out.toString()]; 
							}
							if(sRegisterName.toLowerCase().includes("battery") && sRegisterName.toLowerCase().includes("lasterror")){
                        
								out = batteryErrors[out.toString()]; 
							} 
							
							this.log.debug(sRegisterName + ": " + out + " " + sRegisterUnit); // DEBUG
							/*
								HERE SET OBJECTS
							*/
							if(sRegisterType.includes("uint") && !sRegisterName.toLowerCase().includes("activeinputsource"))
							{
								await this.setObjectNotExistsAsync(sRegisterName, {
									type: "state",
									common: {
										name: sRegisterName,
										type: "number",
										role: "indicator",
										unit: sRegisterUnit,
										read: true,
										write: true,
									},
									native: {},
								});

								writeValue = Number(out);
							}	
							else{
								await this.setObjectNotExistsAsync(sRegisterName, {
									type: "state",
									common: {
										name: sRegisterName,
										type: "string",
										role: "indicator",
										unit: sRegisterUnit,
										read: true,
										write: true,
									},
									native: {},
								});

								writeValue = out;
							} 

							await this.setStateAsync(sRegisterName, { val: writeValue, ack: true });
						} 
						else{
							this.log.debug(`ID: '${nRegisterId + i}' is undefined`); // DEBUG
						} 
					};
				} 
				
				
			});

		}, 5000);
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			// Here you must clear all timeouts or intervals that may still be active
			// clearTimeout(timeout1);
			// clearTimeout(timeout2);
			// ...
			// clearInterval(interval1);

			callback();
		} catch (e) {
			callback();
		}
	}

	// If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
	// You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
	// /**
	//  * Is called if a subscribed object changes
	//  * @param {string} id
	//  * @param {ioBroker.Object | null | undefined} obj
	//  */
	// onObjectChange(id, obj) {
	// 	if (obj) {
	// 		// The object was changed
	// 		this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
	// 	} else {
	// 		// The object was deleted
	// 		this.log.info(`object ${id} deleted`);
	// 	}
	// }

	/**
	 * Is called if a subscribed state changes
	 * @param {string} id
	 * @param {ioBroker.State | null | undefined} state
	 */
	onStateChange(id, state) {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}

	// If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires "common.messagebox" property to be set to true in io-package.json
	//  * @param {ioBroker.Message} obj
	//  */
	// onMessage(obj) {
	// 	if (typeof obj === "object" && obj.message) {
	// 		if (obj.command === "send") {
	// 			// e.g. send email or pushover or whatever
	// 			this.log.info("send command");

	// 			// Send response in callback if required
	// 			if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
	// 		}
	// 	}
	// }
}

if (require.main !== module) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new Ve(options);
} else {
	// otherwise start the instance directly
	new Ve();
}