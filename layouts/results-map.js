import color from './color';


// this module produces css statements, one for party 
// it also makes one for which labels should be lightened

const neverLightLabeled = ['nh','vt','ma','hi','ri','ct','nj','de','md','dc'];

export default (electoralCollegeData, opts) => {
    const selectorGroups = makeSelectorStatements(electoralCollegeData); 
    return selectorGroups;
};

function makeSelectorStatements(arr){
    const groups = arr.reduce(function(previous, current){
        if(current.winner){
            previous[current.winner].push( '#' + current.code.toUpperCase() );
            if(neverLightLabeled.indexOf(current.code) == -1){
                previous.lightLabel.push( '#map-label-' + current.code.toLowerCase() )
            }
        }else{
            previous.n.push( '#' + current.code.toUpperCase() );
        }
        return previous;
    },
    {
        lightLabel: [],
        r: [],
        d: [],
        g: [],
        l: [],
        n: [],
        i: [],
    });

    Object.keys(groups).forEach(function(key){
        groups[key] = groups[key].join(', ');
    })

    return groups;
}