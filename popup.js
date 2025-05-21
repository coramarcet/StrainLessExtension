document.addEventListener('DOMContentLoaded', () => {
    //button constants
    //const button = document.getElementById('button');
    const deviationRequest = document.getElementById('deviationRequestButton');
    const setSeatBaselineButton = document.getElementById('setSeatBaseline');
    const blinkRequestButton = document.getElementById('blinkRequestButton');
    const setNeckAngleBaselineButton = document.getElementById('setNeckAngleBaseline');
    const getUpdatedNeckAngleButton = document.getElementById('neckAngleRequestButton');

    //load images for seat heat map display
    const img = document.createElement('img');
    img.src = 'empty.png';
    const imgFilled = document.createElement('img');
    imgFilled.src = 'filled.png';
    const c1 = document.getElementById('canvas1');
    const c2 = document.getElementById('canvas2');
    const c3 = document.getElementById('canvas3');
    const c4 = document.getElementById('canvas4');

    const iframe = document.getElementById('frame');

    //options for system tray notification
    const options = {
        type: 'basic',
        title: 'StrainLess',
        message: 'Please correct your posture.',
        iconUrl: 'icon seat.png'
    };

    //options for system tray notification for neck angle alert
    const optionsNeck = {
        type: 'basic',
        title: 'StrainLess',
        message: 'Consider making your head more upright.',
        iconUrl: 'icon neck.png'
    }

    //options for system tray notification for blink alert
    const optionsBlink = {
        type: 'basic',
        title: 'StrainLess',
        message: 'Consider looking away from the screen, you are exhibiting symptoms of eye strain.',
        iconUrl: 'icon blink.jpg'
    }

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
                //document.getElementById('response').innerText = data.deviations;
                if(data.deviations[1] === '1') {
                    //turn top oval red
                    c1.getContext('2d').drawImage(imgFilled, 0, 0);
                    //chrome.notifications.create(options);
                }
                if(data.deviations[1] === '0') {
                    //turn top oval white
                    c1.getContext('2d').drawImage(img, 0, 0);
                }
                if(data.deviations[4] === '1') {
                    //turn right oval red
                    c2.getContext('2d').drawImage(imgFilled, 0, 0);
                    //chrome.notifications.create(options);
                }
                if(data.deviations[4] === '0') {
                    //turn right oval white
                    c2.getContext('2d').drawImage(img, 0, 0);
                }
                if(data.deviations[7] === '1') {
                    //turn left oval red
                    c4.getContext('2d').drawImage(imgFilled, 0, 0);
                    //chrome.notifications.create(options);
                }
                if(data.deviations[7] === '0') {
                    //turn left oval white
                    c4.getContext('2d').drawImage(img, 0, 0);
                }
                if(data.deviations[10] === '1') {
                    //turn bottom oval red
                    c3.getContext('2d').drawImage(imgFilled, 0, 0);
                    //chrome.notifications.create(options);
                }
                if(data.deviations[10] === '0') {
                    //turn bottom oval white
                    c3.getContext('2d').drawImage(img, 0, 0);
                }
            })
            .catch(error => console.error('Error:', error));
    }

    function sendRequestAverage() {
        fetch('http://172.26.192.18:5000/average_deviation')
            .then(response => response.json())
            .then(data => {
                //document.getElementById('response').innerText = data.deviations;
                if(data.average_devs[1] === '1') {
                    //turn top oval red
                    //c1.getContext('2d').drawImage(imgFilled, 0, 0);
                    chrome.notifications.create(options);
                }
                if(data.average_devs[1] === '0') {
                    //turn top oval white
                    //c1.getContext('2d').drawImage(img, 0, 0);
                }
                if(data.average_devs[4] === '1') {
                    //turn right oval red
                    //c2.getContext('2d').drawImage(imgFilled, 0, 0);
                    chrome.notifications.create(options);
                }
                if(data.average_devs[4] === '0') {
                    //turn right oval white
                    //c2.getContext('2d').drawImage(img, 0, 0);
                }
                if(data.average_devs[7] === '1') {
                    //turn left oval red
                    //c4.getContext('2d').drawImage(imgFilled, 0, 0);
                    chrome.notifications.create(options);
                }
                if(data.average_devs[7] === '0') {
                    //turn left oval white
                    //c4.getContext('2d').drawImage(img, 0, 0);
                }
                if(data.average_devs[10] === '1') {
                    //turn bottom oval red
                    //c3.getContext('2d').drawImage(imgFilled, 0, 0);
                    chrome.notifications.create(options);
                }
                if(data.average_devs[10] === '0') {
                    //turn bottom oval white
                    //c3.getContext('2d').drawImage(img, 0, 0);
                }
            })
            .catch(error => console.error('Error:', error));
    }

    //send test notification
    //button.addEventListener('click', () => {
    //    chrome.notifications.create(optionsBlink);
    //})

    function getBlink() {
        fetch('http://172.26.192.18:5000/request_blink')
            .then(response => response.json())
            .then(data => {
                //document.getElementById('response').innerText = data.message;
                //send notification to take break from screen if user's blink rate is under 10 blinks/minute
                if(parseInt(data.message) < 10) {
                    chrome.notifications.create(optionsBlink);
                }
                //send message to sandbox.html to update graph
                var message = {
                    type: 'blink',
                    updated_value: parseInt(data.message)
                };
                iframe.contentWindow.postMessage(message, '*');
            })
            .catch(error => console.error('Error:', error));
    }

    //send request to server to get updated blink count
    blinkRequestButton.addEventListener('click', () => {
        setInterval(getBlink, 60000);
    })

    //send request to server to set baseline
    setSeatBaselineButton.addEventListener('click', () => {
        fetch('http://172.26.192.18:5000/save')
            .then(response => response.json())
            .then(data => {
                //document.getElementById('response').innerText = data.message;
            })
            .catch(error => console.error('Error:', error));
    })

    //send request to server to get deviation data
    deviationRequest.addEventListener('click', () => {
        //calls sendRequest function every 2.5 seconds
        setInterval(sendRequest, 2500);
        setInterval(sendRequestAverage, 2500);
    })

    //change shape displayed
    //changeShapeButton.addEventListener('click', () => {
    //    c1.getContext('2d').drawImage(imgFilled, 0, 0);
    //    c2.getContext('2d').drawImage(imgFilled, 0, 0);
    //    c3.getContext('2d').drawImage(imgFilled, 0, 0);
    //    c4.getContext('2d').drawImage(imgFilled, 0, 0);
    //})

    //send request to server to set baseline for neck angle
    setNeckAngleBaselineButton.addEventListener('click', () => {
        fetch('http://172.26.192.18:5000/neck_angle_calibration')
            .then(response => response.json())
            .then(data => {
                //document.getElementById('response').innerText = data.message;
            })
            .catch(error => console.error('Error:', error));
    })

    //send request to server to get updated neck angle value
    function sendRequestNeckAngle() {
        fetch('http://172.26.192.18:5000/get_updated_neck_angle', {method: 'POST'})
            .then(response => response.json())
            .then(data => {
                //document.getElementById('response').innerText = data.message;
                if(data.neck_alert) {
                    chrome.notifications.create(optionsNeck);
                }
                var message = {
                    type: 'neck',
                    updated_value: parseInt(data.message)
                };
                iframe.contentWindow.postMessage(message, '*');
            })
            .catch(error => console.error('Error:', error));
    }

    getUpdatedNeckAngleButton.addEventListener('click', () => {
        setInterval(sendRequestNeckAngle, 6000);
    })

    function fetchVal(tabs) {
        for(const tab of tabs) {
            chrome.tabs.sendMessage(tab.id, message = { title : 'send-val'});
        }
    }

    function gotTabs(tabs) {
        for(const tab of tabs) {
            chrome.tabs.sendMessage(tab.id, message = { toggle : true });
        }
    }

    const date = new Date();
    const hour = date.getHours();
    //const hour = 2;
    //if between the hours of 7 pm and 6 am, dim tabs to reduce eye strain
    if(hour >= 19 || hour <= 6) {
        //get tabs information
        chrome.tabs.query({}, fetchVal);

        //send tabs information
        chrome.tabs.query({}, gotTabs);
    }
})