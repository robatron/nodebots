/**
 * OneTesselAway - OneBusAway for the Tessel 2
 *
 * Display: 2 lines w/ 16 characters each. Example display:
 *
 *  ----------------
 *  11! 15:37 15:49
 *  12  08:11 06:47
 *  ----------------
 *
 *  ----------------
 *  11: 03!  15  45
 *  12: 18   32  51
 *  ----------------
 *
 * Supports up to two routes and two stops.
 */
const http = require('http');
const os = require('os');
const Express = require('express');
const { getLatestLogFromFile, initLogger } = require('./src/Logger');
const { getArrivalInfo, updateArrivalInfo } = require('./src/ArrivalStore');
const { arrivalInfoToDisplayLines } = require('./src/DisplayUtils');
const { fireAndRepeat } = require('./src/AsyncRepeatUtils');

// Settings ------------------------------------------------------------

// Which routes and stops we're interested in, keyed by route ID.
const TARGET_ROUTES = {
    '1_100009': {
        leaveMinGo: 2,
        leaveMinReady: 5,
        routeName: '11',
        stopId: '1_12351',
        stopName: 'E Madison St & 22nd Ave E',
    },
    '1_100018': {
        leaveMinGo: 5,
        leaveMinReady: 8,
        routeName: '12',
        stopId: '1_12353',
        stopName: 'E Madison St & 19th Ave',
    },
};

// How often to request updates from OneBusAway (in milliseconds)
const UPDATE_INTERVAL = 3000;

// Log file path
const LOGFILE = './logs/device.log';

// Server settings. If started locally w/ `npm start`, it'll serve from
// localhost. If running on the Tessel 2, it'll run from its WiFi IP
const PORT = process.env.PORT || 8080;
const ADDRESS = `http://${process.env.ADDR ||
    os.networkInterfaces().wlan0[0].address}`;

// Which pins on the Tessel is the LCD plugged into?
const LCD_DISPLAY_PINS = ['a2', 'a3', 'a4', 'a5', 'a6', 'a7'];

// Setup ---------------------------------------------------------------

// Set up logger
const log = initLogger(LOGFILE);

// Set up Express server for the web UI
var app = new Express();
var server = new http.Server(app);

// Set up the templating engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Route to index
app.get('/', async (req, res) => {
    log.info(
        `IP address ${req.ip} requesting ${req.method} from path ${req.url}`,
    );

    const arrivalInfo = JSON.stringify(getArrivalInfo(), null, 2);
    const deviceLogs = getLatestLogFromFile(LOGFILE, { reverseLines: true });
    const displayLines = arrivalInfoToDisplayLines(getArrivalInfo()).join('\n');

    res.render('index', {
        arrivalInfo,
        deviceLogs,
        displayLines,
    });
});

// Start ---------------------------------------------------------------
(async () => {
    log.info('Starting OneTesselAway...');

    const DEVICE_ENABLED = process.env.DISABLE_DEVICE !== '1';

    let updateLcdScreen;

    if (DEVICE_ENABLED) {
        log.info('Initializing device...');

        // Don't try to require the hardware module unless we're running
        // on the actual device to prevent global import errors
        const { initHardware } = require('./src/Hardware');
        updateLcdScreen = await initHardware(LCD_DISPLAY_PINS);
    } else {
        log.info('Device DISABLED. Starting web UI only...');
    }

    // Begin updating arrival info and LCD screen regularly
    log.info(
        `Begin updating arrival info ${DEVICE_ENABLED &&
            '(and LCD screen)'} every ${UPDATE_INTERVAL} milliseconds`,
    );
    fireAndRepeat(UPDATE_INTERVAL, async () => {
        await updateArrivalInfo(TARGET_ROUTES);
        if (DEVICE_ENABLED) {
            const newDisplayLines = arrivalInfoToDisplayLines(getArrivalInfo());
            updateLcdScreen(newDisplayLines);
        }
    });
})();

// Start up web UI server
server = app.listen(PORT);
log.info(`Web server running on: ${ADDRESS}:${PORT}`);

// Shut down everything on ^C
process.on('SIGINT', () => {
    server.close();
});
