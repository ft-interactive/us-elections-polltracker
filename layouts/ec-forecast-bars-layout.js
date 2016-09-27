import color from './color';

export default function (data, ancestorSelector = '.us-election-midriff-graphic') {
  const total = data.rep + data.leaningRep + data.dem + data.leaningDem + data.swing;

  return {
    ancestorSelector,
    includeStyles: true,
    proportion: {
      swing: (data.swing / total) * 100,
      rep: (data.rep / total) * 100,
      dem: (data.dem / total) * 100,
      leaningRep: (data.leaningRep / total) * 100,
      leaningDem: (data.leaningDem / total) * 100,
      totalRep: ((data.leaningRep + data.rep) / total) * 100,
      totalDem: ((data.leaningDem + data.dem) / total) * 100,
    },
    data,
    color,
  };
}
