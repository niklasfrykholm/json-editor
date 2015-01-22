function Key(path)
{
    this.path = path

    this.set = function (json, value) {
        for (var i=0; i<this.path.length-1; ++i) {
            if (typeof(json[this.path[i]]) != "object")
                json[this.path[i]] = {};
            json = json[this.path[i]]
        }
        json[this.path[this.path.length-1]] = value
    }
}

var dm = {
    "children" : {
        "1" : {"name" : "Mats"},
        "2" : {"name" : "Niklas"},
        "3" : {"name" : "Tobias"}
    }
};

var _listeners = [];

function set(key, value)
{
    key.set(dm, value)
    notify(key)
}

function notify(key)
{
    for (var i=0; i<_listeners.length; ++i)
        _listeners[i].notify(key)

}

Element.prototype.empty = function() {
    while (this.firstChild)
        this.removeChild(this.firstChild)
}

// Object identifier: ID or PATH
// ("children", 1, "name")

/*
    QUERY_OBJECT (#ID) -> State
    SET_STATE (#ID, DeltaState)
    NOTIFY_STATE (#ID, DeltaState)
    CREATE_OBJECT (#ID)
    DESTROY_OBJECT (#ID)

    tree_editor(#ROOT_ID, #SELECTION_ID)
    {
        QUERY(ROOT_ID)
        QUERY(SELECTION_ID)
    }

    notify_state(#ID, state)
    {
        if (inlist(ID, TREEID))
            ;
        if (ID == SELECTION_ID)
            ;
    }
*/

function List(parent, object)
{
    this.redraw = function() {
        parent.empty()
        var ul = document.createElement("ul")
        var children = object["children"]
        for (key in children) {
            var child = children[key]
            var li = document.createElement("li")
            var t = document.createTextNode(child["name"])
            li.appendChild(t)
            ul.appendChild(li)
            ul.onmousedown = function() {alert("click")}
        }
        parent.appendChild(ul)
    }

    this.notify = function(key, value) {
        this.redraw()
    }

    this.redraw()

    _listeners.push(this)
}


function p(parent, text)
{
    var t = document.createTextNode(text || "");
    var p = document.createElement("p");
    p.appendChild(t);
    parent.appendChild(p);
}

function init()
{
    var root = document.getElementById("root");
    var list = new List(root, dm)

    set(new Key(["children", "2", "name"]), "Niklas Frykholm")
    set(new Key(["children", "4", "name"]), "Karl")
}

window.onload = init
