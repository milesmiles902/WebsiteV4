var lineReader = require('line-reader');

lineReader.eachLine('data.json', function(line, last) {
	var lineData = line.split(" ");
	var counter = true;
	for(var i = 0; i < lineData.length; i++){
		if((lineData[i] === "undefined") || (lineData[i] < 0)){
			counter = false;
		}
	}
	if(counter){
		writeFile(line+"\n");
	}
	if(line === last){
		return false;
	}
})

var fs = require('fs');
function writeFile(text){
	fs.appendFile('data/correctedData.json', text, function(err){
		if (err) {
			console.warn(err);
		}
	});
}