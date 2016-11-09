const color = {
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
  nomapdata: '#cec6b9',
  darkRep: '#934247',
  darkSwing: '#ac8845',
  darkDem: '#50708f',
};

queue('https://ig.ft.com/static/g-ui/libs/d3.v4.min.js', resultsMain);

const maxRetries = 3;
let retryCount = 0;

function resultsMain() {
  function gotData(data) {
    // data will be null if the request fails/timesout
    // start with the pollInterval off (null/undefined is off)
    let pollInterval;
    try {
      if (!data) throw new Error('Could not get data');
      if (data.overview.timestamp > window.pageDataTimestamp) {
        window.pageDataTimestamp = data.overview.timestamp;
        rebindMap(data.electoralCollege);
        rebindBars(data.overview);
        rebindMediaOrgs(data.mediaOrgs);
        rebindTable(data.electoralCollege);
        rebindCopy(data.copy);
        rebindLabels(data.electoralCollege);
        redraw();

        updateStateResults(data);
      }
      if (data.overview.pollingInterval) {
        pollInterval = data.overview.pollingInterval;
      }
      retryCount = 0;
    } catch (err) {
      retryCount++;
      // If it failed something might be wrong so back off for a while
      // Perhaps the service is overloaded or there's a problem with the data
      if (retryCount <= maxRetries) {
        pollInterval = 30 * 1000; // 30 secs
      }
      window.console && console.error && console.error(err);
    }

    // We must have a pollInterval over 1 sec to allow polling
    // any less is too frequent... the data doesn't change that quickly
    if (pollInterval >= 1000) {
      setTimeout(resultsMain, pollInterval);
    }
  }

  d3.json('full-result.json', gotData);
}

function rebindLabels(data) {
  data.forEach((d) => {
    d3.select(`#map-label-${d.code.toLowerCase()}`).datum(d.winner);
  });
}

function rebindCopy(data) {
  if (data.headline) {
    d3.select('h1.o-typography-heading1').datum(data.headline);
  }else {
    const existingHeadline = d3.select('h1.o-typography-heading1').html();
    d3.select('h1.o-typography-heading1').datum(existingHeadline);
  }
  if (data.subtitle) {
    d3.select('.o-typography-lead').datum(data.subtitle);
  }else {
    const existingSub = d3.select('p.o-typography-lead').html();
    d3.select('.o-typography-lead').datum(existingSub);
  }

  if (data.mapfootnote) {
    d3.select('.map__footnote').datum(data.mapfootnote);
  } else{
    const existingFootnote = d3.select('.map__footnote').html();
    d3.select('.map__footnote').datum(existingFootnote);
  }
}

function rebindTable(data) {
  const lookupByCollegeID = makeLookup(data, 'code');
  d3.selectAll('.state-block')
      .each(function bindTableData() {
        const code = this.dataset.statecode;
        d3.select(this).datum(lookupByCollegeID[code.toLowerCase()].winner);
      });
}


function rebindBars(data) {
  // president
  d3.select('#president-bar-clinton')
      .datum(data.president.clinton_pct);
  d3.select('#president-bar-trump')
      .datum(data.president.trump_pct);

  d3.select('#president-datalabel-clinton')
      .datum(data.president.clinton);
  d3.select('#president-datalabel-trump')
      .datum(data.president.trump);

  // best guess
  d3.select('#president-bestguessbar-clinton')
      .datum(data.president.bestGuessClinton_pct);

  d3.select('#president-bestguessbar-trump')
      .datum(data.president.bestGuessTrump_pct);

  // house
  d3.select('#house-bar-dem')
      .datum(data.house.dem_pct);
  d3.select('#house-bar-rep')
      .datum(data.house.rep_pct);

  d3.select('#house-datalabel-dem')
      .datum(data.house.dem);
  d3.select('#house-datalabel-rep')
      .datum(data.house.rep);

  // senate
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

function rebindMediaOrgs(data) {
  data.forEach((d, i) => {
      const templateindex = i + 1;
      d3.select(`#mediaorg-${ templateindex }-bar-dem`).datum(d.dem_pct);
      d3.select(`#mediaorg-${ templateindex }-bar-rep`).datum(d.rep_pct);
      d3.select(`#mediaorg-${ templateindex }-datalabel-dem`).datum(d.dem);
      d3.select(`#mediaorg-${ templateindex }-datalabel-rep`).datum(d.rep);
  });
}

function rebindMap(data) {
  const lookupByCollegeID = makeLookup(data, 'code');
  d3.selectAll('.standard-map path')
      .each(function assignMapValue() {
        const collegeID = d3.select(this).attr('id');
        if (collegeID) {
          d3.select(this).datum(lookupByCollegeID[collegeID.toLowerCase()]);
        }
      });

  d3.selectAll('.ec-map circle')
      .each(function assignECValue() {
        const collegeID = d3.select(this).attr('id').split('_')[0];
        if (collegeID) {
          d3.select(this).datum(lookupByCollegeID[collegeID.toLowerCase()]);
        }
      });
}

function updateStateResults({ electoralCollege }) {
  let clintonTotal = 0
  let trumpTotal = 0;

  electoralCollege.forEach(state => {
    [...document.querySelectorAll(`[data-statecode=${state.code.toUpperCase()}]`)].forEach(el => {
      el.style.backgroundColor = color[state.winner ? state.winner.toLowerCase() : color.nodata]; // eslint-disable-line no-param-reassign

      // hack to fix text colour
      const child = el.firstElementChild;
      if (child) child.style.color = state.winner ? '#fff' : '#000';
    });

    switch (state.winner && state.winner.toLowerCase()) {
      case 'd':
        clintonTotal += state.ecvotes;
        break;
      case 'r':
        trumpTotal += state.ecvotes;
        break;
      default:
    }
  });

  const clintonTotalEl = document.querySelector('.state-results__total--Clinton');
  if (clintonTotalEl) clintonTotalEl.textContent = clintonTotal;

  const trumpTotalEl = document.querySelector('.state-results__total--Trump');
  if (trumpTotalEl) trumpTotalEl.textContent = trumpTotal;
}

function redraw() {
  // maps
  d3.selectAll('.standard-map path')
      .style('fill', (d) => {
        if (d && d.winner) return color[d.winner];
        return 'none';
      })
      .style('stroke', (d) => {
        if (d && d.winner) return 'none';
        return color.nomapdata;
      });

  d3.selectAll('.ec-map circle')
      .attr('fill', (d) => {
        if (d && d.winner) return color[d.winner];
        return color.nomapdata;
      })
      .attr('stroke', (d) => {
        if (d && d.winner) return 'none';
        return color.nomapdata;
      })
      .style('fill', (d) => {
        if (d && d.winner) return color[d.winner];
        return color.nomapdata;
      })
      .style('stroke', (d) => {
        if (d && d.winner) return 'none';
        return color.nomapdata;
      });
  // labels
  d3.selectAll('.state-annotations.standard-map text')
      .classed('result-label', d => d);

  // table
  d3.selectAll('.state-block')
      .style('color', (d) => {
        if (d) return '#FFF';
        return null;
      })
      .style('background-color', (d) => {
        if (color[d]) return color[d];
        return color.nomapdata;
      });

  // bars
  d3.selectAll('.data-bar')
      .style('width', d => `${d}%`);

  d3.selectAll('.data-label')
      .text(d => d);

  // text
  d3.select('h1.o-typography-heading1').html(d => d);
  d3.select('.o-typography-lead').html(d => d);
  d3.select('.map__footnote').html(d => d);
}

function makeLookup(arr, key) {
  const o = {};
  arr.forEach((d) => { o[d[key]] = d; });
  return o;
}
