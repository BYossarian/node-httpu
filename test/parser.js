var expect = require('chai').expect;

var httpParser = require('../lib/http-parser.js');

describe('http parser', function() {

    describe('.stringify', function() {

        it('should generate HTTP GET messages (i.e. no msg body)', function() {

            var msg = httpParser.stringify({
                    method: 'GET',
                    path: '/some/path'
                }, {
                    header1: 'value:123',
                    header2: 12345
                });

            expect(msg).to.equal('GET /some/path HTTP/1.1\r\nheader1: value:123\r\nheader2: 12345\r\n\r\n');


        });

        it('should generate HTTP POST messages (i.e. with msg body)', function() {

            var msg = httpParser.stringify({
                    method: 'POST',
                    path: '/some/path'
                }, {
                    header1: 'value1',
                    header2: 12345
                }, 'body');

            expect(msg).to.equal('POST /some/path HTTP/1.1\r\nheader1: value1\r\nheader2: 12345\r\n\r\nbody\r\n\r\n');

        });

        it('should generate HTTP response messages', function() {

            var msg = httpParser.stringify({
                    status: '200'
                }, {
                    header1: 'value1',
                    header2: 12345
                }, 'body');

            expect(msg).to.equal('HTTP/1.1 200 OK\r\nheader1: value1\r\nheader2: 12345\r\n\r\nbody\r\n\r\n');

        });

    });

    describe('.parse', function() {

        it('should parse HTTP GET messages (i.e. no msg body)', function() {

            var msg = httpParser.parse('GET /some/path HTTP/1.1\r\nheader1: value1\r\nheader2: 12345\r\n\r\n');

            expect(msg).to.deep.equal({
                type: 'req',
                method: 'GET',
                version: '1.1',
                path: '/some/path',
                headers: {
                    header1: 'value1',
                    header2: '12345'
                },
                body: ''
            });

        });

        it('should parse HTTP POST messages (i.e. with msg body)', function() {

            var msg = httpParser.parse('POST /some/path HTTP/1.1\r\nheader1: value1\r\nheader2: 12345\r\n\r\nbody\r\n\r\n');

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

        });

        it('should parse HTTP response messages', function() {

            var msg = httpParser.parse('HTTP/1.1 200 OK\r\nheader1: value1\r\nheader2: 12345\r\n\r\nbody\r\n\r\n');

            expect(msg).to.deep.equal({
                type: 'res',
                status: 200,
                statusMsg: 'OK',
                version: '1.1',
                headers: {
                    header1: 'value1',
                    header2: '12345'
                },
                body: 'body'
            });

        });

    });

});