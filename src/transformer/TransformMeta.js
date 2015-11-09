"use strict";
var {arrAdd,arrRemove}=require('../util');
module.exports=TransformMeta;
function TransformMeta(options){
    if(!(this instanceof TransformMeta))return new TransformMeta(options);
    this.transformedNodes=[];
    this.pluginNodes=[];
    this._tempVars=[];
    this._usedVars=[];
    this.functions={};
}
TransformMeta.prototype={
    useTempVariable(nameBase='_$',scope=null){
        var name=this.getTempVariable(nameBase,scope);
        arrAdd(this._usedVars,name);
        return name;
    },
    getTempVariable(nameBase='_$',scope=null){
        var varName,varNames=this._tempVars,i=0,usedVars=this._usedVars;
        scope=scope||this._currentScope;
        if(varNames.some(name=>scope['find_variable'](varName=name))){
          return arrRemove(varNames,varName);
        }
        do{
            varName=nameBase+i++;
        }
        while(scope['find_variable'](varName)||usedVars.indexOf(varName)>-1);
        return varName;
    },
    defineMatrix(matrix){
        this._currentMatrix=matrix;
        this._currentMatrixName='';
    },
    useMatrix(){
        return this._currentMatrixName=this.getTempVariable('_matrix');
    },
    reuseTempVariables(){
        var tempVars=this._tempVars;
        this._usedVars.forEach(name=>arrAdd(tempVars,name));
        this._usedVars=[];
    },
    set currentScope(ast){
        this._currentScope=ast;
    },
    get currentScope(){
        return this._currentScope;
    }
};
function crateName(nameBase,i){
    return nameBase+i
}