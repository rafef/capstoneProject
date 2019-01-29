
const csv = require('fast-csv');
const constants = require('./constants.js');

var Student, Capstone;

module.exports = {
	// receive student and capstone object definitions
	init: function(_Student, _Capstone) {
		Student = _Student;
		Capstone = _Capstone;

		return module.exports;
	},

	// read student info from a given CSV file into student objects
	constructStudentObjects: function(filename, callback) {
		var fileRows = [];
		var students = [];
		var id = 0;
		var parseGrade = /Grade (\d+)/g;	// regular expression for parsing numeric grade out of grade string

		// read file of all student info
		csv.fromPath(filename)
			.on("data", function (data) {
				// add each row of file to array
				fileRows.push(data);
			})
			.on("end", function () {
				// remove the first element--the file header
				fileRows.shift();

				// for each row in CSV
				for (var i = 0; i < fileRows.length; i++) {
					var row = fileRows[i];

					// reset grade regex and match grade string for digits only
					parseGrade.lastIndex = 0;
					var grade = parseGrade.exec(row[1]);

					// parse grade to integer if exists, otherwise -1
					grade = grade ? parseInt(grade[1], 10) : -1;

					// construct new student object and add to list
					students.push(new Student(id++, row[0], row[3], grade, row[2]));
				}

				callback(students);
			});
	},

	// read capstone info from given CSV and construct capstone objects
	constructCapstoneObjects: function(filename, callback) {
		var fileRows = [];
		var capstones = [];
		var id = 0;

		// read file of all student info
		csv.fromPath(filename)
			.on("data", function (data) {
				// add each row of file to array
				fileRows.push(data);
			})
			.on("end", function () {
				// for each row in CSV
				for (var i = 0; i < fileRows.length; i++) {
					var row = fileRows[i];
					capstones.push(new Capstone(id++, row[0]));
				}

				callback(capstones);
			});
	},

	// read preferences from file and apply them to student objects
	addPreferencesToStudents: function(students, capstones, filename, callback) {
		var fileRows = [];

		var capNamesToIDs = {};
		for (var i = 0; i < capstones.length; i++) {
			// associate each capstone name with its ID (which is its index in capstones array)
			capNamesToIDs[capstones[i].name] = capstones[i].id;
		}

		// read file of all preferences
		csv.fromPath(filename)
			.on("data", function (data) {
				// add each row of file to array
				fileRows.push(data);
			})
			.on("end", function () {
				// remove the first element--the file header
				fileRows.shift();

				// construct object to map student email strings to student objects
				var emailToStudent = {};
				for (var i = 0; i < students.length; i++) {
					emailToStudent[students[i].email] = students[i];
				}

				/*
					CSV is in this format:

					rows[0] - timestamp
					rows[1] - email
					rows[2] - choice 1
					rows[3] - choice 2
					...
					rows[n] - choice (n-1)
				*/

				// for each row in CSV
				for (var i = 0; i < fileRows.length; i++) {
					var row = fileRows[i];

					// get the corresponding student object for this row's email
					var student = emailToStudent[row[1]];

					if (student) {
						// for all choices (variable n) they have
						for (var n = 2; n < row.length; n++) {
							// get the ID of the capstone from its name
							var capID = capNamesToIDs[row[n]];

							// if ID found successfully
							if (capID != null) {
								// if this choice is distinct from previous choices
								if (student.choices.indexOf(capID) == -1) {
									// add name of capstone to student rank
									student.choices.push(capNamesToIDs[row[n]]);
								} else {
									// eliminate student's choices entirely
									student.choices = [];
									break;
								}
							}
						}
					}
				}

				// record the number of choices students have made
				if (students.length > 0) {
					constants.NUM_CHOICES = students[0].choices.length;
				}

				callback();
			});
	}
};