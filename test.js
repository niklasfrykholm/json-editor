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

    data: {
        "children" : {
            "1" : {"name" : "Mats"},
            "2" : {"name" : "Niklas"},
            "3" : {"name" : "Tobias"}
        }
    },

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

function Textbox(parent, key)
{
    this.redraw = function() {
        object = DataModel.get(key)
        var p = document.createElement("p")
        p.appendChild(document.createTextNode("Name: "))
        var input = document.createElement("input")
        input.setAttribute("type", "text")
        input.setAttribute("value", object)
        p.appendChild(input)
        parent.empty()
        parent.appendChild(p)
        input.onchange = function() {
            DataModel.set(key, input.value)
        }
    }

    this.teardown = function() {
        DataModel.removeListener(this)
    }

    this.notify = function(k, value) {
        this.redraw()
    }

    this.redraw()
    DataModel.addListener(this)
}

function Properties(parent)
{
    this.redraw = function() {
        if (this.textbox) {
            this.textbox.teardown()
            this.textbox = null
        }

        parent.empty()
        var sel = DataModel.get(["selection"])
        if (sel !== undefined)
            this.textbox = new Textbox(parent, sel.concat("name"))
    }

    this.notify = function(k, value) {
        this.redraw()
    }

    this.redraw()
    DataModel.addListener(this)
}

function init()
{
    var tree = document.getElementById("tree");
    var properties = document.getElementById("properties");
    var list = new List(tree, [])
    var prop = new Properties(properties)

    DataModel.set(["children", "2", "name"], "Niklas Frykholm")
    DataModel.set(["children", "4", "name"], "Karl")
}

window.onload = init
