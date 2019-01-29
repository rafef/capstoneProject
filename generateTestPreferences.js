
const csv = require('fast-csv');
const fs = require('fs');
var fileRows = [];

var studentsFile = '/home/tcastleman/Desktop/CS/HSE/capstone-symposium/testfiles/students.csv';
var capstonesFile = '/home/tcastleman/Desktop/CS/HSE/capstone-symposium/testfiles/capstones.csv';
var outFile = 'testPreferences.csv';

const timestamp = '"2019/01/22 6:21:15 PM EST",';	// just use same fake timestamp for all of them

var numChoices = 3;
var capstones = [];


csv.fromPath(capstonesFile)
	.on("data", function(data) {
		fileRows.push(data);
	})
	.on("end", function() {
		// add all capstone names to an array
		for (var i = 0; i < fileRows.length; i++) {
			capstones.push(fileRows[i][0]);
		}

		// reset fileRows
		fileRows = [];

		// read file of all student info
		csv.fromPath(studentsFile)
			.on("data", function (data) {
				// add each row of file to array
				fileRows.push(data);
			})
			.on("end", function () {
				// remove the first element--the file header
				fileRows.shift();

				// start file data as header
				var data = 'Timestamp","Username","FIRST Choice Capstone","SECOND Choice Capstone","THIRD Choice Capstone"\n';

				// for each row in CSV
				for (var i = 0; i < fileRows.length; i++) {
					var email = fileRows[i][3];

					// add timestamp, email to row string
					data += timestamp + "\"" + email + "\","

					// make working copy of capstones
					var choicesCopy = capstones.slice();

					// for each choice
					for (var n = 0; n < numChoices; n++) {
						// choose capstone at random
						var randIdx = Math.floor(Math.random() * choicesCopy.length);
						var rand = choicesCopy[randIdx];

						// add choice to row string
						data += "\"" + rand + "\","

						// prevent choice from being selected again
						choicesCopy.splice(randIdx, 1);
					}

					// enter down a line for new row
					data += "\n"
				}

				// write generated CSV to file
				fs.writeFile(outFile, data, function(err, data){
				    if (err) console.log(err);
				    console.log("Successfully Written to File.");
				});
			});
	});