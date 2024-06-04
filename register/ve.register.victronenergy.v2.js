function getRegisters() {
	return {
	Version: "2.0.0",
	GXDevice:{
		Id: "100",
		ActiveInputSource: {
			RegisterName: "ActiveInputSource",
			Register: 826,
			Id: 100,
			Length: 1,
			Unit: "",
			Factor: 0,
			Type: "uint16",
			writable: false
		},
		AcConsumptionL1Power: {
			RegisterName: "AcConsumptionL1Power",
			Register: 817,
			Id: 100,
			Length: 1,
			Unit: "W",
			Factor: 1,
			Type: "uint16",
			writable: false
		},
		AcConsumptionL2Power: {
			RegisterName: "AcConsumptionL2Power",
			Register: 818,
			Id: 100,
			Length: 1,
			Unit: "W",
			Factor: 1,
			Type: "uint16",
			writable: false
		},
		AcConsumptionL3Power: {
			RegisterName: "AcConsumptionL3Power",
			Register: 819,
			Id: 100,
			Length: 1,
			Unit: "W",
			Factor: 1,
			Type: "uint16",
			writable: false
		},
		DCCoupledPower: {
			RegisterName: "DCCoupledPower",
			Register: 850,
			Id: 100,
			Length: 1,
			Unit: "kWh",
			Factor: 1,
			Type: "uint16",
			writable: false
		},
		GridL1Power: {
			RegisterName: "GridL1Power",
			Register: 820,
			Id: 100,
			Length: 1,
			Unit: "W",
			Factor: 1,
			Type: "int16",
			writable: false
		},
		GridL2Power: {
			RegisterName: "GridL2Power",
			Register: 821,
			Id: 100,
			Length: 1,
			Unit: "W",
			Factor: 1,
			Type: "int16",
			writable: false
		},
		GridL3Power: {
			RegisterName: "GridL3Power",
			Register: 822,
			Id: 100,
			Length: 1,
			Unit: "W",
			Factor: 1,
			Type: "int16",
			writable: false
		},
		/*
		BatteryVoltage_System: {
			RegisterName: "BatteryVoltage_System",
			Register: 840,
			Id: 100,
			Length: 1,
			Unit: "V",
			Factor: 0.1,
			Type: "uint16",
			writable: false
		},
		BatteryCurrent_System: {
			RegisterName: "BatteryCurrent_System",
			Register: 841,
			Id: 100,
			Length: 1,
			Unit: "A",
			Factor: 0.1,
			Type: "int16",
			writable: false
		},
		BatteryPower_System: {
			RegisterName: "BatteryPower_System",
			Register: 842,
			Id: 100,
			Length: 1,
			Unit: "W",
			Factor: 1,
			Type: "int16",
			writable: false
		},
		BatterySOC_System: {
			RegisterName: "BatterySOC_System",
			Register: 843,
			Id: 100,
			Length: 1,
			Unit: "%",
			Factor: 1,
			Type: "uint16",
			writable: false
		},
		BatteryState_System: {
			RegisterName: "BatteryState_System",
			Register: 844,
			Id: 100,
			Length: 1,
			Unit: "",
			Factor: 1,
			Type: "uint16",
			writable: false
		},
		/*
		Battery: {
			RegisterName: "Battery",
			Register: 1288,
			Id: 100,
			Length: 1,
			Unit: "",
			Factor: 1,
			Type: "uint16",
			writable: false
		},
		*/
	},		
    
	Battery:{
		Id: "255",
		BatteryVoltage: {
			RegisterName: "BatteryVoltage",
			Register: 259,
			Id: 225,
			Length: 1,
			Unit: "V",
			Factor: 0.01,
			Type: "uint16",
			writable: false
		},
		BatteryCurrent: {
			RegisterName: "BatteryCurrent",
			Register: 261,
			Id: 225,
			Length: 1,
			Unit: "A",
			Factor: 0.1,
			Type: "int16",
			writable: false
		},
		BatteryTemperature: {
			RegisterName: "BatteryTemperature",
			Register: 262,
			Id: 225,
			Length: 1,
			Unit: "°C",
			Factor: 0.1,
			Type: "int16",
			writable: false
		},
		BatteryMidpointVoltageOfTheBatteryBank: {
			RegisterName: "BatteryMitpointVoltageOfTheBatteryBank",
			Register: 263,
			Id: 225,
			Length: 1,
			Unit: "V",
			Factor: 0.01,
			Type: "uint16",
			writable: false
		},
		BatteryMidpointDevaitionOfTheBatteryBank: {
			RegisterName: "BatteryMidpointDevaitionOfTheBatteryBank",
			Register: 264,
			Id: 225,
			Length: 1,
			Unit: "%",
			Factor: 0.01,
			Type: "uint16",
			writable: false
		},
		BatteryConsumedAmphours: {
			RegisterName: "BatteryConsumedAmphours",
			Register: 265,
			Id: 225,
			Length: 1,
			Unit: "Ah",
			Factor: -0.1,
			Type: "uint16",
			writable: false
		},
		BatterySOC: {
			RegisterName: "BatterySOC",
			Register: 266,
			Id: 225,
			Length: 1,
			Unit: "%",
			Factor: 0.1,
			Type: "uint16",
			writable: false
		},
		BatteryCapacity: {
			RegisterName: "BatteryCapacity",
			Register: 309,
			Id: 225,
			Length: 1,
			Unit: "Ah",
			Factor: 0.1,
			Type: "uint16",
			writable: false
		},
		BatteryCellMinVoltage: {
			RegisterName: "BatteryCellMinVoltage",
			Register: 1290,
			Id: 225,
			Length: 1,
			Unit: "V",
			Factor: 0.01,
			Type: "uint16",
			writable: false
		},
		BatteryCellMaxVoltage: {
			RegisterName: "BatteryCellMaxVoltage",
			Register: 1291,
			Id: 225,
			Length: 1,
			Unit: "V",
			Factor: 0.01,
			Type: "uint16",
			writable: false
		}
		// shutdowns due to error
		,
		BatteryShutdownsDueToError: {
			RegisterName: "BatteryShutdownsDueToError",
			Register: 1292,
			Id: 225,
			Length: 1,
			Unit: "",
			Factor: 0,
			Type: "uint16",
			writable: false
		}
		// 1st last error
		,
		Battery1stLastError: {
			RegisterName: "Battery1stLastError",
			Register: 1293,
			Id: 225,
			Length: 1,
			Unit: "",
			Factor: 0,
			Type: "uint16",
			writable: false
		}
		,
		Battery2ndLastError: {
			RegisterName: "Battery2ndLastError",
			Register: 1293,
			Id: 225,
			Length: 1,
			Unit: "",
			Factor: 0,
			Type: "uint16",
			writable: false
		}
		,
		Battery3rdLastError: {
			RegisterName: "Battery3rdLastError",
			Register: 1293,
			Id: 225,
			Length: 1,
			Unit: "",
			Factor: 0,
			Type: "uint16",
			writable: false
		}
		,
		Battery4thLastError: {
			RegisterName: "Battery4thLastError",
			Register: 1293,
			Id: 225,
			Length: 1,
			Unit: "",
			Factor: 0,
			Type: "uint16",
			writable: false
		},
	},
    
    Inverter:{
		Id: ">= 20",
		Registers: {
			InverterL1Power: {
				RegisterName: "InverterL1Power",
				Register: 1029,
				Id: 20,
				Length: 1,
				Unit: "W",
				Factor: 1,
				Type: "uint16",
				writable: false
			},
			InverterL2Power: {
				RegisterName: "InverterL2Power",
				Register: 1033,
				Id: 20,
				Length: 1,
				Unit: "W",
				Factor: 1,
				Type: "uint16",
				writable: false
			},
			InverterL3Power: {
				RegisterName: "InverterL3Power",
				Register: 1037,
				Id: 20,
				Length: 1,
				Unit: "W",
				Factor: 1,
				Type: "uint16",
				writable: false
			},
			InverterL1Current: {
				RegisterName: "InverterL1Current",
				Register: 1028,
				Id: 20,
				Length: 1,
				Unit: "A",
				Factor: 0.1,
				Type: "uint16",
				writable: false
			},
			InverterL2Current: {
				RegisterName: "InverterL2Current",
				Register: 1032,
				Id: 20,
				Length: 1,
				Unit: "A",
				Factor: 0.1,
				Type: "uint16",
				writable: false
			},
			InverterL3Current: {
				RegisterName: "InverterL3Current",
				Register: 1036,
				Id: 20,
				Length: 1,
				Unit: "A",
				Factor: 0.1,
				Type: "uint16",
				writable: false
			},
			InverterTotalPower: {
				RegisterName: "InverterTotalPower",
				Register: 1052,
				Id: 20,
				Length: 1,
				Unit: "kW",
				Factor: 0.1,
				Type: "int32",
				writable: false
			}
		}
    },

	GridMeter:{
		Id: "30",
		GridL1Voltage: {
			RegisterName: "GridL1Voltage",
			Register: 2616,
			Id: 30,
			Length: 1,
			Unit: "V",
			Factor: 0.1,
			Type: "uint16",
			writable: false
		},
		GridL2Voltage: {
			RegisterName: "GridL2Voltage",
			Register: 2618,
			Id: 30,
			Length: 1,
			Unit: "V",
			Factor: 0.1,
			Type: "uint16",
			writable: false
		},
		GridL3Voltage: {
			RegisterName: "GridL3Voltage",
			Register: 2620,
			Id: 30,
			Length: 1,
			Unit: "V",
			Factor: 0.1,
			Type: "uint16",
			writable: false
		},
		GridL1Current: {
			RegisterName: "GridL1Current",
			Register: 2617,
			Id: 30,
			Length: 1,
			Unit: "A",
			Factor: 0.1,
			Type: "int16",
			writable: false
		},
		GridL2Current: {
			RegisterName: "GridL2Current",
			Register: 2619,
			Id: 30,
			Length: 1,
			Unit: "A",
			Factor: 0.1,
			Type: "int16",
			writable: false
		},
		GridL3Current: {
			RegisterName: "GridL3Current",
			Register: 2621,
			Id: 30,
			Length: 1,
			Unit: "A",
			Factor: 0.1,
			Type: "int16",
			writable: false
		},
		GridL1EnergyFromNet: {
			RegisterName: "GridL1EnergyFromNet",
			Register: 2603,
			Id: 30,
			Length: 1,
			Unit: "kWh",
			Factor: 0.01,
			Type: "uint16",
			writable: false
		},
		GridL2EnergyFromNet: {
			RegisterName: "GridL2EnergyFromNet",
			Register: 2604,
			Id: 30,
			Length: 1,
			Unit: "kWh",
			Factor: 0.01,
			Type: "uint16",
			writable: false
		},
		GridL3EnergyFromNet: {
			RegisterName: "GridL3EnergyFromNet",
			Register: 2605,
			Id: 30,
			Length: 1,
			Unit: "kWh",
			Factor: 0.01,
			Type: "uint16",
			writable: false
		},
		GridL1EnergyToNet: {
			RegisterName: "GridL1EnergyToNet",
			Register: 2606,
			Id: 30,
			Length: 1,
			Unit: "kWh",
			Factor: 0.01,
			Type: "uint16",
			writable: false
		},
		GridL2EnergyToNet: {
			RegisterName: "GridL2EnergyToNet",
			Register: 2607,
			Id: 30,
			Length: 1,
			Unit: "kWh",
			Factor: 0.01,
			Type: "uint16",
			writable: false
		},
		GridL3EnergyToNet: {
			RegisterName: "GridL3EnergyToNet",
			Register: 2608,
			Id: 30,
			Length: 1,
			Unit: "kWh",
			Factor: 0.01,
			Type: "uint16",
			writable: false
		},
	},
	
	DCSystem:{
		Id: "",
		/*
		DCSystemBatteryVoltage: {
			RegisterName: "DCSystemBatteryVoltage",
			Register: 4400,
			Id: 229,
			Length: 1,
			Unit: "V",
			Factor: 0.01,
			Type: "uint16",
			writable: false
		},*/
	},
  };
}

module.exports = { getRegisters };

