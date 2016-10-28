import color from './color';

// this module produces 3 css statements, one for each party and one for undecided

export default (electoralCollegeData, opts) => {
    const selectorGroups = makeSelectorStatements(electoralCollegeData); 
    return selectorGroups;
};

function makeSelectorStatements(arr){
    const groups = arr.reduce(function(previous, current){
        if(current.winner){
            previous[current.winner].push( '#' + current.code.toUpperCase() );
        }else{
            previous.n.push( '#' + current.code.toUpperCase() );
        }
        return previous;
    },
    {
        r: [],
        d: [],
        g: [],
        l: [],
        n: [],
    });

    Object.keys(groups).forEach(function(key){
        groups[key] = groups[key].join(', ');
    })

    return groups;
}