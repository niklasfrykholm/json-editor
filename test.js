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
        key.set(this.data, value)
        this.notify(key)
    },

    get : function(key) {
        return key.get(this.data)
    },

    notify : function(key) {
        for (var i=0; i<this.listeners.length; ++i)
            this.listeners[i].notify(key)
    },

    addListener: function(l) {
        this.listeners.push(l)
    }
}

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

    this.get = function (json) {
        if (this.path.length==0)
            return json

        for (var i=0; i<this.path.length-1; ++i) {
            if (typeof(json[this.path[i]]) != "object")
                return null;
            json = json[this.path[i]]
        }
        return json[this.path[this.path.length-1]]
    }

    this.append = function (arr) {
        return new Key(this.path.concat(arr))
    }
}

Element.prototype.empty = function() {
    while (this.firstChild)
        this.removeChild(this.firstChild)
}

function List(parent, key)
{
    this.redraw = function() {
        object = DataModel.get(key)
        parent.empty()
        var ul = document.createElement("ul")
        var children = object["children"]
        for (k in children) {
            var child = children[k]
            var li = document.createElement("li")
            var t = document.createTextNode(child["name"])
            li.appendChild(t)
            ul.appendChild(li)
            var kk = key.append(["children", k, "name"])
            li.onmousedown = function(kk) {
                DataModel.set(kk, DataModel.get(kk) + " CLICK")
            }.bind(this, kk)
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
    var list = new List(tree, new Key([]))
    var tb = new Textbox(properties, new Key(["children", "2", "name"]))

    DataModel.set(new Key(["children", "2", "name"]), "Niklas Frykholm")
    DataModel.set(new Key(["children", "4", "name"]), "Karl")
}

window.onload = init
