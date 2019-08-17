// MTA setup
const Mta = require('mta-gtfs')
const mta = new Mta({
  key: '<YOUR_MTA_API_KEY>',
  feed_id: 1
})

// Express setup
const express = require('express')
const app = express()
const port = process.env.PORT || 8080
const router = express.Router()
app.use(express.json())

// middleware to use for all requests
router.use((req, res, next) => {
	next()
})

router.get('/', (req, res) => {
	res.json({ message: 'Welcome to the NYC Train Sign API'})
})

router.route('/status')
	.get(async (req, res ) => {
    const result = await mta.status('subway')
    res.send(result)
  })

router.route('/status/:id')
	.get(async (req, res ) => {
    const result = await mta.status('subway')
    const filteredResult = result.find(o => o.name.includes(req.params.id))
    res.send(filteredResult)
  })

router.route('/station')
  .get(async (req, res ) => {
    const result = await mta.stop()
    res.send(result)
  })

router.route('/station/:id')
	.get(async (req, res ) => {
    const result = await mta.stop(req.params.id)
    res.send(result)
  })

router.route('/schedule')
  .get(async (req, res ) => {
    res.json({ message: 'A station ID is required as a parameter to retrieve a schedule. Ex: /api/schedule/249'})
  })

router.route('/schedule/:id')
	.get(async (req, res ) => {
    const result = await mta.schedule(req.params.id)
    res.send(result.schedule[req.params.id])
  })


router.route('/schedule/:id/:trainName/:direction')
  .get(async (req, res ) => {
    const result = await mta.schedule(req.params.id)
    const direction = req.params.direction
    let filteredResult = removeFromTree(result.schedule[req.params.id], req.params.trainName)
    filteredResult[direction].forEach(arrivalInfo => {
      arrivalInfo.relativeTime = timeToRelative(arrivalInfo.arrivalTime)
    })
    res.send(filteredResult[direction])
  })


const timeToRelative = (time) => {
  const now = new Date().valueOf()
  const diff = (time * 1000) - now
  const minsDiff = Math.floor((diff % 3.6e6) / 6e4);
  return minsDiff
}

const removeFromTree = (parent, childIdToRemove) => {
  if (parent.N) {
  parent.N = parent.N
      .filter(function(child){ return child.routeId == childIdToRemove})
      .map(function(child){ return removeFromTree(child, childIdToRemove)});
  }
  if (parent.S) {
    parent.S = parent.S
        .filter(function(child){ return child.routeId == childIdToRemove})
        .map(function(child){ return removeFromTree(child, childIdToRemove)});
  }
  return parent;
}






// Register the routes & start the server
app.use('/api', router)
app.listen(port, (err) => {
  if (err) return console.log(`Something bad happened: ${err}`)
  console.log(`Node.js server listening on ${port}`)
})
