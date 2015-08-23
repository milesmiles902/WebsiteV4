/*
  Miles Taylor
  NodeJS Data Center
  Arduino->Raspberry Pi
  */

//Website Setup
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//For IP reverse lookup
var ipident = require('ipident');
ipident.autoLoad();

//For File read
var path = require('path');
var lineReader = require('line-reader');

//For time-zone deficit
var moment = require('moment-timezone');
var parseFormat = require('moment-parseformat');

//SerialPort Setup
var arduinoSerialPort = '/dev/ttyACM0';

var serialport = require('serialport');
var serialPort = new serialport.SerialPort(arduinoSerialPort,
  {//Listening on the serial port for data coming from Arduino over USB
  	parser: serialport.parsers.readline('\n')
  });

var lastTemperatureIndoor = NaN;
var lastTemperatureOutdoor = NaN;
var lastAltitude = NaN;
var lastHumidity = NaN;
var lastPressure = NaN;
var lastLumens = NaN;
var lastHeatIndex = NaN;
var dateLastInfo;
var numberParameters = 8; //number of measurements are refereced

var maxIndoorTemp =  0;
var maxIndoorTempTime;
var minIndoorTemp =  0;
var minIndoorTempTime;
var maxOutdoorTemp =  0;
var maxOutdoorTempTime;
var minOutdoorTemp = 0;
var minOutdoorTempTime;
var maxHumidity = 0;
var maxHumidityTime;
var minHumidity = 0;
var minHumidityTime;
var maxHeatIndex = 0;
var maxHeatIndexTime;
var minHeatIndex = 0;
var minHeatIndexTime;
var maxPressure = 0;
var maxPressureTime;
var minPressure = 0;
var minPressureTime;
var maxAltitude = 0;
var maxAltitudeTime;
var minAltitude = 0;
var minAltitudeTime;
var maxLumens = 0;
var maxLumensTime;
var minLumens = 0;
var minLumensTime;

//IP data
var ipBody;

//Get 
app.get('/', function(req, res){
  //send the index.html file for all requests
  res.sendFile(__dirname + '/website/Main.html');

  var body = 'IP Address: ' + req.ip + "\n",
        start = process.hrtime();

    ipident.retrieveCityInfo(req.ip, function (data) {

        if (data) {
            var city_info, diff;
            city_info = "City: " + data.city_name + "\n";
            city_info += "Region Name: " + data.region_name + "\n";
            city_info += "Country: " + data.country_code + "\n";
            city_info += "Postal Code: " + data.postal_code + "\n";
            city_info += "Latitude: " + data.latitude + "\n";
            city_info += "Longitude: " + data.longitude + "\n";
            city_info += "Metro Code: " + data.metro_code + "\n";
            city_info += "Area Code: " + data.area_code + "\n";
            ipBody += city_info;
            diff = process.hrtime(start);
            ipBody += "\n\nIdentification process took " + (diff[0] * 1e9 + diff[1]).toString() + " nanoseconds\n";

        } else {
            ipBody += "No location identified for your IP Address.\n";
        }
    });
});

app.use(express.static(path.join(__dirname, '/website/')));

http.listen(2929, function(){

	console.log('listening on *:2929');

});

get24MaxMin();
getDateTimeOffset();

serialPort.on('data', function (data)
{//When a new line of text is received from Arduino over USB
	try{
		var j = JSON.parse(data);
		lastTemperatureIndoor = j.rawIndoorTemp;
		lastTemperatureOutdoor = j.rawOutdoorTemp;
		lastAltitude = j.rawAltitude;
		lastHumidity = j.rawHumidity;
		lastPressure = j.rawPressure;
		lastLumens = j.rawLumens;
		lastHeatIndex = j.rawHeatIndex;
		dateLastInfo = getDateTimeOffset();
		console.log("Date:" + dateLastInfo + " TemperatureIndoor(F):" + lastTemperatureIndoor + " TemperatureOutdoor(F):" + lastTemperatureOutdoor + " Humidity(%):" + lastHumidity + " HeatIndex(F):" + lastHeatIndex + " Pressure(Pa): " + lastPressure + " Altitude(m):" + lastAltitude  + " Lumens(Lux):" + lastLumens + "\n");
		writeFile(dateLastInfo + " " + lastTemperatureIndoor + " " + lastTemperatureOutdoor + " " + lastHumidity + " " + lastHeatIndex + " " + lastPressure + " " + lastAltitude  + " " + lastLumens + "\n", "data");
	}
	catch (ex){
		console.warn(ex);
	}
});

io.on('connection', function(socket){
	console.log("Emitting data");

	setInterval( function() {
		socket.emit('message', 
		{ 
			lastTemperatureIndoor: lastTemperatureIndoor,
			lastTemperatureOutdoor: lastTemperatureOutdoor,
			lastAltitude: lastAltitude,
			lastHumidity: lastHumidity,
			lastPressure: lastPressure,
			lastLumens: lastLumens,
			lastHeatIndex: lastHeatIndex,
			dateLastInfo: dateLastInfo 
		});

  /*
   socket.emit('tables', 
   { 
    maxIndoorTemp: maxIndoorTemp,
    maxIndoorTempTime: maxIndoorTempTime,
    minIndoorTemp: minIndoorTemp,
    minIndoorTempTime: minIndoorTempTime,
    maxOutdoorTemp: maxOutdoorTemp,
    maxOutdoorTempTime: maxOutdoorTempTime,
    minOutdoorTemp: minOutdoorTemp,
    minOutdoorTempTime: minOutdoorTempTime,
    maxHumidity: maxHumidity,
    maxHumidityTime: maxHumidityTime,
    minHumidity: minHumidity,
    minHumidityTime: minHumidityTime,
    maxHeatIndex: maxHeatIndex,
    maxHeatIndexTime: maxHeatIndexTime,
    minHeatIndex: minHeatIndex,
    minHeatIndexTime: minHeatIndexTime,
    maxPressure: maxPressure,
    maxPressureTime: maxPressureTime,
    minPressure: minPressure,
    minPressureTime: minPressureTime,
    maxAltitude: maxAltitude,
    maxAltitudeTime: maxAltitudeTime,
    minAltitude: minAltitude,
    minAltitudeTime: minAltitudeTime,
    maxLumens: maxLumens,
    maxLumensTime: maxLumensTime,
    minLumens: minLumens,
    minLumensTime: minLumensTime
});*/
}, 1000);

	var clientIpAddress = socket.request.socket.remoteAddress;
	var clientIpAddressCheck = clientIpAddress;
	console.log("New Client Connected: " + clientIpAddress);
	writeFile(dateLastInfo + " " + clientIpAddress + "\n", "ip");
	console.log(ipBody);

	
	lineReader.eachLine('chat.json', function(line, last) {
		socket.emit('chat message', line);
		if (last===line){
			socket.emit('chat message', last);
			return false;
		}
	});

	socket.on('chat message', function(msg){
		console.log("Recieved chat message: " + msg);
		var dateMessage = dateLastInfo + " " + msg;
		writeFile(dateMessage + "\n", "chat");
		io.emit('chat message', dateMessage);
	});

});

var fs = require('fs');
function writeFile(text, file){
	if (file === "data"){
		fs.appendFile('data.json', text, function(err)
		{
			if (err) console.warn(err);
		});	
	}
	else if(file === "ip"){
		fs.appendFile('ip.json', text, function(err)
		{
			if (err) console.warn(err);
		});
	}
	else if(file === "chat"){
		fs.appendFile('chat.json', text, function (err){
			if (err) console.warn(err);

		})
	}
	else {
		fs.appendFile('error.json', text, function (err){
			if (err) console.warn(err);
		})
	}
}
function getDateTimeOffset(){
	// format 
	var format = parseFormat('Thursday, February 6th, 2014 9:20pm'/* , options */);
	return moment().tz("America/Vancouver").format(format); 
}

function get24MaxMin(){
	lineReader.eachLine('data/august.json', function(line, last) {
		var jsonLine = JSON.stringify(last);
		var lineFixed = jsonLine.replace(/\n/g, "")
		.replace(/\'/g, "")
		.replace(/\"/g, "")
		.replace(/\&/g, "")
		.replace(/\r/g, "")
		.replace(/\\r/g, "")
		.replace(/\t/g, "")
		.replace(/\b/g, "")
		.replace(/\f/g, "");
		var lineData = lineFixed.split(" "); 
		maxIndoorTemp = lineData[2];
		maxIndoorTempTime = lineData[3];
		minIndoorTemp = lineData[4];
		minIndoorTempTime = lineData[5];
		maxOutdoorTemp = lineData[6];;
		maxOutdoorTempTime = lineData[7];
		minOutdoorTemp = lineData[8];
		minOutdoorTempTime = lineData[9];
		maxHumidity = lineData[10];
		maxHumidityTime = lineData[11];
		minHumidity = lineData[12];
		minHumidityTime = lineData[13];
		maxHeatIndex = lineData[14];
		maxHeatIndexTime = lineData[15];
		minHeatIndex = lineData[16];
		minHeatIndexTime = lineData[17];
		maxPressure = lineData[18];
		maxPressureTime = lineData[19];
		minPressure = lineData[20];
		minPressureTime = lineData[21];
		maxAltitude = lineData[22];
		maxAltitudeTime = lineData[23];
		minAltitude = lineData[24];
		minAltitudeTime = lineData[25];
		maxLumens = lineData[26];
		maxLumensTime = lineData[27];
		minLumens = lineData[28];
		minLumensTime = lineData[29];
		return false;
	})
}


