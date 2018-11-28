function Class() {}
Class.extend = function (options) {
	var Parent = this
	Parent.options = Parent.options || {}

	// class
	// 用eval创建构造，可以指定名字
	var Class = eval('(function ' + (options.name||'Class') + '(){_Class.apply(this,arguments)})')
	function _Class() {
		// 【实例引用属性副本】
		for(var key in this){
			var value = this[key]
			if (typeof value != 'function') {
				// 如果是原生【数组】或【对象】作为直接属性
				// 则给每个实例复制一份，以免所有实例共用
				if (value && value.constructor == Array) {
					this[key] = [].concat(value)
				}
				if (value && value.constructor == Object) {
					this[key] = {}
					for(var k in value){
						this[key][k] = value[k]
					}
				}
			}
		}

		// 是否执行初始化
		if (Class.__isNotSelfNew) return

		// 【父类初始化】
		// 父类初始化的this绑定到当前类的实例
		this.constructor.super.apply(this, arguments)

		// 【本类初始化】
		// options.constructor作为初始化方法，不是真正构造函数
		options.constructor.apply(this, arguments)
	}

	// 【继承父类】
	// 【父类方法属性】
	// prototype是父类的一个实例
	// __isNotSelfNew: 父类的初始化方法此时暂不执行
	// 当创建实例时，把父类的初始化方法绑定到当前实例
	Parent.__isNotSelfNew = true
	Class.prototype = new Parent
	delete Parent.__isNotSelfNew

	// 【本类方法属性】
	// 复制options的方法到原型
	for(var key in options){
		var value = options[key]
		Class.prototype[key] = value
	}
	// 修正prototype.constructor
	Class.prototype.constructor = Class
	Class.Parent = Parent
	Class.options = options

	// super
	Class.prototype.constructor.super = Parent.options.constructor

	// 当前类同样可以用.extend派生子类
	Class.extend = Parent.extend

	return Class
}




var EventTarget = Class.extend({
	name: 'EventTarget',
	events: {},
	constructor: function(options){},
	on: function(type, handler) {
		this.events[type] = this.events[type] || []
		this.events[type].push(handler)
	},
	off: function(type, handler) {
		var fns = this.events[type] = this.events[type] || []
		if (handler) {
			for (var i = 0; i < fns.length; i++) {
				if (fns[i] == handler) {
					fns.splice(i, 1)
				}
			}
		} else {
			fns.length = 0
		}
	},
	trigger: function(type, event) {
		event = event || {}

		// .on('type')
		var fns = this.events[type] || []
		for (var i = 0; i < fns.length; i++) {
			fns[i].apply(this, [event])
		}
		// .ontype
		var handler = this['on' + type]
		if (typeof handler == 'function') {
			handler.apply(this, [event])
		}
	},
})




var Watcher = EventTarget.extend({
	name: 'Watcher',
	watchs: {},
	watch: function (key, fn) {
	}
})




var Sprite = Watcher.extend({
	name: 'Sprite',
	// 
	x: 0,
	y: 0,
	width: 10,
	height: 10,
	// img
	src: '',
	img: null,
	// text
	text: '',
	// css
	color: '#333',
	border: 'sold 0px #ddd',
	borderRadius: 0,
	// 
	font: '14px monospace',
	textAlign: 'left',
	textBaseline: 'top',
	// 
	parent: null,
	children: [],
	constructor: function(options){
		options = options || {}
		var self = this
		Object.assign(this, options)

		// src
		if (options.src) {
			var img = new Image
			img.onload = function(){
				self.img = this
				self.width = options.width || this.width
				self.height = options.height || this.height
			}
			img.src = options.src
		}

		this.trigger('create')
	},
	draw: function(context){
		this.context = context || this.context || this.parent.context
		if (!this.context) return
		var context = this.context

		// img
		if (this.img) {
			context.drawImage(this.img, this.x, this.y, this.width, this.height)
		}

		// text
		if (this.text) {
			context.font = this.font
			context.textAlign = this.textAlign
			context.textBaseline = this.textBaseline

			context.strokeStyle = '#fff'
			context.fillStyle = this.color

			context.lineWidth = 2
			context.strokeText(this.text, this.x, this.y)
			context.fillText(this.text, this.x, this.y)
		}

		// children
		this.each(function(child){
			child.draw()
		})
	},
	appendTo: function (parent) {
		parent.appendChild(this)
		return this
	},
	appendChild: function(child){
		child.remove()
		child.parent = this
		this.children.push(child)
		return this
	},
	append: function (child) {
		this.appendChild(child)
		return this
	},
	removeChild: function (child) {
		var self = this

		this.each(function (item, i) {
			if (child) {
				if (child == item) {
					self.children.splice(i, 1)
					child.parent = null
					return true
				}
			} else {
				item.parent = null
			}
		})

		if (!child) {
			this.children.length = 0
		}
	},
	remove: function(){
		if (this.parent) {
			this.parent.removeChild(this)
		}
		return this
	},
	each: function (fn) {
		for (var i = 0; i < this.children.length; i++) {
			var child = this.children[i]
			var isBreak = fn(child, i)
			if (isBreak) {
				break
			}
		}
	},
	destroy: function () {
		
	},
	animate: function () {
		
	},
	isPointOn: function(point){
		return point.x >= this.x
			&& point.x <= this.x + this.width
			&& point.y >= this.y
			&& point.y <= this.y + this.height
	},
	hitTest: function(target, fn){
		var bool = false
		if (true) {}
	},
	// 事件捕获模型，从父到子传播
	captureEvent: function (event) {
		this.trigger(event.type, event)

		this.each(function (child) {
			if (/^(click|mousemove)$/.test(event.type)) {
				if (child.isPointOn({x: event.offsetX, y: event.offsetY})) {
					child.captureEvent(event)
				}
			} else {
				child.captureEvent(event)
			}
		})
	},
	bubbleEvent: function (event) {
		
	},
})




var Game = Sprite.extend({
	name: 'Game',
	canvas: null,
	context: null,
	width: 0,
	height: 0,
	timer: null,
	fpsMax: 1000,
	// sprites: [],
	constructor: function(options){
		options = options || {}

		if (!options.canvas) {
			var canvas = document.createElement('canvas')
			canvas.style = 'position:absolute;top:0;left:0'
			document.body.appendChild(canvas)
		}
		this.canvas = canvas
		this.context = canvas.getContext('2d')
		this.resize()

		this.addEventListener()

		if (this.isStart) {
			this.start()
		}
	},
	addEventListener: function(){
		var self = this

		// 注册原生事件
		'click,dblclick,mousemove,keydown,keypress,keyup'.split(',').forEach(function(type){
			window.addEventListener(type, function(event){
				self.captureEvent(event)
			})
		})

		// resize
		window.addEventListener('resize', function () {
			self.resize()
		})

	},
	resize: function (width, height) {
		this.width = width || window.innerWidth
		this.height = height || window.innerHeight
		this.canvas.width = this.width
		this.canvas.height = this.height
	},
	update: function () {
		this.canvas.width = this.canvas.width // clear
		this.draw()
	},
	loop: function(){
		// console.log('loop')
		var self = this
		this.captureEvent({type: 'frame'})

		this.update()
		this.timer = setTimeout(function(){
			self.loop()
		}, 1000/ this.fpsMax)
	},
	start: function(){
		this.pause()
		this.loop()
	},
	pause: function(){
		clearTimeout(this.timer)
	},
})




var Fps = Sprite.extend({
	name: 'Fps',
	color: '#000',
	lastTime: 0,
	fs: 0,
	onframe: function () {
		// console.log('Fps onframe')
		var now = new Date
		if (now - this.lastTime > 1000) {
			this.lastTime = now
			this.text = this.fs + ' fps'
			this.fs = 0
		}
		this.fs += 1
	}
})

