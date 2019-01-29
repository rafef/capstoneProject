
const assign = require('./assigning.js');
const constants = require('./constants.js');

module.exports = {

	/* 	Randomly put capstones into groups, returning an array of capstone ID arrays, representing the random groups.
		i.e. [[0,1], [2,3], [4,5], [6,7], [8,9], [10,11],[12,13]]
	Function also modifies the .groupIndex attribute of each capstone to reflect the index of its group
	*/
	randomizeCapstoneGroupings: function(capstones) {
		process.stdout.write("Randomly grouping capstones... ");

		var capIndices = Array.apply(null, {length: capstones.length}).map(Function.call, Number);
		var groups = [];
		var groupIndex = 0;

		// while there are still capstones left to group
		while (capIndices.length > 0) {
			var group = [];

			// for each member of group
			for (n = 0; n < constants.GROUP_SIZE; n++) {
				// if there are still capstones to group up
				if (capIndices.length > 0) {
					// add a random capstone ID to the current group
					var rand = Math.floor(Math.random() * capIndices.length);
					group.push(capIndices[rand]);

					// update this capstone's group index to reflect the group it's in
					capstones[capIndices[rand]].groupIndex = groupIndex;

					// remove that capstone from the list of remaining capstones
					capIndices.splice(rand, 1);
				}
			}

			// add this new group to the groups array
			groups.push(group)

			// increment the index of the current group
			groupIndex++;
		}

		console.log("Done.");

		// return the array of groups of indices
		return groups
	},

	// optimize the groupings of capstones together for student preference
	optimizeCapstoneGroupings: function(students, capstones, groups) {
		process.stdout.write("Optimizing capstone groupings... ");

		// get an association of capstone ID's to the ID's of the students assigned to that capstone
		var capsToStudents = getCapsToStudents(capstones, students);

		// add filler capstones to ensure all groups are full
		addFakeCapstones(groups, capstones);

		var temperature = 100.0;

		// while temperature above threshold
		while (temperature > constants.GROUPING_THRESHOLD) {
			// get two random capstones from DIFFERENT groups
			var indices = getRandomCapstoneIndices(groups);

			// record the indices of capstone A and B
			var aID = indices.index1, bID = indices.index2;
			var aGroupIdx = capstones[aID].groupIndex, bGroupIdx = capstones[bID].groupIndex;

			// get the two groups these capstones are currently part of
			var groupA = groups[aGroupIdx];
			var groupB = groups[bGroupIdx];

			// generate two groups representing hypothetical swap
			var swappedGroupA = swap(groupA, aID, bID);
			var swappedGroupB = swap(groupB, bID, aID);

			// calculate cost of current groups, cost of swapping
			var prevCost = capstoneGroupCost(groupA, capstones, students, capsToStudents) + capstoneGroupCost(groupB, capstones, students, capsToStudents);
			var swapCost = capstoneGroupCost(swappedGroupA, capstones, students, capsToStudents) + capstoneGroupCost(swappedGroupB, capstones, students, capsToStudents);

			// if swap better or temperature high enough
			if (swapCost < prevCost || Math.random() * 100 < temperature) {
				// apply swap to groups array
				groups[aGroupIdx] = swappedGroupA;
				groups[bGroupIdx] = swappedGroupB;

				// swap groupIndex attributes of capstone objects
				var z = capstones[aID].groupIndex;
				capstones[aID].groupIndex = capstones[bID].groupIndex;
				capstones[bID].groupIndex = z;
			}

			// decrease temperature by given rate
			temperature *= constants.GROUPING_RATE;
		}

		// remove any filler capstones added
		removeFakeCapstones(groups, capstones);

		// make sure the students have their assigned ID's
		applyAssignedIDsToStudents(students, capstones, groups, capsToStudents);

		console.log("Done.");
	}

};

// generate an association from capstone ID's to a list of the student ID's assigned to that capstone
function getCapsToStudents(capstones, students) {
	var assoc = {};

	// for each student
	for (var i = 0; i < students.length; i++) {
		var capID = students[i].assignedCapstones[0];

		// add student ID to this capstone
		if (assoc[capID] == null)
			assoc[capID] = [students[i].id];
		else
			assoc[capID].push(students[i].id);
	}

	return assoc;
}

// remove removeID from group, replace with addID, return new group
function swap(group, removeID, addID) {
	var newGroup = group.slice();

	// if removeID not actually in this group
	if (newGroup.indexOf(removeID) == -1) {
		// just add addID
		newGroup.push(addID);
	} else {
		// remove removeID and add addID
		newGroup.splice(newGroup.indexOf(removeID), 1, addID);
	}

	return newGroup;
}

// calculate soft cost of a pair of capstones
function capstoneGroupCost(group, capstones, students, capsToStudents) {
	var totalCost = 0;

	// for each capstone in this group
	for (var i = 0; i < group.length; i++) {
		var capID = group[i];

		// if capstone isn't fake
		if (!capstones[capID].isFake) {
			// get student ID's assigned to this capstone
			var stuIDs = capsToStudents[capID];

			// for each student in this capstone
			for (var s = 0; s < stuIDs.length; s++) {
				// for other capstones in this group
				for (var o = 0; o < group.length; o++) {
					// if different capstone
					if (o != i) {
						// add cost of this student relative to other capstone
						totalCost += assign.studentCapstoneCost(students[stuIDs[s]], capstones[group[o]]);
					}
				}
			}
		}
	}

	return totalCost;
}

// randomly get the indices of two capstones that aren't currently in the same group
function getRandomCapstoneIndices(groups, capstones) {
	// generate array of possible indices in groups array
	var possibleIndices = Array.apply(null, {length: groups.length}).map(Function.call, Number);

	// get random indices within groups array
	var g1 = possibleIndices[Math.floor(Math.random() * possibleIndices.length)];
	possibleIndices.splice(g1, 1);
	var g2 = possibleIndices[Math.floor(Math.random() * possibleIndices.length)];

	// shorten group names
	var group1 = groups[g1];
	var group2 = groups[g2];

	// choose random capstone ID's from these separate groups
	return { index1: group1[Math.floor(Math.random() * group1.length)], index2: group2[Math.floor(Math.random() * group2.length)] };
}

// add fake capstones to any groups that aren't at full capacity
function addFakeCapstones(groups, capstones) {
	var id = capstones.length;
	// for each group
	for (var g = 0; g < groups.length; g++) {
		// if group is underfilled
		if (groups[g].length < constants.GROUP_SIZE) {
			// for the amount this group is underfilled
			for (var n = groups[g].length; n < constants.GROUP_SIZE; n++) {
				// add fake capstones to capstones under this group
				capstones.push({ id: id, isFake: true, groupIndex: g });

				// add fake capstone's ID to group
				groups[g].push(id++);
			}
		}
	}
}

// remove any fake capstones that were added previously
function removeFakeCapstones(groups, capstones) {
	var newCapstones = [];
	for (var i = 0; i < capstones.length; i++) {
		if (!capstones[i].isFake) {
			// if not fake capstone, add to persisting list
			newCapstones.push(capstones[i]);
		} else {
			// remove fake capstone's ID from group
			var group = groups[capstones[i].groupIndex]

			if (group.indexOf(capstones[i].id) != -1)
				group.splice(group.indexOf(capstones[i].id), 1);
		}
	}

	// remove all capstones from previous array
	capstones.splice(0, capstones.length);

	// add all the non-fake capstones back in
	capstones.push.apply(capstones, newCapstones);
}

// add the ID's of capstones this student has been assigned to to their assignedCapstones attribute
function applyAssignedIDsToStudents(students, capstones, groups, capsToStudents) {
	// for each group
	for (var g = 0; g < groups.length; g++) {
		// for each capstone in this group
		for (var i = 0; i < groups[g].length; i++) {
			// get student ID's
			var stuIDs = capsToStudents[groups[g][i]];

			if (stuIDs != null) {
				// for each student assigned to this capstone
				for (var s = 0; s < stuIDs.length; s++) {
					// assign this group of ID's to this student
					students[stuIDs[s]].assignedCapstones = groups[g];
				}
			}
		}
	}
}