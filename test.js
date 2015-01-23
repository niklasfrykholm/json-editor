Key =
{
    set: function(json, key, value) {
        for (var i=0; i<key.length-1; ++i) {
            if (typeof(json[key[i]]) != "object")
                json[key[i]] = {};
            json = json[key[i]]
        }
        if (value === null || value === undefined)
            delete json[key[key.length-1]]
        else
            json[key[key.length-1]] = value
    },

    get: function(json, key) {
        if (key.length==0)
            return json

        for (var i=0; i<key.length-1; ++i) {
            if (typeof(json[key[i]]) != "object")
                return undefined;
            json = json[key[i]]
        }
        return json[key[key.length-1]]
    },

    equals: function(k1, k2) {
        if (k1.length != k2.length)
            return false

        for (var i=0; i<k1.length; ++i) {
            if (k1[i] != k2[i])
                return false
        }
        return true
    }
}

var DataModel = {
    listeners : [],

    data: DATA,

    set : function(key, value, session) {
        var undo = Key.get(this.data, session)["undo"]
        if (!undo || undo.constructor !== Array) {
            undo = []
            Key.set(this.data, session.concat(["undo"]), undo)
        }
        undo.push({key:key, value:this.get(key)})

        Key.set(this.data, key, value)
        this.notify(key)
    },

    undo: function(session) {
        var undo = Key.get(this.data, session)["undo"]
        if (!undo || undo.length == 0)
            return;
        var item = undo[undo.length-1]
        undo.length = undo.length - 1
        Key.set(this.data, item.key, item.value)
        this.notify(item.key)
    },

    get : function(key) {
        return Key.get(this.data, key)
    },

    notify : function(key) {
        for (var i=0; i<this.listeners.length; ++i) {
            var l = this.listeners[i]
            l.notify(key)
        }
    },

    addListener: function(l) {
        this.listeners.push(l)
    },

    removeListener: function(l) {
        var index = this.listeners.indexOf(l)
        if (index > -1)
            this.listeners.splice(index, 1)
    },
}

Element.prototype.empty = function() {
    while (this.firstChild)
        this.removeChild(this.firstChild)
}

function List(parent, key, session)
{
    var selkey = session.concat("selection")

    this.redraw = function() {
        object = DataModel.get(key)
        parent.empty()
        var ul = document.createElement("ul")
        var children = object["children"]
        var keys = Object.keys(children)
        keys.sort(
            function (a,b) {
                var ka = children[a]["name"]
                var kb = children[b]["name"]
                return (ka > kb) - (kb > ka)
            }
        )
        for (var i=0; i<keys.length; ++i) {
            var k = keys[i]
            var item_key = key.concat(["children", k])
            var child = children[k]
            var li = document.createElement("li")
            var t = document.createTextNode(child["name"])
            li.appendChild(t)
            ul.appendChild(li)

            if (Key.equals(item_key, DataModel.get(selkey))) {
                li.setAttribute("class", "selected")
            }

            li.onmousedown = function(kk) {
                DataModel.set(selkey, kk, session)
            }.bind(this, item_key)
        }
        parent.appendChild(ul)
        var p = document.createElement("p")
        var add = document.createElement("span")
        add.appendChild(document.createTextNode("ADD"))
        add.onmousedown = function() {
            var id = (Math.floor((1 + Math.random()) * 0x10000)).toString()
            var nk = key.concat(["children", id])
            DataModel.set(nk, {name: "Untitled"}, session)
            DataModel.set(selkey, nk, session)
        }
        p.appendChild(add)

        p.appendChild(document.createTextNode(" "))

        var undo = document.createElement("span")
        undo.appendChild(document.createTextNode("UNDO"))
        undo.onmousedown = function() {
            DataModel.undo(session)
        }
        p.appendChild(undo)

        parent.appendChild(p)
    }

    this.notify = function(k, value) {
        this.redraw()
    }

    this.redraw()
    DataModel.addListener(this)
}

function InputText(parent, field, key, session)
{
    var p = document.createElement("p")
    var span = document.createElement("span")
    span.setAttribute("class", "label")
    span.appendChild(document.createTextNode(field + ":"))
    p.appendChild(span)
    this.input = document.createElement("input")
    this.input.setAttribute("type", "text")
    p.appendChild(this.input)
    parent.appendChild(p)
    this.input.onchange = function() {
        DataModel.set(key, this.input.value, session)
    }.bind(this)

    this.redraw = function() {
        object = DataModel.get(key)
        if (object)
            this.input.value = object
    }

    this.teardown = function() {
        DataModel.removeListener(this)
    }

    this.notify = this.redraw

    this.redraw()
    DataModel.addListener(this)
}

function TextArea(parent, field, key, session)
{
    var p = document.createElement("p")
    var span = document.createElement("span")
    span.setAttribute("class", "label")
    span.appendChild(document.createTextNode(field + ":"))
    p.appendChild(span)
    this.textarea = document.createElement("textarea")
    p.appendChild(this.textarea)
    parent.appendChild(p)
    this.textarea.onchange = function() {
        DataModel.set(key, this.textarea.value, session)
    }.bind(this)

    this.redraw = function() {
        object = DataModel.get(key)
        if (object)
            this.textarea.value = object
    }

    this.teardown = function() {
        DataModel.removeListener(this)
    }

    this.notify = this.redraw

    this.redraw()
    DataModel.addListener(this)
}

function Properties(parent, session)
{
    var selkey = session.concat("selection")

    this.redraw = function() {
        if (this.name) {this.name.teardown()}
        if (this.text) {this.text.teardown()}

        parent.empty()
        var sel = DataModel.get(selkey)
        if (sel === undefined)
            return;

        this.name = new InputText(parent, "Name", sel.concat("name"), session)
        this.text = new TextArea(parent, "Text", sel.concat("text"), session)

        var p = document.createElement("p")
        p.appendChild(document.createTextNode("REMOVE"))
        p.onmousedown = function() {
            DataModel.set(sel, null, session)
            DataModel.set(selkey, null, session)
        }
        parent.appendChild(p)
    }

    this.notify = function(k, value) {
        if (Key.equals(k, selkey)) {
            this.redraw()
        }
    }

    this.redraw()
    DataModel.addListener(this)
}

function Save(parent)
{
    this.redraw = function() {
        var pre = document.createElement("pre")
        pre.appendChild(document.createTextNode("DATA = " + JSON.stringify(DATA, null, "\t")))
        var save = document.getElementById("save")
        save.empty()
        save.appendChild(pre)
    }
    this.notify = function(k, value) {this.redraw()}
    this.redraw()
    DataModel.addListener(this)
}

function init()
{
    var list = new List(document.getElementById("tree"), [], ["session_1"])
    var prop = new Properties(document.getElementById("properties"), ["session_1"])

    var list2 = new List(document.getElementById("tree2"), [], ["session_2"])
    var prop = new Properties(document.getElementById("properties2"), ["session_2"])

    var save = new Save(document.getElementById("save"))
}

window.onload = init
