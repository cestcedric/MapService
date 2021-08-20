const mqtt = require('mqtt');
const client  = mqtt.connect('mqtt://localhost');
const robotName = 'blabla';
const topic = 'iot/coordinates/' + robotName;
 
client.on('connect', function () {
    console.log('connected');
    setInterval(simulateRobot,1000);
});

let x = 10;
let y = 20;

function simulateRobot() {
    x+=100;
    y+=10;
    x = x % 2000;
    y = y % 1000;
    console.log(x, y);
    client.publish(topic, JSON.stringify(getRobotInfo(x, y)));
}

function getRobotInfo(x, y){
    return {
        'robotId': robotName,
        'timestamp': new Date().toISOString(),
        'pose': {
            'position': {
                'x': x,
                'y': y,
                'z': 0
            },
            'orientation': {
                'x': 30,
                'y': 40,
                'z': 0,
                'w': 0
            }
        },
        'status': {
            'battery': {
                'battery_level': 3,
                'charging': 'sdf'
            },
            'loaded': 'dfs'
        }
    };
}