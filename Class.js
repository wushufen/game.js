function Class() {}
Class.extend = function (options) {
	var Parent = this
	var Child = function () {
		for(var key in this){
			var value = this[key]
			if (value instanceof Array) {
				this[key] = [].concat(value)
			}
			if (toString.call(value) == '[object Object]') {
				this[key] = {}
				for(var k in value){
					this[key][k] = value[k]
				}
			}
		}
		options.constructor.apply(this, arguments)
	}
	Child.prototype = new Parent
	for(var key in options){
		Child.prototype[key] = options[key]
	}
	Child.prototype.constructor = Child
	Child.Parent = Parent
	Child.extend = Class.extend

	return Child
}

