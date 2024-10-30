Hi this is Ajani and here are just some notes I wanted to make regarding the demo. Creating a standalone WS server:

Link to node.js Websocket documentation: https://github.com/websockets/ws/blob/master/doc/ws.md

** Server Info: **
Setup:

Need to do - npm install ws (websockets)

By specifying the port on localhost, it means the server will only be accessible from my local machine - to allow conenctions from other devices on the same network, use machine's local IP address
The port doesn't have to be 3000, ask recommendation for port from professor when you get the chance...

I believe the way the web socket works is that it acts as a proxy between clients. 
It receives commands via a client initiating a send on the websocket (ws.send) - the server, when dealing with a particular web socket, then has a (ws.on) function to handle an event being called. I think the parameters for ws.on might change based on the object sent. But when we send a string, the server will deal with it via (ws.on('message', () => {...}))



** Client Info **
I believe each client needs to create a new socket within their script. But how will that maintain?

General thoughts:

Potential issues/future concerns:
We need a websocket to persist for a particular user and not dissapear upon page refresh. Need to look up how to externally maintain web socket, maybe in separate client-side JS file? Hm..
Actually thinking about it some more, it's okay if socket reloads, we just need to have a way to maintain the chat history on reload...

Also need to send information to send in addition to a websocket. Or maybe it doesn't have to be? 

Move to use socketio wrapper to support room functionality - each web socket h
[key is a room code, value is a list of sockets] - essentially socketio
== have new leader assigned (whos initial leader: one who creates thr group)
== how is the voting happen (what ahppens if there's an even amount and there's a tie - can leader break it) 
== storing chat messages, user accounts, calendar event dates, group codes watchlist
== every book has api id , thinking about storing books locally and querying
== nominat

need some way to save user data... to save group data within the context of a user's page... need to combine the server's code

things to ask prof long
-authorization/authentication bit  - argon, becrypt
-way to acces susie's db from our computers
-remembering 
    - when person logs in, generate session token which is stored as a token in a cookie AND database remembers the token..
    - way to get the cookie in the early part of conenction, cookie is http header, 
    - can look for cookie in socket 

i think maybe i can still maintain a websocket on an indiciaul pafe, file that they serve can create websocket
sockets has to be created per user but their chat data should still persist (because it's being called from database every time page loads? )

Helpful resources for room/namespaces debacle-ness:
https://stackoverflow.com/questions/10930286/socket-io-rooms-or-namespacing
https://socket.io/docs/v4/rooms/ - living more for rooms since thats what prof suggested also

every user (instance) would then have an individual socket - thinking about users joining different groups... socket can be a part of different rooms and send messaged to that room
question/point of clarification, how can i get that socket to be like persisting across a client -- can't really, has to be created on load of a group page