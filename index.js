var csv = require('csv-parse')
var fs = require('fs')
var path = require('path')
var through2 = require('through2')
var Trello = require('node-trello')

var file = process.argv[2]

var stream = csv({columns: true})
var readable = fs.createReadStream(file)
  .pipe(stream)
  .pipe(through2.obj(transform))
  .on('data', function (data) {
    console.log(data + "\n")
  })
  .on('error', function (err) {
    console.log("There is an error reading the csv file")
    console.log(err)
    console.log(1)
  })
  .on('end', function() {
    console.log("end of csv")
  })

function transform (chunk, enc, callback) {
  var row = []
  Object.keys(chunk).forEach(function (key) {
    !!chunk[key] ? row.push(chunk[key]) : continue 
  })

  // create item from chunk's keys; skip if chunk[key] is empty
  //var item = {
  //}
}

function createCard (item) {
  
}
