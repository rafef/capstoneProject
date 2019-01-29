
const constants = require('./constants.js');

module.exports = {

	// randomly assign a capstone ID to each student, without violating capacity
	randomizeStudentAssignments: function(students, capstones) {
		process.stdout.write("Randomly assigning students to capstones... ");

		// list of number of students currently assigned to each capstone (start all at 0)
		var capsToCapacities = [];
		for (var i = 0; i < capstones.length; i++) { capsToCapacities.push(0); }

		// list of ID's of capstones that still have room for more students (start with all capstone ID's)
		var availCaps = Array.apply(null, {length: capstones.length}).map(Function.call, Number);

		// for each student
		for (var i = 0; i < students.length; i++) {
			// choose a random capstone
			var rand = Math.floor(Math.random() * availCaps.length);

			// assign this student to this capstone
			students[i].assignedCapstones.push(availCaps[rand]);

			// increment the number of student assigned to this capstone
			capsToCapacities[availCaps[rand]]++;

			// if capstone is now at capacity
			if (capsToCapacities[availCaps[rand]] == constants.CAPSTONE_CAPACITY) {
				// remove this capstone from the list of available
				availCaps.splice(rand, 1);
			}
		}

		console.log("Done.");
	},

	// improve the randomized student assignments by making swaps
	// (assumes every student's assignedCapstonse attribute has at least one capstone ID in it)
	optimizeStudentAssignments: function(students, capstones) {
		process.stdout.write("Optimizing assignment of students to capstones... ");

		// add filler student objects to max out the capacity of every capstone (allows moving students into a capstone without taking any out)
		addFakeStudents(students, capstones);

		var temperature = 100.0;	// start temperature at 100 degrees, progressively cool off

		// while temperature above threshold
		while (temperature > constants.ASSIGNING_THRESHOLD) {
			// get two random, distinct indices in students array
			var indices = getRandomIndices(students.length);

			// get random pairs
			var stuA = students[indices.index1];
			var capA = capstones[stuA.assignedCapstones[0]];

			var stuB = students[indices.index2];
			var capB = capstones[stuB.assignedCapstones[0]];

			// calculate cost of current pairs, and cost of swapping
			var prevCost = module.exports.studentCapstoneCost(stuA, capA) + module.exports.studentCapstoneCost(stuB, capB);
			var swapCost = module.exports.studentCapstoneCost(stuA, capB) + module.exports.studentCapstoneCost(stuB, capA);
			
			// if swap better or temperature high enough
			if (swapCost < prevCost || Math.random() * 100 < temperature) {
				// apply swap
				stuA.assignedCapstones = [capB.id];
				stuB.assignedCapstones = [capA.id];
			}

			// decrease temperature by given rate
			temperature *= constants.ASSIGNING_RATE;
		}

		// remove filler students
		removeFakeStudents(students);

		console.log("Done.");
	},

	// the soft cost between a student and a capstone (used for initial assignment)
	studentCapstoneCost: function(stu, cap) {
	if (stu.isFake) {
		// return 0 cost for any fake student pairing (does not factor into optimization)
		return 0;
	} else {
		// calculate cost of pair due to student preference
		var rankCost = stu.choices.indexOf(cap.id) == -1 ? 1 : (stu.choices.indexOf(cap.id) + 1) / (constants.NUM_CHOICES + 1);

		// return cost, summed with grade priority if being used
		return rankCost + (constants.PRIORITIZE_GRADE ? stu.gradeCost : 0);
	}
}

};

// get two random indices that are not the same
function getRandomIndices(numStudents) {
	// generate an array of all possible indices in students array
	var possibleIndices = Array.apply(null, {length: numStudents}).map(Function.call, Number);

	// get random indices within the length of students
	var rand1 = possibleIndices[Math.floor(Math.random() * possibleIndices.length)];
	possibleIndices.splice(rand1, 1);
	var rand2 = possibleIndices[Math.floor(Math.random() * possibleIndices.length)];

	return { index1: rand1, index2: rand2 };
}

// add fake student objects to fill out capacities of every capstone
function addFakeStudents(students, capstones) {
	// for each capstone
	for (var i = 0; i < capstones.length; i++) {
		var cap = capstones[i];
		var numAssigned = 0;

		// count number of students assigned to this capstone
		for (var j = 0; j < students.length; j++) {
			// if this student is assigned to this capstone
			if (students[j].assignedCapstones.indexOf(cap.id) != -1) {
				// increment the number assigned
				numAssigned++;
			}
		}

		// assign as many fake students to this capstone as necessary to fill out capacity
		while (numAssigned < constants.CAPSTONE_CAPACITY) {
			students.push({ isFake: true, assignedCapstones: [cap.id] });
			numAssigned++;
		}
	}
}

// remove any fake student objects after assignment optimization
function removeFakeStudents(students) {
	var newStudents = [];
	for (var i = 0; i < students.length; i++) {
		if (!students[i].isFake) {
			// if not ghost, add to persisting list
			newStudents.push(students[i]);
		}
	}

	// remove all students from previous array
	students.splice(0, students.length);

	// add all the non-fake students back in
	students.push.apply(students, newStudents);
}