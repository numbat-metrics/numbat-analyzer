# numbat-analyzer

An alerting engine for the numbat-powered metrics & monitoring system.

[![npm](http://img.shields.io/npm/v/numbat-analyzer.svg?style=flat)](https://www.npmjs.org/package/numbat-analyzer) [![Tests](http://img.shields.io/travis/numbat-metrics/numbat-analyzer.svg?style=flat)](http://travis-ci.org/numbat-metrics/numbat-analyzer) ![Coverage](http://img.shields.io/badge/coverage-46%25-red.svg?style=flat)    [![Dependencies](https://david-dm.org/numbat-metrics/numbat-analyzer.svg)](https://david-dm.org/numbat-metrics/numbat-analyzer)

## How to run

```
Usage: bin/run-server.js --listen localhost:3333 config.json

Options:
  -l, --listen  host:port pair to listen on            [default: "0.0.0.0:3337"]
  --silent      silence analyzer-specific logging     [boolean] [default: false]
  --version     show version information                               [boolean]
  -h, --help    Show help                                              [boolean]  
```

An example configuration file using the provided rules is in [examples/config.js](https://github.com/numbat-metrics/numbat-analyzer/blob/master/examples/config.js).


- processing rules are *duplex streams*
- probably a directory full of them that gets auto-reloaded? static on startup initially, though
- rules write out actionable items (alerts, new data, etc)
- sends generated events back to any configured output

Outgoing integrations:

- pagerduty
- slack messages (this is an existing output rule)


### What do rules look like?

- match & act
- calculate history & act on outlier
- presence-required
- absence-required
- automatic rules (deduced rules)

Example automatic rule: _heartbeats_. Once a heartbeat is received from a node, a rule requiring the presence of the heartbeat is generated. This rule is removed if a graceful shutdown event from that node arrives. If the heartbeat data times out, an alert is created.

All incoming data points may have a status field. If they have a status field, this is examined for nagios-style warning levels.

## Contributing

Yes, please do! See our [contributing guide](https://github.com/numbat-metrics/documentation/blob/master/contributing.md) for basic rules of engagement.

## License

ISC
