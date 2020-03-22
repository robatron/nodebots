const { initAlarmHardware } = require('./Alarm');
const { initStoplight } = require('./Stoplight');
const { initBuzzerHardware } = require('./Buzzer');
const { initLcdScreen } = require('./LcdScreen');
// const { nyanIntro } = require('../audio/songs');

const initHardware = ({
    buttonAlarmTogglePin,
    isDeviceEnabled,
    lcdPins,
    ledAlarmStatusPin,
    ledMissPin,
    ledReadyPin,
    ledSteadyPin,
    piezoPin,
    piezoPort,
}) => {
    let board;

    if (isDeviceEnabled) {
        log.info('Initializing hardware...');

        const five = require('johnny-five');
        const Tessel = require('tessel-io');

        board = new five.Board({ io: new Tessel() });
    } else {
        log.info('Initializing mock hardware...');

        board = {
            on: (event, cb) => cb(),
        };
    }

    return new Promise(resolve => {
        board.on('ready', () => {
            log.info(
                `Device board ready. Configuring LCD display with pins ${lcdPins}...`,
            );

            // Init buzzer hardware
            initBuzzerHardware({
                isDeviceEnabled,
                piezoPin,
                piezoPort,
            });

            // Init alarm hardware
            initAlarmHardware({
                buttonAlarmTogglePin,
                isDeviceEnabled,
                ledAlarmStatusPin,
            });

            // Init stoplight hardware
            initStoplight({
                isDeviceEnabled,
                ledReadyPin,
                ledSteadyPin,
                ledMissPin,
            });

            // Init LCD last b/c it's slow
            initLcdScreen({ isDeviceEnabled, lcdPins });

            // // Play a tune and flash stoplight once the hardware is ready to go
            // playSong({ piezoPin, piezoPort, song: nyanIntro });
            // setStoplightState('go');

            // Resolve once hardware initialized
            resolve();
        });
    });
};

module.exports = {
    initHardware,
};
