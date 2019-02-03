
const noble = require('noble');
const gpio = require('onoff').Gpio;

const triggerValue = -65;
const LED = new gpio(2, 'out');
const BUZ = new gpio(3, 'out');
LED.writeSync(1);
BUZ.writeSync(1);
var curIt = 0;
var curSampleSum = 0;

const knownPeripherals = ["arjun", "Charge 2"];
var myPeripherals = {"arjun" : undefined, "Charge 2": undefined};
const registeredForRSSIUpdates = []

noble.on('stateChange', function scan(state) {
    if (state === 'poweredOn') {
        noble.startScanning();
        console.log("Started scanning");
    } else {
        noble.stopScanning();
        console.log("Is Bluetooth on?");
    }
});

noble.on('discover',
    function discoverPeripherals(peripheral) {
        if (knownPeripherals.includes(peripheral.advertisement.localName) && !registeredForRSSIUpdates.includes(peripheral)) {
            console.log(`found a target device! ${peripheral.advertisement.localName}`);
           myPeripherals[peripheral.advertisement.localName] = peripheral;  
           
           peripheral.on('connect', function() {noble.startScanning(); registeredForRSSIUpdates.push(peripheral);});
           peripheral.connect(explorePeripheral(undefined, peripheral.advertisement.localName));
	   	  
            //when disconnected, run this function
            peripheral.on('disconnect', () => disconnectPeripheral(peripheral)  );
        }
    });


function explorePeripheral(error, peripheralName) {
   setInterval( () =>  updateRSSI(peripheralName), 50)
};

function updateRSSI(peripheralName) {
        myPeripherals[peripheralName].updateRssi(function (error, rssi) {
            curSampleSum += rssi; curIt++; 
            if (curIt >= 24) {
                curIt = 0;
                avg = curSampleSum / 24;

                if (avg > triggerValue) {
                    console.log(peripheralName + ':= ' + avg + 'ON');
                    
		    if(peripheralName == "arjun")
			LED.writeSync(0);
                    
                    else
                       BUZ.writeSync(0);
                }
                else {
                    console.log(peripheralName + ':= ' + avg + 'OFF');
                   if(peripheralName == "arjun")
                      LED.writeSync(1);
                   else
                      BUZ.writeSync(1);
                }
                curSampleSum = 0;
   }     })
}


function disconnectPeripheral(p) {
    console.log(`${p.advertisement.localName} peripheral disconneted`);

    //stop calling updateRSSI
    clearInterval(updateRSSI);

    //restart scan
    noble.startScanning();
}
