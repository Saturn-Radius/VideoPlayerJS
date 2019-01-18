'use strict';
var vjs = require('video.js');


vjs.plugin('vgoogleanalytics', function(){
    var player = this;
    player.ready(function(){
      player.analytics({
        mode: 'GTAG',
        customDimensions: {
          'access_level': 'DEBUG',
          'uuid': '12345'
        },
        events: [
          {
            name: 'play',
            label: 'video play',
            action: 'play',
          },
          {
            name: 'pause',
            label: 'video pause',
            action: 'pause',
          },
          {
            name: 'ended',
            label: 'video ended',
            action: 'ended',
          },
          {
            name: 'fullscreenchange',
            label: {
              open: 'video fullscreen open',
              exit: 'video fullscreen exit'
            },
            action: 'fullscreen change',
          },
          {
            name: 'volumechange',
            label: 'volume changed',
            action: 'volume changed',
          },
          {
            name: 'resize',
            label: 'resize',
            action: 'resize',
          },
          {
            name: 'error',
            label: 'error',
            action: 'error',
          },
          {
            name: 'resize',
            label: 'resize',
            action: 'resize',
          },
          {
            name: 'resolutionchange',
            action: 'resolution change',
          },
          {
            name: 'timeupdate',
            action: 'time updated',
          }
        ],
        assetName: 'Seagulls video'
      });
    });
});