/*global describe:true, it:true, before:true, after:true, beforeEach: true, afterEach:true */
'use strict';

var
	demand = require('must'),
	Numbat = require('../index')
	;

describe('analyzer', function()
{
	it('exports an analyzer', function()
	{
		Numbat.must.have.property('Analyzer');
		Numbat.Analyzer.must.be.a.function();
	});

	it('exports exports several rules', function()
	{
		Numbat.must.have.property('rules');
		Numbat.rules.must.be.an.object();
		Numbat.rules.must.have.property('Echo');
		Numbat.rules.Echo.must.be.a.function();
	});
});
