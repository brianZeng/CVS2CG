/**
 * Created by brian on 11/6/15.
 */
"use strict";
var {AST_Number,Compressor,AST_Call,AST_Dot,AST_Assign,AST_Sub}=require('uglify-js');
var {vec2}=require('gl-matrix');
var defaultCompressor=Compressor({evaluate:true});
module.exports={
    vecNodeUseMatrix
};
function vecNodeUseMatrix([xNode,yNode],{matrix,meta}){
    var vec=getNumberVec(xNode,yNode),out;
    if(vec){
        vec2.transformMat3(out=vec2.create(),vec,matrix);
        return [toNumberNode(out[0],xNode),toNumberNode(out[1],yNode)]
    }
    else
        return refNodeUseMatrix(xNode,yNode,meta)
}
function getNumberVec(xNode,yNode){
    try{
        var x=xNode._eval(defaultCompressor),y=yNode._eval(defaultCompressor);
        return isNaN(x)||isNaN(y)? void 0:vec2.fromValues(x,y);
    }
    catch (ex){
        return void 0;
    }
}
function refNodeUseMatrix(xNode,yNode,meta){
  // [(_temp=_useMatrix(xNode,yNode,matrix)).x,_temp.y]
    var tempName=meta.useTempVariable('_tempVec'),tempNode=new AST_SymbolRef({name:tempName}),useMatrix=meta.functions.useMatrix;
    useMatrix.used=true;
    return [new AST_Assign({
        left:tempNode,
        operator:'=',
        right:toCallNode(useMatrix.name,[xNode,yNode,meta.useMatrix()])
    }),
       tempNode.clone()].map((expression,i)=>new AST_Sub({expression,property:toNumberNode(i)}))
}

function toNumberNode(value,node){
    if(node) {
        node=new AST_Number(node);
        node.value=value;
    }
    return node||new AST_Number({value})
}
function toCallNode(expression,args){
    return new AST_Call({expression:nodeOrSymbolRef(expression),args:args.map(nodeOrSymbolRef)})
}
function nodeOrSymbolRef(nameOrNode){
    if(typeof nameOrNode=="string")return new AST_SymbolRef({name:nameOrNode});
    return nameOrNode;
}

