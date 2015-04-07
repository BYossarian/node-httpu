node-httpu
==========

A HTTPU (HTTP over UDP) implementation for node. It extends node's UDP socket with two helper methods and an extra event.

### Usage

`var socket = require('node-httpu').createSocket(options[, callback]);`

`options` can be a string, or an object as descibed in the node API docs for UDP sockets. The optional `callback` will be added 
as a handler for the `'httpUMessage'` event described below.

The `socket` is an extension of node's UDP socket to include:

##### Event: `'httpUMessage'`

Is emitted whenever the UDP socket receives a message that conforms to HTTP. The handler is passed the parsed message and 
the remote address info object.

A parsed message will take the form:

```
{
    type: <string indicating the message type: either 'req' or 'res'>,
    version: <string containing the HTTP version>,
    method: <string containing the HTTP method - request messages only>,
    path: <string containing the requested path - request messages only>,
    status: <number giving the HTTP status code - response messages only>,
    statusMsg: <string containing the HTTP status message - response messages only>,
    headers: <object containing the headers, with keys in lower case>,
    body: <string representation of the body>    
}
```

The remote address info object is as described in the node UDP docs.

##### Method: `socket.request`

Can be used to send a HTTP request over UDP.

`socket.request(options[, headers, body]);`

where:

`options.hostname` is the hostname of the destination (required);

`options.port` is the destination port (default: `80`);

`options.method` is the HTTP method (default: `GET`);

`options.path` is the requested path (default: `/`).

`headers` is an object of headers (`Host` will be added automatically);
`body` is the body of the message as a string (objects will be serialized to JSON).

##### Method: `socket.respond`

Can be used to send a HTTP response over UDP.

`socket.respond(options[, headers, body]);`

where:

`options.hostname` is the hostname of the destination (required);

`options.port` is the destination port (default: `80`);

`options.status` is the HTTP status (default: `200`).

`headers` is an object of headers (`Date` will be added automatically);
`body` is the body of the message as a string (objects will be serialized to JSON).