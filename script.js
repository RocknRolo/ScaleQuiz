// Author: Roel Kemp (RocknRolo)

const options = document.getElementsByClassName("flatsharp_options");
const scaleNaturals = document.getElementsByClassName("naturals");
const scaleName = document.getElementById('scale_name');

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
    qTones = [
        new Tone("C",0),
        new Tone("D",-1),
        new Tone("D",0),
        new Tone("E",-1),
        new Tone("E",0),
        new Tone("F",0),
        new Tone("F",1),
        new Tone("G",0),
        new Tone("A",-1),
        new Tone("A",0),
        new Tone("B",-1),
        new Tone("B",0)
    ]
    shuffle(qTones);
}

let qModes = [];
function populateQModes() {
    qModes = [1,2,3,4,5,6,7]
    shuffle(qModes);
}

function shuffle(array) {
    let currentIndex = array.length;
    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
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

let score = 0;
let mistakes = 0;

function checkAnswer() {
    if (allCorrect()) {
        score++;
        question();
    } else {
        mistakes++;
        score--;
    }

    document.getElementById('score').textContent = score;
    document.getElementById('mistakes').textContent = mistakes;
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This part of the code handles populating and refreshing the HTML page.
for (let i = 0; i < options.length; i++) {
    options[i].innerHTML = 
        `<option value = 2>##</option>
        <option value = 1>#</option>
        <option value = 0 selected> </option>
        <option value = -1>b</option>
        <option value = -2>bb</option>`
}