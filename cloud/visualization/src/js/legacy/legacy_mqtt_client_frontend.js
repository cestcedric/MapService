/* eslint-disable */
// import Paho from 'paho-client'
// import Paho from 'web-mqtt-client'

const client = new Paho.MQTT.Client('ws://' + window.location.host.split(':')[0] + ':9001/mqtt', 'myClientId' + new Date().getTime())

// MOCK
// const client = new Paho.MQTT.Client("ws://iot.eclipse.org/ws", "myClientId" + new Date().getTime());
// mock 2 robots
// let x1 = 120;
// let y1 = 81;
// let x2 = 200;
// let y2 = 120;

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function addData (chart, label, data) {
  chart.data.labels.push(label)
  chart.data.datasets.forEach((dataset) => {
    dataset.data.push(data)
  })
  chart.update()
}

function removeData (chart) {
  chart.data.labels.pop()
  chart.data.datasets.forEach((dataset) => {
    dataset.data.pop()
  })
  chart.update()
}

// topic for getting robot coordinates
const topicCoordinates = 'iot/coordinates-frontend'
// topic for getting ID of map tile that changed
const topicTiles = 'iot/chunks/advertisement'
// const topicMonitoring = "$SYS/broker/messages/received/1";

// array of robot IDs
let robotIDs = []
let msgCounter = 0
let mapTilesCounter = 0
let startTime = new Date()
let chartCount = 0

client.onConnectionLost = onConnectionLost
client.onMessageArrived = onMessageArrived

client.connect({
  onSuccess: onConnect
})

async function onConnect () {
  client.subscribe(topicCoordinates + '/#')
  client.subscribe(topicTiles)

  // MOCK
  // publish(topicTiles, "4")
  // mock robot coordinates
  //  await sleep(2000);
  //
  //  setInterval(() => {
  //    x1 +=1;
  //    var robot1 = {"y":y1,"x":x1,"z":0.4596830111165702};
  //    publish(topicCoordinates + "/id123", JSON.stringify(robot1));
  //  }, 5);
  //  setInterval(() => {
  //    x2 +=1;
  //    var robot2 = {"y":y2,"x":x2,"z":0.4596830111165702};
  //    publish(topicCoordinates +  "/id456", JSON.stringify(robot2))
  //  }, 1);
}

function onConnectionLost (responseObject) {
  if (responseObject.errorCode !== 0) {
    // console.log("onConnectionLost:" + responseObject.errorCode);
  }
  client.connect({
    onSuccess: onConnect
  })
}

const publish = (dest, msg) => {
  // console.log('Published to topic :', dest, ', message: ', msg);
  let message = new Paho.MQTT.Message(msg)
  message.destinationName = dest
  client.send(message)
}

function onMessageArrived (message) {
  // display messages per sec counter
  msgCounter += 1
  let endTime = new Date()
  let timeDiff = endTime - startTime // in ms
  startTime = new Date()
  // strip the ms
  timeDiff /= 1000

  document.getElementById('messagePerSec').innerHTML = '<h2>' + Math.ceil(timeDiff) + '</h2>'

  // get topic of new message
  let topic = message.destinationName
  let content = message.payloadString

  // if new coordinates received
  if (topic.includes(topicCoordinates)) {
    // Get robot ID out of topic
    let robotID = topic.split('/')[2]
    // console.log(robotID);
    let newCoords = JSON.parse(content)
    // if robotID not in array yet, add it
    if (!robotIDs.includes(robotID)) {
      robotIDs.push(robotID)
      createRobot(robotID, newCoords['x'], newCoords['y'], newCoords['x'], newCoords['y'])
    }
    document.getElementById('noOfRobots').innerHTML = '<h2>' + robotIDs.length + '</h2>'
    document.getElementById('totalMessages').innerHTML = '<h2>' + (16 * 100 * 100 * 1 / 100 * 12 * robotIDs.length) / 1000000 + ' MB' + '</h2>'

    if (chartCount === 0) {
      removeData(myChartRobots)
      addData(myChartRobots, '', robotIDs.length)

      removeData(myChartPie)
      removeData(myChartPie)
      addData(myChartPie, 'Moving Robots', 100)
      addData(myChartPie, 'Resting Robots', 0)

      chartCount = 1
    }

    // Move robot to new Position: Call Construct function of localMap.js
    moveRobot(robotID, newCoords['x'], newCoords['y'])
  } else if (topic === topicTiles) {
    // if new map tile received
    mapTilesCounter += 1
    document.getElementById('mapTiles').innerHTML = '<h2>' + mapTilesCounter + '</h2>'
    // load only tile with id from server via http (using JQuery)
    var data = JSON.parse(content)
    // load only tile with id from server via http (using JQuery)
    var imgId = data.chunk_index
    var resourceId = data.chunk_resource_id
    document.getElementById(imgId).innerHTML = '<img src="/api/chunk-service/chunks/unique/' + resourceId + '" style="width:100px; height:100px">'
  }
}
