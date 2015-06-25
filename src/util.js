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
module.exports={
    objForEach,defaults,arrAdd
};