var irc = require("irc");

var SERVER_URL = "irc.freenode.org"; // THE IRC SERVER TO CONNECT TO
var BOT_NICK = "BareBot"; // THE BOT NICK NAME
var MAIN_CHANNEL = "#tetabots"; // THE MAIN CHANNEL TO JOIN
var CHANNELS_LIST = [MAIN_CHANNEL]; // THE LIST OF ALL CHANNELS TO JOIN
var USERS = {}; // THE USERS MAP

// Function library "name" : { "description":"", "action":function(nick, params){ function_to_call(nick, params); } } 
var FUNCTIONS = {
  "register": { "description":"Register as User to the Bot", "action":function (nick) { register(nick) } },
  "hello": { "description":"Say Hello to the Bot", "action": function (nick) { hello(nick) } },
  "leave": { "description":"Unregister", "action": function (nick){ leave(nick) } },
  "help":  { "description":"Show Help & Command details", "action": function (nick){ show_help(nick) } },
};

// IRC Client object construction
var client = new irc.Client(SERVER_URL, BOT_NICK, { channels: CHANNELS_LIST });

// Message Listener
client.addListener("message", function (from, to, msg) {
  handle_msg(from, to, msg);
});

client.addListener('registered', function(message) {
    console.log('Connected : ', message);
});

// Split the message and call the related function (if there is one)
function handle_msg(nick, chan, msg) {

  var msg_as_params = msg.split(" ");
  var func_name = msg_as_params.shift();
  var func = FUNCTIONS[func_name];

  if (func != null && func.action != null) {
    console.log("> "+ func_name + " " + nick + " " + msg_as_params.join(" "));
    func.action(nick, msg_as_params);
  }
}

// Registers a User in the USERS map
function register(nick) {
  if (USERS[nick] == null) {

    // Register the User with an Empty Object
    USERS[nick] = { registered_at: new Date() };
    echo(nick+" registered as a User");
    say_to_user(nick,"Hi, I'm glad to meet you !");
  }
}

// Simple "hello" query from the User
function hello(nick){
  if (USERS[nick] != null) {
    say_to_user(nick, "Hello "+nick+", you registered at "+USERS[nick].registered_at); 
  }else{
    say_to_user(nick, "Hello "+nick+", type 'register' so I can register you as a user"); 
  }
}

// Unregister a User
function leave(nick) {
  if (USERS[nick] != null) {
    delete USERS[nick];
    echo(nick + " is no longer a user");
    say_to_user(nick, "Bye !");
  }
}

// Send a private message to a user
function say_to_user(nick,msg) {
  client.say(nick, msg);
}

// Send a message on a channel
function say_to_channel(channel, msg){
  client.say(channel, msg);
}

// Send a log message on the Main Channel
function echo(msg) {
  client.say(MAIN_CHANNEL, "[ "+msg+" ]");
}

// Dynamic help display (custom message + function descriptions)
function show_help(nick) {

  var str = " Hello, I'm a bot. Here are my commands : \n "
  var function_names = [];
  for(var fn in FUNCTIONS){ function_names.push(fn); }
  function_names.sort();

  for(var i = 0; i<function_names.length; i++){
    var name = function_names[i];
    var func = FUNCTIONS[name];
    if(func.description != null){ str+= " - "+name+" : "+func.description+"\n" }
  }

  say_to_user(nick, str);
}