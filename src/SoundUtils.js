const tesselLowLevel = require('tessel');
const { wait } = require('./AsyncRepeatUtils');

const PLAY_DUTY_CYCLE = 0.2;
const STOP_DUTY_CYLCE = 0;

// Play a frequency on the specified PWM pin until stopped. Returns a
// promise.
const playFrequency = ({ freq, pwmPort, pwmPin, duration }) =>
    new Promise(resolve => {
        const targetPin = tesselLowLevel.port[pwmPort].pin[pwmPin];

        if (freq) {
            tesselLowLevel.pwmFrequency(freq);
            targetPin.pwmDutyCycle(PLAY_DUTY_CYCLE);
        } else {
            tesselLowLevel.pwmFrequency(1);
            targetPin.pwmDutyCycle(STOP_DUTY_CYLCE);
        }

        return wait(duration)
            .then(resolve => {
                targetPin.pwmDutyCycle(STOP_DUTY_CYLCE);
            })
            .then(resolve);
    });

// https://github.com/rwaldron/johnny-five/blob/master/lib/piezo.js#L178
const NOTES = {
    c0: 16,
    'c#0': 17,
    d0: 18,
    'd#0': 19,
    e0: 21,
    f0: 22,
    'f#0': 23,
    g0: 25,
    'g#0': 26,
    a0: 28,
    'a#0': 29,
    b0: 31,
    c1: 33,
    'c#1': 35,
    d1: 37,
    'd#1': 39,
    e1: 41,
    f1: 44,
    'f#1': 47,
    g1: 49,
    'g#1': 52,
    a1: 55,
    'a#1': 58,
    b1: 62,
    c2: 65,
    'c#2': 69,
    d2: 73,
    'd#2': 78,
    e2: 82,
    f2: 87,
    'f#2': 93,
    g2: 98,
    'g#2': 104,
    a2: 110,
    'a#2': 117,
    b2: 124,
    c3: 131,
    'c#3': 139,
    d3: 147,
    'd#3': 156,
    e3: 165,
    f3: 175,
    'f#3': 185,
    g3: 196,
    'g#3': 208,
    a3: 220,
    'a#3': 233,
    b3: 247,
    c4: 262,
    'c#4': 277,
    d4: 294,
    'd#4': 311,
    e4: 330,
    f4: 349,
    'f#4': 370,
    g4: 392,
    'g#4': 415,
    a4: 440,
    'a#4': 466,
    b4: 494,
    c5: 523,
    'c#5': 554,
    d5: 587,
    'd#5': 622,
    e5: 659,
    f5: 698,
    'f#5': 740,
    g5: 784,
    'g#5': 831,
    a5: 880,
    'a#5': 932,
    b5: 988,
    c6: 1047,
    'c#6': 1109,
    d6: 1175,
    'd#6': 1245,
    e6: 1319,
    f6: 1397,
    'f#6': 1480,
    g6: 1568,
    'g#6': 1661,
    a6: 1760,
    'a#6': 1865,
    b6: 1976,
    c7: 2093,
    'c#7': 2217,
    d7: 2349,
    'd#7': 2489,
    e7: 2637,
    f7: 2794,
    'f#7': 2960,
    g7: 3136,
    'g#7': 3322,
    a7: 3520,
    'a#7': 3729,
    b7: 3951,
    c8: 4186,
    'c#8': 4435,
    d8: 4699,
    'd#8': 4978,
    e8: 5274,
    f8: 5588,
    'f#8': 5920,
    g8: 6272,
    'g#8': 6645,
    a8: 7040,
    'a#8': 7459,
    b8: 7902,
};

module.exports = {
    playFrequency,
    NOTES,
};
