//#! /usr/bin/env node

var csv      = require("csv-parse")
var fs       = require("fs")
var path     = require("path")
var through2 = requite("through2")
var Trello   = require("node-trello")

var file = process.argv[1]

var stream = csv({columns: true})
var readable = fs.createReadStream(file)
  .pipe(stream)
  .pipe(through2.obj(transform))
  .on('data', function (data) {
    process.stdout.write(data + "\n")
  })
  .on('error', function (err) {
    process.stdout.write("There is an error reading the csv file")
    process.stdout.write(err)
    process.exit(1)
  })

function transform (chunk, enc, callback) {
  var tags = []
  Object.keys(chunk).forEach(function (key) {
    process.stdout.write(chunk[key])
  })

  // create item from chunk's keys; skip if chunk[key] is empty
  var item = {
  }

  j
}

function createCard (item) {
  
}
