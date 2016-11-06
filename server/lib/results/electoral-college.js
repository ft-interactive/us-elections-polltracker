const partyCodes = {
  'R': 'r',
  'LR':'r',
  'D': 'd',
  'LD': 'd',
  'I': 'i',
  'IND': 'i',
  'G': 'i',
  'GRN': 'i',
  'L': 'i',
  'LIB': 'i',
};

export function cleanWinnerCode(value) {
  if (!value || value === '-') return null;
  // Make this case insensitive
  const cleanValue = value.toString().trim().toUpperCase();
  return cleanValue && cleanValue in partyCodes ? partyCodes[cleanValue] : null;
}

const projectionCodes = {
  'R': 'R',
  'LR':'LR',
  'D': 'D',
  'LD': 'LD',
  'I': 'T',
  'IND': 'T',
  'G': 'T',
  'GRN': 'T',
  'L': 'T',
  'LIB': 'T',
  'T': 'T',
};

export function cleanProjectionCode(value) {
  if (!value) return null;
  // Make this case insensitive
  const cleanValue = value.toString().trim().toUpperCase();
  return cleanValue && cleanValue in projectionCodes ? projectionCodes[cleanValue] : null;
}

function createStateRow(row) {
  // Handle bad spreadsheet rows
  if (!row || !row.code) return null;
  const winner = cleanWinnerCode(row.winner);
  const liveestimate = cleanProjectionCode(row.liveestimate);
  return {
    ...row,
    winner: cleanWinnerCode(row.winner),
    pollingprojection: cleanProjectionCode(row.pollingprojection),
    liveestimate: cleanProjectionCode(row.liveestimate),
  });
}

export function processElectoralCollegeSheet(rows) {
  // filter out bad rows
  const polities = (rows || []).map(createStateRow).filter(Boolean);
  // TODO: check there's the correct number of rows and if so find which are missing
  return polities;
}
