---
title: APIs
---

### CASE EXPLORER REST API

The Case Explorer REST API allows you to query any of the tables in our database of over 22 million Maryland court cases dating back to 2000. The data was scraped from the [Maryland Judiciary Case Search](http://casesearch.courts.state.md.us/casesearch/) using the [Case Harvester](https://github.com/dismantl/CaseHarvester) software. The main table in the database is <code>cases</code>, which contains entries for all scraped cases of any format. For [case formats that have parsers available](https://github.com/dismantl/CaseHarvester/issues/10), you can see case details in secondary and tertiary tables (e.g. <code>dscr</code> and <code>dscr_charges</code>).

See a [schematic diagram of the database](https://disman.tl/caseharvester/relationships.html) to get a better understanding of how the tables are related.