
var dgram = require('dgram');

var httpParser = require('./lib/http-parser.js');

function request(options, headers, body) {
    // NB: the context (i.e. this) will have a udp socket in 
    // it's prototype chain

    var msg = '',
        msgBuffer = null;

    if (!options || !options.hostname) {
        throw new Error('HTTPU request message requires hostname.');
    }

    options.method = options.method || 'GET';
    options.port = options.port || 80;
    options.path = options.path || '/';

    headers = headers || {};

    // add Host header (required for HTTP/1.1)
    headers.Host = options.hostname + ':' + options.port;

    msg = httpParser.stringify({
        method: options.method,
        path: options.path
    }, headers, body);

    msgBuffer = new Buffer(msg);

    this.send(msgBuffer, 0, msgBuffer.length, options.port, options.hostname);

}

function respond(options, headers, body) {
    // NB: the context (i.e. this) will have a udp socket in 
    // it's prototype chain

    var msg = '',
        msgBuffer = null;

    if (!options || !options.hostname) {
        throw new Error('HTTPU response message requires hostname.');
    }

    options.status = options.status || 200;
    options.port = options.port || 80;

    headers = headers || {};

    // add Date header (required for HTTP/1.1)
    headers.Date = (new Date()).toUTCString();

    msg = httpParser.stringify({
        status: options.status
    }, headers, body);

    msgBuffer = new Buffer(msg);

    this.send(msgBuffer, 0, msgBuffer.length, options.port, options.hostname);

}

// creates a UDP socket that has events and methods for HTTPU
function createSocket(options, callback) {

    var udpSocket = null,
        httpUSocket = null;

    udpSocket = dgram.createSocket(options, function(msg, rinfo) {

        var parsedMsg = httpParser.parse(msg.toString());

        if (!parsedMsg) {
            // not a HTTPU message
            return;
        }

        this.emit('httpUMessage', parsedMsg, rinfo);

        if (callback) {
            callback(parsedMsg, rinfo);
        }

    });

    // push udp socket one link up the prototype chain 
    // and add httpu API to lowest level, to prevent 
    // any possible property overwriting in the future 
    // (property shadowing will still happen, but the 
    // udp socket methods will still be accessible via 
    // Object.getPrototypeOf)
    httpUSocket = Object.create(udpSocket);

    httpUSocket.request = request;
    httpUSocket.respond = respond;

    return httpUSocket;

}

module.exports = {
    createSocket: createSocket
};