const five = require('johnny-five');
const Tessel = require('tessel-io');
const { playSong } = require('../SoundUtils');
const { nyanIntro } = require('../songs');
const { initAlarmHardware } = require('./Alarm');
const { initLcdScreen } = require('./LcdScreen');
const { initTrafficLight, cycleStates } = require('./TrafficLight');

const initHardware = ({
    buttonAlarmTogglePin,
    lcdPins,
    ledAlarmStatusPin,
    ledMissPin,
    ledReadyPin,
    ledSteadyPin,
    piezoPin,
    piezoPort,
}) => {
    var board = new five.Board({ io: new Tessel() });

    return new Promise(resolve => {
        board.on('ready', () => {
            log.info(
                `Device board ready. Configuring LCD display with pins ${lcdPins}...`,
            );

            initLcdScreen(lcdPins);
            initAlarmHardware({ buttonAlarmTogglePin, ledAlarmStatusPin });
            initTrafficLight({ ledReadyPin, ledSteadyPin, ledMissPin });

            // Play a tune and cycle traffic light once the hardware is ready to go
            playSong({ piezoPin, piezoPort, song: nyanIntro });
            cycleStates({
                cycleCount: 5,
                cycleDelay: 200,
                stateList: ['ready', 'set', 'miss'],
            });

            resolve();
        });
    });
};

module.exports = {
    initHardware,
};
