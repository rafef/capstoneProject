
// student object specs
function Student(id, name, email, grade, advisor) {
	this.id = id;					// unique integer identifier for student
	this.name = name;				// student full name
	this.email = email;				// student email
	this.advisor = advisor;			// student advisor name
	this.grade = grade;				// student grade
	this.choices = [];				// list of capstone ID's this student has chosen
	this.isFake;					// whether or not this student is a filler for capacity
	this.assignedCapstones = [];	// the id's of the capstones this student is assigned to
	this.gradeCost = ([12, 11, 10, 9].indexOf(this.grade) + 1) / 4.0; // compute grade cost (0.25 for seniors, 0.5 juniors, 0.75 sophomores, 1 freshmen)
}

// capstone object specs
function Capstone(id, name) {
	this.id = id;				// unique integer identifier for capstone
	this.name = name;			// full name of capstone
}

const fileio = require('./fileio.js').init(Student, Capstone);
const assign = require('./assigning.js');
const group = require('./grouping.js');
const constants = require('./constants.js');
const analysis = require('./analysis.js');

// build student objects from file
fileio.constructStudentObjects('/home/tcastleman/Desktop/CS/HSE/capstone-symposium/testfiles/students.csv', function(students) {
	// build capstone objects from file
	fileio.constructCapstoneObjects('/home/tcastleman/Desktop/CS/HSE/capstone-symposium/testfiles/capstones.csv', function(capstones) {
		// add student preferences from file
		fileio.addPreferencesToStudents(students, capstones, '/home/tcastleman/Desktop/CS/HSE/capstone-symposium/testfiles/preferences.csv', function() {
			// check that students and capstones exist before computing capacity
			if (students.length > 0 && capstones.length > 0)
				constants.CAPSTONE_CAPACITY = Math.ceil(students.length / capstones.length);
			else
				throw "Unable to compute matching -- either no students or no capstones found.";

			// randomly assign each student a capstone, ignoring preference
			assign.randomizeStudentAssignments(students, capstones);

			// now, optimize those initial random assignments to reflect student preferences
			assign.optimizeStudentAssignments(students, capstones);

			// randomly generate groups of capstones
			var groups = group.randomizeCapstoneGroupings(capstones);

			// now, optimize the groupings of capstones to reflect the preferences of the students already assigned to those capstones
			group.optimizeCapstoneGroupings(students, capstones, groups);

			// run some analysis on the solution to see some statistics
			analysis.analyzeAssignments(students, capstones, groups);
		});
	});
});