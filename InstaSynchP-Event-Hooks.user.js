// ==UserScript==
// @name        InstaSynchP Event Hooks
// @namespace   InstaSynchP
// @description Add hooks to the events on the InstaSynch page

// @version     1.0.3
// @author      Zod-
// @source      https://github.com/Zod-/InstaSynchP-Event-Hooks
// @license     GPL-3.0

// @include     http://*.instasynch.com/*
// @include     http://instasynch.com/*
// @include     http://*.instasync.com/*
// @include     http://instasync.com/*
// @grant       none
// @run-at      document-start

// @require     https://greasyfork.org/scripts/2857-jquery-bind-first/code/jquerybind-first.js
// @require     https://greasyfork.org/scripts/5647-instasynchp-library/code/InstaSynchP%20Library.js
// ==/UserScript==

function EventBase(version) {
    "use strict";
    this.version = version;
}

function ref() {
    return window.plugins.eventBase;
}

EventBase.prototype.executeOnceCore = function () {
    "use strict";

    var hooks = {
        'sendcmd':{'loc':'global','name':'SendCmd'},
        'onConnecting':{'loc':'global','name':'Connecting'},
        'onConnected':{'loc':'global','name':'Connected'},
        'onJoining':{'loc':'global','name':'Joining'},
        'onJoined':{'loc':'global','name':'Joined'},
        'onReconnecting':{'loc':'global','name':'Reconnecting'},
        'onReconnect':{'loc':'global','name':'Reconnect'},
        'reconnectFailed':{'loc':'global','name':'ReconnectFailed'},
        'onError':{'loc':'global','name':'Error'},
        'onDisconnect':{'loc':'global','name':'Disconnect'},
        'requestPartialPage':{'loc':'global','name':'RequestPartialPage'},
        'loadRoomObj':{'loc':'global','name':'LoadRoom'},
        'addMessage':{'name':'AddMessage'},
        'addUser':{'name':'AddUser'},
        'removeUser':{'name':'RemoveUser'},
        'makeLeader':{'name':'MakeLeader'},
        'renameUser':{'name':'RenameUser'},
        'addVideo':{'name':'AddVideo'},
        'removeVideo':{'name':'RemoveVideo'},
        'moveVideo':{'name':'MoveVideo'},
        'playVideo':{'name':'PlayVideo'},
        'resume':{'name':'Resume'},
        'pause':{'name':'Pause'},
        'seekTo':{'name':'SeekTo'},
        'purge':{'name':'Purge'},
        'skips':{'name':'Skips'},
        'loadPlaylist':{'name':'LoadPlaylist'},
        'loadUserlist':{'name':'LoadUserlist'},
        'createPoll':{'name':'CreatePoll'},
        'addPollVote':{'name':'AddPollVote'},
        'removePollVote':{'name':'RemovePollVote'},
        'endPoll':{'name':'EndPoll'}
    };

    function createHookFunction(ev) {
        function defaultFunction() {
                events.fire(ev.name, arguments, true);
                ev.old.apply(undefined, arguments);
                events.fire(ev.name, arguments, false);
            }
            //custom hooks
        switch (ev.name) {
        case 'RemoveUser':
            return function () {
                var args = [].slice.call(arguments);
                args.push(findUserId(args[0])); //user
                defaultFunction.apply(undefined, args);
            };
        case 'RemoveVideo':
            return function () {
                var indexOfVid = window.getVideoIndex(arguments[0].info),
                    video = window.playlist[indexOfVid],
                    args = [].slice.call(arguments);
                args.push(video);
                args.push(indexOfVid);
                defaultFunction.apply(undefined, args);
            };
        case 'MoveVideo':
            return function () {
                var args = [].slice.call(arguments);
                args.push(window.getVideoIndex(args[0]).info); //old position
                defaultFunction.apply(undefined, args);
            };
        }
        return defaultFunction;
    }
    for (var hook in hooks) {
        if (hooks.hasOwnProperty(hook)) {
            var ev = hooks[hook];
            if (ev.location && ev.location === 'global') {
                ev.old = window.global[hook];
                window.global[hook] = createHookFunction(ev);
            } else {
                ev.old = window[hook];
                window[hook] = createHookFunction(ev);
            }
        }
    }

    window.addEventListener("message", function (event) {
        try {
            var parsed = JSON.parse(event.data);
            if (parsed.action) {
                //own events
                events.fire(parsed.action, [parsed.data], false);
            }
            //all
            events.fire('PageMessage', [parsed], false);
        } catch (ignore) {}
    }, false);
};

EventBase.prototype.preConnect = function () {
    "use strict";
    var oldPlayerDestroy = window.video.destroy;
    $("#chat input").bindFirst('keypress', function (event) {
        events.fire('InputKeypress[{0}]'.format(event.keyCode), [event, $("#chat input").val()], false);
        if (event.keyCode === 13 && $("#chat input").val() !== '') {
            events.fire('SendChat', [event, $("#chat input").val()], false);
        }
    });
    $("#chat input").bindFirst('keydown', function (event) {
        events.fire('InputKeydown[{0}]'.format(event.keyCode), [event, $("#chat input").val()], false);
    });
    $("#chat input").bindFirst('keyup', function (event) {
        events.fire('InputKeyup[{0}]'.format(event.keyCode), [event, $("#chat input").val()], false);
    });
    window.video.destroy = function () {
        events.fire('PlayerDestroy', [], true);
        oldPlayerDestroy();
        events.fire('PlayerDestroy', [], false);
    };
};


window.plugins = window.plugins || {};
window.plugins.eventBase = new EventBase("1.0.3");
