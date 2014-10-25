// ==UserScript==
// @name        InstaSynchP Event Hooks
// @namespace   InstaSynchP
// @description Add hooks to the events on the InstaSynch page

// @version     1.0.8
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

function EventHooks(version) {
    "use strict";
    this.version = version;
    this.name = 'InstaSynchP Event Hooks';
    this.resetVariables();
}

EventHooks.prototype.executeOnceCore = function () {
    "use strict";
    var th = this,
        oldLinkify = window.linkify,
        hooks = {
        'onConnecting':{'location':'global','name':'Connecting'},
        'onConnected':{'location':'global','name':'Connected'},
        'onJoining':{'location':'global','name':'Joining'},
        'onJoined':{'location':'global','name':'Joined'},
        'onReconnecting':{'location':'global','name':'Reconnecting'},
        'onReconnect':{'location':'global','name':'Reconnect'},
        'reconnectFailed':{'location':'global','name':'ReconnectFailed'},
        'onError':{'location':'global','name':'Error'},
        'onDisconnect':{'location':'global','name':'Disconnect'},
        'requestPartialPage':{'location':'global','name':'RequestPartialPage'},
        'loadRoomObj':{'location':'global','name':'LoadRoom'},
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

    window.linkify = function (str, buildHashtagUrl, includeW3, target) {
        var tags = [],
            index = -1;
        //remove image urls so they wont get linkified
        str = str.replace(/(src|href)=\"([^\"]*)\"/gi, function ($0, $1, $2) {
            tags.push({
                'tagName': $1,
                'url': $2
            });
            return '{0}=\"\"'.format($1);
        });
        str = oldLinkify(str, buildHashtagUrl, includeW3, target);
        //put them back in
        str = str.replace(/(src|href)=\"\"/gi, function () {
            index += 1;
            return '{0}="{1}"'.format(tags[index].tagName, tags[index].url);
        });
        return str;
    };

    function countUser(user, neg) {
        var inc = (typeof neg === 'boolean' && neg) ? -1 : 1;
        if (user.permissions > 0) {
            th.mods += inc;
        }
        if (user.loggedin) {
            th.blacknames += inc;
        } else {
            th.greynames += inc;
        }
    }

    function subtractUser(user) {
        countUser(user, true);
    }

    function createHookFunction(ev) {
        function defaultFunction() {
                events.fire(ev.name, arguments, true);
                ev.old.apply(undefined, arguments);
                events.fire(ev.name, arguments, false);
            }
            //custom hooks
        switch (ev.name) {
        case 'AddUser':
            return function () {
                countUser(arguments[0]);
                defaultFunction.apply(undefined, arguments);
            };
        case 'RemoveUser':
            return function () {
                var args = [].slice.call(arguments),
                    user = findUserId(args[0]);
                args.push(user);
                subtractUser(user);
                defaultFunction.apply(undefined, args);
            };
        case 'RemoveVideo':
            return function () {
                var indexOfVid = window.getVideoIndex(arguments[0]),
                    video = window.playlist[indexOfVid],
                    args = [].slice.call(arguments);
                args.push(video);
                args.push(indexOfVid);
                defaultFunction.apply(undefined, args);
            };
        case 'MoveVideo':
            return function () {
                var args = [].slice.call(arguments);
                args.push(window.getVideoIndex(args[0])); //old position
                defaultFunction.apply(undefined, args);
            };
        case 'Skips':
            return function () {
                var args = [].slice.call(arguments);
                args.push((args[1] / th.blacknames) * 100); //skip percentage
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

    //get user count when already connected
    if (window.plugins.core.connected) {
        window.users.forEach(countUser);
    }
};

EventHooks.prototype.preConnect = function () {
    "use strict";
    var oldPlayerDestroy = window.video.destroy;
    window.video.destroy = function () {
        events.fire('PlayerDestroy', [], true);
        oldPlayerDestroy();
        events.fire('PlayerDestroy', [], false);
    };
    $("#chat input").bindFirst('keypress', function (event) {
        events.fire('InputKeypress[{0}]'.format(event.keyCode), [event, $("#chat input").val()], false);
        events.fire('InputKeypress', [event, $("#chat input").val()], false);
        if (event.keyCode === 13 && $("#chat input").val() !== '') {
            events.fire('SendChat', [$("#chat input").val()], false);
        }
    });
    $("#chat input").bindFirst('keydown', function (event) {
        events.fire('InputKeydown[{0}]'.format(event.keyCode), [event, $("#chat input").val()], false);
        events.fire('InputKeydown', [event, $("#chat input").val()], false);
    });
    $("#chat input").bindFirst('keyup', function (event) {
        events.fire('InputKeyup[{0}]'.format(event.keyCode), [event, $("#chat input").val()], false);
        events.fire('InputKeyup', [event, $("#chat input").val()], false);
    });
};

EventHooks.prototype.resetVariables = function () {
    "use strict";
    this.mods = 0;
    this.blacknames = 0;
    this.greynames = 0;
};

window.plugins = window.plugins || {};
window.plugins.eventHooks = new EventHooks('1.0.8');
