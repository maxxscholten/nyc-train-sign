# NYC Train Sign using Raspberry Pi with LED Matrix


* An Express.js server which parses current train data from mta-gtfs and provides an API for easy display of data
* A Node.js interface application that displays selected NYC subway station data on a 64x32 LED Matrix via a Raspberry Pi
* TODO: Finish PyPortal Python version


## Requirements
* MTA API Key
  * https://datamine.mta.info/
* Raspberry Pi (w/ headers and Wifi)
* SD Card (for the Raspberry Pi)
* RGB Matrix Bonnet (or HAT)
  * https://www.adafruit.com/product/3211
* 5V 4A power supply (to power Raspberry Pi & LED Matrix)
  * https://www.adafruit.com/product/1466
* 64x32 LED RGB Matrix
  * https://www.adafruit.com/product/2277
  * https://www.alibaba.com/product-detail/Cheapest-P5-RGB-pixel-panel-HD_60814325723.html?spm=a2700.7724838.2017115.1.5c6e13d0O8IYUq&s=p

![Front of 64x32 RGB LED Matrix display](https://imgur.com/G9VgqeS.jpg)


# Hardware
### Raspberry Pi & RGB Matrix Bonnet
Install the RGB Matrix Bonnet (or HAT) onto the Raspberry Pi's 40-pin GPIO header. Be sure you have a Raspberry Pi with headers installed (or you'll end up ordering the GPIO header separately and solder yourself to the Pi). A raspberry Pi Zero WH and the Bonnet should be plug and play. The older HAT model will require soldering a header to it.
  * From the description of the [RGB Matrix Bonnet from Adafruit](https://www.adafruit.com/product/3211):
    * "Bonnet" boards work on any Raspberry Pi with a 40-pin GPIO header — Zero, Zero W/WH, Model A+, B+, Pi 2 and Pi 3. They do not work with older 26-pin boards like the original Model A or B

The Raspberry Pi/Bonnet combo can be discreetly fasted to the back of the display with some double sided tape, velcro, etc.

### RGB LED Matrix
The display should come with a power cable and a data cable. It might even come with multiple data cables in the event that you want to bridge dipslays. The data cable will plug directly into the back of the display and your Bonnet/HAT. The power cable will also plugin into the back of the display and two pronged ends will connect to slotted terminals with screws on the Bonnet/HAT.


### Power cable
The power cable plugs directly into the Bonnet/HAT and will share power to both the Raspberry Pi and the display.

![Backside of display with Raspberry Pi & RGB Matrix HAT](https://imgur.com/X1i7x47.jpg)



# Software
## Dependencies

* Node.js LTS & npm installed on Raspberry Pi
  * https://linuxize.com/post/how-to-install-node-js-on-raspberry-pi/
* [Forever.js](https://www.npmjs.com/package/forever) installed globally
  * `sudo npm install forever -g`


## Getting Started
1. Sign up for an account and generate an API key from the MTA Real-Time Data Feeds website
    * https://datamine.mta.info/
2. Setup your Raspberry Pi and set the wifi to the same network as your development machine


## Installing

Install dependencies

```bash
# Install dependencies for the API server
$ cd nyc-train-sign/Server/node
$ npm install

# Install dependencies for the LED Matrix UI
$ cd nyc-train-sign/UI/node
$ npm install
```

## Configuration

### 1. Configure and test the Server application
Supply your MTA API key that you generated from the MTA datamine website.
```bash
# Update the Server app.js file with your MTA API key, ex:
#  const mta = new Mta({
#    key: '<YOUR_MTA_API_KEY>',
#    feed_id: 1
#  })

$ cd nyc-train-sign/Server/node
$ nano app.js
```

After configuring the Server applicaton, you should test it by running it manually. This will be necessary as you will need to access the API in order to find your `stationId` which will be required to configure the UI application.

```bash
# Run the server manually
$ cd nyc-train-sign/Server/node
$ sudo node app.js
  > Node.js server listening on 8080
```

Get the list of subway stations and find yours. Make note/write down of the `stop_id` associated to your subway station:
```bash
# In an internet browser, go to the below address, or curl from a console:
# From your Raspbery Pi:
$ curl localhost:8080/api/station

# From a computer on the same wifi network as the Raspberry Pi
$ curl http://raspberrypi.local:8080/api/station
```


### 2. Configure and test the UI application
Update the UI configuration file. Use your subway station's `stop_id` you wrote down for the `stationId`. Supply a direction, "N", or "S", and the name of your station and train number to be displayed. You can also change the colors of the font and circle to match your favorite train. I like the 3 and the 4 trains best.
```bash
# Update the UI config file with subway preferences, ex:
#  stationId: 249,
#  direction: "N"
#  stationName: "Kingston",
#  trainName: "3"
#  textColor: [0, 110, 0],
#  circleColor: [110, 0, 0],
#  circleNumberColor: [0, 0, 0],
#  loadingTextColor: [255, 255, 255]

$ cd nyc-train-sign/UI/node
$ nano config.json
```

Manually run the UI application to test that it displays on the LED Matrix.

```bash
# Run the server manually
$ cd nyc-train-sign/UI/node
$ sudo node app.js
  > 249 Kingston 13 min / 249 Kingston 29 min
  > 249 Kingston 11 min / 249 Kingston 28 min
  > 249 Kingston 10 min / 249 Kingston 27 min
```



## Setup for auto-boot on power on

Set the applications to persist beyond the console window and start automatically on system reboot. This will allow everything to startup when the device is plugged in (am I IoT yet?).
```bash
# Set the scripts to start with Forever.js on reboot
$ sudo crontab -e

# Add lines:
@reboot /usr/local/bin/forever start /home/pi/nyc-train-sign/Server/Node/index.js
@reboot /usr/local/bin/forever start /home/pi/nyc-train-sign/UI/node/app.js
```

# REST API

The REST API for the server appliation is described below. Data formatted and parsed from [mta-gtfs](https://github.com/aamaliaa/mta-gtfs), an NYC MTA API library.

## Get MTA subway service status info

### Request

`GET /api/status/`

### Response

```json
[
  {
    "name": "123",
    "status": "GOOD SERVICE",
    "text": "",
    "Date": "",
    "Time": ""
  },
  {
    "name": "456",
    "status": "DELAYS",
    "text": "<span class=\"TitleDelay\">Delays</span>
            <span class=\"DateStyle\">
            &nbsp;Posted:&nbsp;08/16/2019&nbsp; 6:06PM
            </span><br/><br/>
            Northbound [4], [5] and [6] trains are delayed while crews work to correct signal problems at <b>59 St.</b>
            <br/><br/>",
    "Date": "08/16/2019",
    "Time": " 6:06PM"
  },
]
```


## Get MTA subway service status info for specific subway train name

### Request

`GET /api/status/:trainName/`

  * GET /api/status/3/

### Response

```json
[
  {
    "name": "123",
    "status": "GOOD SERVICE",
    "text": "",
    "Date": "",
    "Time": ""
  }
]
```


## Get a list of all subway stations

### Request

`GET /api/station/`

### Response

```json
{
  "101": {
    "stop_id": "101",
    "stop_code": "",
    "stop_name": "Van Cortlandt Park - 242 St",
    "stop_desc": "",
    "stop_lat": "40.889248",
    "stop_lon": "-73.898583",
    "zone_id": "",
    "stop_url": "",
    "location_type": "1",
    "parent_station": ""
  },
  "103": {
    "stop_id": "103",
    "stop_code": "",
    "stop_name": "238 St",
    "stop_desc": "",
    "stop_lat": "40.884667",
    "stop_lon": "-73.90087",
    "zone_id": "",
    "stop_url": "",
    "location_type": "1",
    "parent_station": ""
  },
}
```


## Get a single subway station's metadata

### Request

`GET /api/station/:stationId/`

  * GET /api/station/249/

### Response

```json
{
  "stop_id": "249",
  "stop_code": "",
  "stop_name": "Kingston Av",
  "stop_desc": "",
  "stop_lat": "40.669399",
  "stop_lon": "-73.942161",
  "zone_id": "",
  "stop_url": "",
  "location_type": "1",
  "parent_station": ""
}
```

## Get the current schedule of trains at a specific station

### Request

`GET /api/schedule/:stationId/`

  * GET /api/schedule/249/

### Response

```json
{
  "N": [
    {
      "routeId": "3",
      "delay": null,
      "arrivalTime": 1565958549,
      "departureTime": 1565958549
    },
    {
      "routeId": "3",
      "delay": null,
      "arrivalTime": 1566000654,
      "departureTime": 1566000654
    },
  ],
  "S": [
    {
      "routeId": "3",
      "delay": null,
      "arrivalTime": 1566000745,
      "departureTime": 1566000745
    },
    {
      "routeId": "3",
      "delay": null,
      "arrivalTime": 1566001280,
      "departureTime": 1566001280
    },
  ]
}
```

## Get the current schedule of a specific train at a specific station

### Request

`GET /api/schedule/:stationId/:trainName/:direction/`

  * GET /api/schedule/249/3/N/

### Response

```json
{
  "N": [
    {
      "routeId": "3",
      "delay": null,
      "arrivalTime": 1565958549,
      "departureTime": 1565958549
    },
    {
      "routeId": "3",
      "delay": null,
      "arrivalTime": 1566000654,
      "departureTime": 1566000654
    },
  ]
}
```




# TODO:
* Finish the Python version for PyPortal
* Write some tests
* Make a cool mobile app inteface to change the train preferences
* Add some potential status/delay notifcation data
