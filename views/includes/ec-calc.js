var width=600, barHeight = 20, barGap = 5;
var height = 3*barHeight+barGap;

// create data binding
// and add listeners
d3.selectAll('tr.statelist-staterow')
    .each(function(){
        var row = d3.select(this);
        row.datum( Object.assign({}, this.dataset) );

        row.selectAll('.switch-button')
            .on('click', function(){
                var switchPosition = d3.select(this).attr('data-position');
                d3.event.preventDefault();
                setState(row.datum().statecode, switchPosition);
                showTotals();
                return false;
            });
    });

//add the results SVG
d3.select('#calculation-result')
    .append('svg')
        .attr('class','calculation-chart')
        .attr('width',width)
        .attr('height',height)
        .attr('viewBox','0 0 '+width+' '+height);

showTotals();

function setState(stateCode, newPosition){
    var selection = d3.selectAll('tr.statelist-staterow')
        .filter(function(d){
            return stateCode == d.statecode;
        });

    selection.datum()
        .classification = newPosition;
    //update row styles
    selection.classed('statelist-swing statelist-dem statelist-rep statelist-leaningDem statelist-leaningRep',false);
    selection.classed('statelist-'+newPosition, true);
};

function showTotals(){
    var barHeight = 20;
    var total = calculateTotals( d3.selectAll('tr.statelist-staterow').data() );
    function win(n){ return n>269; }

    var tickSelection = d3.select('svg.calculation-chart').selectAll('g.tick')
        .data([270])

    tickSelection.enter().append('g')
        .attr('class','tick')
        .attr('transform',function(d){return 'translate('+d+',0)'})
        .append('line')
            .attr('x1',0)
            .attr('y1',0)
            .attr('x2',0)
            .attr('y2',height)
            .attr('stroke','#000');

    var barSelection = d3.select('svg.calculation-chart')
        .selectAll('g.calculation-chart--bar')
        .data([
            { label:'Clinton', value:total.dem, winner:win(total.dem), color:'#579DD5' },
            { label:'Trump', value:total.rep, winner:win(total.rep), color:'#e03d46' },
            { label:'Up for grabs', value:total.swing, winner:false, color:'#fcc83c' }
        ]);

    barSelection.enter()
        .append('g')
            .attr('class','calculation-chart--bar')
            .attr('transform', function(d,i){return 'translate(0,' + (i * barHeight) + ')'; })
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
                .attr('width', function(d,i){ return d.value; });

            parent.select('text.calculation-chart--value')
                .attr('dx', function(d,i){ return d.value+4; })
                .text(function(d){ return d.value; });

            parent.select('text.calculation-chart--name')
                .attr('dx', function(d,i){ return d.value + 30; })
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

var totals = calculateTotals( d3.selectAll('tr.statelist-staterow').data() );