// disable logging on console
var winston = require('winston');
try {
    winston.remove(winston.transports.Console);
} catch(e) {
    // swallow the error
}
