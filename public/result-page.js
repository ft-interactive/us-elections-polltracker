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

queue('https://ig.ft.com/static/g-ui/libs/d3.v4.min.js', function() {
    var pollingInterval = 3000;
    window.setInterval(function(){  //load data every three seconds
        console.log('tick');
        getData();
    }, pollingInterval);
});

function getData() {
    d3.json('full-result.json',function(data) {
        if(data.overview.timestamp > pageDataTimestamp){
            pageDataTimestamp = data.overview.timestamp;
            rebindMap(data.electoralCollege);
            rebindBars(data.overview);
            rebindTable(data.electoralCollege);
            rebindCopy(data.copy);
            redraw();
        }
    });
}

function rebindCopy(data){
    d3.select('h1.o-typography-heading1').datum(data.headline);
    d3.select('p.o-typography-lead').datum(data.subtitle);
}

function rebindTable(data){
    var lookupByCollegeID = makeLookup(data, 'code');
    d3.selectAll('.ecresultslist tr')
        .each(function(){
            var selection = d3.select(this);
            if( selection.attr('id') ){
                var collegeID = d3.select(this).attr('id').split('-')[0];
                selection.select('.ecresultslist__cell--2016').datum( lookupByCollegeID[collegeID.toLowerCase()] );
            }
        });
}

function rebindBars(data) {
    //president
    d3.select('#president-bar-clinton')
        .datum(data.president.clinton_pct);
    d3.select('#president-bar-trump')
        .datum(data.president.trump_pct);

    d3.select('#president-datalabel-clinton')
        .datum(data.president.clinton);
    d3.select('#president-datalabel-trump')
        .datum(data.president.trump);

    //best guess
    d3.select('#president-bestguessbar-clinton')
        .datum(data.president.bestGuessClinton_pct);

    d3.select('#president-bestguessbar-trump')
        .datum(data.president.bestGuessTrump_pct);

    //house
    d3.select('#house-bar-dem')
        .datum(data.house.dem_pct);
    d3.select('#house-bar-rep')
        .datum(data.house.rep_pct);

    d3.select('#house-datalabel-dem')
        .datum(data.house.dem);
    d3.select('#house-datalabel-rep')
        .datum(data.house.rep);

    //senate
    d3.select('#senate-bar-dem')
        .datum(data.senate.dem_pct);
    d3.select('#senate-bar-ind')
        .datum(data.house.ind_pct);
    d3.select('#senate-bar-rep')
        .datum(data.senate.rep_pct);

    d3.select('#senate-datalabel-dem')
        .datum(data.senate.dem);
    d3.select('#senate-datalabel-rep')
        .datum(data.senate.rep);
}

function rebindMap(data) {
    var lookupByCollegeID = makeLookup(data, 'code');
    d3.selectAll('.standard-map path')
        .each(function(){
            var collegeID = d3.select(this).attr('id');
            if(collegeID){
                d3.select(this).datum( lookupByCollegeID[collegeID.toLowerCase()] );
            }
        });

    d3.selectAll('.ec-map circle')
        .each(function(){
            var collegeID = d3.select(this).attr('id').split('_')[0];
            if(collegeID){ 
                d3.select(this).datum( lookupByCollegeID[collegeID.toLowerCase()] );
            }
        });
}

function redraw(){
    //maps
    d3.selectAll('.standard-map path')
        .style('fill',function(d){
            if ( d && d.winner ) return color[d.winner];
            return 'none';
        })
        .style('stroke',function(d){
            if ( d && d.winner ) return 'none';
            return color.nomapdata;
        });

    d3.selectAll('.ec-map circle')
        .style('fill',function(d){
            if ( d && d.winner ) return color[d.winner];
            return 'none';
        })
        .style('stroke',function(d){
            if ( d && d.winner ) return 'none';
            return color.nomapdata;
        });

    //table
    d3.selectAll('.ecresultslist__cell--2016')
        .transition()
        .attr('class',function(d){
            if(d.winner == 'r') {
                return 'ecresultslist__cell--2016 ecresultslist__cell--rep';
            }else if (d.winner == 'd'){
                return 'ecresultslist__cell--2016 ecresultslist__cell--dem';
            }
        })
        .text(function(d){
            if(d.winner == 'r') {
                return 'Trump';
            }else if (d.winner == 'd'){
                return 'Clinton';
            }
        });

    //bars
    d3.selectAll('.data-bar')
        .style('width', function(d){
            return d+'%';
        });

    d3.selectAll('.data-label')
        .text(function(d){ return d; })

    //text 
    d3.select('h1.o-typography-heading1').text(function(d){ return d; });
    d3.select('p.o-typography-lead').text(function(d){ return d; })
}

function makeLookup(arr,key){
    var o = {};
    arr.forEach(function(d){
        o[d[key]] = d;
    })
    return o;
}
