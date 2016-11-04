import { sanitiseInteger, percentOfVotes } from './util';

export default function processMediaSheet(rows) {
  return (rows || []).map((row, index) => {
    if (!row.name || !row.link) return null;
    const dem = sanitiseInteger(row.clinton, `Error in media org sheet, ${row.name} row, Clinton column`, true);
    const rep = sanitiseInteger(row.trump, `Error in media org sheet, ${row.name} row, Trump column`, true);
    const other = sanitiseInteger(row.other, `Error in media org sheet, ${row.name} row, Other column`, true);
    let dem_pct = percentOfVotes(dem);
    let rep_pct = percentOfVotes(rep);
    let other_pct = percentOfVotes(other);

    if (rep_pct + dem_pct > 100) {
     const dif = rep_pct+dem_pct - 100;
     dem_pct -= dif/2;
     rep_pct -= dif/2;
    }

    return {
      name: row.name,
      link: row.link,
      dem,
      rep,
      other,
      dem_pct,
      rep_pct,
      other_pct,

      // TODO: remove?
      dem_initial_pct: 0,
      rep_initial_pct: 0,
    };

  }).filter(Boolean);
}
