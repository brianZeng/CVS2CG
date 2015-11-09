"use strict";
var UglifyJS=require('uglify-js');
var {objForEach}=require('../util');
var globalCnfig={
    digitalMaxLength:2
};
let mixin= {
    Number: {
        _codegen(define){
            var _codegen=define.origin;
            return function(self,output){
                var _output={print:printNumberValue};
                _codegen(self,_output);
                output.print(_output.value);
            };
        }
    },
    UnaryPrefix:{
        _eval(define){
            var _origin=define.origin;
            return function(compressor){
                try{
                   return _origin.call(this,compressor);
                }
                catch (ex){
                    return this.operator=='-'&& this.expression.value===0? 0:NaN;
                }
            }
        }
    }
};
objForEach(mixin,(define,nodeType)=>objForEach(define,(func,methodName)=>redefine(nodeType,methodName,func)));
export function config(configure){
    objForEach(configure,(val,key)=>globalCnfig.hasOwnProperty(key)&&(globalCnfig[key]=val));
}
function printNumberValue(number){
   return this.value=number.replace(/\.(\d+)$/,(str,digital)=>
      str.length > globalCnfig.digitalMaxLength?
            str.substring(0,globalCnfig.digitalMaxLength+1):digital);
}
function redefine(nodeType,methodName,func){
    var AST=UglifyJS[`AST_${nodeType}`], origin=AST.prototype[methodName];
    AST.prototype[methodName]=func({origin,nodeType,methodName});
}