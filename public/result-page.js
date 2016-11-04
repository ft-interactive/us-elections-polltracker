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
    i: '#6e4794',
    leaningRep: '#f4a098',
    leaningDem: '#a2c1e1',
    swing: '#fcc83c',
    nodata: '#b0b0b0',
    nomapdata: '#e9decf',
    darkRep: '#934247',
    darkSwing: '#ac8845',
    darkDem: '#50708f',
};

queue('https://ig.ft.com/static/g-ui/libs/d3.v4.min.js', resultsMain);


function resultsMain(){
    var timer, defaultPollingInterval = 3000;
    function gotData(data) {
        
       if(data.overview.timestamp > pageDataTimestamp){
            pageDataTimestamp = data.overview.timestamp;
            rebindMap(data.electoralCollege);
            rebindBars(data.overview);
            rebindMediaOrgs(data.mediaOrgs);
            rebindTable(data.electoralCollege);
            rebindCopy(data.copy);
            rebindLabels(data.electoralCollege);
            redraw();
        }
        var nextInterval = data.overview.pollingInterval ? data.overview.pollingInterval : defaultPollingInterval;
        timer = window.setTimeout(function(){  //load data every three seconds
            d3.json('full-result.json', gotData);
        }, nextInterval);
    }

    d3.json('full-result.json', gotData);
}

function rebindLabels(data){
    data.forEach(function(d){
        d3.select('#map-label-'+d.code).datum(d.winner);
    });
}

function rebindCopy(data){
    if (data.headline) {
      d3.select('h1.o-typography-heading1').datum(data.headline);
    }
    d3.select('p.o-typography-lead').datum(data.subtitle);
}

function rebindTable(data){
    var lookupByCollegeID = makeLookup(data, 'code');
    d3.selectAll('.state-block')
        .each(function(){
            var code = this.dataset.statecode;
            d3.select(this).datum(lookupByCollegeID[code.toLowerCase()].winner);
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

function rebindMediaOrgs(data){
    data.forEach(function(d, i){
        var templateindex = i+1;
        d3.select('#mediaorg-' + templateindex + '-bar-dem').datum(d.dem_pct);
        d3.select('#mediaorg-' + templateindex + '-bar-rep').datum(d.rep_pct);
        d3.select('#mediaorg-' + templateindex + '-datalabel-dem').datum(d.dem);
        d3.select('#mediaorg-' + templateindex + '-datalabel-rep').datum(d.rep);
    })
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
            return color.nomapdata;
        })
        .style('stroke',function(d){
            if ( d && d.winner ) return 'none';
            return color.nomapdata;
        });
    //labels
    d3.selectAll('.state-annotations.standard-map text')
        .classed('result-label',function(d){ return d; })

    //table
    d3.selectAll('.state-block')
        .style('color',function(d){
            if(d) return '#FFF';
            return null;
        })
        .style('background-color',function(d){
            if (color[d]) return color[d];
            return color.nomapdata;
        })


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
