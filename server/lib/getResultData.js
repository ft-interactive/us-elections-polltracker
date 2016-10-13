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
                        let guess_r = previous.guess_r;
                        let guess_d = previous.guess_d;
                        let g = previous.g;
                        let l = previous.l;
                        let reported = previous.reported;

                        if(current.winner == 'r'){ 
                            r += current.ecvotes; 
                            guess_r += current.ecvotes;
                        }else if(current.winner == 'd'){ 
                            d += current.ecvotes; 
                            guess_d += current.ecvotes;
                        }else if(current.winner == 'g'){ g += current.ecvotes; }
                        else if(current.winner == 'l'){ l += current.ecvotes; }
                        else if(current.leaning == 'r'){ guess_r += current.ecvotes; }
                        else if(current.leaning == 'd'){ guess_d += current.ecvotes; }

                        if(current.winner){ reported[current.code.substring(0,2)] = true; }

                        return { r, d, g, l, guess_d:guess_d, guess_r:guess_r, total:previous.total, reported:reported};
                    }, { r: 0, d: 0, g: 0, l:0, guess_d:0, guess_r:0, total: 538, reported:{} });

console.log(totals);

            processed.pollClosingTimes = response.data.events;
            processed.senate = response.data.senate[0];
            processed.house = response.data.house[0];
            processed.electoralCollege = response.data.electoralCollege;
            processed.ecTotals = totals;
            processed.overview = {
                timestamp: (new Date()).getTime(),
                senate: Object.assign({total:response.data.senate[0].total}, response.data.senate[0].current),
                house: Object.assign({total:response.data.house[0].total}, response.data.house[0].current),
                president: {
                    clinton: totals.d,
                    trump: totals.r,
                    clinton_pct: 100/ totals.total * totals.d,
                    trump_pct: 100/ totals.total * totals.r,
                    bestGuessClinton: totals.guess_d,
                    bestGuessTrump: totals.guess_r,
                    bestGuessClinton_pct: 100/ totals.total * totals.guess_d,
                    bestGuessTrump_pct: 100/ totals.total * totals.guess_r,
                    states_reporting: Object.keys(totals.reported).length,
                    isFinal: ( (totals.r + totals.d) === totals.total ),
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