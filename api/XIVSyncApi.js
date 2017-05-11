const vsprintf = require("sprintf-js").vsprintf;
const query = require('query-string');
const https = require('https');
const Log = require('libs/Logging');

// Endpoint
const API_ENDPOINT = 'https://xivsync.com';

/**
 * API actions on XIVDB
 */
class XIVDBApi
{
    /**
     * Query XIVDB
     *
     * @param callback - 1st for syntax readability reasons
     * @param path
     */
    query(callback, path)
    {
        // request options
        let options = {
            host: API_ENDPOINT,
            port: 8443,
            path: path,
        }

        Log.echo('[XIVSYNC] Get: {url:cyan}', {
            url: (options.host + options.path),
        });

        // request
        let json = '';
        https.get(options, function(res) {
            res.on('data', function(data) {
                json += data;
            })
            .on('end', function() {
                callback(JSON.parse(json));
            });
        });
    }

    /**
     * Search for a character
     * @param name
     * @param server
     * @param callback
     */
    search(name, server, callback)
    {
        let data = {
            name: name,
            server: server,
        }

        this.query(callback, '/characters/search?' + query.stringify(data));
    }

    /**
     * Get a specific character
     *
     * @param id
     * @param callback
     */
    getCharacter(id, callback)
    {
        this.query(callback, vsprintf('/characters/get/%s', [
            id
        ]));
    }
}

module.exports = new XIVDBApi();