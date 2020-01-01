# game.js


* https://wusfen.github.io/game.js/examples/index.html
* https://wusfen.github.io/game.js/examples/event.html
* https://wusfen.github.io/game.js/examples/transition.html
* https://wusfen.github.io/game.js/examples/sensor.html
* https://wusfen.github.io/game.js/examples/src.html
* https://wusfen.github.io/game.js/examples/fps.html
* https://wusfen.github.io/game.js/examples/test.html

# API

## Sprite

### options

```javascript
var sprite = new Sprite({
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
    fontFamily: 'Verdana',
    color: '#000',
    textShadow: 'none',
    textAlign: 'left',
    textBaseline: 'middle',
    // css
    background: '',
    shadow: '',
    boxShadow: 'none',
    borderWidth: 0,
    borderColor: '',
    borderRadius: 0,
    padding: 0,
    opacity: 1,
})

```

### constructor(...args)
```javascript
new Sprite({
    constructor: function(...args){
        // init code
    }
})
```

### methods
```javascript
sprite.assign(options)
sprite.appendTo(parentSprite)
sprite.append(childSprite)
sprite.appendChild(childSprite)
sprite.remove()
sprite.removeChild(childSprite)
sprite.clone()
sprite.each(function(child, index){})
sprite.transition(options, duration, callback)
sprite.isPointOn({x:0, y:0})
sprite.hitTest(targetSprite, callback)
```

### event

#### on
```javascript
var sprite = new Sprite({
    onclick: function(e){}
})
sprite.onclick = function(e){}
sprite.on('click', function(e){})
```

#### off
```javascript
sprite.off(eventType)
sprite.off(eventType, handler)
```

#### trigger
```javascript
sprite.trigger(eventType)
sprite.trigger(eventType, data)
```

#### events

- domEvent
    - click, mousemove, ...
- frame
- create
- transitionend


### Sprite.extend
```javascript
var SpriteSub = Sprite.extend({
    arg1: 0,
    constructor: function(arg0, arg1, argN){
    },
    method1: function(){
        console.log(this.arg1)
    },
    oncreate: function(){
        this.method1()
    }
})
var spriteSub = new SpriteSub({
    arg1: 100
})
```


## Sprite.Game extends Sprite
```javascript
var game = new Sprite.Game({
    canvas: null, // auto create
    width: 0,
    height: 0,
    fps: 60,
})
game.start()
game.pause()
game.appendChild(childSprite)
```


## Sprite.Fps extends Sprite
```javascript
new Sprite.Fps()
    .appendTo(game)
```
