
//
// discover uPnP devices on your local network using SSDP
// spec: http://upnp.org/specs/arch/UPnP-arch-DeviceArchitecture-v1.1.pdf
//

var httpu = require('../httpu.js');

var SSDP_MULTICAST_IP = '239.255.255.250',
    SSDP_PORT = 1900;

// create socket
var socket = httpu.createSocket('udp4', function(msg, rinfo) {

        console.log(msg.headers);
        console.log(rinfo);
        console.log('\n');

    });

// bind it to a port so that messages can be received
// (remember that UDP is connectionless)
socket.bind(SSDP_PORT, function() {

        socket.setMulticastTTL(1);
        socket.addMembership(SSDP_MULTICAST_IP);

    });

// make the request for devices to identify themselves
socket.request({
        method: 'M-SEARCH',
        path: '*',
        hostname: SSDP_MULTICAST_IP,
        port: SSDP_PORT
    }, {
        MAN: '"ssdp:discover"',
        ST: 'ssdp:all',
        MX: 2
    });