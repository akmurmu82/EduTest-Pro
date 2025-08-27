const getGradeLabel = (n) => {
  if (n === 1) return "1st Grade";
  if (n === 2) return "2nd Grade";
  if (n === 3) return "3rd Grade";
  return `${n}th Grade`;
};

// generate enum values dynamically
const gradeEnum = Array.from({ length: 10 }, (_, i) => getGradeLabel(i + 1));
module.exports = { getGradeLabel, gradeEnum };