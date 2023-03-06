# VideoCall-WebRtc

¡¡¡please read: readme.pdf!!!!

VideoCall using Webrtc

Webrtc video Call:

To build this i use nodeJs.

The signaling server is build with websocket and the media is webrtc

 

To use this repo you should download and them go to the directory where you downloaded an run the command: `npm install`

after that you must run the command: `node server.js`  this will activate the websocket. Take in count that the ws will running in that local machine  in the port 9090 for that reason the test you will do with diferent broswers but in the same computer. In case that you wan to change to make the tests in diferents computer i recommended that running the server.js in on computer and them copy in others computers (but in the same directory) the files: “index.js” and “client.js” changing the line 30 of “client.js” for the direction of the computer with the server.js:

`let conn = new WebSocket('ws://server.Js.direction:9090');`

if you do the steps before you can open the index.html with liveServer or something similar  and them get this principal page:

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/b1bf7384-bed2-4c74-8770-9df390f06adb/Untitled.png)

You should to introduce your name and them you will be inside of your video page. (in case that the username that you choose its already in use you will be advise and you should to choose another one)

Login in both side and the you will in each side your own connection:

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/5ccde205-36e8-4467-a76b-5371106df58e/Untitled.png)

upside you can see the selectors of audio/video input/output.

and below you can see the the options to call to another user.

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/3737927e-9ff3-4375-9ec4-64035006491f/Untitled.png)

Put the name of the other user connected and the the call will be stablished by websocket the stun servers config in “server.js”.

The connection will see like this:

![Untitled](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/18b2f33d-9ee1-4e6c-b3ae-94a80f9bee77/Untitled.png)

if you have any question please let me know.

ps: if you can see the images please open “readme.pdf”

Engineer Carlos Velasco
