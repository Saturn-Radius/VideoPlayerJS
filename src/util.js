'use strict';
var videojs = window.videojs;
var E = module.exports;

// https://github.com/mathiasbynens/small/blob/master/mp4-with-audio.mp4
E.small_mp4_with_sound = 'data:video/mp4;base64,AAAAHGZ0eXBpc29tAAACAGlzb21pc2'
+'8ybXA0MQAAAAhmcmVlAAAC721kYXQhEAUgpBv/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
+'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
+'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
+'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
+'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
+'AAAAAAAAAAAAAAAAA3pwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
+'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcCEQBSCkG/'
+'/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
+'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
+'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
+'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
+'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADengAAAAAAAAAAAAAAAAA'
+'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
+'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAcAAAAsJtb292AAAAbG12aGQAAAAAAAAAAAAAAAAAAAPoAA'
+'AALwABAAABAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAEAAAAAAAA'
+'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADAAAB7HRyYWsAAABcdGtoZAAAAAMAAAAAAAAAAAAAAA'
+'IAAAAAAAAALwAAAAAAAAAAAAAAAQEAAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAE'
+'AAAAAAAAAAAAAAAAAAACRlZHRzAAAAHGVsc3QAAAAAAAAAAQAAAC8AAAAAAAEAAAAAAWRtZGlhAA'
+'AAIG1kaGQAAAAAAAAAAAAAAAAAAKxEAAAIAFXEAAAAAAAtaGRscgAAAAAAAAAAc291bgAAAAAAAA'
+'AAAAAAAFNvdW5kSGFuZGxlcgAAAAEPbWluZgAAABBzbWhkAAAAAAAAAAAAAAAkZGluZgAAABxkcm'
+'VmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAADTc3RibAAAAGdzdHNkAAAAAAAAAAEAAABXbXA0YQAAAA'
+'AAAAABAAAAAAAAAAAAAgAQAAAAAKxEAAAAAAAzZXNkcwAAAAADgICAIgACAASAgIAUQBUAAAAAAf'
+'QAAAHz+QWAgIACEhAGgICAAQIAAAAYc3R0cwAAAAAAAAABAAAAAgAABAAAAAAcc3RzYwAAAAAAAA'
+'ABAAAAAQAAAAIAAAABAAAAHHN0c3oAAAAAAAAAAAAAAAIAAAFzAAABdAAAABRzdGNvAAAAAAAAAA'
+'EAAAAsAAAAYnVkdGEAAABabWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAbWRpcmFwcGwAAAAAAAAAAA'
+'AAAAAtaWxzdAAAACWpdG9vAAAAHWRhdGEAAAABAAAAAExhdmY1Ni40MC4xMDE=';

E.load_script = function(url, onload, attrs){
    var script = document.createElement('script');
    script.src = url;
    script.onload = onload;
    if (attrs)
        Object.assign(script, attrs);
    if (document.getElementsByTagName('head').length)
        document.getElementsByTagName('head')[0].appendChild(script);
    else if (document.getElementsByTagName('body').length)
        document.getElementsByTagName('body')[0].appendChild(script);
    else if (document.head)
        document.head.appendChild(script);
};

E.current_script = function(){
    var script;
    if (script = document.querySelector(
        'script[src*="//player.h-cdn.com/player/"]') ||
        document.querySelector('script[src*="//player2.h-cdn.com/"]') ||
        document.querySelector(
        'script[src*="//cdn.jsdelivr.net/hola_player/"]') ||
        document.querySelector(
        'script[src*="//cdn.jsdelivr.net/npm/@hola.org/hola_player@"]'))
    {
        return script;
    }
    if (script = document.currentScript || current_script_ie())
        return script;
    // assumes wasn't loaded async
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length-1];
};

function current_script_ie(){
    try { throw new Error(); }
    catch(err) {
      var res = (/.*at [^\(]*\((.*):.+:.+\)$/ig).exec(err.stack);
      if (res)
          return document.querySelector('script[src="'+res[1]+'"]');
    }
}

var id_counter = 0;
var rand = Math.floor(Math.random()*10000)+'';
E.unique_id = function(prefix){
    return (prefix ? prefix+'_' : '')+rand+'_'+(++id_counter);
};

E.scaled_number = function(num){
    if (num===undefined)
        return '';
    if (!num)
        return '0';
    var k = 1024;
    var sizes = ['', 'K', 'M', 'G', 'T', 'P'];
    var i = Math.floor(Math.log(num)/Math.log(k));
    num /= Math.pow(k, i);
    if (num<0.001)
        return '0';
    if (num>=k-1)
        num = Math.trunc(num);
    var str = num.toFixed(num<1 ? 3 : num<10 ? 2 : num<100 ? 1 : 0);
    return str.replace(/\.0*$/, '')+sizes[i];
};

function try_play(v, cb){
    var p = v.play();
    if (p&&p.then)
    {
        p.then(function(){ cb(); }, function(error){ cb(error); });
        return;
    }
    if (v.paused)
        return cb('play refused');
    var listener = function(e){
        v.removeEventListener('playing', listener);
        v.removeEventListener('error', listener);
        v.removeEventListener('abort', listener);
        v.removeEventListener('pause', listener);
        if (e.type=='playing')
            return cb();
        var err = 'not playing: '+e.type, msg;
        if (e.type=='error' && (msg = v.error&&v.error.message))
            err += ', '+msg;
        cb(err);
    };
    v.addEventListener('playing', listener);
    v.addEventListener('error', listener);
    v.addEventListener('abort', listener);
    v.addEventListener('pause', listener);
}

E.can_autoplay = function(cb, muted, force){
    // IE older than 10.0 doesn't support this test
    if (videojs.browser.IE_VERSION && videojs.browser.IE_VERSION<10)
        return 'sound';
    if (E._can_autoplay!==undefined && !force)
    {
        if (Array.isArray(E._can_autoplay))
            return void E._can_autoplay.push(cb);
        return void cb(E._can_autoplay);
    }
    E._can_autoplay = E._can_autoplay||[];
    var v = document.createElement('video');
    v.muted = muted;
    v.setAttribute('muted', muted);
    v.setAttribute('playsinline', 1);
    v.src = E.small_mp4_with_sound;
    try_play(v, function(error){
        var res;
        if (!error)
            res = muted ? 'muted' : 'sound';
        else if (muted)
            res = false;
        if (res!==undefined)
        {
            var callbacks = E._can_autoplay;
            E._can_autoplay = res;
            cb(res);
            if (!Array.isArray(callbacks))
                return;
            for (var i=0; i<callbacks.length; i++)
                callbacks[i](res);
            return;
        }
        setTimeout(function(){ E.can_autoplay(cb, true, true); });
    });
};
