import color from './color';

// this module produces 3 css statements, one for each party and one for undecided

export default (electoralCollegeData, opts) => {
    const votes = expand(electoralCollegeData);
    //console.log(votes);
    const repSelector = votes
        .filter(d => d.winner == 'r')
        .map(d => d.selector)
        .join(', ');
    const demSelector = votes
        .filter(d => d.winner == 'd')
        .map(d => d.selector)
        .join(', ');

    return 'dot map layout ' + repSelector;
};

function expand(arr){ 
    return arr.reduce(function(value, d){
        for(var i=0;i<d.ecvotes;i++){
            var s = JSON.parse( JSON.stringify(d))
            s.selector = '#' + d.code + '_' + i;
            value.push(s);
        }
        return value;
    }, []);
}