const noble = require('noble');
const gpio = require('onoff').Gpio;

const triggerValue = -65;
const LED = new gpio(2, 'out');
const  BUZ = new gpio(3, 'out');
LED.writeSync(1);
BUZ.writeSync(1);
var curIt = 0;
var curSampleSum = 0;

var myPeripheral;
const peripheralName = "arjun";

noble.on('stateChange', function scan(state){
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
  if(peripheral.advertisement.localName===peripheralName){
    console.log("found a target device!");
    myPeripheral = peripheral;
    peripheral.connect(explorePeripheral);
  }
});


function explorePeripheral(error) {
  setInterval(updateRSSI, 50);
  //when disconnected, run this function
  myPeripheral.on('disconnect', disconnectPeripheral);
};

function updateRSSI(){
    curIt++;
    myPeripheral.updateRssi(function(error, rssi){

    curSampleSum += rssi;

   if(curIt >= 24) {
	curIt = 0;
	avg = curSampleSum / 24;

	if(avg > triggerValue) {
          console.log(avg + 'ON');
	  LED.writeSync(0);
	  BUZ.writeSync(0);
	}
	else {
	 console.log(avg + 'OFF');
	  LED.writeSync(1);
	  BUZ.writeSync(1);
	}
	curSampleSum = 0;
   }
  });
}


function disconnectPeripheral(){
      console.log('peripheral disconneted');

      //stop calling updateRSSI
      clearInterval(updateRSSI);

      //restart scan
      noble.startScanning();
}
