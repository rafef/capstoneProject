
// Important system constants

module.exports = {
	NUM_CHOICES: null,			// the number of choices students are allowed to pick (parsed from preferences.csv)
	CAPSTONE_CAPACITY: null,	// the max capacity of each capstone (ceiling of number of students / number of capstones)
	
	GROUP_SIZE: 2,				// the number of capstones to be grouped together
	PRIORITIZE_GRADE: true,		// whether or not to weigh seniority into the matching

	// constants for optimizing capstone groupings
	GROUPING_RATE: 0.9999,			
	GROUPING_THRESHOLD: 0.00001,

	// constants for optimizing student assignments
	ASSIGNING_RATE: 0.9999, 
	ASSIGNING_THRESHOLD: 0.00001
};