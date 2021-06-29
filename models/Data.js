'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

//var userSchema = mongoose.Schema( {any:{}})

var dataSchema = Schema( {
  data: Schema.Types.Mixed,
  apikey: String,
} );

module.exports = mongoose.model( 'Data', dataSchema );
