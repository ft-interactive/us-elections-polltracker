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

                        if(current.winner == 'r'){ r += current.ecvotes; }
                        if(current.winner == 'd'){ d += current.ecvotes; }
                        if(current.winner == 'g'){ g += current.ecvotes; }
                        if(current.winner == 'l'){ l += current.ecvotes; }
                        return { r, d, g, l, total:previous.total};
                    }, { r: 0, d: 0, g: 0, l:0, total: 538 });

            processed.pollClosingTimes = response.data.events;
            processed.senate = response.data.senate[0];
            processed.house = response.data.house[0];
            processed.electoralCollege = response.data.electoralCollege;
            processed.ecTotals = totals;

            return processed;
        });
}
