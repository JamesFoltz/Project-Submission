// index.js

const TYPE_SOUND_SRC = 'type.wav';

function typeOutHTML(target, html, onDone) {
    let i = 0;
    let isTag = false;
    let tagBuffer = '';
    let output = '';

    function type() {
        if (i >= html.length) {
            if (onDone) onDone();
            return;
        }
        let char = html[i];

        if (char === '<') {
            isTag = true;
            tagBuffer = '';
        }

        if (isTag) {
            tagBuffer += char;
            if (char === '>') {
                output += tagBuffer;
                target.innerHTML = output;
                isTag = false;
            }
        } else {
            output += char;
            target.innerHTML = output;
            // Play sound for visible characters only
            if (char.trim() && char !== '\n') {
                let snd = new Audio(TYPE_SOUND_SRC);
                snd.volume = 0.14;
                snd.play();
            }
        }
        i++;
        // Auto-scroll to bottom
        target.scrollTop = target.scrollHeight;
        // Fast typing, but yield every 8 chars for browser responsiveness
        if (i % 8 === 0) {
            setTimeout(type, 0);
        } else {
            type();
        }
    }
    type();
}

// Sequence: type out each container, one after another
const containers = [
    { id: 'l-con', html: null },
    { id: 'rt-con', html: null },
    { id: 'rb-con', html: null }
];

// Utility to get URL parameters
function getURLParams() {
    const params = {};
    window.location.search
        .substring(1)
        .split('&')
        .forEach(pair => {
            const [key, value] = pair.split('=');
            if (key) params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        });
    return params;
}

window.addEventListener('DOMContentLoaded', () => {
    const params = getURLParams();
    const disableTyping = params['type'] === 'false' || params['type'] === '0' || params['type'] === 'no';

    containers.forEach(c => {
        const el = document.getElementById(c.id);
        if (!el) return;
        c.html = el.innerHTML;
        if (disableTyping) {
            // Restore original HTML and apply flicker effect
            el.innerHTML = c.html;
            el.classList.add('flicker-on');
            // Remove the flicker class after animation completes (600ms)
            setTimeout(() => el.classList.remove('flicker-on'), 600);
        } else {
            // Clear content for typing effect
            el.innerHTML = '';
        }
    });

    if (disableTyping) {
        // No typing effect, no keypress needed
        return;
    }
});

function typeSequence(index = 0) {
    if (index >= containers.length) return;
    const c = containers[index];
    const el = document.getElementById(c.id);
    typeOutHTML(el, c.html, () => typeSequence(index + 1));
}

// Only trigger once, on first keypress, if typing is enabled
let started = false;
window.addEventListener('keydown', () => {
    const params = getURLParams();
    const disableTyping = params['type'] === 'false' || params['type'] === '0' || params['type'] === 'no';
    if (disableTyping) return;

    if (started) return;
    started = true;
    typeSequence(0);
});
