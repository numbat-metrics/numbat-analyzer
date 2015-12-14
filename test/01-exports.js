/*global describe:true, it:true, before:true, after:true, beforeEach: true, afterEach:true */
'use strict';

var
	demand = require('must'),
	Numbat = require('../index')
	;

describe('exports', function()
{
	it('exports an analyzer', function()
	{
		Numbat.must.have.property('Analyzer');
		Numbat.Analyzer.must.be.a.function();
	});
});
