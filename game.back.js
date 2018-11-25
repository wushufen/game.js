function Class(Parent, options){
	if (typeof Parent != 'function') {
		options = Parent
		Parent = null
	}
	options = options || {}

	var Class = function(){
		init.apply(this, arguments)
	}

	Class.Parent = Parent
	Class.options = options

	if (Parent) {
		Parent.__isNotSelfNew = true
		Class.prototype = new Parent
		delete Parent.__isNotSelfNew
	}

	for(var key in options){
		if (typeof options[key] == 'function') {
			Class.prototype[key] = options[key]
		}
	}
	Class.prototype.constructor = Class
	Class.prototype.super = Parent

	function init() {
		if (Class.__isNotSelfNew) {
			return
		}

		if (Class.Parent) {
			Class.Parent.apply(this, arguments)
		}

		for(var key in options){
			var value = options[key]

			if (typeof value != 'function') {
				this[key] = value
				// [] {} 只复制一层
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
		}
		options.constructor.apply(this, arguments)
	}

	return Class
}




var EventTarget = Class({
	name: 'EventTarget',
	events: {},
	constructor: function(){
	},
	on: function(type, listener) {
		this.events[type] = this.events[type] || []
		this.events[type].push(listener)
	},
	off: function(type, listener) {
		var fns = this.events[type] = this.events[type] || []
		if (listener) {
			for (var i = 0; i < fns.length; i++) {
				if (fns[i] == listener) {
					fns.splice(i, 1)
				}
			}
		} else {
			fns.length = 0
		}
	},
	trigger: function(type, event) {
		// on()
		var fns = this.events[type] || []
		for (var i = 0; i < fns.length; i++) {
			fns[i].apply(this, [event])
		}
		// .on
		var handler = this['on' + type]
		if (typeof handler == 'function') {
			handler.apply(this, [event])
			this.constructor.prototype.constructor.prototype
		}
	}
})




var Sprite = Class(EventTarget, {
	name: 'Sprite',
	// 
	x: 0,
	y: 0,
	width: 10,
	height: 10,
	// 
	src: '',
	img: null,
	// 
	text: '',
	// 
	color: '#333',
	border: 'none',
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
				self.width = this.width
				self.height = this.height
			}
			img.src = options.src
		}

		// onframe
		self.on('frame', function (e) {
			self.eachChild(function (child) {
				child.trigger('frame', e)
			})
		})
		
		this.trigger('create')
		
	},
	draw: function(context){
		this.context = context || this.context || this.parent.context
		if (!this.context) return

		var self = this
		var context = this.context

		// img
		if (this.img) {
			context.drawImage(this.img, this.x, this.y)
		}

		// text
		if (this.text) {
			context.font = this.font
			context.textAlign = this.textAlign
			context.textBaseline = this.textBaseline

			context.strokeStyle = '#fff'
			context.fillStyle = this.color

			context.lineWidth = 3
			context.strokeText(this.text, this.x, this.y)
			context.fillText(this.text, this.x, this.y)
		}

		// children
		this.eachChild(function(child){
			child.draw()
		})
	},
	appendChild: function(child){
		child.appendTo(this)
		return this
	},
	appendTo: function (parent) {
		this.remove()
		this.parent = parent
		parent.children.push(this)
	},
	remove: function(){
		var self = this

		if (this.parent) {
			this.parent.eachChild(function (child, i) {
				if (self == child) {
					self.parent.children.splice(i, 1)
					return
				}
			})
		}
	},
	destroy: function () {
		
	},
	eachChild: function (fn) {
		for (var i = 0; i < this.children.length; i++) {
			var child = this.children[i]
			var isBreak = fn(child, i)
			if (isBreak) {
				break
			}
		}
	},
	isPointOnSelf: function(point){
		return point.x >= this.x
			&& point.x <= this.x + this.width
			&& point.y >= this.y
			&& point.y <= this.y + this.height
	},
	isPointOn: function(point){
		var bool = this.isPointOnSelf(point)
		this.eachChild(function (child) {
			if (child.isPointOnSelf(point)) {
				return bool = true
			}
		})
		return bool
	},
	hitTest: function(target){

	},
	eventTest: function(eventName, e){
		if ( this.isPointOn({x: e.offsetX, y: e.offsetY}) ) {
			this.trigger(eventName, e)
			this.eachChild(function (child) {
				child.eventTest(eventName, e)
			})
		}
	}
})




var Game = Class(Sprite, {
	name: 'Game',
	canvas: null,
	context: null,
	width: 0,
	height: 0,
	timer: null,
	sprites: [],
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
		this.start()
	},
	addEventListener: function(){
		var self = this

		// mounse
		'click,dblclick'.split(',').forEach(function(eventName){
			self.canvas.addEventListener(eventName, function(e){
				self.trigger(eventName, e)
				self.eachChild(function(child){
					child.eventTest(eventName, e)
				})
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
		var self = this
		this.trigger('frame')

		this.update()
		this.timer = setTimeout(function(){
			self.loop()
		}, 1)
	},
	start: function(){
		this.loop()
	},
	pause: function(){
		clearTimeout(this.timer)
	},
})





var Fps = Class(Sprite, {
	name: 'Fps',
	color: '#000',
	lastTime: 0,
	fs: 0,
	onframe: function () {
		var now = new Date
		if (now - this.lastTime > 1000) {
			this.lastTime = now
			this.text = this.fs + ' fps'
			this.fs = 0
		}
		this.fs += 1
	}
})





var fps = new Fps()
var game = new Game({
	onframe: function () {
	}
})

var ts = new Sprite({
	x: 100,
	src: 'img/ts.png',
	onclick: function(){
		console.log('click ts')
	},
})

var mg = new Sprite({
	x: 300,
	y: 100,
	src: 'img/mg.jpg',
	onclick: function(e){
		console.log('click mg')
	},
})

var pic = new Sprite({
	src: 'http://pic31.nipic.com/20130722/9252150_095713523386_2.jpg',
	onclick: function(e){
		console.log('click pic')
	},
})



for (var i = 0; i < 150; i++) {

	var xrk = new Sprite({
		x: 300,
		y: 300,
		src: 'img/xrk.jpg',
		oncreate: function () {
			this.x = Math.random() * game.width
			this.y = Math.random() * game.height
		},
		onclick: function(e){
			console.log('click xrk')
		},
		onframe: function () {
			this.x = Math.random() * game.width
			this.y = Math.random() * game.height
		}
	})


	xrk.appendTo(game)
}

game.appendChild(ts)
ts.appendChild(mg)
game.appendChild(fps)