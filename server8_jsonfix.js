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
var satelize = require('satelize');

//For File read
var path = require('path');
var lineReader = require('line-reader');

//For time-zone deficit
var moment = require('moment-timezone');
var parseFormat = require('moment-parseformat');

//For file-system
var fs = require('fs');

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
var numberParameters = 8; //Number of measurements

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


//IP information
var ip;
var clientIpAddress;

app.use(express.static(path.join(__dirname, '/website/')));

//Get 
app.get('/', function(req, res){
  //send the index.html file for all requests
  res.sendFile(__dirname + '/website/Main.html');
});

http.listen(3001, function(){
	console.log('listening on *:2929');
});

get24MaxMin();
getDateTimeOffset();
//readFile('ip.json');

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
	clientIpAddress  = socket.handshake.address;
	console.log("This is the Ip address of the client: " + clientIpAddress);
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
		});
	}, 1000);

	//Get client statistics
	if(clientIpAddress !== "undefined"){
		satelize.satelize(clientIpAddress, function(err, geoData) {
			if(err){
				console.log(err);
				return;
			}
			var obj = JSON.parse(geoData);
			console.log("New Client Connected");
			obj["date"]= dateLastInfo;
			console.log(obj);
			writeFile(JSON.stringify(obj), "ip");
		});
	}

	//Emit past chat
	lineReader.eachLine('chat.json', function(line, last) {
		socket.emit('chat message', line);
		if (last===line){
			socket.emit('chat message', last);
			return false;
		}
	});

	//Broadcast messages received
	socket.on('chat message', function(msg){
		console.log("Recieved chat message: " + msg);
		var dateMessage = dateLastInfo + ": " + msg;
		writeFile(dateMessage + "\n", "chat");
		io.emit('chat message', dateMessage);
	});
	/*
	for(var latitude in ip) {
	var lat = ip.latitude;
	var lon = ip.longitude;
	var latlon = [lat, lon];
	var country = ip.country;
	socket.emit('map', latlon, country);
	console.log("Emitted data to world-map");
	//socket.emit('chat message', last);
	}*/
});

function writeFile(text, file){
	if (file === "data"){
		fs.appendFile('data.json', text, function(err){
			if(err){
				console.log("Write data.json error");
				throw err;
			}
		});	
	}
	else if(file === "ip"){
		fs.appendFile('ip.json', text, function(err){
			if(err){
				console.log("Write data.json error");
				throw err;
			}
		});
	}
	else if(file === "chat"){
		fs.appendFile('chat.json', text, function (err){
			if(err){
				console.log("Write data.json error");
				throw err;
			}
		})
	}
	else {
		fs.appendFile('err.log', text, function (err){
			if(err){
				console.log("Write error, incorrect file?");
				throw err;
			}
		})
	}
}

function readFile(file){
	fs.readFile(file, 'utf8', function (err, data){
		if(err){
			console.log("Read file error");
			throw err;
		}
		ip=JSON.parse(data);
	})
}

function getDateTimeOffset(){
	// format 
	var format = parseFormat('Thursday, February 6th, 2014 9:20pm'/* , options */);
	return moment().tz("America/Vancouver").format(format); 
}

function get24MaxMin(){
	console.log("Max/Min being put into variables");
	lineReader.eachLine('data/august.json', function(line, last) {
		if(last){
		var lineFixed = line.replace(/\n/g, "")
		.replace(/\'/g, "")
		.replace(/\"/g, "")
		.replace(/\&/g, "")
		.replace(/\r/g, "")
		.replace(/\\r/g, "")
		.replace(/\t/g, "")
		.replace(/\b/g, "")
		.replace(/\f/g, "");
		var lineData = lineFixed.split(" "); 
		maxIndoorTemp = lineData[1];
		maxIndoorTempTime = lineData[2];
		minIndoorTemp = lineData[3];
		minIndoorTempTime = lineData[4];
		maxOutdoorTemp = lineData[5];;
		maxOutdoorTempTime = lineData[6];
		minOutdoorTemp = lineData[7];
		minOutdoorTempTime = lineData[8];
		maxHumidity = lineData[9];
		maxHumidityTime = lineData[10];
		minHumidity = lineData[11];
		minHumidityTime = lineData[12];
		maxHeatIndex = lineData[13];
		maxHeatIndexTime = lineData[14];
		minHeatIndex = lineData[15];
		minHeatIndexTime = lineData[16];
		maxPressure = lineData[17];
		maxPressureTime = lineData[18];
		minPressure = lineData[19];
		minPressureTime = lineData[20];
		maxAltitude = lineData[21];
		maxAltitudeTime = lineData[22];
		minAltitude = lineData[23];
		minAltitudeTime = lineData[24];
		maxLumens = lineData[25];
		maxLumensTime = lineData[26];
		minLumens = lineData[27];
		minLumensTime = lineData[28];
		return false;
		}
	})
}