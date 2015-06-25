/**
 * Created by brian on 6/25/15.
 */
"use strict";
var UglifyJS=require('uglify-js');
var util=require('./util.js');
var converter=require('./map2oc.js');
var funcCounter=0;
util.objForEach(UglifyJS,function(val,key){
    if(key.indexOf('AST_')==0)
      global[key]=val
});
global.UglifyJS=UglifyJS;
module.exports={
    parse
};
function parse(source,options){
    options=util.defaults(options,{output:[],beautify:1});
    var ast=UglifyJS.parse(source+'',{toplevel:false}),output=options.output;
    walkAst(ast, function (node) {
        if(isContextDefFunc(node)){
            output.push(rewrite2oc(node,options));
            return 1;
        }
    });
    return output.join('\n');
}
function rewrite2oc(ast,options){
    var funcName=ast.name.name||'ctx_call_'+base54(funcCounter++),body=[],bodyStr,args,argsType=[],argsTypeMap={};
    walkAst(ast, function (node) {
        var funcName,contextName,nodeExp;
        if(isCallContext(node)){
            funcName= (nodeExp=node.expression) instanceof AST_Sub?  node.property.value:nodeExp.property;
            contextName=nodeExp.expression.name;
            args=node.args;
        }
        else if(isPropertySet(node)){
            funcName=(nodeExp=node.left) instanceof AST_Sub? nodeExp.property.value:nodeExp.property;
            contextName=nodeExp.expression.name;
            args=[node.right];
        }
        if(funcName){
            argsTypeMap[contextName]='CGContextRef';
            body.push(converter.rewriteContextCall(funcName,contextName,args.map(mapArgValue)));
        }
    });
    bodyStr=options.beautify? '\n\t'+body.join(';\n\t')+';'+'\n': body.join(';')+';';
    util.objForEach(argsTypeMap, function (type, name) {
        argsType.push(type+' '+name);
    });
    return `void ${funcName}(${argsType.join(',')}){${bodyStr}}`;
    function mapArgValue(arg,index){
        if(arg instanceof AST_Constant)
            return arg.value;
        else if(arg instanceof AST_SymbolRef){
            argsTypeMap[arg.name]=converter.argumentTypeInfo(funcName,index);
            return arg.name
        }
        else throw Error('not support');
    }
}
function isPropertySet(node){
    return node instanceof AST_Binary && node.operator=='=' && node.left instanceof AST_PropAccess
}
function isCallContext(node,nodeExp){
    nodeExp=nodeExp||node.expression;
    return node instanceof  AST_Call && nodeExp instanceof AST_PropAccess && nodeExp.expression instanceof AST_SymbolRef
}
function isContextDefFunc(node){
    return node instanceof AST_Defun
}
function walkAst(ast,func){
    var walker=new UglifyJS.TreeWalker(func);
    ast.walk(walker);
    return walker
}
