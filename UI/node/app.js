const LedMatrix = require("easybotics-rpi-rgb-led-matrix")
const fs = require('fs')
const path = require('path')
const axios = require("axios")
const {
  trainName,
  stationName,
  direction,
  stationId,
  textColor,
  circleColor,
  circleNumberColor,
  loadingTextColor
} = require('./config.json');
const matrix = new LedMatrix(32, 64, 1, 1, 100, 'adafruit-hat')
const url = `http://localhost:8080/api/schedule/${stationId}/${trainName}/${direction}`
const fontPath = path.join(__dirname, '../fonts/tom-thumb.bdf')

let loadInterval, drawInterval
let i = 0


// Time in minutes it takes to walk to the train station
// Don't show trains that are shorter than 9 minutes because
// we can't walk there to catch it fast enough
const minimumMins = 9

const getData = async url => {
  try {
    loading = true
    const response = await axios.get(url)
    const data = response.data
    loading = false
    return data
  } catch (error) {
    loading = true
    console.log('connection error')
  }
}

getTrainMins = (times) => {
  const minsArr = times.map(o => {
    return o.relativeTime
  })
  return minsArr
}

drawLoading = () => {
  switch(i) {
    case (0):
      matrix.clear()
      matrix.drawText(16, 14, "Loading", fontPath, ...loadingTextColor)
      matrix.update()
      i = 1
      break;
    case (1):
      matrix.clear()
      matrix.drawText(16, 14, "Loading.", fontPath, ...loadingTextColor)
      matrix.update()
      i = 2
      break;
    case (2):
      matrix.clear()
      matrix.drawText(16, 14, "Loading..", fontPath, ...loadingTextColor)
      matrix.update()
      i = 3
      break;
    case (3):
    matrix.clear()
      matrix.drawText(16, 14, "Loading...", fontPath, ...loadingTextColor)
      matrix.update()
      i = 0
      break;
  }
}

drawTrainCircle = (x, y, ...color) => {
  // Draw circle with lines
  matrix.drawLine(x+2, y+0, x+6, y+0, ...color)
  matrix.drawLine(x+1, y+1, x+7, y+1, ...color)
  matrix.drawLine(x+0, y+2, x+8, y+2, ...color)
  matrix.drawLine(x+0, y+3, x+8, y+3, ...color)
  matrix.drawLine(x+0, y+4, x+8, y+4, ...color)
  matrix.drawLine(x+0, y+5, x+8, y+5, ...color)
  matrix.drawLine(x+0, y+6, x+8, y+6, ...color)
  matrix.drawLine(x+1, y+7, x+7, y+7, ...color)
  matrix.drawLine(x+2, y+8, x+6, y+8, ...color)
}

drawRows = (minsTrain1, minsTrain2) => {
  matrix.clear()
  minsTrain1 = minsTrain1.toString()
  minsTrain2 = minsTrain2.toString()

  // Top line
  drawTrainCircle(2, 4, ...circleColor)
  matrix.drawText(5, 7, trainName, fontPath, ...circleNumberColor)
  matrix.drawText(14, 7, stationName, fontPath, ...textColor)
  matrix.drawText(47, 7, minsTrain1, fontPath, ...textColor)
  matrix.drawText(54, 7, "min", fontPath, ...textColor)

  // Bottom line
  drawTrainCircle(2, 19, ...circleColor)
  matrix.drawText(5, 22, trainName, fontPath, ...circleNumberColor)
  matrix.drawText(14, 22, stationName, fontPath, ...textColor)
  matrix.drawText(47, 22, minsTrain2, fontPath, ...textColor)
  matrix.drawText(54, 22, "min", fontPath, ...textColor)


  console.log(`${stationId} ${stationName} ${minsTrain1} min / ${stationId} ${stationName} ${minsTrain2} min`)

  matrix.update()
}

drawCanvas = async () => {
  try {
      const minsArr = await getData(url)
      if (minsArr) {
        clearInterval(loadInterval)
        let timesArr = getTrainMins(minsArr)
            timesArr = timesArr.filter(x => x >= minimumMins)
        drawRows(...timesArr)
      }
  } catch (e) {
      console.log(e)
  }
}

const init = () => {
  console.log('Init')
  console.log('Loading...')
  loadInterval = setInterval(drawLoading, 350)

  drawCanvas()
  drawInterval = setInterval(drawCanvas, 60000)
}

init()
