
const WebSocketServer = require('ws').Server; 
const express = require('express');
const app = express();
const server = require('http').Server(app);

app.get('/', function(req, res) {
    res.status(200).send('')
});


let wss = new WebSocketServer({port: 9090})
let users = {};

wss.on('connection', function(connection) { 
    console.log("user connected")
	

    connection.on('message', function(message){ 
        let data

        //accepting only json format
        try{
            data = JSON.parse(message)
        }catch (e){
            connection.send('Only json format are addmited')
            console.log('Invalid Json')
            data ={}
        }


        // login
        switch (data.type) { 
            case "login": 
                console.log("User logged:", data.name); 
                    
                //if anyone is logged in with this username then refuse 
                if(users[data.name]) { 
                    sendTo(connection, { 
                        type: "login", 
                        success: false 
                    }); 
                } else { 
                    //save user connection on the server 
                    users[data.name] = connection; 
                    connection.name = data.name; 
                        
                    sendTo(connection, { 
                        type: "login", 
                        success: true 
                    });
                        
                }    
            break;
            case "offer": 
                //info of user A 
                console.log("Sending offer to: ", data.name); 
                var conn = users[data.name]; 
                    
                //if userb exits them send him offers details
                if(conn != null){ 
                    connection.otherName = data.name; 
                        
                    sendTo(conn, { 
                        type: "offer", 
                        offer: data.offer, 
                        name: connection.name 
                    }); 
                }
            break;
            case "answer": 
                //info user B
                console.log("Sending answer to: ", data.name); 
                    
                //for ex. UserB answers UserA 
                var conn = users[data.name]; 
                    
                if(conn != null) { 
                    connection.otherName = data.name; 
                    sendTo(conn, { 
                        type: "answer", 
                        answer: data.answer 
                    }); 
                }  
            break;
            case "candidate": 
                console.log("Sending candidate to:",data.name); 
                var conn = users[data.name]; 
                    
                if(conn != null) {
                    sendTo(conn, { 
                        type: "candidate", 
                        candidate: data.candidate 
                    }); 
                }
            break;
            case "leave": 
                console.log("Disconnecting from", data.name); 
                var conn = users[data.name]; 
                conn.otherName = null; 
                    
                //notify the other part
                if(conn != null) { 
                    sendTo(conn, { 
                        type: "leave"
                    }); 
                } 
            break;
            case "change": 
                console.log(data.name, "has changes de input devices"); 
                var conn = users[data.name];
                    
                //notify the other part
                if(conn != null) { 
                    connection.otherName = data.name; 
                    sendTo(conn, { 
                        type: "change", 
                        message: "change"
                    }); 
                } 
            break;
            case "change2": 
                var conn = users[data.name];
                    
                //notify the other part
                if(conn != null) { 
                    connection.otherName = data.name; 
                    sendTo(conn, { 
                        type: "change2", 
                        message: "change2"
                    }); 
                } 
            break;
            default: 
                sendTo(connection, { 
                    type: "error", 
                    message: "Command no found: " + data.type 
                }); 
            break; 


        }


    }); 


    connection.on("close", function() { 
        if(connection.name) { 
            delete users[connection.name];
            console.log(`User ${connection.name} are disconnected`) 
        }
        if(connection.otherName) { 
            console.log("Disconnecting from ", connection.otherName); 
            var conn = users[connection.otherName]; 
            conn.otherName = null;
                
            if(conn != null) { 
                sendTo(conn, { 
                    type: "leave" 
                }); 
            }  
            } 


    });

    connection.send("Hello from server"); 

}); 


let sendTo = (connection, message) => { 
    connection.send(JSON.stringify(message)); 
}