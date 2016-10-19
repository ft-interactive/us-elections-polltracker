var color = {
    Trump: '#e03d46',
    Clinton: '#579dd5',
    Johnson: '#6e4794',
    Stein: '#55c72c',
    lib: '#6e4794',
    grn: '#55c72c',
    rep: '#e03d46',
    dem: '#579dd5',
    l: '#6e4794',
    g: '#55c72c',
    r: '#e03d46',
    d: '#579dd5',
    leaningRep: '#f4a098',
    leaningDem: '#a2c1e1',
    swing: '#fcc83c',
    nodata: '#b0b0b0',
    nomapdata: '#b0b0b0',
    darkRep: '#934247',
    darkSwing: '#ac8845',
    darkDem: '#50708f',
};

queue('d3.v4.min.js', function() {
    var pollingInterval = 3000;
    window.setTimeout(function(){ //wait for 3 seconds
        window.setInterval(function(){  //load data every three seconds
            getData();
        }, pollingInterval); 
    }, pollingInterval);
});

function getData() {
    d3.json('full-result.json',function(data) {
        if(data.overview.timestamp > pageDataTimestamp){
            pageDataTimestamp = data.overview.timestamp;
            rebindMap(data);
            colourMap();


        }
    });
}

function rebindBarData(data) {

}

function rebindMap(data) {
    var lookupByCollegeID = makeLookup(data.electoralCollege, 'code');
    d3.selectAll('path.map-state')
        .each(function(){      
            var collegeID = d3.select(this).attr('id');
            d3.select(this).datum( lookupByCollegeID[collegeID.toLowerCase()] );
        });

    d3.selectAll('circle.college-vote')
        .each(function(){      
            var collegeID = d3.select(this).attr('id').split('_')[0];
            d3.select(this).datum( lookupByCollegeID[collegeID.toLowerCase()] );
        });
}

function colourMap(){
    d3.selectAll('path.map-state').transition()
        .style('fill',function(d){
            if ( d.winner ) return color[d.winner];
            return color.nomapdata;
        });

    d3.selectAll('circle.college-vote').transition()
        .style('fill',function(d){
            if ( d.winner ) return color[d.winner];
            return color.nomapdata;
        });
}

function makeLookup(arr,key){
    var o = {};
    arr.forEach(function(d){
        o[d[key]] = d;
    })
    return o;
}


