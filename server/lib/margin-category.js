import { scaleThreshold } from 'd3-scale';
import color from '../../layouts/color';

export const keyOrder = [
  'dem',
  'leaningDem',
  'swing',
  'leaningRep',
  'rep'
];

export const scale = scaleThreshold()
                            .range(keyOrder.concat().reverse())
                            .domain([-10.01, -5.01, 5.01, 10.01]);

export function category(margin) {
  return Number.isFinite(margin) ? scale(margin) : 'nodata';
}

export function categoryColor(margin) {
  return color[category(margin)];
}
