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
                return null;
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
        },
        "selection" : []
    },

    set : function(key, value) {
        Key.set(this.data, key, value)
        this.notify(key)
    },

    get : function(key) {
        return Key.get(this.data, key)
    },

    notify : function(key) {
        for (var i=0; i<this.listeners.length; ++i)
            this.listeners[i].notify(key)
    },

    addListener: function(l) {
        this.listeners.push(l)
    }
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
                console.log("selected", item_key)
                li.setAttribute("class", "selected")
            }

            li.onmousedown = function(kk) {
                console.log("click", kk)
                // DataModel.set(kk, DataModel.get(kk) + " CLICK")
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
        var input = document.createElement("input")
        input.setAttribute("type", "text")
        input.setAttribute("value", object)
        parent.empty()
        parent.appendChild(input)
        input.onchange = function() {
            DataModel.set(key, input.value)
        }
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
    var tb = new Textbox(properties, ["children", "2", "name"])

    DataModel.set(["children", "2", "name"], "Niklas Frykholm")
    DataModel.set(["children", "4", "name"], "Karl")
}

window.onload = init
