var EventEmitter = require('events').EventEmitter
var util = require('util')
var Node = require('./node')

function Lem(db, options){
	EventEmitter.call(this)

	if(!db){
		throw new Error('db required')
	}

	options = options || {}
	options.sep = options.sep || '\xff'

	this._db = db
	this._options = options
}

util.inherits(Lem, EventEmitter)

module.exports = Lem

Lem.prototype.node = function(path){
	
}