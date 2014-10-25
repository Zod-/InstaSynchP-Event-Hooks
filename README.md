InstaSynchP-Event-Hooks
=======================

Add hooks to a lot of the events on the InstaSynch page

Events
------
Events from InstaSynch
```javascript
'AddMessage': [user, message, extraStyles]
'AddUser': [user, sortUserlist]
'RemoveUser': [userId, user]
'MakeLeader': [userId]
'RenameUser': [userId, username]
'AddVideo': [video, updateScrollbar]
'RemoveVideo': [videoinfo, video, indexOfVideo]
'MoveVideo': [videoinfo, position, oldPosition]
'PlayVideo': [videoinfo, time, playing]
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
<InstaSynch - Watch Videos with friends.>
Copyright (C) 2013  InstaSynch

<Bibbytube - Modified InstaSynch client code>
Copyright (C) 2014  Zod-

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

http://opensource.org/licenses/GPL-3.0
