var csv = require('csv-parse')
var fs = require('fs')
var path = require('path')
var through2 = require('through2')
var Trello = require('node-trello')

var file = process.argv[2]

var stream = csv({columns: true})

// ok, let's do some trello things;
var idBoard, idList, boardURL, newCard, idCard, comments

// thing we need to create a list, and then cards

var creds = getCreds()
var trello = new Trello(creds.key, creds.token)

createBoard()
createList()


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

function createBoard () {
  // let's create a new board
  trello.post('/1/boards', {name: 'Cascadia Sponsorship'}, function (err, data) {
    if (err) console.log(err)
    idBoard = data.id
    boardURL = data.url
    console.log(`${data.name} successfully created. Check ${data.url} for awesome details`)
  })
}

function createList () {
  // let's create a new list
  trello.post('/1/lists', {name: 'Backlog', idBoard: idBoard}, function (err, data) {
    if (err) console.log(err)
    console.log(`${data.name} successfully created. Check ${data.url} for awesome details`)
    idList = data.id
  })
}

function createTrello (chunk, enc, callback) {
  // let's create some cards based on chunk
  newCard = {
    name: chunk['Company'],
    idList: idList,
    pos: checkIfAlum(chunk['Alum?']),
    desc: []
  }
  comments = {}

  Object.keys(chunk).forEach(function (key) {
    // don't want these in desc
    if (!chunk[key] || key === 'Alum?') return
    // create a comment separate from the card
    if (key === 'Notes' && !!chunk[key]) {
      comments.text= chunk[key]
      return
    }
    newCard.desc.push(`**${key}** ${chunk[key]}`)
  })

  newCard.desc.join("\n")

  trello.post('/1/cards', newCard, function (err, data) {
    if (err) console.log(err)

    idCard = data.id

    console.log(data)
    console.log(`${data.name} successfully created. Check ${data.url} for awesome details`)
  })

  if (comments.text) {
    trello.post(`/1/cards/${idCard}/action/comments`, comments, function (err, data) {
      if (err) console.log(err)

      console.log(data)
      console.log(`${data.name} successfully created. Check ${data.url} for awesome details`)
    })
  }

  callback()

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
