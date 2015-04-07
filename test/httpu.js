var expect = require('chai').expect;

var httpu = require('../httpu.js'),
    dgram = require('dgram');

describe('the httpu module', function() {

    it('has a .createSocket method', function() {

        expect(httpu.createSocket).to.be.a('function');

    });

    describe('the httpu socket', function() {

        it('inherits from a UDP socket', function() {

            var socket = httpu.createSocket('udp4');

            expect(socket).to.be.an.instanceof(dgram.Socket);

        });

        it('has a .request method for sending HTTPU requests', function(done) {

            var httpuSocket = httpu.createSocket('udp4'),
                socket = dgram.createSocket('udp4'),
                expectMsg = 'POST /some/path HTTP/1.1\r\nHost: localhost:8081\r\n\r\nbody\r\n\r\n';

            socket.bind(8081, function() {

                socket.on('message', function(msg) {

                    expect(msg.toString()).to.equal(expectMsg);
                    done();

                });

            });

            httpuSocket.request({
                    method: 'POST',
                    hostname: 'localhost',
                    port: 8081,
                    path: '/some/path'
                }, {}, 'body');
            
        });

        it('has a .respond method for sending HTTPU responses', function(done) {

            var httpuSocket = httpu.createSocket('udp4'),
                socket = dgram.createSocket('udp4');

            socket.bind(8082, function() {

                socket.on('message', function(msg) {

                    var seperatedMsg = msg.toString().split('\r\n'),
                        dateSent = new Date(seperatedMsg[1].substring(5));

                    // start line
                    expect(seperatedMsg[0]).to.equal('HTTP/1.1 200 OK');

                    // date header
                    expect(seperatedMsg[1]).to.match(/^Date:/);
                    // expect date header to contain a date within 10 seconds of now:
                    expect(dateSent.getTime()).to.be.closeTo(Date.now(), 1000 * 10);
                    expect(dateSent.getTime()).to.be.lessThan(Date.now());

                    // empty lines and body
                    expect(seperatedMsg[2]).to.equal('');
                    expect(seperatedMsg[3]).to.equal('body');
                    expect(seperatedMsg[4]).to.equal('');
                    done();

                });

            });

            httpuSocket.respond({
                    status: 200,
                    hostname: 'localhost',
                    port: 8082
                }, {}, 'body');
            
        });

        it('has a \'httpuMessage\' event for receiving HTTPU messages', function(done) {

            var httpuSocket = httpu.createSocket('udp4'),
                socket = dgram.createSocket('udp4'),
                msg = new Buffer('POST /some/path HTTP/1.1\r\nheader1: value1\r\nheader2: 12345\r\n\r\nbody\r\n\r\n');

            httpuSocket.bind(8083, function() {

                httpuSocket.on('httpuMessage', function(msg, rinfo) {

                    expect(msg).to.deep.equal({
                        type: 'req',
                        method: 'POST',
                        version: '1.1',
                        path: '/some/path',
                        headers: {
                            header1: 'value1',
                            header2: '12345'
                        },
                        body: 'body'
                    });

                    expect(rinfo).to.be.a('object');

                    expect(this).to.equal(httpuSocket);

                    done();

                });

                socket.send(msg, 0, msg.length, 8083, 'localhost');

            });
            
        });

        it('can have \'httpuMessage\' event handlers attached on creation', function(done) {

            var httpuSocket = null,
                socket = dgram.createSocket('udp4'),
                msg = new Buffer('POST /some/path HTTP/1.1\r\nheader1: value1\r\nheader2: 12345\r\n\r\nbody\r\n\r\n');

            httpuSocket = httpu.createSocket('udp4', function(msg, rinfo) {

                    expect(msg).to.deep.equal({
                        type: 'req',
                        method: 'POST',
                        version: '1.1',
                        path: '/some/path',
                        headers: {
                            header1: 'value1',
                            header2: '12345'
                        },
                        body: 'body'
                    });

                    expect(rinfo).to.be.a('object');

                    expect(this).to.equal(httpuSocket);

                    done();

                });

            httpuSocket.bind(8084, function() {

                socket.send(msg, 0, msg.length, 8084, 'localhost');

            });
            
        });

    });

});