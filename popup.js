document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('button');
    const deviationRequest = document.getElementById('deviationRequestButton');
    const setSeatBaselineButton = document.getElementById('setSeatBaseline');
    const slider = document.getElementById('slider');
    const output = document.getElementById('val');
    const check = document.getElementById('overlayToggle');
    const changeShapeButton = document.getElementById('changeShapeButton');
    const blinkRequestButton = document.getElementById('blinkRequestButton');
    const setNeckAngleBaselineButton = document.getElementById('setNeckAngleBaseline');
    const changeDataButton = document.getElementById('changeDataButton');

    const img = document.createElement('img');
    img.src = 'empty.png';
    const imgFilled = document.createElement('img');
    imgFilled.src = 'filled.png';
    const c1 = document.getElementById('canvas1');
    const c2 = document.getElementById('canvas2');
    const c3 = document.getElementById('canvas3');
    const c4 = document.getElementById('canvas4');

    //load images
    img.addEventListener('load', () => {
        c1.getContext('2d').drawImage(img, 0, 0);
        c2.getContext('2d').drawImage(img, 0, 0);
        c3.getContext('2d').drawImage(img, 0, 0);
        c4.getContext('2d').drawImage(img, 0, 0);
    })

    //send request to server for pressure sensor information
    function sendRequest() {
        fetch('http://172.26.192.18:5000/deviation')
            .then(response => response.json())
            .then(data => {
                document.getElementById('response').innerText = data.deviations;
                if(data.deviations[1] === '1') {
                    //turn top oval red
                    c1.getContext('2d').drawImage(imgFilled, 0, 0);
                }
                if(data.deviations[1] === '0') {
                    //turn top oval white
                    c1.getContext('2d').drawImage(img, 0, 0);
                }
                if(data.deviations[4] === '1') {
                    //turn right oval red
                    c2.getContext('2d').drawImage(imgFilled, 0, 0);
                }
                if(data.deviations[4] === '0') {
                    //turn right oval white
                    c2.getContext('2d').drawImage(img, 0, 0);
                }
                if(data.deviations[7] === '1') {
                    //turn left oval red
                    c4.getContext('2d').drawImage(imgFilled, 0, 0);
                }
                if(data.deviations[7] === '0') {
                    //turn left oval white
                    c4.getContext('2d').drawImage(img, 0, 0);
                }
                if(data.deviations[10] === '1') {
                    //turn bottom oval red
                    c3.getContext('2d').drawImage(imgFilled, 0, 0);
                }
                if(data.deviations[10] === '0') {
                    //turn bottom oval white
                    c3.getContext('2d').drawImage(img, 0, 0);
                }
            })
            .catch(error => console.error('Error:', error));
    }

    //send test notification
    button.addEventListener('click', () => {
        let options = {
            type: 'basic',
            title: 'StrainLess',
            message: 'Please correct your posture.',
            iconUrl: 'icon.png'
        };
        chrome.notifications.create(options);
    })

    //send request to server to get updated blink count
    blinkRequestButton.addEventListener('click', () => {
        fetch('http://172.26.192.18:5000/request_blink')
            .then(response => response.json())
            .then(data => {
                document.getElementById('response').innerText = data.message;
            })
            .catch(error => console.error('Error:', error));
    })

    //send request to server to set baseline
    setSeatBaselineButton.addEventListener('click', () => {
        fetch('http://172.26.192.18:5000/save')
            .then(response => response.json())
            .then(data => {
                document.getElementById('response').innerText = data.message;
            })
            .catch(error => console.error('Error:', error));
    })

    //send request to server to get deviation data
    deviationRequest.addEventListener('click', () => {
        //calls sendRequest function every 5 seconds
        let intervalId = setInterval(sendRequest, 2500);
    })

    //change shape displayed
    changeShapeButton.addEventListener('click', () => {
        c1.getContext('2d').drawImage(imgFilled, 0, 0);
        c2.getContext('2d').drawImage(imgFilled, 0, 0);
        c3.getContext('2d').drawImage(imgFilled, 0, 0);
        c4.getContext('2d').drawImage(imgFilled, 0, 0);
    })

    //send request to server to set baseline for neck angle
    setNeckAngleBaselineButton.addEventListener('click', () => {
        fetch('http://172.26.192.18:5000/neck_angle_calibration')
            .then(response => response.json())
            .then(data => {
                document.getElementById('response').innerText = data.message;
            })
            .catch(error => console.error('Error:', error));
    })

    //change data on graph (demonstrates exchange between main extension code and sandbox)
    changeDataButton.addEventListener('click', () => {
        var iframe = document.getElementById('frame');
        var message = { data: 15 };
        iframe.contentWindow.postMessage(message, '*');
    })

    //get open tabs information
    chrome.tabs.query({}, fetchVal);

    function fetchVal(tabs) {
        for(const tab of tabs) {
            chrome.tabs.sendMessage(tab.id, message = { title : 'send-val'});
        }
    }

    chrome.runtime.onMessage.addListener(gotVal);
   
    //render the UI for when popup is opened
    function gotVal(message) {
        //setting the slider and the val values
        val = 1-message.value;
        slider.value = val; 
        output.innerHTML =(Math.round(val*100)) + '%';

        //check if the checkbox is on or not when opening the popup
        if(message.displayStyle === 'block') {
            check.checked = true;
        }
        else {
            check.checked = false;
        }
    }

    let msg;
    //update current slider value
    slider.oninput = function() {
        output.innerHTML = (Math.round(slider.value*100)) + "%"; //display the default slider value

        chrome.tabs.query({}, gotTabs);

        function gotTabs(tabs) {

            msg = {
                value : slider.value,
                toggle : check.checked,
            }

            for(const tab of tabs) {
                chrome.tabs.sendMessage(tab.id, message = msg);

            }
        }
    }

    //adjust brightness of screen
    check.onchange = function() {
        chrome.tabs.query({}, gotTabs);

        function gotTabs(tabs) {
            //if the check box is checked
            if(check.checked) {
                msg = {
                    value : slider.value,
                    toggle : true,
                }
            }
            else {
                msg = {
                    value : slider.value,
                    toggle : false,
                }
            }

            for(const tab of tabs) {
                chrome.tabs.sendMessage(tab.id, message = msg);
            }
        }
    }
})