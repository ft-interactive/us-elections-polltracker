import { scaleThreshold } from 'd3-scale';

export default scaleThreshold()
                            .range(['rep', 'leaningRep', 'swing', 'leaningDem', 'dem'])
                            .domain([-10.01, -5.01, 5.01, 10.01]);
