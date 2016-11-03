import color from './color';

// this module produces 3 css statements, one for each party and one for undecided

export default (electoralCollegeData, opts) => {
    const votes = expand(electoralCollegeData);
    const selectorGroups = makeSelectorStatements(votes); 
    return selectorGroups;
};

function makeSelectorStatements(arr){
    const groups = arr.reduce(function(previous, current){
        if(current.winner){
            previous[current.winner].push( current.selector );
        }else{
            previous.n.push( current.selector );
        }
        return previous;
    },
    {
        r: [],
        d: [],
        g: [],
        i: [],
        l: [],
        n: [],
    });

    Object.keys(groups).forEach(function(key){
        groups[key] = groups[key].join(', ');
    })

    return groups;
}

function expand(arr){ 
    return arr.reduce(function(value, d){
        for(var i=0;i<d.ecvotes;i++){
            var s = JSON.parse( JSON.stringify(d))
            s.selector = '#' + d.code.toUpperCase() + '_' + i;
            value.push(s);
        }
        return value;
    }, []);
}