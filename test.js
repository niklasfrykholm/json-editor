// TODO: Hierarchical tree view

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

    set : function(key, value) {
        Key.set(this.data, key, value)
        this.notify(key)
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
        var index = this.listeners.index
        if (index > -1)
            this.listeners.splice(index, 1)
    },
}

Element.prototype.empty = function() {
    while (this.firstChild)
        this.removeChild(this.firstChild)
}

Array.prototype.equals = function(that) {
    if (typeof(this) != typeof(that))
        return false

    if (this.length != that.length)
        return false

    for (var i=0; i<this.length; ++i) {
        if (this[i] != that[i])
            return false
    }

    return true
}

function List(parent, key, selkey)
{
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

            if (item_key.equals(DataModel.get(selkey))) {
                li.setAttribute("class", "selected")
            }

            li.onmousedown = function(kk) {
                DataModel.set(selkey, kk)
            }.bind(this, item_key)
        }
        parent.appendChild(ul)
        var p = document.createElement("p")
        p.appendChild(document.createTextNode("ADD"))
        p.onmousedown = function() {
            var id = (Math.floor((1 + Math.random()) * 0x10000)).toString()
            var nk = key.concat(["children", id])
            DataModel.set(nk.concat(["name"]), "Untitled")
            DataModel.set(selkey, nk)
        }
        parent.appendChild(p)
    }

    this.notify = function(k, value) {
        this.redraw()
    }

    this.redraw()
    DataModel.addListener(this)
}

function InputText(parent, field, key)
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
        DataModel.set(key, this.input.value)
    }.bind(this)

    this.redraw = function() {
        object = DataModel.get(key)
        if (object)
            this.input.setAttribute("value", object)
    }

    this.notify = this.redraw

    this.redraw()
    DataModel.addListener(this)
}

function TextArea(parent, field, key)
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
        DataModel.set(key, this.textarea.value)
    }.bind(this)

    this.redraw = function() {
        object = DataModel.get(key)
        if (object) {
            this.textarea.empty()
            this.textarea.appendChild(document.createTextNode(object))
        }
    }

    this.notify = this.redraw

    this.redraw()
    DataModel.addListener(this)
}


function Properties(parent, selkey)
{
    this.redraw = function() {
        parent.empty()
        var sel = DataModel.get(selkey)
        if (sel === undefined)
            return;

        this.name = new InputText(parent, "Name", sel.concat("name"))
        this.text = new TextArea(parent, "Text", sel.concat("text"))

        var p = document.createElement("p")
        p.appendChild(document.createTextNode("REMOVE"))
        p.onmousedown = function() {
            DataModel.set(sel, null)
            DataModel.set(selkey, null)
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
    var tree = document.getElementById("tree");
    var properties = document.getElementById("properties");
    var list = new List(tree, [], ["selection"])
    var prop = new Properties(properties, ["selection"])
    var save = new Save(document.getElementById("save"))
    var list2 = new List(document.getElementById("tree2"), [], ["selection2"])
    var prop = new Properties(document.getElementById("properties2"), ["selection2"])
}

window.onload = init
