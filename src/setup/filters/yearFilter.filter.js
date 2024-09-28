const yearFilter = (year) => {
    return `'${year.toString().substring(2, 4)}`;
   
}
exports.yearFilter = yearFilter;