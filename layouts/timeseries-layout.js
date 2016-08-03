

module.exports = function(data, opts){
    return {
        margin: {top:70, left:35, right:90, bottom:70},
        height: 300,
        width: 600,
        yLabelOffset: '-7',
        yTicks: [{label:'', position:''}],
        xTicks: [{label:'', position:''}],
        candidateAreas: [],
        candidateLines: [],
        candidateEndPoints: [],
        title: '!Which White House candidate is leading in the polls?',
        subtitle: '!National polling average as of August 2, 2016 (%)',
        source: '!Source: Real Clear Politics',
    };
};
