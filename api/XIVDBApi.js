const vsprintf = require("sprintf-js").vsprintf;
const query = require('query-string');
const https = require('https');
const Log = require('libs/Logging');

// Endpoint
const API_ENDPOINT = 'api.xivdb.com';

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
            port: 443,
            path: path,
        }

        Log.echo('[XIVDB] Get: {url:cyan}', {
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
     * Search for something
     *
     * @param string
     * @param callback
     */
    search(string, callback)
    {
        this.query(callback, '/search?' + query.stringify({
            string: string,
        }));
    }

    /**
     * Get an item via it's id
     *
     * @param id
     * @param callback
     */
    getItem(id, callback)
    {
        this.query(callback, vsprintf('/item/%s', [
            id
        ]));
    }
}

module.exports = new XIVDBApi();