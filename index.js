const socket = require("socket.io-client");
const events = require("events");
const superagent = require("superagent");

let eventEmitter = new events.EventEmitter();

class Client {
    constructor(url){
        if(typeof url != "string") throw "Invalid type, needs to be an String";
        async function login(token){
            if(typeof token != "string") throw "Invalid type, needs to be an String";
            superagent.post(url+"/api/v1/banned").set("Authorization", token).send(null).end((err,res)=>{
                if(JSON.parse(res.text).banned == true){throw "Opps, bot banned"}
            });
            global.io = socket.connect(url);

            global.token = token;

            eventEmitter.emit("ready");

            io.on("messageCreate", (message) => {
                let messageScorpio = {};
                messageScorpio.content = message.message;
                messageScorpio.author = {};
                messageScorpio.author.name = message.author;

                messageScorpio.createdAt = {};
                messageScorpio.createdAt.Hours = message.timestampH;
                messageScorpio.createdAt.Minutes = message.timestampM;

                eventEmitter.emit("message", messageScorpio);
            });
            
            return true;
        }

        function on(eventName, theFunction) {
            eventEmitter.on(eventName, theFunction);
        }

        async function send(content){
            if(typeof content != "string") throw "Invalid type, needs to be an String";
            if(!io) throw "Bot needs to be logged to this work!";
            io.emit("messageForServer", {token: global.token, message: content});
        }
        
        return {login, on, send}
    }
}

module.exports.Client = Client;