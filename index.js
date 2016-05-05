var csv = require('csv-parse')
var fs = require('fs')
var path = require('path')
var through2 = require('through2')
var Trello = require('node-trello')

var file = process.argv[2]

var stream = csv({columns: true})
var readable = fs.createReadStream(file)
  .pipe(stream)
  .pipe(through2.obj(createCard))
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


function createCard (chunk, enc, callback) {
  var boardId

  var creds = getCreds()
  var trello = new Trello(creds.key, creds.token)

  trello.post('/1/boards', {name: 'CascadiaFest Sponsors'}, function (err, data) {
    if (err) throw (err)

    console.log(data)
  })
}

function getCreds () {
  var credsFile = path.join(__dirname, "./keys.json")
  var file = fs.readFileSync(credsFile) 

  return JSON.parse(file)
}
