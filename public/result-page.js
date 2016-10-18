//set polling frequency
function getData() {
  console.log('GET DATE');
    d3.json('full-result.json',function(d){
        if(d.overview.timestamp>timestamp){
            timestamp = d.overview.timestamp;
            console.log('ts');
        }
        console.log(timestamp);console.log(d);
    });
}

queue('d3.v4.min.js', function() {
  getData();
})
