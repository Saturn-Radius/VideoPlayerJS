'use strict';
var vjs = require('video.js');

vjs.plugin('mchromecast', function(){
    var player = this;
    player.ready(function(){
        this.chromecast();
    });
});