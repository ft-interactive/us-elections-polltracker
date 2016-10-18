//set polling frequency
function getData() {
    d3.json('full-result.json',function(data) {
        if(data.overview.timestamp > pageDataTimestamp){
            pageDataTimestamp = data.overview.timestamp;
            console.log('UPDATE');
            rebind(data);
            colourMap();
        }
    });
}

function rebind(data) {
    var lookupByCollegeID = makeLookup(data.electoralCollege, 'code');
    d3.selectAll('path.map-state')
        .each(function(datum){      
            var collegeID = d3.select(this).attr('id');
            d3.select(this).datum( lookupByCollegeID[collegeID.toLowerCase()] );
        });

    d3.selectAll('circle.college-vote')
        .each(function(datum){      
            var collegeID = d3.select(this).attr('id').split('_')[0];
            d3.select(this).datum( lookupByCollegeID[collegeID.toLowerCase()] );
        });
}

function colourMap(){
    d3.selectAll('path.map-state').transition().style('fill',function(d){
        return '#000';
    })
    d3.selectAll('circle.college-vote').transition().style('fill',function(d){
        return '#000';
    })
}

function makeLookup(arr,key){
    var o = {};
    arr.forEach(function(d){
        o[d[key]] = d;
    })
    return o;
}

queue('d3.v4.min.js', function() {
    var pollingInterval = 3000;
    window.setTimeout(function(){ 
        window.setInterval(function(){
            console.log('polling');
            getData();
        }, pollingInterval); 
    }, pollingInterval);
})
