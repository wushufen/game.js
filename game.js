function Class() {}
Class.extend = function (props) {
    var Super = this
    function Sub() {
        // 引用属性副本
        for(var key in this){
            var value = this[key]
            if (value && value.constructor == Array) {
                this[key] = [].concat(value)
            }
            if (value && value.constructor == Object) {
                this[key] = Object.assign({}, value)
            }
        }

        Super.props && Super.props.constructor && Super.props.constructor.apply(this, arguments)
        props.constructor && props.constructor.apply(this, arguments)
    }
    // eval 修改类名
    Sub = eval('0,'+ Sub.toString().replace('Sub', props.name||Super.name+'Sub'))

    // Sub.prototype = Super.prototype //
    var Prototype = function(){}
    Prototype.prototype = Super.prototype
    Sub.prototype = new Prototype
    Object.assign(Sub.prototype, props)
    Sub.prototype.constructor = Sub

    Sub.super = Super
    Sub.props = props
    Sub.extend = Class.extend

    return Sub
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
    width: 0,
    height: 0,
    zIndex: 0,
    // transform
    rotate: 0,
    scale: 1,
    // img
    src: '',
    img: null,
    video: null,
    // text
    text: '',
    fontStyle: 'normal',
    fontVariant: 'normal',
    fontWeight: 'normal',
    fontSize: 14,
    lineHeight: 14,
    fontFamily: 'unsetx',
    // fontFamily: 'Tahoma',
    // fontFamily: 'Menlo',
    // fontFamily: 'Monaco',
    // fontFamily: 'Osaka',
    fontFamily: 'Verdana',
    color: '#000',
    textShadow: 'none',
    textAlign: 'left',
    textBaseline: 'hanging',
    textBaseline: 'middle',
    // css
    background: '',
    shadow: '',
    borderWidth: 0,
    borderColor: '',
    borderRadius: 0,
    padding: 0,
    boxShadow: 'none',
    opacity: 1,
    // 
    parent: null,
    children: [],
    constructor: function(options){
        var self = this

        // options
        options = options || {}
        this.$options = options
        Object.assign(this, options)

        // src
        if (options.src) {
            var isVideo = options.src.match(/\.(mp4|avi)$/)
            if (isVideo) {
                var video = document.createElement('video')
                video.oncanplay = function () {
                    self.video = this
                    self.width = options.width || this.width
                    self.height = options.height || this.height
                }
                video.muted = true
                video.loop = true
                video.src = options.src
                video.play()

                // muted?
                if (!Sprite._isVideoMutedClicked) {
                    addEventListener('click', video._mutedHandle = function () {
                        Sprite._isVideoMutedClicked = true
                        video.muted = false
                        removeEventListener('click', video._mutedHandle)
                        delete video._mutedHandle
                    })
                } else {
                    video.muted = false
                }
            } else {
                var img = new Image
                img.onload = function(){
                    self.img = this
                    self.width = options.width || this.width
                    self.height = options.height || this.height
                }
                img.src = options.src
            }
        }

        this.trigger('create')
    },
    draw: function(context){
        this.trigger('frame')

        // context
        this.context = context || this.context || this.parent.context
        if (!this.context) return
        var context = this.context

        // context save status
        context.save()

        // text width height
        if (this.text) {
            context.font = this.fontStyle
            + ' ' + this.fontVariant
            + ' ' + this.fontWeight
            + ' ' + this.fontSize + 'px/' + this.lineHeight + 'px'
            + ' ' + this.fontFamily

            if (!this.$options.width) {
                this.width = context.measureText(this.text).width + this.padding*2
            }
            if (!this.$options.height) {
                this.height = this.fontSize + this.padding*2
            }
        }

        // 
        var x = this.x
        var y = this.y
        var p = this.padding
        var r = this.borderRadius
        var w = this.width
        var h = this.height

        // transform: translate=>(x,y)  x,y=>transformOrigin
        var x = -w/2
        var y = -h/2
        context.translate(this.x+w/2, this.y+h/2)
        
        // scale
        context.scale(this.scale, this.scale)
        // rotate
        context.rotate(this.rotate)
        // opacity
        context.globalAlpha = this.opacity

        // area: background, shadow, border
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

        // video
        if (this.video) {
            context.drawImage(this.video, x, y, this.width, this.height)
        }

        // img
        if (this.img) {
            context.drawImage(this.img, x, y, this.width, this.height)
        }

        // border
        if (this.borderWidth) {
            context.lineWidth = this.borderWidth
            context.strokeStyle = this.borderColor || this.color
            context.stroke()
        }

        // text
        if (this.text) {
            context.textAlign = this.textAlign
            context.textBaseline = this.textBaseline
            context.fillStyle = this.color

            if (this.textBaseline == 'middle') {
                context.fillText(this.text, x+p, y+p+this.fontSize/2)
            } else {
                context.fillText(this.text, x+p, y+p)
            }
        }

        context.restore()

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
    clone: function (options) {
        
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
    assign: function (options) {
        Object.assign(this, options)
    },
    transition: function (options, duration, callback) {
        var self = this
        if (arguments.length == 1) {
            duration = 1000
        }
        if (arguments.length == 2) {
            if (typeof duration == 'function') {
                callback = duration
                duration = 1000
            }
        }

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
                // console.log('transitionend')
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


var Game = Sprite.Game = Sprite.extend({
    name: 'Game',
    isPause: false,
    canvas: null,
    context: null,
    width: 0,
    height: 0,
    timer: null,
    fps: 60,
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
        this.start()
    },
    listen: function(){
        var self = this

        // 注册事件委托
        for(var ontype in this.canvas){
            if(ontype.match(/^on./)){
                var type = ontype.substr(2)
                self.canvas.addEventListener(type, function(e){
                    if(self.isPause) return
                    self.captureEvent(e)
                })
            }
        }
        // 传感器
        addEventListener('deviceorientation', function(e) {
            if(self.isPause) return
            self.captureEvent(e)
        })
        // resize
        addEventListener('resize', function () {
            self.resize()
        })

        // 阻止默认拖动
        this.canvas.addEventListener('touchstart', function (e) {
            e.preventDefault()
        })
        this.canvas.addEventListener('touchmove', function (e) {
            e.preventDefault()
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

        var updateStartTime = new Date
        this.update()
        var updateTime = new Date - updateStartTime
        var timeout = 1000/this.fps - updateTime - (this.timeWaitTimeout||0)

        var timerStartTime = new Date
        this.timer = setTimeout(function(){
            var timeRunTime = new Date
            var timeWaitTimeout = timeRunTime - timerStartTime - timeout
            self.timeWaitTimeout = timeWaitTimeout
            // console.log(1000/self.fps, updateTime, timeRunTime-timerStartTime, timeout, timeWaitTimeout)
            self.loop()
        }, timeout)
    },
    start: function(){
        this.pause()
        this.isPause = false
        this.loop()
    },
    pause: function(){
        this.isPause = true
        clearTimeout(this.timer)
    },
})


var Fps = Sprite.Fps = Sprite.extend({
    name: 'Fps',
    lastTime: 0,
    fs: 0,
    hasFistUpdate: false,
    constructor: function () {
        this.lastTime = new Date
    },
    onframe: function () {
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
    },
    update: function () {
        this.text = this.fs + 'fps'
    }
})

