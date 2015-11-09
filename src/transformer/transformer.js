/**
 * Created by brian on 7/14/15.
 */
"use strict";
var {objForEach,isObj} =require('../util');
var {vecNodeUseMatrix}=require('./convertNode');
var normalMethod = {
    moveTo: {
        toVec(args){
            return toVecArray([0], [1], args);
        },
        remap(vecs){
            return mapVecs(vecs,[0,1])
        }
    },
    arc:{
        toVec(args){
            return toVecArray([0, 2], [1, 3], args);
        },
        remap(vecs){
            return mapVecs(vecs,[0,1],[2,3])
        }
    },
    arcTo:{
        toVec(args){
            return toVecArray([0, 2, 4], [1, 3, 4], args);
        },
        remap(vecs){
            var ret=mapVecs(vecs,[0,1],[2,3]);
            ret.push(vecs[2][0]);
            return ret;
        }
    },
    quadraticCurveTo:{
        toVec(args){
        return toVecArray([0, 2], [1, 3], args);
        },
        remap(vecs){
            return mapVecs(vecs,[0,1],[2,3])
        }
    },
    bezierCurveTo:{
        toVec(args){
        return toVecArray([0, 2, 4], [1, 3, 5], args);
        },
        remap(vecs){
            return mapVecs(vecs,[0,1],[2,3],[4,5])
        }
    },
    lineTo:{
        toVec(args){
            return toVecArray([0], [1], args);
        },
        remap(vecs){
            return mapVecs(vecs,[0,1])
        }
    },
    rect:{
        toVec(args){
            return toVecArray([0, 2], [1, 3], args);
        },
        remap(vecs){
            return mapVecs(vecs,[0,1],[2,3])
        }
    },
    translate:{
        toVec(args){
            return toVecArray([0], [1], args);
        },
        remap(vecs){
            return mapVecs(vecs,[0,1])
        }
    },
    scale:{
        toVec(args){
        return toVecArray([0], [1], args)
        },
        remap(vecs){
            return mapVecs(vecs,[0,1])
        }
    },
    transform:{
        toVec(args){
            return toVecArray([0, 1, 4], [2, 3, 5], args)
        },
        remap(vecs){
            return mapVecs(vecs,[0,2],[1,3],[4,5])
        }
    },
    setTransform:{
        toVec(args){
            return toVecArray([0, 1, 4], [2, 3, 5], args)
        },
        remap(vecs){
            return mapVecs(vecs,[0,2],[1,3],[4,5])
        }
    }
};
var emptyDefine={skip:true};
'beginPath,closePath,save,fill,restore,stroke'.split(',').forEach(function (key) {
    normalMethod[key] =emptyDefine
});
function toVecArray(xs, ys, args) {
    for (var i = 0, len = xs.length, ret = []; i < len; i++) {
        ret[i] = [args[xs[i]], args[ys[i]]]
    }
    return ret;
}
function mapVecs(vecs,...indices){
    var ret=[];
    indices.forEach((index,i)=>{
        var vec=vecs[i];
        ret[index[0]]=vec[0];
        ret[index[1]]=vec[1];
    });
    return ret;
}
function argVectors(methodName, args) {
    var func = normalMethod[methodName], nodes;
    if (func)
        nodes = func(args);
    else
        throw Error('not support:' + methodName);
    return nodes;
}
function transformMethod(methodName,args,{matrix,meta}){
    var define=normalMethod[methodName];
    if(!define)
        throw Error(`${methodName} not support`);
    if(define.skip)return args;
    var transformedNodes=define.toVec(args).map(vec=>vecNodeUseMatrix(vec,{matrix,meta}));
    return define.remap(transformedNodes);
}

module.exports = {
    transformMethod
};

