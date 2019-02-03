const noble = require('noble');
const gpio = require('onoff').Gpio;
const request = require('request');
status = false;

const triggerValue = -65;
const LED = new gpio(2, 'out');
const  BUZ = new gpio(3, 'out');
LED.writeSync(1);
BUZ.writeSync(1);
var curIt = 0;
var curSampleSum = 0;

var myPeripheral;
const peripheralName = "Charge 2";

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

  noble.stopScanning();
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
          console.log('STATUS ' + status); 
          console.log(avg + 'ON');
	  LED.writeSync(0);
	  BUZ.writeSync(0);
	  var s = {
          uri: "http://192.168.43.79:3000/",
	  method: 'POST',
	  json: {
                  "username" : "arjun"
        	}
          };
	    request(s, function(error,response, body) {
                  console.log(error);
             });
         
	}
	else {
	 console.log(avg + 'OFF');

	  LED.writeSync(1);
	  BUZ.writeSync(1);
          
          request.get("http://192.168.43.79:3000/kill", function(err) { console.log(err) });
     
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
