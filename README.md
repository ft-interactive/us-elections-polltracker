# US Elections Poll Tracker


Partially based on the [FT Brexit polling app](https://github.com/ft-interactive/brexit-polling).

A web service scraping data from Real Clear Politics' [historical averages polling data feed for the 2016 general election between Trump v Clinton](http://www.realclearpolitics.com/poll/race/5491/historical_data.xml) and publishing it as SVG charts.

The format for URLs looks like `/polls.svg?size=300x400&type=both&background=fff1e0&startDate=July 1, 2015&endDate=June 29, 2016&fontless=true&state=us`.

## Settings

|param|options|default|
|---|---|---|
|size|{number}x{number}|300x400|
|type|`line`, `area`|`line`|
|background|hexcode (don't include the hash)|<blank>|
|logo|`true`, `false`|`false`|
|startDate|Month day, year|July 1, 2015|
|endDate|Month day, year|<today's date>|
|fontless|`true`, `false`|`true`|
|state|two-letter state abbreviation, `us`|`us`|

## Running locally

- Requirements: node, git
- Clone repository
- `npm install`, `make watch`

## Licence
This software is published by the Financial Times under the [MIT licence](http://opensource.org/licenses/MIT).

Please note the MIT licence includes only the software, and does not cover any FT content made available using the software, which is copyright &copy; The Financial Times Limited, all rights reserved. For more information about re-publishing FT content, please contact our [syndication department](http://syndication.ft.com/).
