"use strict";
var parseColor=require('./color');
var cvsMethods = {
    beginPath(ctx){
        return `CGContextBeginPath(${ctx})`;
    },
    closePath(ctx){
        return `CGContextClosePath(${ctx})`
    },
    clearRect(ctx, args){
        return `CGContextClearRect(${ctx},${printCGRectMake(args)})`
    },
    fillRect(ctx, args){
        return `CGContextFillRect(${ctx},${printCGRectMake(args)})`
    },
    strokeRect(ctx, args){
        return `CGContextStrokeRect(${ctx},${printCGRectMake(args)})`
    },
    moveTo(ctx, args){
        return `CGContextMoveToPoint(${ctx},${mapNumbers(args).join(',')})`
    },
    lineTo(ctx, args){
        return `CGContextLineToPoint(${ctx},${mapNumbers(args).join(',')})`
    },
    bezierCurveTo(ctx, args){
        return `CGContextAddCurveToPoint(${ctx},${mapNumbers(args).join(',')})`
    },
    quadraticCurveTo(ctx, args){
        return `CGContextAddQuadCurveToPoint(${ctx},${mapNumbers(args).join(',')})`
    },
    arcTo(ctx, args){
        return `CGContextAddArcToPoint(${ctx},${mapNumbers(args).join(',')})`
    },
    arc(ctx, args){
        var nargs = mapNumbers(args.slice(0, 2)).concat(mapPreciseNumbers(args.slice(3, 4)));
        nargs.push(getNumberOrRef(args[5],0));
        return `CGContextAddArc(${ctx},${nargs.join(',')})`
    },
    ellipse(ctx, args){
        //x,y,radiusX,radiusY
        var x = args[0] - args[2], y = args[1] - args[3], w = 2 * args[2], h = 2 * args[3];
        return `CGContextAddEllipseInRect(${ctx},${printCGRectMake([x, y, w, h])})`
    },
    rect(ctx, args){
        return `CGContextAddRect(${ctx},${printCGRectMake(args)})`
    },
    fill(ctx){
        return `CGContextFillPath(${ctx})`
    },
    stroke(ctx){
        return `CGContextStrokePath(${ctx})`
    },
    clip(ctx){
        return `CGContextClip(${ctx})`
    },
    rotate(ctx, args){
        var angle = mapPreciseNumbers(args)[0];
        return `CGContextRotateCTM(${ctx},${angle})`
    },
    translate(ctx, args){
        return `CGContextTranslateCTM(${ctx},${mapNumbers(args).join(',')})`
    },
    scale(ctx, args){
        return `CGContextScaleCTM(${ctx},${mapNumbers(args).join(',')})`
    },
    transform(ctx, args){
        return `CGContextConcatCTM(${ctx},${printCGAffineTransformMake(args)})`
    },
    setTransform(ctx, args){
        var values = mapPreciseNumbers(args).join(',');
        return `${defFuncs.setAffineMatrixValues.name}(CGContextGetCTM(${ctx}),${values})`
    },
    save(ctx){
        return `CGContextSaveGState(${ctx})`
    },
    restore(ctx){
        return `CGContextRestoreGState(${ctx})`
    },
    globalAlpha(ctx, args){
        var alpha = mapNumbers(args)[0];
        return `CGContextSetAlpha(${ctx},${alpha})`
    },
    globalCompositeOperation(ctx){

    },
    shadowBlur(ctx){

    },
    shadowColor(ctx){

    },
    shadowOffsetX(ctx){

    },
    shadowOffsetY(ctx){

    },
    fillStyle(ctx,args){
        var color=parseColor(args[0]);
        return `CGContextSetRGBFillColor(${ctx},${mapArgNumbers(color.components)})`;
    },
    strokeStyle(ctx,args){
        var color=parseColor(args[0]);
        return `CGContextSetRGBStrokeColor(${ctx},${mapArgNumbers(color.components)})`;
    }
};
var defFuncs = {
    setAffineMatrixValues: {
        name: 'setAffineMatrixValues',
        type: 'void',
        params: {
            mat: 'CGAffineTransform',
            a: 'CGFloat', b: 'CGFloat', c: 'CGFloat', d: 'CGFloat',
            tx: 'CGFloat', ty: 'CGFloat'
        },
        body: `mat.a=a;mat.b=b;mat.c=c;mat.d=d;mat.tx=tx;mat.ty=ty;`
    }
};
function defineFunc(def, name) {
    var params = [];
    objForEach(def.params, function (type, name) {
        params.push(type + ' ' + name)
    });
    return `${def.type} ${name} (${params.join(',')}){${def.body}}`
}
function printSetMatrix() {

}
/*
 |a  b  0|
 |c  d  0|
 |dx dy 1|
*/
function printCGAffineTransformMake(args) {
    return 'CGAffineTransformMake(' + mapPreciseNumbers(args).join(',') + ')'
}
function printCGRectMake(args) {
    args = mapNumbers(args).join(',');
    return 'CGRectMake(' + args + ')'
}
function printCGPointMake(args) {
    return 'CGPointMake(' + mapNumbers(args).join(',') + ')'
}
function mapArgNumbers(nums){
    return mapNumbers(nums).join(',')
}
function mapNumbers(nums) {
    return nums.map?nums.map(function (num) {
        return getNumberOrRef(num,2)
    }):getNumberOrRef(nums,2)
}
function mapPreciseNumbers(nums) {
    return nums.map? nums.map(function (num) {
        return getNumberOrRef(num,8)
    }):getNumberOrRef(nums,8)
}
function getNumberOrRef(num,pre){
    if(isNaN(num))return num;
    return pre? (+num).toFixed(pre):parseInt(num);
}
function objForEach(obj, callback, thisObj) {
    if (obj) {
        thisObj = thisObj || obj;
        Object.getOwnPropertyNames(obj).forEach(function (key) {
            callback.call(thisObj, obj[key], key);
        });
    }
}
module.exports={
    rewriteContextCall(methodName,ctxName,args){
        var func=cvsMethods[methodName];
        if(!func) throw Error('method:'+methodName+' not support');
        return func(ctxName,args);
    },
    argumentTypeInfo(methodName,index){
        return 'CGFloat'
    }
};
