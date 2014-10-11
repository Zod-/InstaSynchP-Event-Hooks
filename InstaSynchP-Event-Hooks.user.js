// ==UserScript==
// @name        InstaSynchP Event Hooks
// @namespace   InstaSynchP
// @description Add hooks to the events on the InstaSynch page

// @version     1
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

function Plugin() {
    "use strict";
    this.version = 1;
}

function ref() {
    return window.plugins.eventBase;
}

Plugin.prototype.executeOnceCore = function () {
    "use strict";

    var oldSendCmd = window.global.sendcmd,
        oldOnConnecting = window.global.onConnecting,
        oldOnConnected = window.global.onConnected,
        oldOnJoining = window.global.onJoining,
        oldOnJoined = window.global.onJoined,
        oldLoadRoomObj = window.global.loadRoomObj,
        oldOnReconnecting = window.global.onReconnecting,
        oldOnReconnect = window.global.onReconnect,
        oldReconnectFailed = window.global.reconnectFailed,
        oldOnError = window.global.onError,
        oldOnDisconnect = window.global.onDisconnect,
        oldRequestPartialPage = window.global.requestPartialPage,
        oldAddMessage = window.addMessage,
        oldAddUser = window.addUser,
        oldRemoveUser = window.removeUser,
        oldMakeLeader = window.makeLeader,
        oldRenameUser = window.renameUser,
        oldAddVideo = window.addVideo,
        oldRemoveVideo = window.removeVideo,
        oldMoveVideo = window.moveVideo,
        oldPlayVideo = window.playVideo,
        oldResume = window.resume,
        oldPause = window.pause,
        oldSeekTo = window.seekTo,
        oldPurge = window.purge,
        oldSkips = window.skips,
        oldLoadPlaylist = window.loadPlaylist,
        oldLoadUserlist = window.loadUserlist,
        oldCreatePoll = window.createPoll,
        oldAddPollVote = window.addPollVote,
        oldRemovePollVote = window.removePollVote,
        oldEndPoll = window.endPoll;

    function fireOverwrittenEvent(name, old, args) {
        events.fire(name, args, true);
        old.apply(undefined, args);
        events.fire(name, args, false);
    }
    window.global.sendcmd = function () {
        fireOverwrittenEvent('SendCmd', oldSendCmd, arguments);
    };
    window.global.onConnecting = function () {
        fireOverwrittenEvent('Connecting', oldOnConnecting, arguments);
    };
    window.global.onConnected = function () {
        fireOverwrittenEvent('Connected', oldOnConnected, arguments);
    };
    window.global.onJoining = function () {
        fireOverwrittenEvent('Joining', oldOnJoining, arguments);
    };
    window.global.onJoined = function () {
        fireOverwrittenEvent('Joined', oldOnJoined, arguments);
    };
    window.global.loadRoomObj = function () {
        var args = [].slice.call(arguments);
        args.push(window.global.page); //page
        fireOverwrittenEvent('LoadRoom', oldLoadRoomObj, args);
    };
    window.global.onReconnecting = function () {
        fireOverwrittenEvent('Reconnecting', oldOnReconnecting, arguments);
    };
    window.global.onReconnect = function () {
        fireOverwrittenEvent('Reconnect', oldOnReconnect, arguments);
    };
    window.global.reconnectFailed = function () {
        fireOverwrittenEvent('ReconnectFailed', oldReconnectFailed, arguments);
    };
    window.global.onError = function () {
        fireOverwrittenEvent('OnError', oldOnError, arguments);
    };
    window.global.onDisconnect = function () {
        fireOverwrittenEvent('Disconnect', oldOnDisconnect, arguments);
    };
    window.global.requestPartialPage = function () {
        fireOverwrittenEvent('RequestPartialPage', oldRequestPartialPage, arguments);
    };
    window.addMessage = function () {
        fireOverwrittenEvent('AddMessage', oldAddMessage, arguments);
    };
    window.addUser = function () {
        fireOverwrittenEvent('AddUser', oldAddUser, arguments);
    };
    window.removeUser = function () {
        var args = [].slice.call(arguments);
        args.push(findUserId(args[0])); //user
        fireOverwrittenEvent('RemoveUser', oldRemoveUser, args);
    };
    window.makeLeader = function () {
        fireOverwrittenEvent('MakeLeader', oldMakeLeader, arguments);
    };
    window.renameUser = function () {
        fireOverwrittenEvent('RenameUser', oldRenameUser, arguments);
    };
    window.addVideo = function () {
        fireOverwrittenEvent('AddVideo', oldAddVideo, arguments);
    };
    window.removeVideo = function () {
        var indexOfVid = window.getVideoIndex(arguments[0].info),
            video = window.playlist[indexOfVid],
            args = [].slice.call(arguments);
        args.push(video);
        args.push(indexOfVid);
        fireOverwrittenEvent('RemoveVideo', oldRemoveVideo, args);
    };
    window.moveVideo = function () {
        var args = [].slice.call(arguments);
        args.push(window.getVideoIndex(args[0]).info); //old position
        fireOverwrittenEvent('MoveVideo', oldMoveVideo, args);
    };
    window.playVideo = function () {
        fireOverwrittenEvent('PlayVideo', oldPlayVideo, arguments);
    };
    window.resume = function () {
        fireOverwrittenEvent('Resume', oldResume, arguments);
    };
    window.pause = function () {
        fireOverwrittenEvent('Pause', oldPause, arguments);
    };
    window.seekTo = function () {
        fireOverwrittenEvent('SeekTo', oldSeekTo, arguments);
    };
    window.purge = function () {
        fireOverwrittenEvent('Purge', oldPurge, arguments);
    };
    window.skips = function () {
        fireOverwrittenEvent('Skips', oldSkips, arguments);
    };
    window.loadPlaylist = function () {
        fireOverwrittenEvent('LoadPlaylist', oldLoadPlaylist, arguments);
    };
    window.loadUserlist = function () {
        fireOverwrittenEvent('LoadUserlist', oldLoadUserlist, arguments);
    };
    window.createPoll = function () {
        fireOverwrittenEvent('CreatePoll', oldCreatePoll, arguments);
    };
    window.addPollVote = function () {
        fireOverwrittenEvent('AddPollVote', oldAddPollVote, arguments);
    };
    window.removePollVote = function () {
        fireOverwrittenEvent('RemovePollVote', oldRemovePollVote, arguments);
    };
    window.endPoll = function () {
        fireOverwrittenEvent('EndPoll', oldEndPoll, arguments);
    };
    window.addEventListener("message", function (event) {
        try {
            var parsed = JSON.parse(event.data);
            if (parsed.action) {
                //own events
                events.fire(parsed.action, [parsed.data], false);
            }
            //all
            events.fire('onPageMessage', [parsed], false);
        } catch (ignore) {}
    }, false);
};

Plugin.prototype.preConnect = function () {
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
window.plugins.eventBase = new Plugin();
