// insert code here

var
    Analyzer  = require('./lib/analyzer'),
    Dashboard = require('./lib/dashboard')
    ;

Analyzer.Dashboard = Dashboard;

module.exports = Analyzer;
