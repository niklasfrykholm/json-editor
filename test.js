Key =
{
    set: function(json, key, value) {
        for (var i=0; i<key.length-1; ++i) {
            if (typeof(json[key[i]]) != "object")
                json[key[i]] = {};
            json = json[key[i]]
        }
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

function List(parent, key)
{
    this.redraw = function() {
        object = DataModel.get(key)
        parent.empty()
        var ul = document.createElement("ul")
        var children = object["children"]
        for (k in children) {
            var item_key = key.concat(["children", k])
            var child = children[k]
            var li = document.createElement("li")
            var t = document.createTextNode(child["name"])
            li.appendChild(t)
            ul.appendChild(li)

            if (item_key.equals(DataModel.get(["selection"]))) {
                li.setAttribute("class", "selected")
            }

            li.onmousedown = function(kk) {
                DataModel.set(["selection"], kk)
            }.bind(this, item_key)
        }
        parent.appendChild(ul)
    }

    this.notify = function(k, value) {
        this.redraw()
    }

    this.redraw()
    DataModel.addListener(this)
}

function Textbox(parent, field, key)
{
    this.redraw = function() {
        object = DataModel.get(key)
        var p = document.createElement("p")
        p.appendChild(document.createTextNode(field + ": "))
        var input = document.createElement("input")
        input.setAttribute("type", "text")
        if (object)
            input.setAttribute("value", object)
        p.appendChild(input)
        parent.appendChild(p)
        input.onchange = function() {
            DataModel.set(key, input.value)
        }
    }

    this.redraw()
}

function Properties(parent)
{
    this.redraw = function() {
        parent.empty()
        var sel = DataModel.get(["selection"])
        if (sel === undefined)
            return;

        this.name = new Textbox(parent, "Name", sel.concat("name"))
        this.text = new Textbox(parent, "Text", sel.concat("text"))
    }

    this.notify = function(k, value) {
        this.redraw()
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
    var list = new List(tree, [])
    var prop = new Properties(properties)
    var save = new Save(document.getElementById("save"))

    DataModel.set(["children", "2", "name"], "Niklas Frykholm")
    DataModel.set(["children", "4", "name"], "Karl")
}

window.onload = init
