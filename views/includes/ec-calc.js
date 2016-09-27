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

showTotals();

function setState(stateCode, newPosition){
    console.log('switch ' + stateCode + ' to ' + newPosition);
    var selection = d3.selectAll('tr.statelist-staterow')
        .filter(function(d){
            return stateCode == d.statecode;
        });

    selection.datum()
        .classification = newPosition;
    //update row styles
    console.log( selection.attr('class') );
};

function showTotals(){
    var total = calculateTotals( d3.selectAll('tr.statelist-staterow').data() );
    d3.select('#calculation-result')
        .html('CLNTN: ' + total.dem + '<br>¯\\_(ツ)_/¯: ' + total.swing +  '<br>TRMP: ' + total.rep);
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