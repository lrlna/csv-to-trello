var csv = require('csv-parse')
var fs = require('fs')
var path = require('path')
var through2 = require('through2')
var Trello = require('node-trello')

var file = process.argv[2]

var stream = csv({columns: true})

// ok, let's add some global trello variablesss
var idBoard, idList, boardURL, newCard, idCard, comments

var creds = getCreds()
var trello = new Trello(creds.key, creds.token)

createBoard(function (board) {
  if (board) console.log(`${board.name} successfully created. Check ${board.url} for awesome details`)
  createList(function (list) {
    if (list) console.log(`${list.name} successfully created. Check ${list.url} for awesome details`)
    createReadStream()
  })
})

// thing we need to create a list, and then cards

// create a readable file stream
var createReadStream = function () {
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
}

function createBoard (done) {
  // let's create a new board
  trello.post('/1/boards', {name: 'Cascadia Sponsorship Board'}, function (err, data) {
    if (err) console.log(err)
    idBoard = data.id
    boardURL = data.url
    done(data)
  })
}

function createList (done) {
  // let's create a new list
  trello.post('/1/lists', {name: 'Backlog', idBoard: idBoard}, function (err, data) {
    if (err) done (err)
    idList = data.id
    done (data)
  })
}

function createTrello (chunk, enc, done) {
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

  // join the array with breaks, or if just one item, convert to string; a lil' messy
  newCard.desc = newCard.desc > 1 ? newCard.desc.join("\r\n") : newCard.desc.toString()

  createCard (function (card) {
    console.log(`${data.name} successfully created. Check ${data.url} for awesome details`)
    if (comments.text) {
      createComment (function (commentPost) {
        console.log(`${data.type} successfully created`)
        done()
      })
    } else {
      done()
    }
  })
}

function getCreds () {
  var credsFile = path.join(__dirname, "./keys.json")
  var file = fs.readFileSync(credsFile)

  return JSON.parse(file)
}

function createComment (done) {
  trello.post(`/1/cards/${idCard}/actions/comments`, comments, function (err, data) {
    if (err) console.log(err)
    done (data)
  })
}

function createCard (done) {
  trello.post('/1/cards', newCard, function (err, data) {
    if (err) throw (err)
    idCard = data.id
    done(data)
  })
}

function checkIfAlum (alum) {
  var position = alum === "Y" ? 'top' : 'bottom'
  return position
}
