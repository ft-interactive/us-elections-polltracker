import _ from 'lodash';
import axios from 'axios';
import Page from './page';
import stateReference from '../../data/states';

const states = stateReference.map(d => {
  const slug = _.kebabCase(d.name);
  return { ...d, slug };
});

const slugIndex = states.reduce((map, state) =>
        map.set(state.slug, state), new Map());

const codeIndex = states.reduce((map, state) =>
        map.set(state.code, state.slug), new Map());

class StatePage extends Page {
  constructor(state) {
    super();
    this.state = state;
    this.code = this.state.code;
    this.headline = `US election poll tracker: ${this.state.name}`;
    this.url = `${this.url}/${this.state.slug}-polls`;
  }

  async ready() {
    await this.pready();
  }
}

export function codeToSlug(code) {
  if (!code) return null;
  return codeIndex.get(code.toUpperCase());
}

const STREAM_INFO_URL = (process.env.STREAM_INFO_URL ||
                                'http://bertha.ig.ft.com/view/publish/gss/18N6Mk2-pyAsOjQl1BTMfdjt7zrcOy0Bbajg55wCXAX8/streampages');
let cachedRequest;

// TODO: replace with a fail stale poller
async function getStreamInfo() {
  if (cachedRequest) return cachedRequest;

  cachedRequest = axios.get(STREAM_INFO_URL, { timeout: 3000 })
          .then(response =>
            response.data.reduce((map, d) => map.set(d.state, d), new Map())
          )
          .catch(reason => {
            cachedRequest = null;
            if (reason && reason.code === 'ECONNABORTED') {
              return;
            }
            throw reason;
          });
  return cachedRequest;
}

export async function getBySlug(slug) {
  const state = slugIndex.get(slug);

  if (!state) return null;

  const streams = await getStreamInfo();
  const page = new StatePage(state);

  if (streams && streams.has(state.code)) {
    page.streamUrl = streams.get(state.code).link;
  }

  await page.ready();

  return page;
}

// TODO: shareTitle = `US presidential election polls: In ${stateName}, it's Clinton ${latestPollAverages.Clinton}%, Trump ${latestPollAverages.Trump}%`;
// TODO: UUID
// TODO: stateDemographics,

// const stateDemographicsData = require('./layouts/stateDemographics');
// get state demographics data
// const stateDemographics = [];
// const stateDemoKeys = ['wageGrowth2015', 'unemployment', 'poverty', 'graduates', 'hispanic', 'africanAmerican'];
// for (let i = 0; i < stateDemoKeys.length; i++) {
//   const stateDemoKey = stateDemoKeys[i];
//   stateDemographics.push({
//     category: stateDemographicsData.label[stateDemoKey],
//     stateValue: stateDemographicsData[state.toUpperCase()][stateDemoKey],
//     nationalValue: stateDemographicsData.US[stateDemoKey],
//     maxYVal: Math.max(stateDemographicsData[state.toUpperCase()][stateDemoKey], stateDemographicsData.US[stateDemoKey]),
//   });
// }
