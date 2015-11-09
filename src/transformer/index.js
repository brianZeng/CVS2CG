/**
 * Created by brian on 11/6/15.
 */
"use strict";
var {isObj,isFunc,defaults}=require('./../util.js');
var {Mat3}=require('./../matrix.js');
var {transformMethod}=require('./transformer.js');
var TransformMeta=require('./TransformMeta');
var {isContextDefFunc,walkAst,transformAst}=require('./../astUtil');
var {AST_TopLevel,parse,AST_SimpleStatement,AST_VarDef,AST_SymbolVar,AST_Array,AST_Number}=require('uglify-js');
module.exports={
    transform(ast,options,meta){
        var {transform,shouldTransform}=defaults(options,{transform:false,output:[]});
        if(!isFunc(options.shouldTransform))
            shouldTransform=()=>1;
        var transformedAst=ensureTopLevel(ast);
        meta=meta||TransformMeta();
        meta.functions.useMatrix={name:meta.getTempVariable('useMatrix',ast)};
        walkAst(transformedAst,function (node) {
            if(isContextDefFunc(node) && shouldTransform(deFunNodeInfo(node))){
                node=transformPaintDefun(node,transform,meta);
                meta.transformedNodes.push(node);
            }
        });
        postTransform(transformedAst,options,meta);
        return {ast,meta,transformedAst}
    }
};
function postTransform(ast,options,meta){
    var {useMatrix}=meta.functions;
    if(useMatrix.used){
       meta.pluginNodes.push(parse(`function ${useMatrix.name}(x,y,m){return [x*m[0]+y*m[1]+m[2],x*m[3]+y*m[4]+m[5]]}`))
    }
}
function ensureTopLevel(ast){
    if(ast.TYPE!=='TopLevel')
      ast=new AST_Toplevel({body:[ast]});
    ast.figure_out_scope({screw_ie8:true});
    return ast;
}
function transformPaintDefun(node,toTransform,meta){
    var matrix;
    if(isObj(toTransform)){
        if(toTransform.length==9) matrix=Mat3(toTransform);
        else throw Error('not support');
    }
    else if(isFunc(toTransform)){
        matrix=toTransform(deFunNodeInfo(node),Mat3)
    }
    node.init_scope_vars();
    meta.currentScope=node;
    meta.defineMatrix(matrix);
    node=transformAst(node,()=>void 0,function(node){
        if(node.TYPE=='Call')
        {
            node.args=transformMethod(getCallMethodName(node),node.args,{matrix,meta});
            meta.reuseTempVariables();
        }
    });
    var tempVars=meta._tempVars.slice(),matName=meta._currentMatrixName;
    if(matName)
        tempVars.push({name:matName,value:matrixAst(matrix)});
    if(tempVars.length){
        node.body.unshift(getVarAst(tempVars));
    }
    meta.reuseTempVariables();
    meta.scope=null;
    return node;
}
function parseStatement(source){
    return new AST_SimpleStatement({body:parse(source,{expression:1})})
}
function getVarAst(definitions){
    return new AST_Var({definitions:definitions.map(def=>{
        var name=isObj(def)? def.name:def;
        return new AST_VarDef({name:new AST_SymbolVar({name}),value:def.value})
    })})
}
function matrixAst(matrix){
    return new AST_Array({elements:matrix.print_to_array().map(value=>new AST_Number({value}))})
}
function deFunNodeInfo(node){
    return {
        name:node.name? node.name.name:void 0,
        argsnames:node.argnames.map(arg=>arg.name)
    }
}
function getCallMethodName(node){
    if(node instanceof AST_Call){
        var  exp=node.expression;
        if(exp instanceof AST_Dot)
            return exp.property;
        else if(exp.property instanceof AST_Constant)
            return exp.property.value;
    }
}


