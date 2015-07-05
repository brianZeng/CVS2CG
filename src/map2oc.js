"use strict";
var parseColor=require('./color');
var cvsState={};
var cvsMethods = {
    beginPath(ctx){
        return `CGContextBeginPath(${ctx})`
    },
    closePath(ctx){
        return `CGContextClosePath(${ctx})`
    },
    clearRect(ctx, args){
        return `CGContextClearRect(${ctx},${printCGRectMake(args)})`
    },
    fillRect(ctx, args){
        return applyState(ctx,`CGContextFillRect(${ctx},${printCGRectMake(args)})`)
    },
    strokeRect(ctx, args){
        return applyState(ctx,`CGContextStrokeRect(${ctx},${printCGRectMake(args)})`)
    },
    moveTo(ctx, args){
        return `CGContextMoveToPoint(${ctx},${mapNumbers(args).join(',')})`
    },
    lineTo(ctx, args){
        return `CGContextAddLineToPoint(${ctx},${mapNumbers(args).join(',')})`
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
        return applyState(ctx,`CGContextFillPath(${ctx})`)
    },
    stroke(ctx){
        return applyState(ctx,`CGContextStrokePath(${ctx})`)
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
        return `[StaticDrawer setContext:${ctx} transform:(CGFloat[]){${mapPreciseNumbers(args).join(',')}}]`;
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
    shadowBlur(ctx,args){
        cvsState.shadowBlur=mapNumbers(args)[0];
        cvsState.changed=1;
    },
    shadowColor(ctx,args){
        cvsState.shadowColor=parseColor(args[0]);
        cvsState.changed=1;
    },
    shadowOffsetX(ctx,args){
        cvsState.shadowOffsetX=mapNumbers(args[0]);
        cvsState.changed=1;
    },
    shadowOffsetY(ctx,args){
        cvsState.shadowOffsetY=mapNumbers(args[0]);
        cvsState.changed=1;
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
var cvsParams = {
    clearRect(args){
        return args;
    },
    fillRect(args){
        return args;
    },
    strokeRect(args){
        return args;
    },
    moveTo(args){
        return args;
    },
    lineTo(args){
        return args;
    },
    bezierCurveTo(args){
        return args;
    },
    quadraticCurveTo(ctx, args){
        return args;
    },
    arcTo(args){
        return args;
    },
    arc(args){
        return args.slice(0,2);
    },
    ellipse(args){
       return args;
    },
    rect(args){
        return args;
    },
    translate(args){
        return args;
    },
    transform(args){
        return [args[4],args[5]]
    },
    setTransform(args){
        return [args[4],args[5]]
    }
};
function printSetShadowWithColor(ctx){
  return `CGContextSetShadowWithColor(${ctx},${printCGSizeMake([cvsState.shadowOffsetX,cvsState.shadowOffsetY])},${mapNumbers(cvsState.shadowBlur)},
  [StaticDrawer createRGBColor:(CGFloat[]){${mapArgNumbers(cvsState.shadowColor.components)}}])`
}

function applyState(ctx,statement){
    if(cvsState.changed){
        cvsState.changed=0;
        return [printSetShadowWithColor(ctx),statement];
    }
    return statement;
}

/*
 |a  b  0|
 |c  d  0|
 |dx dy 1|
*/
function printCGAffineTransformMake(args) {
    return 'CGAffineTransformMake(' + mapPreciseNumbers(args).join(',') + ')'
}
function printCGSizeMake(args){
    return 'CGSizeMake('+mapArgNumbers(args)+')'
}
function printCGRectMake(args) {
    return 'CGRectMake(' + mapArgNumbers(args) + ')'
}
function printCGPointMake(args) {
    return 'CGPointMake(' + mapArgNumbers(args) + ')'
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
    },
    shouldNormalizeNodes(methodName,args){
        var func=cvsParams[methodName],nodes,max=-Infinity;
        if(func){
            nodes=func(args);
            nodes.forEach(function (node) {
                if(!isNaN(node.value) && node.value>max)
                    max=node.value
            });
            return { nodes,max }
        }
    },
    reset(){
        resetCvsState();
    }
};
module.exports.reset();
function resetCvsState(){
    cvsState={
        shadowOffsetX:0,
        shadowOffsetY:0,
        shadowBlur:0,
        shadowColor:parseColor([0,0,0],0),
        changed:0
    }
}
function retFirstParam(args){return args}
