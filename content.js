const init = function() {
    const injectElement = document.createElement('div');
    injectElement.className = 'Black-Overlay';
    injectElement.setAttribute('id', 'Black-Overlay');
    document.body.appendChild(injectElement);
}

init();

let overlay = document.getElementById('Black-Overlay');

//turn on black overlay
function on(opacity) {
    overlay.style.display = 'block';
    overlay.style.opacity = opacity;
}

//turn of black overlay
function off() {
    overlay.style.display = 'none';
}

//listen for messages sent from popup
chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(message) {
    if(message.title == 'send-val') {
        chrome.runtime.sendMessage({
            value : overlay.style.opacity,
            displayStyle : overlay.style.display
        });
    }
    else {
        if(message.toggle) {
            on(0.75);
        }
        else if(!(message.toggle)) {
            off();
        }
    }
}