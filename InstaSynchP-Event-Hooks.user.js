// ==UserScript==
// @name        Beta InstaSynchP Event Hooks
// @namespace   InstaSynchP
// @description Add hooks to the events on the InstaSynch page

// @version     1.1.3
// @author      Zod-
// @source      https://github.com/Zod-/InstaSynchP-Event-Hooks
// @license     MIT

// @include     *://instasync.com/r/*
// @include     *://*.instasync.com/r/*
// @grant       none
// @run-at      document-start

// @require     https://greasyfork.org/scripts/2857-jquery-bind-first/code/jquerybind-first.js?version=26080
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
        hooks = [
            {'onConnecting':{'name':'Connecting'}},
            {'onConnected':{'name':'Connected'}},
            {'onJoining':{'name':'Joining'}},
            {'onJoined':{'name':'Joined'}},
            {'onReconnecting':{'name':'Reconnecting'}},
            {'onReconnect':{'name':'Reconnect'}},
            //{'reconnectFailed':{'name':'ReconnectFailed'}},
            {'onError':{'name':'Error'}},
            {'onDisconnect':{'name':'Disconnect'}},
            //{'requestPartialPage':{'name':'RequestPartialPage'}},
            //{'loadRoomObj':{'name':'LoadRoom'}},
            {'addMessage':{'name':'AddMessage'}},
            {'addUser':{'location':'userlist', 'name':'AddUser'}},
            {'removeUser':{'location':'userlist', 'name':'RemoveUser'}},
            {'load':{'location':'userlist', 'name':'LoadUserlist'}},
            {'renameUser':{'location':'userlist', 'name':'RenameUser'}},
            {'makeLead':{'name':'MakeLeader'}},
            {'addVideo':{'location':'playlist', 'name':'AddVideo'}},
            {'removeVideo':{'location':'playlist', 'name':'RemoveVideo'}},
            {'moveVideo':{'location':'playlist', 'name':'MoveVideo'}},
            {'playVideo':{'name':'PlayVideo'}},
            {'load':{'location':'playlist', 'name':'LoadPlaylist'}},
            {'purge':{'location':'playlist', 'name':'Purge'}},
            {'resume':{'name':'Resume'}},
            {'pause':{'name':'Pause'}},
            {'seekTo':{'name':'SeekTo'}},
            {'setSkips':{'name':'Skips'}},
            {'create':{'location':'poll', 'name':'CreatePoll'}},
            {'addVote':{'location':'poll', 'name':'AddPollVote'}},
            {'removeVote':{'location':'poll', 'name':'RemovePollVote'}},
            {'end':{'location':'poll', 'name':'EndPoll'}},
            {'sendcmd':{'name':'SendCMD'}}
        ];

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
        case 'RenameUser':
            return function () {
                var args = [].slice.call(arguments),
                    user = findUserId(args[0]);
                args.push(user);
                subtractUser(user);
                defaultFunction.apply(undefined, args);
            };
        case 'RemoveVideo':
            return function () {
                var indexOfVid = window.room.playlist.indexOf(arguments[0]),
                    video = window.room.playlist.videos[indexOfVid],
                    args = [].slice.call(arguments);
                args.push(video);
                args.push(indexOfVid);
                defaultFunction.apply(undefined, args);
            };
        case 'MoveVideo':
            return function () {
                var args = [].slice.call(arguments),
                    oldPosition = window.room.playlist.indexOf(args[0]),
                    video = window.room.playlist.videos[oldPosition];
                args.push(oldPosition);
                args.push(video);
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
    hooks.forEach(function (temp) {
        for (var hook in temp) {
            if (!temp.hasOwnProperty(hook)) {
                continue;
            }
            var ev = temp[hook];
            if (ev.location &&
                window.room[ev.location] &&
                window.room[ev.location][hook]) {
                ev.old = window.room[ev.location][hook];
                window.room[ev.location][hook] = createHookFunction(ev);
            } else if (window.room[hook]) {
                ev.old = window.room[hook];
                window.room[hook] = createHookFunction(ev);
            } else {
               logger().error(th.name, "Hook not found", hook, "with location", ev.location);
            }
        }
    });

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
    var csel = '#cin',
        oldPlayerDestroy = window.room.video.destroy;
    window.room.video.destroy = function () {
        events.fire('PlayerDestroy', [], true);
        oldPlayerDestroy();
        events.fire('PlayerDestroy', [], false);
    };
    $(csel).bindFirst('keypress', function (event) {
        events.fire('InputKeypress[{0}]'.format(event.keyCode), [event, $(csel).val()], false);
        events.fire('InputKeypress', [event, $(csel).val()], false);
        if (event.keyCode === 13 && $(csel).val() !== '') {
            events.fire('SendChat', [$(csel).val()], false);
        }
    });
    $(csel).bindFirst('keydown', function (event) {
        //prevent loosing focus on tab
        if (event.keyCode === 9) {
            event.preventDefault();
        }
        events.fire('InputKeydown[{0}]'.format(event.keyCode), [event, $(csel).val()], false);
        events.fire('InputKeydown', [event, $(csel).val()], false);
    });
    $(csel).bindFirst('keyup', function (event) {
        events.fire('InputKeyup[{0}]'.format(event.keyCode), [event, $(csel).val()], false);
        events.fire('InputKeyup', [event, $(csel).val()], false);
    });
};

EventHooks.prototype.resetVariables = function () {
    "use strict";
    this.mods = 0;
    this.blacknames = 0;
    this.greynames = 0;
};

window.plugins = window.plugins || {};
window.plugins.eventHooks = new EventHooks('1.1.3');
