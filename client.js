
//Use
let name; 
let connectedUser;

//styles var
const loginPage = document.querySelector('#loginPage'); 
const usernameInput = document.querySelector('#usernameInput'); 
const loginBtn = document.querySelector('#loginBtn'); 
const callPage = document.querySelector('#callPage'); 
const callToUsernameInput = document.querySelector('#callToUsernameInput');
const callBtn = document.querySelector('#callBtn'); 
const hangUpBtn = document.querySelector('#hangUpBtn');
const localVideo = document.getElementById('localVideo'); 
const remoteVideo = document.querySelector('#remoteVideo');
let yourConn; 
let stream;
const audioInputSelect = document.querySelector('select#audioSource');
const audioOutputSelect = document.querySelector('select#audioOutput');
const videoSelect = document.querySelector('select#videoSource');
const selectors = [audioInputSelect, audioOutputSelect, videoSelect];

//hide call page without login
callPage.style.display = "none";




//connecting to signaling server 
let conn = new WebSocket('ws://localhost:9090');

conn.onopen = function () { 
console.log("Connected to the signaling server"); 
};

//when we got a message from a signaling server 
conn.onmessage = function async(msg) { 
    console.log("Got message: ", msg.data);

    var data = JSON.parse(msg.data);

    switch(data.type) { 
        case "login": 
            start();
            handleLogin(data.success);
            break; 
        case "offer": 
            handleOffer(data.offer, data.name); 
            break; 
        case "answer": 
            handleAnswer(data.answer); 
            break; 
        case "candidate": 
            handleCandidate(data.candidate); 
            break; 
        case "leave": 
            handleLeave(); 
            break; 
        case "change":
            second()
            start()
            break;
        case "change2":
            start()
        default: 
            break; 
    }
};

conn.onerror = function (err) { 
console.log("Got error", err); 
};




//Events
loginBtn.addEventListener("click", function (event) { 
    name = usernameInput.value; 
    //send the login to ws
    if (name.length > 0) { 
        send({ 
            type: "login", 
            name: name 
        }); 
    } 

});

//functions

let handleLogin = async(success)  => { 

    if (success === false) { 
        alert("Ooops...try a different username"); 
    } else { 
        //display the call page if login is successful 
        loginPage.style.display = "none"; 
        callPage.style.display = "block";


    //-------STARTING A PEER CONNECTION-----

        navigator.webkitGetUserMedia({ video: true, audio: true }, function (myStream) { 
        stream = myStream; 
        
        //let localStream = new MediaStream()
        localVideo.srcObject = stream
            
        //using Google public stun server 
        let configuration = { 
            "iceServers": [{ "url": "stun:stun2.1.google.com:19302" }] 
        }; 
            
        yourConn = new webkitRTCPeerConnection(configuration);
            
        // setup stream listening 
        yourConn.addStream(stream); 
            
        //when a remote user adds stream to the peer connection, we display it 
        yourConn.onaddstream = function (e) { 
            remoteVideo.srcObject = (e.stream); 
        };
                
        // Setup ice handling 
        yourConn.onicecandidate = function (event) {
            
            if (event.candidate) { 
            send({ 
                type: "candidate", 
                candidate: event.candidate 
            }); 
            } 
                
        };
                
        },function (error) { 
            console.log(error); 
        }); 
    //----END CONFIG PEER CONNECTION------

    } 
};

callBtn.addEventListener("click", function () { 
    let callToUsername = callToUsernameInput.value; 
        
    if (callToUsername.length > 0) {
        connectedUser = callToUsername;
            
        // create an offer
        yourConn.createOffer(function (offer) { 
            send({ 
                type: "offer", 
                offer: offer 
            }); 
                
            yourConn.setLocalDescription(offer); 
                
        }, function (error) { 
            alert("Error when creating an offer"); 
        });  
    } 
});

//when somebody sends us an offer 
let handleOffer = (offer, name) => { 
    connectedUser = name; 
    yourConn.setRemoteDescription(new RTCSessionDescription(offer));
        
    //create an answer to an offer 
    yourConn.createAnswer(function (answer) { 
        yourConn.setLocalDescription(answer); 
            
        send({ 
            type: "answer", 
            answer: answer 
        }); 
            
    }, function (error) { 
        alert("Error when creating an answer"); 
    }); 
};

//answer from remote
let handleAnswer = (answer) => { 
    yourConn.setRemoteDescription(new RTCSessionDescription(answer));
    }; 

//ice of remote
let handleCandidate = (candidate) => { 
    yourConn.addIceCandidate(new RTCIceCandidate(candidate)); 
};


hangUpBtn.addEventListener("click", function () { 

    send({ 
        type: "leave" 
    });
    handleLeave(); 
});

let handleLeave = () => { 
    connectedUser = null; 
    remoteVideo.src = null;
    yourConn.close(); 
    yourConn.onicecandidate = null; 
    yourConn.onaddstream = null; 

    window.location.reload();

};


//Functions to change the audio/video source and audio output:
let gotDevices =  (deviceInfos) => {
    const values = selectors.map(select => select.value);
    selectors.forEach(select => {
        while (select.firstChild) {
        select.removeChild(select.firstChild);
        }
    });
    for (let i = 0; i !== deviceInfos.length; ++i) {
        const deviceInfo    = deviceInfos[i];
        const option        = document.createElement('option');
        option.value        = deviceInfo.deviceId;
        if (deviceInfo.kind === 'audioinput') {
            option.text = deviceInfo.label || `microphone ${audioInputSelect.length + 1}`;
            audioInputSelect.appendChild(option);
        } else if (deviceInfo.kind === 'audiooutput') {
            option.text = deviceInfo.label || `speaker ${audioOutputSelect.length + 1}`;
            audioOutputSelect.appendChild(option);
        } else if (deviceInfo.kind === 'videoinput') {
            option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
            videoSelect.appendChild(option);
        } else {
            console.log('Some other kind of source/device: ', deviceInfo);
        }
        }
        selectors.forEach((select, selectorIndex) => {
        if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
            select.value = values[selectorIndex];
        }
        });
}

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch('error device');


let attachSinkId =  (element, sinkId) => {
    if (typeof element.sinkId !== 'undefined') {
        element.setSinkId(sinkId)
            .then(() => {
            console.log(`Success, audio output device attached: ${sinkId}`);
            })
            .catch(error => {
            let errorMessage = error;
            if (error.name === 'SecurityError') {
                errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
            }
            console.error(errorMessage);
            audioOutputSelect.selectedIndex = 0;
            });
    } else {
        console.warn('Browser does not support output device selection.');
    }
}




let changeAudioDestination =  () =>{
    const audioDestination = audioOutputSelect.value;
    attachSinkId(localVideo, audioDestination);
}


let  gotStream =  (stream) => {
    window.stream = stream;
    localVideo.srcObject = stream;
    remoteVideo.srcObject = stream;


    return navigator.mediaDevices.enumerateDevices();
}

let start = async() => {
    if (window.stream) {
        window.stream.getTracks().forEach(track => {
        track.stop();
        });
    }
    const audioSource = audioInputSelect.value;
    const videoSource = videoSelect.value;
    const constraints = {
        audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
        video: {deviceId: videoSource ? {exact: videoSource} : undefined}
    };
await navigator.mediaDevices.getUserMedia(constraints).then(gotStream).then(gotDevices).catch('error device');
}

let changeInput = () =>{
    send({ 
        type: "change",
    }); 
}

//this function its called to callback my own peer
let second = () =>{
    send({ 
        type: "change2",
    }); 
}



    audioInputSelect.onchange = changeInput;
    audioOutputSelect.onchange = changeAudioDestination;

    videoSelect.onchange = changeInput;



//alias for sending JSON encoded messages 
let send = (message) => { 
//attach the 2nd username
    if (connectedUser) { 
        message.name = connectedUser; 
    } 

conn.send(JSON.stringify(message));
};