function EventHooks() {
  'use strict';
  this.version = '@VERSION@';
  this.name = 'InstaSynchP Event Hooks';
  this.resetVariables();
  this.isPlaylistLoaded = false;
  this.isShuffle = false;
  this.hooks = {};
}

EventHooks.prototype.executeOnceCore = function () {
  'use strict';
  var _this = this;
  var oldLinkify = window.linkify;
  var hooks = {
    events: {
      connected: 'Connected',
      joining: 'Joining',
      joined: 'Joined',
      reconnecting: 'Reconnecting',
      reconnect: 'Reconnect',
      disconnect: 'Disconnect'
    },
    playlist: {
      addVideo: 'AddVideo',
      removeVideo: 'RemoveVideo',
      moveVideo: 'MoveVideo',
      load: 'LoadPlaylist',
      purge: 'Purge',
    },
    userlist: {
      addUser: 'AddUser',
      removeUser: 'RemoveUser',
      load: 'LoadUserlist',
      renameUser: 'RenameUser',
    },
    poll: {
      create: 'CreatePoll',
      addVote: 'AddPollVote',
      removeVote: 'RemovePollVote',
      end: 'EndPoll',
    },
    room: {
      addMessage: 'AddMessage',
      makeLead: 'MakeLeader',
      playVideo: 'PlayVideo',
      resume: 'Resume',
      pause: 'Pause',
      seekTo: 'SeekTo',
      setSkips: 'Skips',
      sendcmd: 'SendCMD',
    }
  };

  window.linkify = function (str, buildHashtagUrl, includeW3, target) {
    var tags = [];
    var index = -1;
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
      _this.mods += inc;
    }
    if (user.loggedin) {
      _this.blacknames += inc;
    } else {
      _this.greynames += inc;
    }
  }

  function subtractUser(user) {
    countUser(user, true);
  }

  function createHookFunction(ev) {
    function defaultFunction() {
      var instasyncArgs = arguments[0];
      var frameworkArgs = arguments[1] || instasyncArgs;
      events.fire(ev.name, frameworkArgs, true);
      ev.oldFn.apply(undefined, instasyncArgs);
      events.fire(ev.name, frameworkArgs, false);
    }

    function arrayFunction() {
      var instasyncArgs = arguments[0];
      var frameworkArgs = arguments[1] || instasyncArgs;
      frameworkArgs = frameworkArgs[0];
      frameworkArgs.forEach(function () {
        events.fire(ev.name, arguments, true);
      });
      ev.oldFn.apply(undefined, instasyncArgs);
      frameworkArgs.forEach(function () {
        events.fire(ev.name, arguments, false);
      });
    }

    if (ev.location === 'events') {
      window.room.e.on(ev.hook, function () {
        events.fire(ev.name, arguments, false);
      });
      return;
    }
    //custom hooks
    switch (ev.name) {
    case 'LoadPlaylist':
      return function () {
        if (!_this.isPlaylistLoaded) {
          defaultFunction.apply(undefined, [arguments]);
          _this.isPlaylistLoaded = true;
        } else {
          events.fire('Shuffle', arguments, true);
          ev.oldFn.apply(undefined, arguments);
          events.fire('Shuffle', arguments, false);
        }
      };
    case 'AddUser':
      return function () {
        if (Array.isArray(arguments[0])) {
          arguments[0].forEach(countUser);
          arrayFunction.apply(undefined, [arguments]);
        } else {
          countUser(arguments[0]);
          defaultFunction.apply(undefined, [arguments]);
        }
      };
    case 'AddVideo':
      return function () {
        if (_this.isShuffle) {
          ev.oldFn.apply(undefined, arguments);
          return;
        }
        if (Array.isArray(arguments[0])) {
          arrayFunction.apply(undefined, [arguments]);
        } else {
          defaultFunction.apply(undefined, [arguments]);
        }
      };
    case 'RemoveUser':
    case 'MakeLeader':
    case 'RenameUser':
      return function () {
        var user = findUserId(arguments[0]);
        if (ev.name === 'RenameUser') {
          user.username = arguments[1];
        }
        defaultFunction.apply(undefined, [
          arguments, [user]
        ]);
      };
    case 'PlayVideo':
    case 'RemoveVideo':
    case 'MoveVideo':
      return function () {
        var indexOfVid = window.room.playlist.indexOf(arguments[0]);
        var video = window.room.playlist.videos[indexOfVid];
        var args = [].slice.call(arguments);
        args[0] = video;
        if (ev.name === 'MoveVideo') {
          args.push(indexOfVid);
        }
        defaultFunction.apply(undefined, [arguments, args]);
      };
    case 'Skips':
      return function () {
        var args = [].slice.call(arguments);
        args.push((args[1] / _this.blacknames) * 100); //skip percentage
        defaultFunction.apply(undefined, [arguments, args]);
      };
    }
    return function () {
      defaultFunction.apply(undefined, [arguments]);
    };
  }

  for (var locationName in hooks) {
    if (!hooks.hasOwnProperty(locationName)) {
      continue;
    }
    var location = hooks[locationName];
    for (var hookName in location) {
      if (!location.hasOwnProperty(hookName)) {
        continue;
      }
      var ev = {
        hook: hookName,
        name: location[hookName],
        location: locationName
      };
      if (locationName === 'events') {
        createHookFunction(ev);
      } else if (locationName === 'room') {
        ev.oldFn = window.room[ev.hook];
        window.room[ev.hook] = createHookFunction(ev);
      } else {
        if (locationName === 'room') {
          ev.context = window.room;
        } else {
          ev.context = window.room[ev.location];
        }
        ev.oldFn = ev.context[ev.hook];
        ev.context[ev.hook] = createHookFunction(ev);
      }
    }
  }

  window.addEventListener('message', function (event) {
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
    window.room.userlist.users.forEach(countUser);
  }

  events.on(_this, 'Shuffle', function () {
    _this.isShuffle = true;
  }, true);

  events.on(_this, 'Shuffle', function () {
    _this.isShuffle = false;
  }, false);

  events.on(_this, 'RemoveUser', function (user) {
    subtractUser(user);
  }, true);
};

EventHooks.prototype.preConnect = function () {
  'use strict';
  var csel = '#cin';
  var oldPlayerDestroy = window.room.video.destroy;
  window.room.video.destroy = function () {
    events.fire('PlayerDestroy', [], true);
    oldPlayerDestroy();
    events.fire('PlayerDestroy', [], false);
  };
  $(csel).bindFirst('keypress', function (event) {
    events.fire('InputKeypress[{0}]'.format(event.keyCode), [event, $(
      csel).val()], false);
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
    events.fire('InputKeydown[{0}]'.format(event.keyCode), [event,
      $(csel).val()
    ], false);
    events.fire('InputKeydown', [event, $(csel).val()], false);
  });
  $(csel).bindFirst('keyup', function (event) {
    events.fire('InputKeyup[{0}]'.format(event.keyCode), [event, $(csel).val()],
      false);
    events.fire('InputKeyup', [event, $(csel).val()], false);
  });
};

EventHooks.prototype.resetVariables = function () {
  'use strict';
  this.mods = 0;
  this.blacknames = 0;
  this.isPlaylistLoaded = false;
  this.greynames = 0;
};

window.plugins = window.plugins || {};
window.plugins.eventHooks = new EventHooks();
