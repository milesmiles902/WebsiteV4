var lineReader = require('line-reader');
var day = 0;
var month = 0;
var year = 0;
var oldDate = 0;
var counter = false;
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
var twentyFour;


lineReader.eachLine('data/correctedData.json', function(line, last) {
	var jsonLine = JSON.stringify(line);
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
	var date = lineData[0].split("/");
	month = date[1];
	year = date[0];
	if (day < date[2]){
		console.log("Made it in the initilizer");
		if (counter) {
			console.log("Got to another day");
			writeFile(oldDate + " " + maxIndoorTemp + " " + maxIndoorTempTime + " " + minIndoorTemp + " " + minIndoorTempTime + " " + maxOutdoorTemp + " " + maxOutdoorTempTime + " " + minOutdoorTemp  + " " + minOutdoorTempTime + " " + maxHumidity + " " + maxHumidityTime + " " + minHumidity + " "  + minHumidityTime + " " + maxHeatIndex + " " + maxHeatIndexTime + " " + minHeatIndex + " " + minHeatIndexTime + " " + maxPressure + " " + maxPressureTime + " " + minPressure + " " + minPressureTime + " " + maxAltitude + " " + maxAltitudeTime + " " + minAltitude + " " + minAltitudeTime + " " + maxLumens + " " + maxLumensTime + " " + minLumens + " " + minLumensTime + "\n");
			counter = false;
		}
		oldDate = lineData[0];
		day = date[2];
		maxIndoorTemp = lineData[2];
		maxIndoorTempTime = lineData[1];
		minIndoorTemp = lineData[2];;
		minIndoorTempTime = lineData[1];
		maxOutdoorTemp = lineData[3];;
		maxOutdoorTempTime = lineData[1];
		minOutdoorTemp = lineData[3];
		minOutdoorTempTime = lineData[1];
		maxHumidity = lineData[4];
		maxHumidityTime = lineData[1];
		minHumidity = lineData[4];
		minHumidityTime = lineData[1];
		maxHeatIndex = lineData[5];
		maxHeatIndexTime = lineData[1];
		minHeatIndex = lineData[5];
		minHeatIndexTime = lineData[1];
		maxPressure = lineData[6];
		maxPressureTime = lineData[1];
		minPressure = lineData[6];
		minPressureTime = lineData[1];
		maxAltitude = lineData[7];
		maxAltitudeTime = lineData[1];
		minAltitude = lineData[7];
		minAltitudeTime = lineData[1];
		maxLumens = lineData[8];
		maxLumensTime = lineData[1];
		minLumens = lineData[8];
		minLumensTime = lineData[1];
		counter = true;
	}
	if(maxIndoorTemp < lineData[2]){
		maxIndoorTemp = lineData[2];
		maxIndoorTempTime = lineData[1];
	}
	if(minIndoorTemp > lineData[2]){
		minIndoorTemp = lineData[2];
		minIndoorTempTime = lineData[1];
	}
	if(maxOutdoorTemp < lineData[3]){
		maxOutdoorTemp = lineData[3];
		maxOutdoorTempTime = lineData[1];
	}
	if(minOutdoorTemp > lineData[3]){
		minOutdoorTemp = lineData[3];
		minOutdoorTempTime = lineData[1];
	}
	if(maxHumidity < lineData[4]){
		maxHumidity = lineData[4];
		maxHumidityTime = lineData[1];
	}
	if(minHumidity > lineData[4]){
		minHumidity = lineData[4];
		minHumidityTime = lineData[1];
	}
	if(maxHeatIndex < lineData[5]){
		maxHeatIndex = lineData[5];
		maxHeatIndexTime = lineData[1];
	}
	if(minHeatIndex > lineData[5]){
		minHeatIndex = lineData[5];
		minHeatIndexTime = lineData[1];
	}
	if(maxPressure < lineData[6]){
		maxPressure = lineData[6];
		maxPressureTime = lineData[1];
	}
	if(minPressure > lineData[6]){
		minPressure = lineData[6];
		minPressureTime = lineData[1];
	}
	if(maxAltitude < lineData[7]){
		maxAltitude = lineData[7];
		maxAltitudeTime = lineData[1];
	}
	if(minAltitude > lineData[7]){
		minAltitude = lineData[7];
		minAltitudeTime = lineData[1];
	}
	if(maxLumens < lineData[8]){
		maxLumens = lineData[8];
		maxLumensTime = lineData[1];
	}
	if(minLumens > lineData[8]){
		minLumens = lineData[8];
		minLumensTime = lineData[1];
	}

 	if(last === line){
 		return false;
 	}
});

var fs = require('fs');
function writeFile(text){
	fs.appendFile('data/august.json', text, function(err){
		if (err) {
			console.warn(err);
		}
	});
}
