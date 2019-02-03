
var noble = require('noble');   // import the noble library

noble.on('stateChange', function (state) {
    console.log(`state: ${state}`)
    if (state === 'poweredOn') {    // if Bluetooth is on
        console.log("start scanning");
        noble.startScanning();
    } else if (state === 'unauthorized') {
        console.log("unauthorized");
        noble.startScanning();
    } else {
        noble.stopScanning();
        console.log("Please check that Bluetooth is turned on.");
    }
});

target = undefined;

noble.on('discover', function (peripheral) {

    var peripheralData = {
        "id": peripheral.id,
        "name": peripheral.advertisement.localName,
        "address": peripheral.address,
        "addressType": peripheral.addressType,
        "rssi": peripheral.rssi
    }

    if (peripheralData.name === "Charge 2" && target === undefined) {
        noble.stopScanning();
        target = peripheral;
        if (target.advertisement.localName !== undefined) {
            console.log(`name: ${target.advertisement.localName}, rssi: ${target.rssi}`);
        }
        target.connect(err => {
            console.log(err)
            target.updateRssi((err, rssi) => {
                console.log(`rssi: ${rssi}`);
            })
        })
    }


    //   if(peripheralData.name === "ArjunA" 
    //   || peripheralData.name === "Robert's iPhone"){
    //     console.log("****** Sucessfully found a known device ******");
    console.log(JSON.stringify(peripheralData, 2));
    // }



});
