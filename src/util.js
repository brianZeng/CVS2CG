/**
 * Created by brian on 6/25/15.
 */
"use strict";
function objForEach(obj, callback, thisObj) {
    if (obj) {
        thisObj = thisObj || obj;
        Object.getOwnPropertyNames(obj).forEach(function (key) {
            callback.call(thisObj, obj[key], key);
        });
    }
}
function defaults(obj,def){
   var ret={};
    def=def||{};
    obj=obj||{};
    objForEach(def,function(val,key){
       ret[key]=obj.hasOwnProperty(key)? obj[key]:val;
    });
    return ret;
}
function arrAdd(array,obj){
    if(array.indexOf(obj)==-1){
        array.push(obj);
        return true;
    }
    return false
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
function printCGRectMake(args) {
  return 'CGRectMake(' + mapArgNumbers(args) + ')'
}
function printCGAffineTransformMake(args){
  var argNumbers=[].map.call(args,mapPreciseNumbers).slice(0,6).join(',');
  return `CGAffineTransformMake(${argNumbers})`
}
module.exports={
    objForEach,defaults,arrAdd,mapNumbers,mapPreciseNumbers,printCGRectMake,printCGAffineTransformMake
};