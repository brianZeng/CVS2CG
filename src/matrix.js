/**
 * Created by brian on 11/8/15.
 */
"use strict";
var {isObj,objForEach,makeArray,isFunc}=require('./util');
var {mat3,vec2,glMatrix}=require('gl-matrix');
var mat3_pro=Mat3.prototype=glMatrix.ARRAY_TYPE.prototype;
mat3_pro.print_to_array=function(){
    var m=this;
    return [m[0],m[2],m[4],m[1],m[3],m[5]]
};
var mat3_pro_mixIn={
    scale(x,y){
        return [x,y]
    },
    rotate(rad){
        return rad;
    },
    translate(x,y){
        return [x,y]
    }
};
objForEach(mat3,(func,key)=>{
    var mixFunc=mat3_pro_mixIn[key];
    if(isFunc(mixFunc))
        mat3_pro[key]=function(){
            var vec=mixFunc.apply(this,arguments);
            return mat3[key](this,this,vec);
        };
    else
        mat3_pro[key]= function () {
            return func.apply(this,arguments);
        };
    Mat3[key]=function createMat3(){
        return new Mat3(func.apply(null,arguments))
    }
});
export function Mat3(opt){
    if(!(this instanceof Mat3))
        return new Mat3(opt);
    let mat;
    if(isObj(opt))
        mat=mat3.clone.call(this,opt);
    else
        mat= mat3.create.call(this);
    return clone(this,mat);
}
function clone(target,source){
    for(var i=0;i<source.length;i++)
        target[i]=source[i];
    return target;
}