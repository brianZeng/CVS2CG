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
    options=util.defaults(options,{output:[],beautify:1,normalize:false});
    var ast=UglifyJS.parse(source+'',{toplevel:false}),output=options.output;
    walkAst(ast, function (node) {
        if(isContextDefFunc(node)){
            if(!isNaN(options.normalize))
                node=normalizeParam(node,+options.normalize);
            output.push(rewrite2oc(node,options));
            return 1;
        }
    });
    return output.join('\n');
}
function normalizeParam(defNode,normalize){
   var nodesToRewrite=[],temp,max=-Infinity,ratio,methodName;
    defNode.body.forEach(function(ast){
       walkAst(ast, function (subNode) {
           if(subNode instanceof AST_Call && (methodName=getCallMethodName(subNode))&& (temp=converter.shouldNormalizeNodes(methodName,subNode.args))){
               nodesToRewrite.push.apply(nodesToRewrite,temp.nodes);
               if(!isNaN(temp.max)&& temp.max>max)
                   max=temp.max;
               return 1;
           }
       });
    });
    if(max==-Infinity) return defNode;
    ratio=normalize/max;
    return transformAst(defNode,function(subNode){
        if((nodesToRewrite.indexOf(subNode)>-1)){
            if(subNode instanceof AST_Constant)
                subNode.value*=ratio;
            else //TODO:if param is not a constant return itself
                return  subNode;
        }
    })
}
function rewrite2oc(ast,options){
    var funcName=ast.name.name||'ctx_call_'+base54(funcCounter++),body=[],bodyStr,args,argsType=[],argsTypeMap={};
    walkAst(ast, function (node) {
        var funcName,contextName,nodeExp,res;
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
            if(res=converter.rewriteContextCall(funcName,contextName,args.map(mapArgValue)))
                res instanceof Array? body.push.apply(body,res):body.push(res);
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
        else if(arg instanceof AST_UnaryPrefix && arg.expression instanceof AST_Constant && arg.operator ==='-'){
            return - arg.expression.value
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
function getCallMethodName(node){
    if(node instanceof AST_Call){
        var  exp=node.expression;
        if(exp instanceof AST_Dot) return exp.property;
        else if(exp.property instanceof AST_Constant)return exp.property.value;
    }
}
function walkAst(ast,func){
    var walker=new UglifyJS.TreeWalker(func);
    ast.walk(walker);
    return walker
}
function transformAst(ast,preFunc,postFunc){
    var trans=new UglifyJS.TreeTransformer(preFunc,postFunc);
    return ast.transform(trans);
}
