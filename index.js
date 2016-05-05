var csv = require('csv-parse')
var fs = require('fs')
var path = require('path')
var through2 = require('through2')
var Trello = require('node-trello')

var file = process.argv[2]

var stream = csv({columns: true})

// create a readable file stream
var readable = fs.createReadStream(file)
  .pipe(stream)
  .pipe(through2.obj(createTrello))
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


// ok, let's do some trello things;
var idBoard, idList, boardURL, newCard, idCard

function createTrello (chunk, enc, callback) {
  // thing we need to create a list, and then cards

  var creds = getCreds()
  var trello = new Trello(creds.key, creds.token)

  // let's create a new board
  trello.post('/1/boards', {name: 'test12'}, function (err, data) {
    if (err) throw err
    idBoard = data.id
    boardURL = data.url
    console.log(`${data.name} successfully created. Check ${data.url} for awesome details`)
  })

  // let's create a new list
  trello.post('/1/lists', {name: 'test213', idBoard: idBoard}, function (err, data) {
    if (err) throw err
    console.log(`${data.name} successfully created. Check ${data.url} for awesome details`)
    idList = data.id
  })

  // let's create some cards based on 
  Object.keys.forEach(chunk, function (key) {

    newCard = {
      name: chunk['Company'],
      //idList: idList,
      desc: [
        `**key**   ${chunk['Company']}`,
        `**`
      ].join("\b")
      pos: checkIfAlum(chunk['Alum?'])
    }

    trello.post('/1/cards', newCard, function (err, data) {
      if (err) throw err

      idCard = data.id
      console.log(`${data.name} successfully created. Check ${data.url} for awesome details`)

    })
  })

}

function creationCallback (err, data) {

}

function getCreds () {
  var credsFile = path.join(__dirname, "./keys.json")
  var file = fs.readFileSync(credsFile)

  return JSON.parse(file)
}

function checkIfAlum (alum) {
  var position = alum === "Y" ? 'top' : 'bottom'
  return position
}
