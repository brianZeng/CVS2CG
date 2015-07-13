/**
 * Created by Administrator on 2015/7/13.
 */
var util=require('./util.js');
function VM(options){
  options=util.defaults(options,{
    hasSubPath:false,
    transformIds:['_curMat'],
    transformCount:0,
    transformChanged:false,
    currentPath:'_curPath',
    currentTransform:'_curMat',
    retPath:'_retPath'
  });
  util.objForEach(options,function(v,k){this[k]=v},this);
}
var vm={};
var pathMethods={
  moveTo(args){
    return simpleWap('CGPathMoveToPoint',util.mapNumbers(args.slice(0,2)).join(','));
  },
  arc(args){
    var nargs = util.mapNumbers(args.slice(0, 3)).concat(util.mapPreciseNumbers(args.slice(3, 5)));
    nargs.push(args[5]?1:0);
    return simpleWap('CGPathAddArc',nargs.join(','));
  },
  arcTo(args){
    return simpleWap('CGPathAddArcToPoint',util.mapNumbers(args.slice(0,5)).join(','));
  },
  quadraticCurveTo( args){
    return simpleWap('CGPathAddQuadCurveToPoint',util.mapNumbers(args.slice(0,4)).join(','));
  },
  bezierCurveTo(args){
    return simpleWap('CGPathAddCurveToPoint',util.mapNumbers(args.slice(0,6)).join(','));
  },
  moveTo( args){
    return simpleWap('CGPathMoveToPoint',util.mapNumbers(args.slice(0,2)).join(','))
  },
  lineTo(args){
    return simpleWap('CGPathAddLineToPoint',util.mapNumbers(args.slice(0,2)).join(','));
  },
  rect(args){
    return simpleWap('CGPathAddRect',util.printCGRectMake(args.slice(0,4)))
  },
  save(){
    var lastId=currentTransformIdentifier();
    return `CGAffineTransform ${saveTransformIdentifier()}=CGAffineTransformConcat(${lastId},CGAffineTransformIdentity)`
  },
  restore(){
    return `//pop transform ${restoreTransformIdentifier()} use ${currentTransformIdentifier()}`
  },
  beginPath(){
    var ret=[`${vm.currentPath}=CGPathCreateMutable()`,`CGPathAddPath(${vm.retPath},nil,${vm.currentPath})`];
    vm.hasSubPath=true;
    return ret;
  },
  closePath(){
    return `CGPathCloseSubPath(${vm.hasSubPath?vm.currentPath:vm.retPath})`
  },
  fill(){
   /* var ret=vm.hasSubPath? [`CGPathAddPath(${vm.retPath},nil,${vm.currentPath})`,`${vm.currentPath}=CGPathCreateMutable()`]:[];
    vm.hasSubPath=false;
    return ret;*/
    return []
  },
  setTransform(args){
    vm.transformChanged=1;
    return `${vm.currentTransform}=${util.printCGAffineTransformMake(args)}`
  },
  transform(args){
    return useTransform('CGAffineTransformConcat',util.printCGAffineTransformMake(args))
  },
  translate(args){
    return useTransform('CGAffineTransformTranslate',util.mapPreciseNumbers(args.slice(0,2)))
  },
  scale(args){
    return useTransform('CGAffineTransformScale',util.mapPreciseNumbers(args.slice(0,2)))
  },
  rotate(args){
    return useTransform('CGAffineTransformRotate',util.mapPreciseNumbers(args[0]));
  },
  stroke(){
    return pathMethods.fill();
  }
};

function resetVm(){
  vm=new VM();
}
function currentTransformIdentifier(){
 return vm.transformIds[vm.transformIds.length-1]
}
function saveTransformIdentifier(){
  var id=vm.currentTransform+vm.transformCount++;
  vm.transformIds.push(id);
  return id;
}
function restoreTransformIdentifier(){
  if(vm.transformIds.length>1)
    return vm.transformIds.pop();
}
function useTransform(methodName,args){
  if(!vm.transformChanged){
    vm.transformChanged=1;
  }
  return `${currentTransformIdentifier()}=${methodName}(${currentTransformIdentifier()},${args})`
}
function simpleWap(methodName,args){
  return `${methodName}(${vm.hasSubPath?vm.currentPath:vm.retPath},${vm.transformChanged? currentTransformIdentifier():'nil'},${args})`
}
function mapCtxCall(methodName,ctx,args){
  return pathMethods[methodName](ctx,args);
}
module .exports={
  rewrite(bodies){
    resetVm();
    var ret=[`CGPathRef ${vm.retPath}=CGPathCreateMutable(),${vm.currentPath}`];
    bodies.forEach(function(body){
      var func=pathMethods[body.funcName],retbodies;
      if(func){
        retbodies=func(body.args);
        if(typeof retbodies=="string")
          ret.push(retbodies);
        else if(retbodies.length)
          ret.push.apply(ret,retbodies);
      }
      else throw Error('not support '+body.funcName);
    });
    if(vm.transformChanged) ret.splice(1,0,`CGAffineTransform ${vm.currentTransform}=CGAffineTransformIdentity`);
    ret.push(`return ${vm.retPath}`);
    return ret;
  },
  reset(){
    resetVm();
  }
};