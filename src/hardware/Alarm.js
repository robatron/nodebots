const five = require('johnny-five');
const { cycleStates } = require('./TrafficLight');

let isAlarmEnabled = false;
let buttonAlarmToggle;
let ledAlarmStatus;

// When the button is released, toggle the alarm status
const initAlarmHardware = ({ buttonAlarmTogglePin, ledAlarmStatusPin }) => {
    ledAlarmStatus = new five.Led(ledAlarmStatusPin);
    buttonAlarmToggle = new five.Button(buttonAlarmTogglePin);

    buttonAlarmToggle.on('release', () => {
        console.log(`Button "buttonAlarmToggle" released!`);

        // Toggle alarm status and sync the status LED
        isAlarmEnabled = !isAlarmEnabled;
        ledAlarmStatus[isAlarmEnabled ? 'on' : 'off']();

        // Cycle lights TEMP
        cycleStates({
            cycleCount: 10,
            cycleDelay: 100,
            stateList: ['ready', 'set', 'go'],
        });
    });
};

module.exports = {
    getAlarmIsEnabled: () => isAlarmEnabled,
    initAlarmHardware,
};