/**
 * Created by brian on 6/25/15.
 */
"use strict";
let arr_slice=Array.prototype.slice;
export function makeArray(arr){
    return slice.apply(arr);
}
export function objForEach(obj, callback, thisObj) {
    if (isObj(obj)) {
        thisObj = thisObj || obj;
        Object.getOwnPropertyNames(obj).forEach(function (key) {
            callback.call(thisObj, obj[key], key);
        });
    }
}
export function defaults(obj,def){
   var ret={};
    def=def||{};
    obj=obj||{};
    objForEach(def,function(val,key){
       ret[key]=obj.hasOwnProperty(key)? obj[key]:val;
    });
    return ret;
}
export function arrAdd(array,obj){
    if(array.indexOf(obj)==-1){
        array.push(obj);
        return true;
    }
    return false
}
export function arrRemove(arr,obj){
    var i=arr.indexOf(obj);
    if(i>-1){
        arr.splice(i,1);
        return obj;
    }
}
export function mapArgNumbers(nums){
  return mapNumbers(nums).join(',')
}
export function mapNumbers(nums) {
  return nums.map?nums.map(function (num) {
    return getNumberOrRef(num,2)
  }):getNumberOrRef(nums,2)
}
export function mapPreciseNumbers(nums) {
  return nums.map? nums.map(function (num) {
    return getNumberOrRef(num,8)
  }):getNumberOrRef(nums,8)
}
export function getNumberOrRef(num,pre){
  if(isNaN(num))return num;
  return pre? (+num).toFixed(pre):parseInt(num);
}
function printCGRectMake(args) {
  return 'CGRectMake(' + mapArgNumbers(args) + ')'
}
export function printCGAffineTransformMake(args){
  var argNumbers=[].map.call(args,mapPreciseNumbers).slice(0,6).join(',');
  return `CGAffineTransformMake(${argNumbers})`
}
export function isFunc(func){
    return typeof func==="function"
}
export function isObj(obj){
    return obj && typeof obj==="object"
}

//module.exports={
//    objForEach,defaults,arrAdd,mapNumbers,mapPreciseNumbers,isFunc,isObj,printCGRectMake,printCGAffineTransformMake
//};