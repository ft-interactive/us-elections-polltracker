import axios from 'axios';

const resultURL = 'http://bertha.ig.ft.com/republish/publish/gss/17Ea2kjME9yqEUZfQHlPZNc6cqraBUGrxtuHj-ch5Lp4/events,electoralCollege,senate,house';

export default async function getResult() {
    return axios.get(resultURL)
        .then(response => {
            const processed = {};
            const totals = response.data.electoralCollege
                .reduce((previous, current) => {
                        let r = previous.r;
                        let d = previous.d;
                        let g = previous.g;
                        let l = previous.l;
                        let reported = previous.reported;

                        if(current.winner == 'r'){ r += current.ecvotes; }
                        if(current.winner == 'd'){ d += current.ecvotes; }
                        if(current.winner == 'g'){ g += current.ecvotes; }
                        if(current.winner == 'l'){ l += current.ecvotes; }
                        if(current.winner){ reported[current.code.substring(0,2)] = true; }

                        return { r, d, g, l, total:previous.total, reported:reported};
                    }, { r: 0, d: 0, g: 0, l:0, total: 538, reported:{} });

            processed.pollClosingTimes = response.data.events;
            processed.senate = response.data.senate[0];
            processed.house = response.data.house[0];
            processed.electoralCollege = response.data.electoralCollege;
            processed.ecTotals = totals;
            processed.overview = {
                time: new Date(),
                senate: response.data.senate[0].current,
                house: response.data.house[0].current,
                president: {
                    clinton: totals.d,
                    trump: totals.r,
                    clinton_pct: 100/totals.total * totals.d,
                    trump_pct: 100/totals.total * totals.r,
                    /*
                    bestGuessClinton: 245,
                    bestGuessTrump: 212,
                    bestGuessClinton_pct: 45.5,
                    bestGuessTrump_pct: 39.4, */
                    states_reporting:Object.keys(totals.reported).length,
                    isFinal: false
                },
            }

            return processed;
        });
}

/*overview

            'president': {
                'clinton': 90,
                'trump': 61,
                'clinton_pct': 1,
                'trump_pct': 1,
                'bestGuessClinton': 245,
                'bestGuessTrump': 212,
                'bestGuessClinton_pct': 45.5,
                'bestGuessTrump_pct': 39.4,
                'footnote': '(12 of 50 states reporting as of 9:28am)',
                'isFinal': false
            },
            'senate': {
                'dem': 35,
                'rep': 25,
                'ind': 1,
                'dem_contested': 9,
                'rep_contested': 20
            },
            'house': {
                'dem': 261,
                'dem_pct': 30,
                'rep': 174,
                'rep_pct': 40
            }

*/