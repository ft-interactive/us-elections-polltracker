import { extent } from 'd3-array';
import { scaleLinear } from 'd3-scale';

export function formatToPercent(n) {
  return Math.round(n * 1000) / 10;
}

export default function layout(indicator) {
  if (!indicator.stateValue) return null;

  const chartConfig = {
    width: 325,
    height: 136,
    margin: {
      left: 15,
      right: 15,
      top: 30,
      bottom: 60,
    },
    contentWidth() {
      return this.width - (this.margin.left + this.margin.right);
    },
  };

  const [min, max] = indicator.domain;
  const range = [0, chartConfig.contentWidth()];
  const scale = scaleLinear().domain(indicator.domain).range(range);
  const flipLabelDirection = scale(indicator.stateValue) / scale(max) > 0.5;
  const stateLabelTextDirection = flipLabelDirection ? 'end' : 'start';

  console.log('Range', range);

  return {
    indicator,
    ...chartConfig,
    stateTicks: indicator.allStates.map(d => scale(d.value)),
    highlight: {
      value: `${formatToPercent(indicator.stateValue)}%`,
      position: scale(indicator.stateValue),
      textDirection: stateLabelTextDirection,
    },
    xTicks: [{
      label: 'min',
      value: `${formatToPercent(min)}%`,
      position: scale(min),
      fontWeight: 400,
    },
    {
      label: 'US',
      value: `${formatToPercent(indicator.nationalAvg)}%`,
      position: scale(indicator.nationalAvg),
      fontWeight: 500,
    },
    {
      label: 'max',
      value: `${formatToPercent(max)}%`,
      position: scale(max),
      fontWeight: 400,
    }],
  };
}
