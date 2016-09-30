
// create data binding
// and add listeners
//add the results SVG
    
rebindData();
showTotals();

//add reset button
d3.select('#calculation-result')
    .append('div')
    .append('a')
    .text('RESET')
    .on('click',function(){
        rebindData();
        reclassTable();
        showTotals();
    });

function rebindData(){
    d3.selectAll('tr.statelist-staterow')
        .each(function(){
            var row = d3.select(this);
            row.datum( {
                classification:this.dataset.classification,
                ecvotes:this.dataset.ecvotes,
                margin:this.dataset.margin,
                statecode:this.dataset.statecode,
            } );//the object assign method doesn't work in safari :(
            row.selectAll('.switch-button')
                .on('click', function(){
                    var switchPosition = d3.select(this).attr('data-position');
                    d3.event.preventDefault();
                    setState(row.datum().statecode, switchPosition);
                    reclassTable();
                    showTotals();
                    return false;
                });
        });
}

function setState(stateCode, newPosition){
    var selection = d3.selectAll('tr.statelist-staterow')
        .filter(function(d){
            return stateCode == d.statecode;
        });

    selection.datum()
        .classification = newPosition;
};

function reclassTable(){
    d3.selectAll('.statelist-staterow')
        .each(function(d){
            d3.select(this)
                .classed('statelist-swing statelist-dem statelist-rep statelist-leaningDem statelist-leaningRep', false)
                .classed('statelist-'+d.classification, true);                
        })


}

function showTotals(){
    var barHeight = 15;
    var barGap = 5;
    var height = 3*(barHeight+barGap)-barGap;
    var size = d3.select('#calculation-result').node().getBoundingClientRect();
    var barScale = d3.scaleLinear()
        .domain([0, 538])
        .range([0, size.width]);

    var total = calculateTotals( d3.selectAll('tr.statelist-staterow').data() );
    
    function win(n){ return n>269; }

    d3.select('#calculation-result')
        .selectAll('svg').data([0]).enter()
        .append('svg')
            .attr('class','calculation-chart')
            .attr('height',height);

    d3.select('svg.calculation-chart')
        .attr('width', size.width);

    var tickSelection = d3.select('svg.calculation-chart').selectAll('rect.tick')
        .data([270])

    tickSelection.enter()
        .append('rect')
            .attr('class','tick')
        .merge(tickSelection).transition()
            .attr('x',0)
            .attr('y',0)
            .attr('width',barScale)
            .attr('height',height)
            .attr('fill','#f6e9d8');

    var result = [{ label: 'Clinton', value: total.dem, winner: win(total.dem), color: '#579DD5' },
            { label: 'Trump', value: total.rep, winner: win(total.rep), color: '#e03d46' },
            { label: 'Up for grabs', value: total.swing, winner: false, color: '#fcc83c' },];

    var barSelection = d3.select('svg.calculation-chart')
        .selectAll('g.calculation-chart--bar')
        .data(result);

    var victory = result.reduce(function(previous,current){
        if(current.winner) return current.label;
        return previous
    },false);

    barSelection.enter()
        .append('g')
            .attr('class','calculation-chart--bar')
            .attr('transform', function(d,i){return 'translate(0,' + (i * (barHeight+barGap)) + ')'; })
        .call(function(parent){
            parent.append('rect')
                .attr('height', barHeight)
                .attr('fill',function(d){ return d.color; });

            parent.append('text')
                .attr('class', 'calculation-chart--name')
                .attr('dy', barHeight-4);
            
            parent.append('text')
                .attr('class','calculation-chart--value')
                .attr('dy', barHeight-4);
        })
        .merge(barSelection)
        .transition()
        .call(function(parent){
            parent.select('rect')
                .attr('width', function(d,i){ return barScale(d.value); })
                .attr('fill-opacity',function(d){
                    if(!victory) return 1;
                    if(d.label === victory) return 1;
                    if(d.label !== victory) return 0.3;
                });

            parent.select('text.calculation-chart--value')
                .attr('dx', function(d,i){ return Math.max(barScale(d.value), barScale(270))+4; })
                .text(function(d){ return d.value; });

            parent.select('text.calculation-chart--name')
                .attr('dx', function(d,i){ 
                    return Math.max(barScale(d.value), barScale(270)) + 30; 
                })
                .text(function(d){
                    if(d.winner) return d.label + ' wins!';  
                    return d.label; });
        });
}

function calculateTotals(data){
    return data.reduce(function(previous,current){
        if (current.classification == 'swing') {
            previous.swing += parseInt(current.ecvotes);
        }
        if (current.classification == 'leaningDem' || current.classification == 'dem') {
            previous.dem += parseInt(current.ecvotes);
        }
         if (current.classification == 'leaningRep' || current.classification == 'rep') {
            previous.rep += parseInt(current.ecvotes);
        }
        return previous;
    },{dem:0, rep:0, swing:0});
}

var debounce = function(fn, timeout) {
  var timeoutID = -1;
  return function() {
    if (timeoutID > -1) {
      window.clearTimeout(timeoutID);
    }
    timeoutID = window.setTimeout(fn, timeout);
  }
};

var drawChart = debounce(function() {
  showTotals();
}, 125); //but wait atleast 125 ms before repeating this function

var stick = debounce(function(d){
    console.log('d',d)
    console.log('scroll',document.documentElement.scrollTop);
})

d3.select(window).on('resize', drawChart);
d3.select(window).on('scroll', stick);