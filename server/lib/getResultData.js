import axios from 'axios';

const resultURL = 'http://bertha.ig.ft.com/republish/publish/gss/17Ea2kjME9yqEUZfQHlPZNc6cqraBUGrxtuHj-ch5Lp4/events,electoralCollege,senate,house';

export default async function getResult() {
    return axios.get(resultURL)
        .then(response => {
            const processed = {};
            const totals = response.data.electoralCollege
                .reduce((previous, current) => {
                        return {
                            rep: previous.rep + Number(current.rep),
                            dem: previous.dem + Number(current.dem),
                            ind: previous.ind + Number(current.ind),
                            total: previous.total,
                        };
                    }, { rep: 0, dem: 0, ind: 0, total: 538 });

            processed.senate = response.data.senate[0];
            processed.house = response.data.house[0];
            processed.electoralCollege = response.data.electoralCollege;
            processed.ecTotals = totals;

            return processed;
        });
}
