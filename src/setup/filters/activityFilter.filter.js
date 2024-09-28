const activityFilter = (activity) => {
    if(activity > 6){
        return 'high';
    } else if(activity > 3){
        return 'medium';
    } else if (activity > 0){
        return 'low';

    } else {
        return 'none';
    }
}
exports.activityFilter = activityFilter;