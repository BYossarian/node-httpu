
// Basic HTTP parser

var reasonPhrases = require('http').STATUS_CODES;

var HTTP_REGEX = /^http\//i,
    WHITESPACE = /\s+/,
    SEPARATOR = /\s*\:\s*/;

function _parseInitialLine(startLine) {

    if (typeof startLine !== 'string') { return null; }

    var parts = startLine.trim().split(WHITESPACE);

    if (HTTP_REGEX.exec(parts[0])) {
        // response

        return {
            type: 'res',
            version: parts[0].substring(5),
            status: parseInt(parts[1], 10) || 0,
            statusMsg: parts[2] || ''
        };

    } else if (HTTP_REGEX.exec(parts[2])) {
        // request

        return {
            type: 'req',
            version: parts[2].substring(5),
            method: parts[0].toUpperCase(),
            path: parts[1]
        };

    } else {
        // incorrectly formatted inital line
        return null;
    }

}

// takes a complete HTTP msg as a string, and 
// parses it into parts
function parse(msg) {

    var lines = msg.trim().split(/\r?\n/),
        line = '',
        parsedMsg = _parseInitialLine(lines[0]),
        headers = {},
        body = '',
        key = '',
        value = '',
        firstChar = '',
        separation = 0;

    if (!parsedMsg) {
        // incorrectly formatted start line
        return null;
    }

    // parse headers
    // http://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.2
    for (var i = 1, l = lines.length; i < l; i++) {

        line = lines[i];
        firstChar = line[0];

        // normalise whitespace
        line = line.trim().replace(/\s+/g, ' ');

        if (line === '') {
            // end of headers
            break;
        }

        // header lines starting with a space or a horizontal tab are
        // actually part of the preceeding header (see spec)
        if (firstChar === ' ' || firstChar === '\t') {
            // need to check we're not on the first header so:
            if (key) {
                headers[key] += (' ' + line);
                continue;
            }
        }

        separation = SEPARATOR.exec(line);

        if (!separation) {
            // incorrectly formatted headers
            return null;
        }

        key = line.substring(0, separation.index).toLowerCase();
        value = line.substring(separation.index + separation[0].length);

        if (key) {
            headers[key] = value;
        } else {
            // incorrectly formatted headers
            return null;
        }

    }

    // body
    body = lines.slice(i).join('').trim();

    parsedMsg.headers = headers;
    parsedMsg.body = body;

    return parsedMsg;

}

// creates a http message string
function stringify(startLine, headersObj, body) {

    var msg = '',
        headersKeys = Object.keys(headersObj),
        headersCount = headersKeys.length,
        headersArray = new Array(headersCount),
        headers = '',
        key = '',
        value = '';

    if (startLine.status) {
        // response

        startLine = 'HTTP/' + (startLine.version || '1.1') + ' ' + startLine.status + ' ' + (reasonPhrases[startLine.status] || '');
    } else {
        // request

        startLine = (startLine.method || 'GET') + ' ' + (startLine.path || '/') + ' HTTP/' + (startLine.version || '1.1');
    }

    // headers
    for (var i = 0; i < headersCount; i++) {

        key = headersKeys[i];
        value = headersObj[key];

        if (typeof value === 'undefined') { continue; }

        headersArray[i] = key + ': ' + value + '\r\n';

    }

    headers = headersArray.join('');

    // body
    if (typeof body === 'object') {
        body = JSON.stringify(body) || '';
    }

    msg = startLine + '\r\n' + headers + '\r\n' + (body ? body + '\r\n\r\n' : '');

    return msg;

}

module.exports = {
    parse: parse,
    stringify: stringify
};
