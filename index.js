let express = require("express")
let fetch = require("node-fetch")
let app = express()

let sqlite = require("sqlite")

let auth = false

async function authorization(req) {
  const token = req.header("Authorization").split(" ")[1]

  const request = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?access_token=${token}`
  )
  return request.status
}

function setupServer(db) {
  // This is a test frontend - uncomment to check it out
  // app.use(express.static('public'));

  app.get("/info", (req, res) => {
    const result = authorization(req)
    result.then(auth => {
      if (auth === 200) {
        res.send("Full stack example")
      } else {
        res.send("Access Denied /r/n")
      }
    })
  })

  // retrieve all unique stree names
  app.get("/streets", (req, res) => {
    const result = authorization(req)
    result.then(auth => {
      if (auth === 200) {
        db.all(`SELECT DISTINCT(name) FROM BikeRackData`).then(data => {
          // console.log(data);
          res.send(data)
        })
      } else {
        res.send("Access Denied /r/n")
      }
    })
  })

  app.get("/streets/:street/", (req, res) => {
    const result = authorization(req)
    result.then(auth => {
      if (auth === 200) {
        let streetName = req.params.street
        // query based on street
        // NOTE: this is open to SQL injection attack
        db.all(`SELECT * FROM BikeRackData WHERE name = '${streetName}'`).then(
          data => {
            res.send(data)
          }
        )
      } else {
        res.send("Access Denied /r/n")
      }
    })
  })

  let server = app.listen(8000, () => {
    console.log("Server ready", server.address().port)
  })
}

sqlite.open("database.sqlite").then(db => {
  //console.log('database opened', db);

  setupServer(db)
  //return db.all('SELECT * from TEST');
})
