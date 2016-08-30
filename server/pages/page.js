import flags from '../../config/flags';

const onwardJourney = () => ({
  relatedContent: [
    { rows: 1, list: 'thing/N2UxNTM3MzItNWNlZC00MDc5LWI3ODUtYWNmZDA2YjE0MWE2-U2VjdGlvbnM=' },
    { rows: 1, list: 'list/graphics' },
    { rows: 1, list: 'list/highlights' },
  ],
});

const ads = {
  site: 'world',
  zone: 'us.and.canada',
  aboveHeader: true,
};

export default class Page {

  constructor() {
    this.id = 'some uuid';
    this.url = 'https://ig.ft.com/us-elections/';
    this.publishedDate = new Date();
    this.headline = 'This is the headline';
    // this.summary = 'This is the summary';
    this.title = 'Presidential polls 2016';
    this.description = 'Polling data for the 2016 US presidential election';
    this.flags = flags();
    this.onwardJourney = onwardJourney();

    this.forecastMapLayout = {
      width: 640,
      height: 380,
      FL: { fill: 'red' },
    };

    this.pollHistory = {
      lineCharts: {
        XL: `<svg class="poll" width="680" height="310" viewBox="0 0 680 310" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMinYMin meet" font-family="MetricWeb, sans-serif">

<style>
text{
    font-family: MetricWeb, sans-serif;
}
</style>

<g class="yAxis" transform="translate(35,10)" fill="none" font-size="10" font-family="sans-serif" text-anchor="end">

    <g class="tick" transform="translate(0,250)">
        <line stroke="#C3BCB0" stroke-dasharray="1,2" x2="555" y1="0.5" y2="0.5"></line>
        <text font-size="14px" fill="#6b6e68" x="0" y="0.5" dy=".32em" dx="-7">35</text>
    </g>

    <g class="tick" transform="translate(0,166.66666666666669)">
        <line stroke="#C3BCB0" stroke-dasharray="1,2" x2="555" y1="0.5" y2="0.5"></line>
        <text font-size="14px" fill="#6b6e68" x="0" y="0.5" dy=".32em" dx="-7">40</text>
    </g>

    <g class="tick" transform="translate(0,83.33333333333334)">
        <line stroke="#C3BCB0" stroke-dasharray="1,2" x2="555" y1="0.5" y2="0.5"></line>
        <text font-size="14px" fill="#6b6e68" x="0" y="0.5" dy=".32em" dx="-7">45</text>
    </g>

    <g class="tick" transform="translate(0,0)">
        <line stroke="#C3BCB0" stroke-dasharray="1,2" x2="555" y1="0.5" y2="0.5"></line>
        <text font-size="14px" fill="#6b6e68" x="0" y="0.5" dy=".32em" dx="-7">50</text>
    </g>

</g>
<g class="xAxis" transform="translate(35,260)" fill="none" font-size="10" font-family="sans-serif" text-anchor="middle">
    <line class="domain" stroke="#C3BCB0" x1="0" x2="555" y1="0.5" y2="0.5"></line>

    <g class="tick" transform="translate( 0 ,0)">
        <line stroke="#C3BCB0" y2="18" x1="0.5" x2="0.5"></line>
        <text font-size="14px" fill="#6b6e68" y="2" x="0.5" dy="18" text-anchor="start" transform="translate(-2, 18)">Jun  1, 2016</text>
    </g>

    <g class="tick" transform="translate( 555 ,0)">
        <line stroke="#C3BCB0" y2="18" x1="0.5" x2="0.5"></line>
        <text font-size="14px" fill="#6b6e68" y="2" x="0.5" dy="18" text-anchor="end" transform="translate(-2, 18)">Aug 29</text>
    </g>

    <g class="tick" transform="translate( 187.07865168539325 ,0)">
        <line stroke="#C3BCB0" y2="6" x1="0.5" x2="0.5"></line>
        <text font-size="14px" fill="#6b6e68" y="2" x="0.5" dy="1" text-anchor="start" transform="translate(-2, 18)">Jul</text>
    </g>

    <g class="tick" transform="translate( 380.39325842696627 ,0)">
        <line stroke="#C3BCB0" y2="6" x1="0.5" x2="0.5"></line>
        <text font-size="14px" fill="#6b6e68" y="2" x="0.5" dy="1" text-anchor="start" transform="translate(-2, 18)">Aug</text>
    </g>

</g>
<g class="plot" transform="translate(35,10)">

    <path d="M0,100L6.2,103.3L12.5,103.3L18.7,103.3L24.9,103.3L31.2,100L37.4,100L43.7,98.3L49.9,98.3L56.1,98.3L62.4,105L68.6,105L74.8,111.7L81.1,98.3L87.3,100L93.5,98.3L99.8,98.3L106,85L112.2,85L118.5,86.7L124.7,83.3L131,83.3L137.2,78.3L143.4,78.3L149.7,68.3L155.9,65L162.1,60L168.4,70L174.6,81.7L180.8,90L187.1,90L193.3,86.7L199.6,86.7L205.8,85L212,85L218.3,76.7L224.5,73.3L230.7,73.3L237,73.3L243.2,76.7L249.4,76.7L255.7,76.7L261.9,83.3L268.1,100L274.4,115L280.6,115L286.9,103.3L293.1,103.3L299.3,103.3L305.6,101.7L311.8,100L318,96.7L324.3,90L330.5,88.3L335.9,97.1L335.9,97.1L330.5,111.7L324.3,123.3L318,140L311.8,145L305.6,148.3L299.3,148.3L293.1,156.7L286.9,156.7L280.6,160L274.4,160L268.1,151.7L261.9,155L255.7,151.7L249.4,151.7L243.2,151.7L237,151.7L230.7,151.7L224.5,151.7L218.3,156.7L212,161.7L205.8,161.7L199.6,161.7L193.3,161.7L187.1,170L180.8,170L174.6,183.3L168.4,183.3L162.1,173.3L155.9,176.7L149.7,178.3L143.4,176.7L137.2,176.7L131,180L124.7,180L118.5,185L112.2,181.7L106,181.7L99.8,195L93.5,195L87.3,193.3L81.1,190L74.8,186.7L68.6,180L62.4,180L56.1,161.7L49.9,161.7L43.7,150L37.4,133.3L31.2,133.3L24.9,128.3L18.7,128.3L12.5,128.3L6.2,128.3L0,125Z" fill="#579dd5" fill-opacity="0.3"></path>

    <path d="M335.9,97.1L336.7,98.3L343,88.3L349.2,90L355.4,88.3L361.7,95L361.7,95L355.4,73.3L349.2,71.7L343,73.3L336.7,95L335.9,97.1Z" fill="#e03d46" fill-opacity="0.3"></path>

    <path d="M361.7,95L361.7,95L367.9,105L374.2,91.7L380.4,68.3L386.6,60L392.9,45L399.1,43.3L405.3,45L411.6,45L417.8,41.7L424,45L430.3,36.7L436.5,33.3L442.8,43.3L449,41.7L455.2,36.7L461.5,36.7L467.7,36.7L473.9,38.3L480.2,46.7L486.4,50L492.6,46.7L498.9,50L505.1,53.3L511.3,50L517.6,50L523.8,46.7L530.1,38.3L536.3,28.3L542.5,26.7L548.8,28.3L555,26.7L555,128.3L548.8,128.3L542.5,131.7L536.3,128.3L530.1,138.3L523.8,136.7L517.6,141.7L511.3,141.7L505.1,141.7L498.9,145L492.6,146.7L486.4,146.7L480.2,146.7L473.9,150L467.7,150L461.5,150L455.2,150L449,146.7L442.8,158.3L436.5,161.7L430.3,168.3L424,165L417.8,158.3L411.6,160L405.3,158.3L399.1,156.7L392.9,140L386.6,133.3L380.4,133.3L374.2,110L367.9,111.7L361.7,95L361.7,95Z" fill="#579dd5" fill-opacity="0.3"></path>



    <path class="candidateLine" d="M0,125L6.2,128.3L12.5,128.3L18.7,128.3L24.9,128.3L31.2,133.3L37.4,133.3L43.7,150L49.9,161.7L56.1,161.7L62.4,180L68.6,180L74.8,186.7L81.1,190L87.3,193.3L93.5,195L99.8,195L106,181.7L112.2,181.7L118.5,185L124.7,180L131,180L137.2,176.7L143.4,176.7L149.7,178.3L155.9,176.7L162.1,173.3L168.4,183.3L174.6,183.3L180.8,170L187.1,170L193.3,161.7L199.6,161.7L205.8,161.7L212,161.7L218.3,156.7L224.5,151.7L230.7,151.7L237,151.7L243.2,151.7L249.4,151.7L255.7,151.7L261.9,155L268.1,151.7L274.4,160L280.6,160L286.9,156.7L293.1,156.7L299.3,148.3L305.6,148.3L311.8,145L318,140L324.3,123.3L330.5,111.7L336.7,95L343,73.3L349.2,71.7L355.4,73.3L361.7,95L367.9,111.7L374.2,110L380.4,133.3L386.6,133.3L392.9,140L399.1,156.7L405.3,158.3L411.6,160L417.8,158.3L424,165L430.3,168.3L436.5,161.7L442.8,158.3L449,146.7L455.2,150L461.5,150L467.7,150L473.9,150L480.2,146.7L486.4,146.7L492.6,146.7L498.9,145L505.1,141.7L511.3,141.7L517.6,141.7L523.8,136.7L530.1,138.3L536.3,128.3L542.5,131.7L548.8,128.3L555,128.3" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" fill="none" stroke="#e03d46"></path>

    <path class="candidateLine" d="M0,100L6.2,103.3L12.5,103.3L18.7,103.3L24.9,103.3L31.2,100L37.4,100L43.7,98.3L49.9,98.3L56.1,98.3L62.4,105L68.6,105L74.8,111.7L81.1,98.3L87.3,100L93.5,98.3L99.8,98.3L106,85L112.2,85L118.5,86.7L124.7,83.3L131,83.3L137.2,78.3L143.4,78.3L149.7,68.3L155.9,65L162.1,60L168.4,70L174.6,81.7L180.8,90L187.1,90L193.3,86.7L199.6,86.7L205.8,85L212,85L218.3,76.7L224.5,73.3L230.7,73.3L237,73.3L243.2,76.7L249.4,76.7L255.7,76.7L261.9,83.3L268.1,100L274.4,115L280.6,115L286.9,103.3L293.1,103.3L299.3,103.3L305.6,101.7L311.8,100L318,96.7L324.3,90L330.5,88.3L336.7,98.3L343,88.3L349.2,90L355.4,88.3L361.7,95L367.9,105L374.2,91.7L380.4,68.3L386.6,60L392.9,45L399.1,43.3L405.3,45L411.6,45L417.8,41.7L424,45L430.3,36.7L436.5,33.3L442.8,43.3L449,41.7L455.2,36.7L461.5,36.7L467.7,36.7L473.9,38.3L480.2,46.7L486.4,50L492.6,46.7L498.9,50L505.1,53.3L511.3,50L517.6,50L523.8,46.7L530.1,38.3L536.3,28.3L542.5,26.7L548.8,28.3L555,26.7" stroke-width="2px" stroke-linejoin="round" stroke-linecap="round" fill="none" stroke="#579dd5"></path>



    <circle class="lastpointlabel" cx="555" cy="128.3" r="3" fill="#e03d46"></circle>
    <text font-size="14px" class="lastpointtext" transform="translate(565,138.3)" fill="#e03d46">
        <tspan style="font-weight: 600;">42.3</tspan>
        <tspan>Trump</tspan>
    </text>

    <circle class="lastpointlabel" cx="555" cy="26.7" r="3" fill="#579dd5"></circle>
    <text font-size="14px" class="lastpointtext" transform="translate(565,26.7)" fill="#579dd5">
        <tspan style="font-weight: 600;">48.4</tspan>
        <tspan>Clinton</tspan>
    </text>



</g>

</svg>`,
        L: '<svg><text>L LINE CHART</text></svg>',
        M: '<svg><text>M LINE CHART</text></svg>',
        S: '<svg><text>S LINE CHART</text></svg>',
        default: '<svg><text>default LINE CHART</text></svg>',
      },
      list: [
        {
          Clinton: 100,
          Trump: 50,
          date: '01/01/2016',
          pollster: 'POLLSTER',
          sampleSize: 100,
          winner: true,
        },
        {
          Clinton: 100,
          Trump: 50,
          date: '01/01/2016',
          pollster: 'POLLSTER',
          sampleSize: 100,
          winner: true,
        },{
          Clinton: 100,
          Trump: 50,
          date: '01/01/2016',
          pollster: 'POLLSTER',
          sampleSize: 100,
          winner: true,
        },
      ],
    };
  }

  tracking = {
    micrositeName: 'us-elections',
  };

  topic = {
    name: 'US Election 2016',
    url: '//www.ft.com/us-election-2016',
  };

  ads = ads;

  introText = 'This is the intro text **with _markdown_**\n\nanother paragraph'

}
