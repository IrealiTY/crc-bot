'use strict';


function TokenBucket(capacity, interval) {
    
    this.capacity = capacity;
    this.interval = interval * 1000;
    this.tokens = this.capacity;
    this.lastFill = Date.now();
    this.nextFill = this.lastFill + this.interval;

}

TokenBucket.prototype.drain = function (tokens) {
    //
    // first re-fill the bucket
    var now = Date.now();
    var elapsed = (now - this.lastFill);

    var fill = Math.floor(elapsed / this.interval);
    this.tokens = Math.min(this.capacity, fill + this.tokens);

    this.lastFill += ( fill * this.interval );
    this.nextFill = this.lastFill + this.interval;

    // now drain the bucket
    tokens = Math.min(this.tokens, (tokens || 1) );
    this.tokens -= tokens;
    return(tokens);
}

module.exports = TokenBucket;