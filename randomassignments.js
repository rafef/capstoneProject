StudentList = []
//This is just a test student class for what we expect to be imported
class Student {
  constructor(id){
    this.id = id;
  }
}
stulist = [];
for (i = 0; i < 300; i++){
  stulist[i] = new Student(i);
}
// this randomizes the order of the list of students
function listRand(theList) {
  for (i = 0; i < theList.length-1; i++){
    var randomI = Math.floor(Math.random()*(i+1));
    var temp = theList[randomI];
    theList[randomI] = theList[i];
    theList[i] = temp;
  }

  return theList;
}

var cap = 30;
tempArray1 = [];
tempArray2 = [];
tempArray3 = [];
arrayOfArrays = [tempArray1,tempArray2,tempArray3]

//What this does is it takes the list of students and the list of capstones
//and fills the capstones (which are lists) with students with a general cap of 30
function sortInto(theList,listOfLists){
  for (k = 0; k < listOfLists.length; k++){

    // ----- this issue here is that this always adds the *first* 30 students -- never the ones after that
    for (i = 0; i < cap; i++){
      listOfLists[k].push(theList[i])
    }
  }
}


L = listRand(stulist);
console.log(L);

L = sortInto(L,arrayOfArrays)
console.log(L);