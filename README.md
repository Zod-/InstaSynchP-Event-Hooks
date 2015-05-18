InstaSynchP-Event-Hooks [![Build Status](https://travis-ci.org/Zod-/InstaSynchP-Event-Hooks.svg?branch=master)](https://travis-ci.org/Zod-/InstaSynchP-Event-Hooks)
=======================

Add hooks to a lot of the events on the InstaSynch page

Events
------
Events from InstaSynch
```javascript
'AddMessage': [user, message, extraStyles]
'AddUser': [user]
'RemoveUser': [user]
'MakeLeader': [user]
'RenameUser': [user]
'AddVideo': [video]
'RemoveVideo': [video]
'PlayVideo': [video, time, playing]
'MoveVideo': [video, newIndex, oldIndex]
'Resume': []
'Pause': []
'SeekTo': []
'Purge': [username]
'Skips': [skips, skipsNeeded, percentage]
'PlayerDestroy': []
'LoadPlaylist': [arrVideos]
'LoadUserlist': [arrUsers]
'CreatePoll': [poll]
'AddPollVote': [index]
'RemovePollVote': [index]
'EndPoll': []
'OnConnecting': []
'OnConnected': []
'OnJoining': []
'OnJoined': []
'OnReconnecting': []
'OnReconnect': []
'ReconnectFailed': []
'OnError': []
'OnDisconnect': []
'RequestPartialPage': [name, room, back]
'LoadRoomObj': []
'SendCMD': [command, data]
```

Other events
```javascript
'PageMessage': [object]
'SendChat': [inputValue] /*inputValue can still be changed*/
'InputKeypress': [event, inputValue]
'InputKeypress[keycode]': [event, inputValue] /*e.g. InputKeypress[9] for enter*/
'InputKeydown': [event, inputValue]
'InputKeydown[keycode]': [event, inputValue] /*e.g. InputKeydown[9] for enter*/
'InputKeyup': [event, inputValue]
'InputKeyup[keycode]': [event, inputValue] /*e.g. InputKeyup[9] for enter*/
```

Public Variables
---------
* `eventHooks.mods` # of mods
* `eventHooks.blacknames` # of blacknames
* `eventHooks.greynames` # of greynames

License
-----------
The MIT License (MIT)<br>

&lt;InstaSynch - Watch Videos with friends.&gt;<br>
Copyright (c) 2014 InstaSynch

&lt;Bibbytube - Modified InstaSynch client code&gt;<br>
Copyright (C) 2014  Zod-

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
