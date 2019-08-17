#!/usr/bin/env python
# Display a runtext with double-buffering.
from samplebase import SampleBase
from rgbmatrix import graphics
import time
import requests
import transitfeed
import datetime
import arrow
import schedule

today = datetime.date.today()
starttime = time.time()
schedule = transitfeed.Schedule()
url = "http://localhost:5000/by-id/077e"
font = graphics.Font()
font.LoadFont("../fonts/tom-thumb.bdf")
textColor = graphics.Color(0, 110, 0)
circleColor = graphics.Color(110, 0, 0)
circleNumberColor = graphics.Color(0, 0, 0)

class RunText(SampleBase):
    def __init__(self, *args, **kwargs):
        super(RunText, self).__init__(*args, **kwargs)
        self.parser.add_argument("-t", "--text", help="The text to scroll on the RGB LED panel", default="6 Wall Street")

    def getData(self):
        r = requests.get(url=url)
        time1 = r.json()['data'][0]['N'][0]['time']
        time2 = r.json()['data'][0]['N'][1]['time']
        print(r.json()['data'][0]['N'])
        nowTime = arrow.utcnow().datetime
        time1Formatted = arrow.get(time1).to('utc').datetime
        time2Formatted = arrow.get(time2).to('utc').datetime
        deltaTime1 = time1Formatted - nowTime
        deltaTime2 = time2Formatted - nowTime
        deltaMod1 = divmod(deltaTime1.total_seconds(), 60)
        deltaMod2 = divmod(deltaTime2.total_seconds(), 60)
        deltaMins1 = deltaMod1[0] + deltaMod1[1]/60
        deltaMins2 = deltaMod2[0] + deltaMod2[1]/60
        minsUntilTrain1 = int(round(deltaMins1))
        minsUntilTrain2 = int(round(deltaMins2))
        minsUntilTrain1Str = str(minsUntilTrain1)
        minsUntilTrain2Str = str(minsUntilTrain2)

        if minsUntilTrain1 < 10 and minsUntilTrain1 >= 0:
          minsUntilTrain1Str = " " + str(minsUntilTrain1)
        if minsUntilTrain2 < 10 and minsUntilTrain2 >= 0:
          minsUntilTrain2Str = " " + str(minsUntilTrain2)

        return [minsUntilTrain1Str, minsUntilTrain2Str]

    def drawCircle(self, canvas,  x, y, color):
        # Draw circle with lines
        graphics.DrawLine(canvas, x+2, y+0, x+6, y+0, color)
        graphics.DrawLine(canvas, x+1, y+1, x+7, y+1, color)
        graphics.DrawLine(canvas, x+0, y+2, x+8, y+2, color)
        graphics.DrawLine(canvas, x+0, y+3, x+8, y+3, color)
        graphics.DrawLine(canvas, x+0, y+4, x+8, y+4, color)
        graphics.DrawLine(canvas, x+0, y+5, x+8, y+5, color)
        graphics.DrawLine(canvas, x+0, y+6, x+8, y+6, color)
        graphics.DrawLine(canvas, x+1, y+7, x+7, y+7, color)
        graphics.DrawLine(canvas, x+2, y+8, x+6, y+8, color)

    def drawRows(self, canvas, minsTrain1, minsTrain2):
      canvas.Clear()
      # Top line
      self.drawCircle(canvas, 2, 4, circleColor)
      graphics.DrawText(canvas, font, 5, 11, circleNumberColor, "3")
      graphics.DrawText(canvas, font, 14, 11, textColor, "Kingston")
      graphics.DrawText(canvas, font, 47, 11, textColor, minsTrain1)
      graphics.DrawText(canvas, font, 54, 11, textColor, "min")

      # Bottom line
      self.drawCircle(canvas, 2, 20, circleColor)
      graphics.DrawText(canvas, font, 5, 27, circleNumberColor, "3")
      graphics.DrawText(canvas, font, 14, 27, textColor, "Kingston")
      graphics.DrawText(canvas, font, 47, 27, textColor, minsTrain2)
      graphics.DrawText(canvas, font, 54, 27, textColor, "min")

    def timeDrawing(self):
      minsArr = self.getData()
      print(minsArr)
      minsTrain1 = minsArr[0]
      minsTrain2 = minsArr[1]
      canvas = self.matrix.CreateFrameCanvas()

      self.drawRows(canvas, minsTrain1, minsTrain2)
      # draw to the canvas
      canvas = self.matrix.SwapOnVSync(canvas)

    def run(self):
      self.timeDrawing()
      i = 0
      while True:
        time.sleep(60 - time.time() % 60)
        print(i)
        self.timeDrawing()
        i = i + 1


# Main function
if __name__ == "__main__":
    run_text = RunText()
    if (not run_text.process()):
        run_text.print_help()
