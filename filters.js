import nunjucks from 'nunjucks';
const d3 = require('d3');
const _ = require('underscore');
const stateIds = require('./layouts/stateIds').states;

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
                  'September', 'October', 'November', 'December'];

export function ftdate(d) {
  const day = days[d.getUTCDay()];
  const month = months[d.getUTCMonth()];
  return !d ? '' : `${day}, ${d.getUTCDate()} ${month}, ${d.getUTCFullYear()}`;
}

export function commas(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function encodedJSON(str) {
  try {
    return encodeURIComponent(JSON.stringify(JSON.parse(str || ''), null, ''));
  } catch (e) {
    return '';
  }
}

export function spoorTrackingPixel(str) {
  const json = encodedJSON(str.trim());
  const img = `<img src="https://spoor-api.ft.com/px.gif?data=${json}" height="1" width="1" />`;

  /* Add this conditional comment before the <noscript> once Core/Enhanced is
     properley implemented:

     <!--[if lt IE 9]>
       ${img}
    <![endif]-->
  */
  return new nunjucks.runtime.SafeString(`<noscript data-o-component="o-tracking">${img}</noscript>`);
}

export function round1dp(n) {
  return Math.round(n * 10) / 10;
}

export function getClassificationFromMargin(margin) {
  const classification = d3.scaleThreshold()
    .range(['rep', 'leaningRep', 'swing', 'leaningDem', 'dem'])
    .domain([-10, -5, 5, 10]);

  return classification(margin);
}

export function toStateName(stateAbbreviation) {
  const fullStateName = _.findWhere(stateIds, { state: stateAbbreviation.toUpperCase() }).stateName;
  return fullStateName;
}

export function orderStatesByImportance(stateObj) {
  // convert object into array
  const orderedStatesPolls = [];
  const orderedStatesNoPolls = [];
  for (const key in stateObj) {
    if (stateObj.hasOwnProperty(key)) {
      if (stateObj[key].Clinton != null) {
        orderedStatesPolls.push([key, stateObj[key]]); // each item is an array in format [key, value]
      } else {
        orderedStatesNoPolls.push([key, stateObj[key]]);
      }
    }
  }

  // sort items with poll averages by value
  orderedStatesPolls.sort((a, b) => {
    if (Math.abs(0 - a[1].margin) !== Math.abs(0 - b[1].margin)) {
      return Math.abs(0 - a[1].margin) - Math.abs(0 - b[1].margin); // compare how close numbers are to 0
    }
    return Math.abs(0 - a[1].margin) - Math.abs(0 - b[1].margin) - ((a[1].ecVotes - b[1].ecVotes) / 100); // if equal distance to 0, sort by ecVotes
  });
  orderedStatesNoPolls.sort((a, b) => {
    if (toStateName(a[0]) < toStateName(b[0])) {
      return -1;
    } else if (toStateName(a[0]) > toStateName(b[0])) {
      return 1;
    }
    return 0;
  }); // sort alphabetically

  const allPolls = orderedStatesPolls.concat(orderedStatesNoPolls);

  // turn back into dictionary
  const newStateObj = {};
  for (let i = 0; i < allPolls.length; i++) {
    newStateObj[allPolls[i][0]] = allPolls[i][1];
  }

  // const stateArray = Object.keys(stateObj).map(key => ({ state: key, stateData: stateObj[key] }));
  // const allStates = stateArray.sort((a, b) => {
  //   console.log('a', a, 'b', b);
  //   if (a.stateData.Clinton !== null && b.stateData.Clinton !== null) {
  //     if (a.stateData.margin !== b.stateData.margin) {
  //       return Math.abs(0 - a.stateData.margin) > Math.abs(0 - b.stateData.margin);
  //     }
  //     return a.stateData.ecVotes > a.stateData.ecVotes;
  //   } else if (a.margin == null && b.margin == null) {
  //     return a.state - b.state;
  //   } else if (a.stateData.Clinton && b.stateData.Clinton == null) {
  //     return true;
  //   } else if (a.stateData.Clinton == null && b.stateData.Clinton) {
  //     return false;
  //   }
  //   return 0;
  // });
  // console.log(stateArray);


  return newStateObj;
}
