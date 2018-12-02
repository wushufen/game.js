function Class() {}
Class.extend = function (options) {
	var Parent = this
	Parent.options = Parent.options || {}

	// class
	// 用eval创建构造，可以指定名字
	var Class = eval('(function ' + (options.name||'Class') + '(){_Class.apply(this,arguments)})')
	function _Class() {
		// 【实例引用类型属性副本】
		for(var key in this){
			var value = this[key]

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
		var self = this

		type.split(',').forEach(function (type) {
			self.events[type] = self.events[type] || []
			self.events[type].push(handler)
		})

		return this
	},
	off: function(type, handler) {
		var self = this
		var argumentsLength = arguments.length

		type.split(',').forEach(function (type) {
			var fns = self.events[type] = self.events[type] || []
			if (argumentsLength == 2) {
				for (var i = 0; i < fns.length; i++) {
					if (fns[i] == handler) {
						fns.splice(i, 1)
					}
				}
			} else {
				fns.length = 0
			}
		})

		return this
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

		return this
	},
})




var Watcher = EventTarget.extend({
	name: 'Watcher',
	watchs: {},
	watch: function (key, fn) {

		return this
	}
})




var Sprite = Watcher.extend({
	name: 'Sprite',
	// pos
	x: 0,
	y: 0,
	// img
	src: '',
	img: null,
	// text
	text: '',
	// css
	width: 10,
	height: 10,
	display: 'block',
	position: 'absolute',
	left: 'auto',
	right: 'auto',
	top: 'auto',
	bottom: 'auto',
	background: '',
	shadow: '',
	border: '',
	borderRadius: 0,
	padding: 0,
	color: '#333',
	fontFamily: 'monospace',
	fontSize: 14,
	lineHeight: 1.25,
	fontStyle: 'normal',
	fontWeight: 'normal',
	textShadow: 'none',
	boxShadow: 'none',
	opacity: 1,
	zIndex: 0,
	zoom: 1,
	// canvas context style
	// font: '14px monospace',
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
		this.trigger('frame')

		this.context = context || this.context || this.parent.context
		if (!this.context) return
		var context = this.context

		var x = this.x
		var y = this.y
		var w = this.width
		var h = this.height
		var r = this.borderRadius
		var p = this.padding

		context.beginPath()
		context.moveTo(x+r, y)
		context.lineTo(x+w-r, y)
		context.arc(x+w-r, y+r, r, -Math.PI/2, 0)
		context.lineTo(x+w, y+h-r)
		context.arc(x+w-r, y+h-r, r, 0, Math.PI/2)
		context.lineTo(x+r, y+h)
		context.arc(x+r, y+h-r, r, Math.PI/2, Math.PI)
		context.lineTo(x, y+r)
		context.arc(x+r, y+r, r, Math.PI, -Math.PI/2)

		// shadow
		if (this.shadow) {
			context.shadowBlur = 10
			context.shadowColor = this.shadow
			// context.shadowOffsetX = 3
			// context.shadowOffsetY = 3
		}
		// background
		if (this.background) {
			context.fillStyle = this.background
		}
		if (this.background||this.shadow) {
			context.fill()
			// context.shadowColor = 'rgba(0,0,0,0)'
			// context.fillStyle = 'rgba(0,0,0,0)'
		}

		// img
		if (this.img) {
			context.drawImage(this.img, this.x, this.y, this.width, this.height)
		}

		// border
		if (this.border) {
			context.lineWidth = 1
			context.strokeStyle = this.color
			context.stroke()
		}

		// text
		if (this.text) {
			context.font = this.fontSize + 'px ' + this.fontFamily
			context.textAlign = this.textAlign
			context.textBaseline = this.textBaseline

			context.strokeStyle = 'rgba(255,255,255,.4)'
			context.fillStyle = this.color
			context.lineWidth = 1

			var p = this.padding
			var x = this.x + this.padding
			var y = this.y + this.padding
			var w = context.measureText(this.text).width
			var h = this.fontSize
			var wp = w + p*2
			var hp = h + p*2
			context.strokeText(this.text, x, y)
			context.fillText(this.text, x, y)

			this.width = Math.max(this.width, wp)
			this.height = Math.max(this.height, hp)
		}

		// children
		this.each(function(child){
			child.draw()
		})

		return this
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

		return this
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

		return this
	},
	transition: function (options, duration, callback) {
		if (arguments.length == 1) {
			duration = 1
		}
		if (arguments.length == 2) {
			if (typeof duration == 'function') {
				callback = duration
				duration = 1
			}
		}
		duration *= 1000

		var self = this

		var startTime = +new Date
		var lastTime = startTime
		var endTime = startTime + duration

		var startOptions = Object.assign({}, this)
		var keys = Object.keys(options)
		var dones = {}

		this.off('frame', this.transitionHandler)
		this.on('frame', this.transitionHandler = function () {
			var now = +new Date

			for(var key in options){
				var endValue = options[key]

				if (typeof endValue == 'number') {
					var startValue = startOptions[key] || 0
					var diffValue = endValue - startValue

					this[key] += (now-lastTime)/duration * diffValue

					if (diffValue>0) {
						if (this[key] >= endValue) {
							this[key] = endValue
							dones[key] = true
						}
					} else {
						if (this[key] <= endValue) {
							this[key] = endValue
							dones[key] = true
						}
					}

				} else {
					this[key] = endValue
					dones[key] = true
				}
			}
			lastTime = now

			if (Object.keys(dones).length == keys.length) {
				this.off('frame', this.transitionHandler)
				this.trigger('transitionend')
				console.log('transitionend')
				if (callback) {
					callback.call(this)
				}
			}
		})

		return this
	},
	// this.animation([
	// 	{x:200, y:400},
	// 	{x:100, y:300}	
	// ])
	animation: function (list, options) {
		// body...
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

		return this
	},
	// 事件捕获模型，从父到子传播
	captureEvent: function (event) {
        if (event.changedTouches) {
            var touch = event.changedTouches[0]
            event.clientX = touch.clientX
            event.clientY = touch.clientY
        }
		this.trigger(event.type, event)

		this.each(function (child) {
			if (/^(click|mousedown|mousemove|mouseup|touchstart|touchmove|touchend)$/.test(event.type)) {
				if (child.isPointOn({x: event.clientX, y: event.clientY})) {
					child.captureEvent(event)
				}
			} else {
				child.captureEvent(event)
			}
		})

		return this
	},
	bubbleEvent: function (event) {

		return this
	},
})




var Game = Sprite.extend({
	name: 'Game',
	isStart: true,
	canvas: null,
	context: null,
	width: 0,
	height: 0,
	timer: null,
	fps: 1000,
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

		this.listen()

		if (this.isStart) {
			this.start()
		}
	},
	listen: function(){
		var self = this

		// 注册原生事件
		for(var ontype in this.canvas){
			if(ontype.match(/^on./)){
				var type = ontype.substr(2)
				self.canvas.addEventListener(type, function(e){
					self.captureEvent(e)
				})
			}
		}
		this.canvas.addEventListener('touchstart', function (e) {
			e.preventDefault()
		})
		this.canvas.addEventListener('touchmove', function (e) {
			e.preventDefault()
		})

		// 传感器
		addEventListener('deviceorientation', function(e) {
			self.captureEvent(e)
		})

		// resize
		addEventListener('resize', function () {
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
		// this.captureEvent({type: 'frame'}) // || sprite.draw(){this.trigger('frame')}

		this.update()
		this.timer = setTimeout(function(){
			self.loop()
		}, 1000/ this.fps)
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
	hasFistUpdate: false,
	constructor: function () {
		this.lastTime = new Date

		this.on('frame', function () {
			// console.log('Fps onframe')
			var now = new Date
			if (now - this.lastTime > 1000) {
				this.update()
				this.lastTime = now
				this.fs = 0
				this.hasFistUpdate = true
			}

			this.fs += 1
			if (!this.hasFistUpdate) {
				this.update()
			}
		})
	},
	update: function () {
		this.text = this.fs + ' fps'
	}
})

