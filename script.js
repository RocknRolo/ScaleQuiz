// Author: Roel Kemp (RocknRolo). Special thanks to NismoRack for suggesting using a table to get the menu properly aligned!!

const options = document.getElementsByClassName("flatsharp_options");
const scaleNaturals = document.getElementsByClassName("naturals");
const scaleName = document.getElementById('scale_name');
const keyCBs = document.getElementsByClassName('key_cb');
const modeCBs = document.getElementsByClassName('mode_cb');
const rightEl = document.getElementById('right');
const wrongEl = document.getElementById('wrong');

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This part of the code deals with calculating scales and defining Tone and Scale objects.

const SEMITONES = "C D EF G A B";
const NATURALS = SEMITONES.replaceAll(" ","")
const IONIAN_PATTERN = [2, 2, 1, 2, 2, 2, 1];

function Tone(natural, flatSharp, interval) {
    this.natural = natural.toUpperCase();
    this.flatSharp = (parseInt(flatSharp)) || 0;
    this.interval = interval || 0;

    this.toString = () => {
        let accidentals = "";
        for (let i = 0; i < Math.abs(flatSharp); i++) {
            accidentals += (flatSharp < 0 ? "b" : "#");
        }
        return natural + accidentals;
    }
}

function Scale(root, mode) {
    mode = mode || 1;

    let tones = [];
    let accidentals;
    let semitoneSteps = 0;
    for (let i = 1; i <= NATURALS.length; i++) {
        tones.push(calcTone(i, semitoneSteps));
        semitoneSteps += calcWholeHalfPattern()[i - 1];
    }
    this.tones = tones;

    function calcTone(interval, semitoneSteps) {
        let targetNatural = toneAt(NATURALS.indexOf(root.natural) + interval - 1, NATURALS);
        let flatSharpOffset = root.flatSharp;

        if (toneAt(SEMITONES.indexOf(root.natural) + semitoneSteps, SEMITONES) !== targetNatural) {
            for (let i = 1; i <= 6; i++) {
                if (toneAt(SEMITONES.indexOf(root.natural) + semitoneSteps - i, SEMITONES) === targetNatural) {
                    flatSharpOffset += i;
                    break;
                } else if (toneAt(SEMITONES.indexOf(root.natural) + semitoneSteps + i, SEMITONES) === targetNatural) {
                    flatSharpOffset -= i;
                    break;
                }
            }
        }
        accidentals += flatSharpOffset;
        return new Tone(targetNatural, flatSharpOffset, interval);
    }

    function calcWholeHalfPattern() {
        let index = mode - 1;
        while (index < 0) {
            index += IONIAN_PATTERN.length;
        }
        let pattern = [];
        for (let i = 0; i < IONIAN_PATTERN.length; i++) {
            pattern[i] = IONIAN_PATTERN[(index + i) % IONIAN_PATTERN.length];
        }
        return pattern;
    }

    function toneAt(index, scaleString) {
        while (index < 0) {
            index += scaleString.length;
        }
        return scaleString.charAt(index % scaleString.length);
    }

    this.toString = () => {
        let sclStr = "";
        for (let i = 0; i < tones.length; i++) {
            sclStr += tones[i] + (i === tones.length - 1 ? "" : " ");
        }
        return sclStr;
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This part of the code handles the question cycle.

let qTones = [];
function populateQTones() {
    qTones = [];
    for (let i = 0; i < keyCBs.length; i++) {
        if (keyCBs[i].checked) {
            natural = keyCBs[i].id[0];
            flatSharp = keyCBs[i].value;
            qTones.push(new Tone(natural, flatSharp))
        }
    }
    if (qTones.length < 1) {
        keyCBs[0].checked = true;
        qTones.push(new Tone("C", 0));
    }
    shuffle(qTones);
}

let qModes = [];
function populateQModes() {
    qModes = [];
    for (let i = 0; i < modeCBs.length; i++) {
        if (modeCBs[i].checked) {
            qModes.push(modeCBs[i].value);
        }
    }
    if (qModes.length < 1) {
        modeCBs[0].checked = true;
        qModes.push(1)
    }
    shuffle(qModes);
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

let modeNames = ["ionian", "dorian", "phrygian", "lydian", "mixolydian", "aeolian", "locrian"]

let scale;

function question() {
    if (qTones.length < 1) {
        populateQTones();
    }
    if (qModes.length < 1) {
        populateQModes();
    }
    let tone = qTones.pop()
    let mode = qModes.pop()
    scale = new Scale(tone, mode);

    scaleName.textContent = tone.toString() + " " + modeNames[mode-1];

    scaleNaturals[0].textContent = scale.tones[0].toString();
    for (let i = 1; i < scaleNaturals.length; i++) {
        scaleNaturals[i].textContent = scale.tones[i].natural;
    }
}

question();

let right = 0;
let wrong = 0;

function checkAnswer() {
    if (allCorrect()) {
        right++;
        question();
    } else {
        wrong++;
    }

    rightEl.textContent = right;
    wrongEl.textContent = wrong;
    options[0].focus();
}

function allCorrect() {
    result = true;
    for (let i = 0; i < options.length; i++) {
        if (parseInt(options[i].value) != scale.tones[i+1].flatSharp) {
            result = false;
        }
        options[i].value = '0';
    }
    return result;
}

function reset() {
    qTones = [];
    qModes = [];

    right = 0;
    wrong = 0;

    rightEl.textContent = right;
    wrongEl.textContent = wrong;
    question();
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This part of the code handles the HTML page.
for (let i = 0; i < options.length; i++) {
    options[i].innerHTML = 
        `<option value = 2>##</option>
        <option value = 1>#</option>
        <option value = 0 selected> </option>
        <option value = -1>b</option>
        <option value = -2>bb</option>`
}

function checkCB(elementStr, checkboxStr) {
    let el = document.getElementById(elementStr);
    let cb = document.getElementById(checkboxStr);
    if (cb.checked) {
        el.style.visibility = "visible";
        el.style.display = "grid";
        el.hidden = false;
    } else {
        el.style.visibility = "hidden";
        el.style.display = "none";
        el.hidden = true;
    }
}

let allKeysChecked = true;
function toggleAllKeys() {
    for (let i = 0; i < keyCBs.length; i++) {
        keyCBs[i].checked = !allKeysChecked;
    }
    allKeysChecked = !allKeysChecked;
}

let allModesChecked = true;
function toggleAllModes() {
    for (let i = 0; i < modeCBs.length; i++) {
        modeCBs[i].checked = !allModesChecked;
    }
    allModesChecked = !allModesChecked;
}

document.getElementById("cheatsheet_checkbox").checked = false
document.getElementById("menu_checkbox").checked = false
checkCB('cheatsheet','cheatsheet_checkbox')
checkCB('menu','menu_checkbox')