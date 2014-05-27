# numbat-dash

Dashboard/alert/monitor for the numbat-powered metrics system.

Information goes here.

## Development notes

- express web app for the page-serving part
- mostly it's a server that accepts data streams from hekad & processes them
- processing rules are javascript snippets
- probably a directory full of them that gets auto-reloaded? static on startup initially, though
- websockets/whatever to push updates from monitoring layer to the dashboard

- Incoming data ⇢ rules
- some rules ⇢ in-memory data caches ⇢ short-term graphs
- other rules ⇢ alerts
- alerts ⇢ outgoing integrations

Half of the above can happen in hekad. Hekad can then send the alerts/rollups to this app for display or other action. Separate responsibility: heka to analyze data, this app for display.

Implications:

- everything goes into InfluxDB: hekad output, operational actions, other human actions
- Dashboard needs to include both visual data (graphs) & current alert status
- data should probably get tagged with "how to display this" so a new stream of info from hekad can be displayed usefully sans config

Integrations:

- pagerduty
- slack messages


## License

ISC
