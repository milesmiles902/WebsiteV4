/*
  Miles Taylor
  NodeJS Data Center
  Arduino->Raspberry Pi
  */
var socket = require('socket.io-client')('http://localdatacenter.org');


var path = require('path');
var lineReader = require('line-reader');

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

get24MaxMin();

/*
app.get('/socket.io/socket.io.js', function(request, response){
  response.sendfile(__dirname + "/socket.io/socket.io.js");
});
*/
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
    dateLastInfo = getDateTime();
    //console.log("Date:" + dateLastInfo + " TemperatureIndoor(F):" + lastTemperatureIndoor + " TemperatureOutdoor(F):" + lastTemperatureOutdoor + " Humidity(%):" + lastHumidity + " HeatIndex(F):" + lastHeatIndex + " Pressure(Pa): " + lastPressure + " Altitude(m):" + lastAltitude  + " Lumens(Lux):" + lastLumens + "\n")
    writeFile(dateLastInfo + " " + lastTemperatureIndoor + " " + lastTemperatureOutdoor + " " + lastHumidity + " " + lastHeatIndex + " " + lastPressure + " " + lastAltitude  + " " + lastLumens + "\n");
  }
  catch (ex){
    console.warn(ex);
  }
});

io.on('connection', function(socket){
	setInterval( function() {
    console.log("Emitting Data");
   io.emit('message', 
   { 
    lastTemperatureIndoor: lastTemperatureIndoor,
    lastTemperatureOutdoor: lastTemperatureOutdoor,
    lastAltitude: lastAltitude,
    lastHumidity: lastHumidity,
    lastPressure: lastPressure,
    lastLumens: lastLumens,
    lastHeatIndex: lastHeatIndex,
    dateLastInfo: dateLastInfo 
  });/*
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
});
/*
setInterval( function() {
  io.emit('message', lastTemperatureIndoor, lastTemperatureOutdoor);
}, 1000);
*/

var fs = require('fs');
function writeFile(text){
  fs.appendFile('data.json', text, function(err)
  {
    if (err) console.warn(err);
  });
}

function getDateTime() {
  var now     = new Date(); 
  var year    = now.getFullYear();
  var month   = now.getMonth()+1; 
  var day     = now.getDate();
  var hour    = now.getHours()-7;
  var minute  = now.getMinutes();
  var second  = now.getSeconds(); 
  if(month.toString().length == 1){
    var month = '0'+month;
  }
  if(day.toString().length == 1){
    var day = '0'+day;
  }   
  if(hour.toString().length == 1){
    var hour = '0'+hour;
  }
  if(minute.toString().length == 1){
    var minute = '0'+minute;
  }
  if(second.toString().length == 1){
    var second = '0'+second;
  }   
  var dateTime = year+'/'+month+'/'+day+' '+hour+':'+minute+':'+second;   
  return dateTime;
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
};


