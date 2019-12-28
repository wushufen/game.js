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