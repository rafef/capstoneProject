
var ordinal = require('ordinal');

module.exports = {

	// log an analysis of overall assignment satisfaction & other things to console
	analyzeAssignments: function(students, capstones, groups) {
		console.log("\n---------------------------- ANALYSIS ----------------------------\n");

		// -------------------------- Measure some satisfaction ----------------------------

		/* association of choice indices (0: first choice, 1: second choice...) with the number of 
		students for whom that was the best / worst assignment they got */
		var bestAssignment = {};
		var worstAssignment = {};

		// stats for those who are attending a capstone they didn't sign up for
		var bestForArbitrary = {};
		var numWithWorstArbitrary = 0;

		// the number of students who actually have preference data (the only ones we care about satisfying)
		var numResponsiveStudents = 0;

		// for each student, gather preference satisfaction stats
		for (var i = 0; i < students.length; i++) {
			var stu = students[i];
			var alreadyUnchosen = false;
			var best = undefined, worst = undefined;

			if (students[i].choices.length > 0) {
				// record another responsive student
				numResponsiveStudents++;

				// for each of their assigned capstones
				for (var j = 0; j < stu.assignedCapstones.length; j++) {
					// see which choice this capstone was for this student
					var ch = stu.choices.indexOf(stu.assignedCapstones[j]);

					if (ch != -1 || !alreadyUnchosen) {
						// update their worst assignment
						if (ch == -1 || (ch > worst && worst != -1) || worst == undefined)
							worst = ch;

						// update their best assignment
						if ((ch < best && ch != -1) || best == -1 || best == undefined)
							best = ch;
					}

					// register that we've now already recorded an unchosen assignment for this student
					if (ch == -1)
						alreadyUnchosen = true;
				}

				// increment number of people with this as their best assignment
				if (bestAssignment[best] == null) bestAssignment[best] = 0;
				bestAssignment[best]++;

				// increment number of people with this as their worst assignment
				if (worstAssignment[worst] == null) worstAssignment[worst] = 0;
				worstAssignment[worst]++;

				// if this student is attending an arbitrarily assignment capstone
				if (worst == -1) {
					// check out this student's best assignment
					if (bestForArbitrary[best] == null) bestForArbitrary[best] = 0;
					bestForArbitrary[best]++;

					// increase a count of these types of students
					numWithWorstArbitrary++;
				}
			}
		}

		console.log("------------ SATISFACTION STATISTICS ------------");

		console.log("Assignment of highest satisfaction...");
		for (var ch in bestAssignment) {
			if (bestAssignment.hasOwnProperty(ch)) {
				var num = bestAssignment[ch];
				var choice = parseInt(ch, 10) + 1;
				var percentage = num / numResponsiveStudents * 100;

				if (choice > 0) {
					console.log(ordinal(choice) + " Choice: " + num + " students (" + percentage.toFixed(3) + "%)");
				} else {
					console.log("Arbitrary: " + num + " students (" + percentage.toFixed(3) + "%)");
				}
			}
		}

		console.log("\nAssignment of lowest satisfaction...");
		for (var ch in worstAssignment) {
			if (worstAssignment.hasOwnProperty(ch)) {
				var num = worstAssignment[ch];
				var choice = parseInt(ch, 10) + 1;
				var percentage = num / numResponsiveStudents * 100;

				if (choice > 0) {
					console.log(ordinal(choice) + " Choice: " + num + " students (" + percentage.toFixed(3) + "%)");
				} else {
					console.log("Arbitrary: " + num + " students (" + percentage.toFixed(3) + "%)");
				}
			}
		}

		console.log("\nOf the " + numWithWorstArbitrary + " students attending an arbitrarily assigned capstone...");
		for (var ch in bestForArbitrary) {
			if (bestForArbitrary.hasOwnProperty(ch)) {
				var num = bestForArbitrary[ch];
				var choice = parseInt(ch, 10) + 1;
				var percentage = num / numWithWorstArbitrary * 100;

				if (choice > 0) {
					console.log(num + " (" + percentage.toFixed(3) + "%) are also attending their " + ordinal(choice) + " choice.");
				} else {
					console.log(num + " (" + percentage.toFixed(3) + "%) are also attending an arbitrary choice.");
				}
			}
		}

		// ------------- Collect some capacity stats -------------------

		var groupCapacities = {};

		// determine how many students are attending each grouping of capstones
		for (var i = 0; i < students.length; i++) {
			// increment number of students attending this grouping
			if (groupCapacities[students[i].assignedCapstones] == null) {
				groupCapacities[students[i].assignedCapstones] = 1;
			} else {
				groupCapacities[students[i].assignedCapstones]++;
			}
		}

		console.log("\n------------ CAPSTONE GROUPINGS ------------");

		// for each group
		for (var k in groupCapacities) {
			if (groupCapacities.hasOwnProperty(k)) {
				var capacity = groupCapacities[k];
				var ids = k.split(',');

				// log the capstone name of each capstone in this group
				for (var i = 0; i < ids.length; i++) {
					var intID = parseInt(ids[i], 10);
					console.log(capstones[intID].name.substring(0, 70) + "...");
				}

				// log the number of students attending this group of capstones
				console.log(capacity + " students attending\n");
			}
		}
	}

};