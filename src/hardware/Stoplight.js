// Hardware for set of "stoplight" status LEDs. Consists of three LEDs, red,
// yellow, and green.

const mockRequire = require('./mock-hardware');
const constants = require('../Constants');
const { onGlobalStateUpdate } = require('../EventUtils');
const { setState } = require('../GlobalState');

// Object containing references to LED hardware
const leds = constants.STOPLIGHT_LED_NAMES.reduce((accum, ledName) => {
    accum[ledName] = null;
    return accum;
}, {});

const initStoplight = ({
    isDeviceEnabled,
    pinsAndPorts: { ledReadyPin, ledSteadyPin, ledMissPin },
}) => {
    const five = mockRequire('johnny-five', isDeviceEnabled, {
        moduleName: 'Stoplight',
    });

    leds[constants.STOPLIGHT_STATES.READY] = new five.Led({
        id: 'ledStoplightReady',
        pin: ledReadyPin,
    });
    leds[constants.STOPLIGHT_STATES.STEADY] = new five.Led({
        id: 'ledStoplightSteady',
        pin: ledSteadyPin,
    });
    leds[constants.STOPLIGHT_STATES.MISS] = new five.Led({
        id: 'ledStoplightMiss',
        pin: ledMissPin,
    });

    // When the stoplight state is updated, turn on the corresponding LED(s)
    onGlobalStateUpdate('stoplightState', stoplightState => {
        Object.keys(leds).forEach(ledName => {
            leds[ledName][
                [constants.STOPLIGHT_STATES.GO, ledName].includes(
                    stoplightState,
                )
                    ? 'on'
                    : 'off'
            ]();
        });
    });

    // When arrivalInfo is updated, get the stoplight state, and set it
    onGlobalStateUpdate('arrivalInfo', arrivalInfo => {
        const stoplightState = getStoplightState(arrivalInfo);
        setState('stoplightState', stoplightState);
    });
};

// Return one of the 'ready', 'steady', 'go', 'miss' stoplight states based on
// the closest arrival time of the primary route
const getStoplightState = arrivalInfo => {
    let closestMinsUntilArrival;

    try {
        closestMinsUntilArrival =
            arrivalInfo[constants.PRIMARY_ROUTE].upcomingArrivalTimes[0]
                .minsUntilArrival;
    } catch (e) {
        log.warn(
            'Malformed arrivalInfo. Unable to calculate stoplight state: %o',
            arrivalInfo,
        );
        return;
    }

    const stoplightStates = Object.keys(constants.STOPLIGHT_TIME_RANGES);

    let stoplightState;
    for (let i = 0; stoplightStates.length; ++i) {
        const curStoplightState = stoplightStates[i];
        const curStoplightStateRange =
            constants.STOPLIGHT_TIME_RANGES[curStoplightState];
        if (
            closestMinsUntilArrival >= curStoplightStateRange[0] &&
            closestMinsUntilArrival < curStoplightStateRange[1]
        ) {
            stoplightState = curStoplightState;
            break;
        }
    }

    return stoplightState;
};

module.exports = {
    initStoplight,
};
