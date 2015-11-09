"use strict";
let {defaults}=require('../util');
let {walkNode}=require('../astUtil');
let {config}=require('../astMixin');
export const METHOD_TYPE={
    OC_STATIC:0,OC_INSTANCE:1,C_STYLE:2,JS_STYLE:3
};
let printer={
  [METHOD_TYPE.JS_STYLE](node,options){
      config(defaults(options,{
          digitalMaxLength:2
      }));
      return node.print_to_string(options.printOptions);
  }
};
export function print(node,options,meta){
    let print=printer[options.methodType];
    return print(node,options,meta);
}
