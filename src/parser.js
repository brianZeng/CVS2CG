/**
 * Created by brian on 6/25/15.
 */
"use strict";
var UglifyJS=require('uglify-js');
var util=require('./util.js');
var converter=require('./map2oc.js');
var transformer=require('./transformer/index.js');
var pathConv=require('./path2oc.js');
var {print}=require('./printer');
var {transformAst,walkAst,getCallMethodName,isContextDefFunc,isCallContext,isPropertySet}=require('./astUtil.js');
var funcCounter=0;
const METHOD_TYPE={
    OC_STATIC:0,OC_INSTANCE:1,C_STYLE:2,JS_STYLE:3
};
const constNames={
    Math:{
        PI:'M_PI'
    }
};
util.objForEach(UglifyJS,function(val,key){
    if(key.indexOf('AST_')==0)
      global[key]=val
});
module.exports={
    parse,METHOD_TYPE
};
function parse(source,options){
    options=util.defaults(options,{
        output:[],
        transform:false,
        createPath:false,
        methodType:METHOD_TYPE.C_STYLE,
        printOptions:{
            beautify:true
        }
    });
    var ast=UglifyJS.parse(source+'',{toplevel:false}),
        output=options.output,result;
    var {transformedAst,meta}=transformer.transform(ast,options);
    var printNodes=[...meta.transformedNodes,...meta.pluginNodes].map(node=>print(node,options));

    /*walkAst(ast, function (node) {
        if(isContextDefFunc(node)){
            node=transformer.transform(node,options.transform);
            if(options.methodType==METHOD_TYPE.JS_STYLE){
                output.push(printer.print(node,options))
            }
            else{
                result=rewrite2oc(node,options);
                output.push(`${getFuncSignature(options,result.funcName,result.argTypes)}{${result.bodyStr}}`);
            }
           return 1;
        }
    });*/
    return printNodes.join('\n');
}
function rewrite2oc(ast,options){
    var funcName=ast.name.name||'ctx_call_'+base54(funcCounter++),bodyStatements=[],body,bodyStr,args,isRetPath=options.createPath,
      argTypes=[],argsTypeMap={},rewrite=isRetPath?pathConv.rewrite:converter.rewrite;
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
            !isRetPath&&(argsTypeMap[contextName]='CGContextRef');
            bodyStatements.push({contextName,args:args.map(mapArgValue),funcName});
        }
    });
    body=rewrite(bodyStatements);
    bodyStr=options.beautify? '\n\t'+body.join(';\n\t')+';'+'\n': body.join(';')+';';
    util.objForEach(argsTypeMap, function (type, name) {argTypes.push({type,name})});
    return {funcName,argTypes,bodyStr};
    function mapArgValue(arg,index){
        var expName,proName,ret;
        if(arg instanceof AST_Constant)
            return arg.value;
        else if(arg instanceof AST_SymbolRef){
            argsTypeMap[arg.name]=converter.argumentTypeInfo(funcName,index);
            return arg.name
        }
        else if(arg instanceof AST_Dot && arg.expression instanceof AST_SymbolRef){
            if(constNames[expName=arg.expression.name] && (ret=constNames[expName][proName=arg.property]) && ret!==undefined)
                return ret;
            throw Error(`not support: ${expName}.${proName}`)
        }
        else if(arg instanceof AST_Binary){
            return tryEval(mapArgValue(arg.left,index),mapArgValue(arg.right),arg.operator)
        }
        else if(arg instanceof AST_UnaryPrefix && arg.expression instanceof AST_Constant && arg.operator ==='-'){
            return - arg.expression.value
        }
        else throw Error('not support');
    }
}
function getFuncSignature(options,funcName,args){
    var type=options.createPath? 'CGMutablePathRef':'void';
    switch (options.methodType){
        case METHOD_TYPE.C_STYLE: return cSign();
        case METHOD_TYPE.OC_INSTANCE:return ocSign('-('+type+')');
        case METHOD_TYPE.OC_STATIC:return ocSign('+('+type+')');
    }
    function cSign(){
        var argSign=args.map(function (arg) {
            return arg.type+' '+arg.name
        }).join(',');
        return `${type} ${funcName}(${argSign})`
    }
    function ocSign(type){
        if(args.length==0)return `${type} ${funcName}`;
        args[0].sigName=funcName;
        var argSign=args.map(function (arg) {
            return (arg.sigName||arg.name)+':('+arg.type+')'+arg.name
        }).join(' ');
        return type+' '+argSign
    }
}
function tryEval(left,right,operator){
    if(typeof left==="number" &&typeof  right==="number")
      switch (operator){
          case '+':return left+right;
          case '-':return left-right;
          case'*':return left*right;
          case"/":return left/right;
      }
    return left+operator+right;
}
