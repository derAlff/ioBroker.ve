"use strict";
/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");
const ModbusRTU = require("modbus-serial").default;
// const fs = require('fs');
const client = new ModbusRTU();

const registers = require("./register/ve.register.victronenergy");

const ve = registers.getRegisters();

let interval;
const DISABLE = false;

const batteryState_System = {
	0: "idle",
	1: "charging",
	2: "discharging"
};

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

            hexString = "0x" + hexString;
            returnValue = signedToNumber(16, hexString);
        }
        else{
			returnValue = nValue[0];
		}
    }
    catch{
		returnValue = nValue[0];
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
		this.log.info("Config IP: " + this.config.victronIp);
		this.log.info("Config port: " + this.config.victronPort);
		this.log.info("Number of PV-Inverters: " + this.config.numOfPvInverters);
		this.log.info(`MPPT installed: ${this.config.dcSystemAvailable}`);

		this.log.info(`MPPTs: ${JSON.stringify(this.config.mppts)}`);

		let oMppts = this.config.mppts;
		if(oMppts.length > 0)
		{
			this.log.debug(`Length of 'oMppts' > 0: (${oMppts.length})`);
			oMppts.forEach(mppt => {
				this.log.debug("Complete JSON: " + JSON.stringify(mppt));

				let bEnabled = mppt.enabled;
				let bVedirect = mppt.vedirect;
				let bEthernet = mppt.ethernet;
				let sDeviceName = mppt.device;
				let nDeviceId = mppt.id;
				let sIpAddress = mppt.ipaddress;
				
				this.log.debug(`bEnabled: '${bEnabled}'`);
				this.log.debug(`bVedirect: '${bVedirect}'`);
				this.log.debug(`bEthernet: '${bEthernet}'`);
				this.log.debug(`sDeviceName: '${sDeviceName}'`);
				this.log.debug(`nDeviceId: '${nDeviceId}'`);
				this.log.debug(`sIpAddress: '${sIpAddress}'`);
				if(!bEnabled){
					this.log.warn(`MPPT '${sDeviceName}' is disabled.`);
					return;
				}
				if(!bVedirect && !bEthernet)
				{
					this.log.warn(`The MPPT '${sDeviceName}' has no option (VE.Direct or Ethernet) assigned. Please assign an option to the device.`);
					return;
				}
				if(bVedirect && bEthernet)
				{
					this.log.warn(`The MPPT '${sDeviceName}' has all options (VE.Direct or Ethernet) assigned. Please assign only option to the device.`);
					return;
				}
				if(bVedirect && nDeviceId.length <= 0) 
				{
					this.log.warn(`VE.Direct assigned. But there is no Device-ID available`);
					return;
				}
				if(bEthernet && !checkIfValidIP(sIpAddress)){
					this.log.warn(`Ethernet assigned but the IP-Address is not correct.`);
				}

			});

		}
		else{
			this.log.debug(`Length of 'oMppts' <= 0`);
		}

		// Subscribe writable states
		await this.subscribeStatesAsync("*BatteryCapacity");

		//await this.subscribeStatesAsync('*');
		if(!DISABLE){
			if(this.config.victronIp !== "")
			{
				// Check IP-Address
				if(!checkIfValidIP(this.config.victronIp)){
					this.log.error(`Your IP-Address '${this.config.victronIp}' is not valid. Restart the Adapter.`);

					this.getAdapterObjects(data => {
						this.log.warn(data.toString());
					});
				}

				// Connect to VE-Device
				client.connectTCP(this.config.victronIp, { port: this.config.victronPort }).catch(() => {this.log.debug("brb");});

				interval = this.setInterval(() =>{
					this.log.debug("Started interval...");


					Object.entries(ve).forEach(async register => {
						// Non-inverter values
						if(!register.includes("Inverter"))
						{
							this.log.debug(JSON.stringify(register));
							let run = true;
							const deviceCount = 1;
							let sRegisterName = register.toString().split(",")[0];
							const nRegisterNumber = register[1].Register;
							const nRegisterLength = register[1].Length;
							const nRegisterId = register[1].Id;
							const sRegisterUnit = register[1].Unit;
							const nRegisterFactor = register[1].Factor;
							const sRegisterType = register[1].Type;
							const bRegisterWritable = register[1].writable;
							let writeValue = null;

							if(sRegisterName.includes("DCSystem") && !this.config.dcSystemAvailable)
							{
								this.log.debug("Do not use DC-System.");
								run = false;
							}

							this.log.debug("Value of 'run': " + run.toString());
							if(run)
							{
								for(let i = 0; i < deviceCount; i++){
									this.log.debug(`Read ID: '${nRegisterId + i}'`); // DEBUG
									client.setID(nRegisterId + i);
									this.log.debug(`Read register: '${nRegisterNumber}'`); // DEBUG
									const data = await client.readHoldingRegisters(nRegisterNumber, nRegisterLength);
									if(data !== undefined && data != null){
										if(data !== undefined)
										{
											let out = "";
											const nV = data.data;
											const nValue = convertRegister(sRegisterType, nV);

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
												// Create folder for Errors in ve.0.Battery.Error
												sRegisterName = "Battery.Error." + sRegisterName;
												out = batteryErrors[out.toString()];
											}

											// Create folders
											// Battery
											if(sRegisterName.toLowerCase().includes("battery") && !sRegisterName.toLowerCase().includes("lasterror"))
											{
												sRegisterName = "Battery." + sRegisterName;
											}
											// AC
											if(sRegisterName.toLowerCase().includes("ac"))
											{
												sRegisterName = "AC." + sRegisterName;
											}
											// Grid
											if(sRegisterName.toLowerCase().includes("grid"))
											{
												sRegisterName = "Grid." + sRegisterName;
											}

											this.log.debug(sRegisterName + ": " + out + " " + sRegisterUnit); // DEBUG
											/*
												HERE SET OBJECTS
											*/
											this.log.debug(sRegisterName.toLowerCase());
											if(/*sRegisterType.includes("uint") && */(!sRegisterName.toLowerCase().includes("activeinputsource") || sRegisterName.toLowerCase().includes("batterycurrent_system")))
											{
												await this.setObjectNotExistsAsync(sRegisterName, {
													type: "state",
													common: {
														name: sRegisterName,
														type: "number",
														role: "indicator",
														unit: sRegisterUnit,
														read: true,
														write: bRegisterWritable,
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
														write: bRegisterWritable,
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
									}
								}
							}
						}
						else{
							this.log.debug(`It is the INVERTER :) -> Installed ${this.config.numOfPvInverters}`);
							if(this.config.numOfPvInverters > 0)
							{
								for(let i = 0; i < this.config.numOfPvInverters; i++)
								{
									this.log.debug(`Actual PV-Inverter: '${i.toString()}'`);

									Object.entries(register[1]["Registers"]).forEach(async invRegister  =>{
										const oRegister = invRegister[1];
										const sRegisterName = oRegister["RegisterName"].toString();
										const nRegisterNr = Number(oRegister["Register"]);
										const nRegisterId = Number(oRegister["Id"]);
										const nRegisterLength = Number(oRegister["Length"]);
										const sRegisterUnit = oRegister["Unit"].toString();
										const nRegisterFactor = Number(oRegister["Factor"]);
										const sRegisterType = oRegister["Type"].toString();
										const bRegisterWritable = oRegister["writable"];

										this.log.debug("----------------------------------");
										this.log.debug(`Value for inverter '${i.toString()}' - RegisterName: '${sRegisterName}'`);
										this.log.debug(`Value for inverter '${i.toString()}' - nRegisterNr: '${nRegisterNr.toString()}'`);
										this.log.debug(`Value for inverter '${i.toString()}' - nRegisterId: '${nRegisterId.toString()}'`);
										this.log.debug(`Value for inverter '${i.toString()}' - nRegisterLength: '${nRegisterLength.toString()}'`);
										this.log.debug(`Value for inverter '${i.toString()}' - sRegisterUnit: '${sRegisterUnit}'`);
										this.log.debug(`Value for inverter '${i.toString()}' - nRegisterFactor: '${nRegisterFactor.toString()}'`);
										this.log.debug(`Value for inverter '${i.toString()}' - sRegisterType: '${sRegisterType}'`);
										this.log.debug("----------------------------------");

										//client.setID(nRegisterId + i);
										//const data = await client.readHoldingRegisters(nRegisterNr, nRegisterLength);
										const data = await this.getInverter(nRegisterId + i, nRegisterNr, nRegisterLength);

										if(data !== undefined && data !== null)
										{
											this.log.debug(`Received data for inverter no. '${(i+1).toString()}'`);
											//this.log.debug("Data: " + data.data.toString());
											const iobDatapoint = "Inverter." + nRegisterId.toString() + "." + sRegisterName;
											const nV = data.data;
											const nValue = (convertRegister(sRegisterType, nV) * nRegisterFactor).toFixed(2);
											const out = Number(nValue);

											this.log.debug(`Value for '${sRegisterName}': ${nValue.toString()} ${sRegisterUnit}`);

											await this.setObjectNotExistsAsync(iobDatapoint, {
												type: "state",
												common: {
													name: sRegisterName,
													type: "number",
													role: "indicator",
													unit: sRegisterUnit,
													read: true,
													write: bRegisterWritable,
												},
												native: {},
											});

											const writeValue = out;

											await this.setStateAsync(iobDatapoint, { val: writeValue, ack: true });

										}
										else{
											this.log.warn(`Can not read '${sRegisterName}' data for inverter no. '${(i+1).toString()}'. Is this inverter available?`);
										}
									});
								}
							}
						}
					});
				}, 5000);
			}
			else{
				interval = setInterval(() => {
					this.log.debug("The IP address is not set. Adapter is not running!");
				}, 5000);
			}
		}
		else{
			this.log.warn("Program is disabled for tests...");
		}
	}

	async getInverter(nRegisterId, nRegisterNr, nRegisterLength){
		try{
			client.setID(nRegisterId);
			const data = await client.readHoldingRegisters(nRegisterNr, nRegisterLength);
			return data;
		}catch(err){
			return null;
		}
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
			this.log.info("Unload adapter...");
			clearInterval(interval);
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
			this.log.info(`Send via Modbus`);
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