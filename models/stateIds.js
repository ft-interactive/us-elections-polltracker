const states = [{ state: 'US', stateName: 'United States', raceId: 5491, ecVotes: 538 },
{ state: 'AL', stateName: 'Alabama', raceId: null, ecVotes: 9 },
{ state: 'AK', stateName: 'Alaska', raceId: 5884, ecVotes: 3 },
{ state: 'AZ', stateName: 'Arizona', raceId: 5832, ecVotes: 11 },
{ state: 'AR', stateName: 'Arkansas', raceId: 5899, ecVotes: 6 },
{ state: 'CA', stateName: 'California', raceId: 5849, ecVotes: 55 },
{ state: 'CO', stateName: 'Colorado', raceId: 5751, ecVotes: 9 },
{ state: 'CT', stateName: 'Connecticut', raceId: 5720, ecVotes: 7 },
{ state: 'DC', stateName: 'District of Columbia', raceId: null, ecVotes: 3 },
{ state: 'DE', stateName: 'Delaware', raceId: 5900, ecVotes: 3 },
{ state: 'FL', stateName: 'Florida', raceId: 5635, ecVotes: 29 },
{ state: 'GA', stateName: 'Georgia', raceId: 5741, ecVotes: 16 },
{ state: 'HI', stateName: 'Hawaii', raceId: null, ecVotes: 4 },
{ state: 'ID', stateName: 'Idaho', raceId: 5903, ecVotes: 4 },
{ state: 'IL', stateName: 'Illinois', raceId: 5583, ecVotes: 20 },
{ state: 'IN', stateName: 'Indiana', raceId: 5878, ecVotes: 11 },
{ state: 'IA', stateName: 'Iowa', raceId: 5597, ecVotes: 6 },
{ state: 'KS', stateName: 'Kansas', raceId: 5904, ecVotes: 6 },
{ state: 'KY', stateName: 'Kentucky', raceId: 5523, ecVotes: 8 },
{ state: 'LA', stateName: 'Louisiana', raceId: 5696, ecVotes: 8 },
{ state: 'ME', stateName: 'Maine', raceId: 5896, ecVotes: 1 }, // ///// don't forget to add two more for ME winner
{ state: 'MECD', stateName: 'Maine', raceId: 5897, ecVotes: 1 }, // /////
{ state: 'MD', stateName: 'Maryland', raceId: 5859, ecVotes: 10 },
{ state: 'MA', stateName: 'Massachusetts', raceId: 5863, ecVotes: 11 },
{ state: 'MI', stateName: 'Michigan', raceId: 5533, ecVotes: 16 },
{ state: 'MN', stateName: 'Minnesota', raceId: 5591, ecVotes: 10 },
{ state: 'MS', stateName: 'Mississippi', raceId: 5857, ecVotes: 6 },
{ state: 'MO', stateName: 'Missouri', raceId: 5609, ecVotes: 10 },
{ state: 'MT', stateName: 'Montana', raceId: null, ecVotes: 3 },
{ state: 'NE', stateName: 'Nebraska', raceId: null, ecVotes: 1 }, // ///// don't forget to add two more for NE winner
{ state: 'NECD', stateName: 'Nebraska', raceId: null, ecVotes: 1 }, // /////
{ state: 'NECD2', stateName: 'Nebraska', raceId: null, ecVotes: 1 }, // /////
{ state: 'NV', stateName: 'Nevada', raceId: 5891, ecVotes: 6 },
{ state: 'NH', stateName: 'New Hampshire', raceId: 5596, ecVotes: 4 },
{ state: 'NJ', stateName: 'New Jersey', raceId: 5872, ecVotes: 14 },
{ state: 'NM', stateName: 'New Mexico', raceId: 5894, ecVotes: 5 },
{ state: 'NY', stateName: 'New York', raceId: 5792, ecVotes: 29 },
{ state: 'NC', stateName: 'North Carolina', raceId: 5538, ecVotes: 15 },
{ state: 'ND', stateName: 'North Dakota', raceId: null, ecVotes: 3 },
{ state: 'OH', stateName: 'Ohio', raceId: 5634, ecVotes: 18 },
{ state: 'OK', stateName: 'Oklahoma', raceId: 5908, ecVotes: 7 },
{ state: 'OR', stateName: 'Oregon', raceId: 5892, ecVotes: 7 },
{ state: 'PA', stateName: 'Pennsylvania', raceId: 5633, ecVotes: 20 },
{ state: 'RI', stateName: 'Rhode Island', raceId: null, ecVotes: 4 },
{ state: 'SC', stateName: 'South Carolina', raceId: 5748, ecVotes: 9 },
{ state: 'SD', stateName: 'South Dakota', raceId: null, ecVotes: 3 },
{ state: 'TN', stateName: 'Tennessee', raceId: 5911, ecVotes: 11 },
{ state: 'TX', stateName: 'Texas', raceId: 5694, ecVotes: 38 },
{ state: 'UT', stateName: 'Utah', raceId: 5834, ecVotes: 6 },
{ state: 'VT', stateName: 'Vermont', raceId: 5912, ecVotes: 3 },
{ state: 'VA', stateName: 'Virginia', raceId: 5542, ecVotes: 13 },
{ state: 'WA', stateName: 'Washington', raceId: 5895, ecVotes: 12 },
{ state: 'WV', stateName: 'West Virginia', raceId: 5885, ecVotes: 5 },
{ state: 'WI', stateName: 'Wisconsin', raceId: 5659, ecVotes: 10 },
{ state: 'WY', stateName: 'Wyoming', raceId: null, ecVotes: 3 },
];

function makeLookup(a, key){
  const lookup = {};
  a.forEach(function(d){
    lookup[d[key]] = d;
  });
  return lookup;
}

module.exports = {
  states,
  byID: makeLookup(states, 'state'),
};
