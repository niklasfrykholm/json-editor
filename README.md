# json-editor

This is an experiment in creating a web based "generic" editor with collaboration support.

The editor uses a two tier structure:

* The *backend* manages the data (as a JSON object) and provides an API to it.
* The *frontend* provides a suitable view of the data (typically a tree view and a property panel).

The backend essentially provides three services:

* Manipulation (setting particular JSON keys)
* Notification (notifying listeners when JSON data has changed)
* Undo (manipulation history is kept, so actions can be undone)

Data updates happen this way:

1. The user enters a value in a front end control (say a text field)
2. A message to change the data that the text field controls is sent to the backend
3. The backend changes the data and notifies all clients
4. All client views react to the changed data

This gives automatic collaboration support, beause it doesn't matter if the data change was
inititated locally or by someone else.

"Selection" is just another piece of data in the backend. The properties view
reacts to "selection" changes to show the currently selected object. Since selection
is different per client, each client stores its selection under its own session id.
The session id is also used for undo, so each client gets its own undo queue.

Curently the backend is implemented in the same JavaScript as the front end, but it
would typically be hosted by a separate service.
