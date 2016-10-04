
// create data binding
// and add listeners
//add the results SVG


rebindData();
var originalValues = calculateTotals( d3.selectAll('tr.statelist-staterow').data() );
showTotals();


//add reset button
d3.select('#calculation-result')
    .append('div')
    .attr('class','calculator-reset-button')
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
                    if(row.datum().classification === switchPosition) switchPosition = 'swing';
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
    var barHeight = 20;
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
        .data([270,270,270])

    tickSelection.enter()
        .append('rect')
            .attr('class','tick')
        .merge(tickSelection).transition()
            .attr('x',0)
            .attr('y',function(d,i){
                return (i * (barHeight+barGap));
            })
            .attr('width',barScale)
            .attr('height',barHeight)
            .attr('fill','#fff1e0');

    var result = [{ label: 'Clinton', value: total.dem, winner: win(total.dem), color: '#579DD5', addition:(total.dem - originalValues.dem), },
            { label: 'Trump', value: total.rep, winner: win(total.rep), color: '#e03d46', addition:(total.rep - originalValues.rep) },
            { label: 'Up for grabs', value: total.swing, winner: false, color: '#fcc83c', addition:0 }];

    var barSelection = d3.select('svg.calculation-chart')
        .selectAll('g.calculation-chart--bar')
        .data(result);

    var victory = result.reduce(function(previous,current){
        if(current.winner) return current.label;
        return previous
    },false);

    barSelection.enter()
        .append('g')
            .attr('class',function(d,i){
                var c = 'calculation-chart--bar ';
                if(i==2) c +='calculation-chart--secondarytext';
                return c;
            })
            .attr('transform', function(d,i){return 'translate(0,' + (i * (barHeight+barGap)) + ')'; })
        .call(function(parent){
            parent.append('rect')
                .attr('height', barHeight)
                .attr('fill', function(d){ return d.color; });

            parent.append('text')
                .attr('class', 'calculation-chart--name')
                .attr('dy', barHeight-4);
            
            parent.append('text')
                .attr('class','calculation-chart--value')
                .attr('dy', barHeight-4);
            
            parent.append('text')
                .attr('class','calculation-chart--addition')
                .attr('dy', barHeight-4);

        })
        .merge(barSelection)
        .transition()
        .call(function(parent){
//            .calculation-chart--secondarytext
            parent.select('rect')
                .attr('width', function(d,i){ return barScale(d.value); })
                .attr('fill-opacity',function(d){
                    if(!victory) return 1;
                    if(d.label === victory) return 1;
                    if(d.label !== victory) return 0.3;
                });

            parent.select('text.calculation-chart--value')
                .attr('dx', function(d,i){ return Math.max(barScale(d.value), barScale(270))+10; })
                .text(function(d){ return d.value; });

            parent.select('text.calculation-chart--name')
                .attr('dx', 2)
                .text(function(d){
                    if(d.winner) return (d.label + ' wins!').toUpperCase();  
                    return d.label.toUpperCase(); });

            parent.select('text.calculation-chart--addition')
                .attr('dx', function(d,i){ return Math.max(barScale(d.value), barScale(270))+40; })
                .text(function(d){ if (d.addition) return '(' + sign(d.addition) + ')'; });
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

function sign(n){
    if(n>0) return '+' + String(n);
    return String(n);
}

var drawChart = debounce(function() {
  showTotals();
}, 125); //but wait atleast 125 ms before repeating this function

function stick(){
    var position = d3.select('.sticky').node().getBoundingClientRect();
    var parentPosition = d3.select('#statelist-table').node().getBoundingClientRect();
    var computedStyle = window.getComputedStyle(d3.select('#statelist-table').node());
    var innerWidth =  parseInt(computedStyle.width);

    if(parentPosition.bottom > 0 && parentPosition.top >= 0 || (parentPosition.bottom-position.height) < 0){
        d3.select('.sticky')
            .classed('stuck',false)
            .style('height', null)
            .style('width', null);

        d3.select('#placeholder')
            .style('display','none');

        showTotals();
    }else{
        d3.select('.sticky')
            .classed('stuck',true)
            .style('height', (position.height-1) + 'px'); //-1 becasue of the bottom border thickness 
            //.style('width', Math.min(parentPosition.width, innerWidth) + 'px');

        d3.select('#placeholder')
            .style('display','block')
            .style('height', position.height + 'px')
            .style('width', (position.width) + 'px');

        showTotals();            
    }
};

d3.select(window).on('resize', drawChart);
d3.select(window).on('scroll', stick);