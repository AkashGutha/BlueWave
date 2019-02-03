var Gpio = require('onoff').Gpio;
var noble = require('noble');

var myPeripheral;
var peripheralName = "ArjunA";

var curSumTotal = 0;
var curIt = 0;

var sWitch = new Gpio(2, 'out');
sWitch.writeSync(0);

noble.on('stateChange', scan);

function scan(state){
  if (state === 'poweredOn') {
    noble.startScanning();
    console.log("Started scanning");   
  } else {
    noble.stopScanning();
    console.log("Is Bluetooth on?");
  }
}

noble.on('discover', discoverPeripherals);

function discoverPeripherals(peripheral) {
  if(peripheral.advertisement.localName == peripheralName){
    console.log("found my device");

    noble.stopScanning();
    myPeripheral = peripheral;

    peripheral.connect(explorePeripheral);
  }
};


function explorePeripheral(error) {
  console.log("connected to "+myPeripheral.advertisement.localName);
  setInterval(updateRSSI, 50);

  myPeripheral.on('disconnect', disconnectPeripheral);

};

function updateRSSI(){
    myPeripheral.updateRssi(function(error, rssi){

    curIt++;
    //rssi are always negative values 
    if(rssi <  0) {
     if(curIt >= 40) {
	avg = curSumTotal/39;
	if(avg > -60) {
	  console.log('set switch on avg', avg);
	  sWitch.writeSync(1);
	}	
	else {
	  console.log('set switch off avg', avg);
	  sWitch.writeSync(0);
	}
	curSumTotal = 0;
	curIt = 0;
      }
     curSumTotal += rssi;
     curIt++;
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
