# US Elections Poll Tracker
---

Partially based on the [FT Brexit polling app](https://github.com/ft-interactive/brexit-polling).

A web service scraping data from Real Clear Politics' [historical averages polling data feed for the 2016 general election between Trump v Clinton](http://www.realclearpolitics.com/poll/race/5491/historical_data.xml) and publishing it as SVG charts.

The format for URLs looks like `/polls.svg?size=300x400&type=both&background=#fff1e0&startDate=July 1,2015&endDate=June 29, 2016&fontless=true`. 

Default settings:
- size: 300x400
- type: margins
- background: #fff1e0
- startDate: July 1, 2015 (as far back as the data goes)
- endDate: today
- fontless: true

## Running locally

- Requirements: node, git
- Clone repository
- `npm install`, `npm install nodemon`, `npm run dev`