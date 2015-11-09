export function isPropertySet(node){
    return node instanceof AST_Binary && node.operator=='=' && node.left instanceof AST_PropAccess
}
export function isCallContext(node,nodeExp){
    nodeExp=nodeExp||node.expression;
    return node instanceof  AST_Call && nodeExp instanceof AST_PropAccess && nodeExp.expression instanceof AST_SymbolRef
}
export function isContextDefFunc(node){
    return node instanceof AST_Defun
}
export function getCallMethodName(node){
    if(node instanceof AST_Call){
        var  exp=node.expression;
        if(exp instanceof AST_Dot) return exp.property;
        else if(exp.property instanceof AST_Constant)return exp.property.value;
    }
}
export function walkAst(ast,func){
    var walker=new UglifyJS.TreeWalker(func);
    ast.walk(walker);
    return walker
}
export function transformAst(ast,preFunc,postFunc){
    var trans=new UglifyJS.TreeTransformer(preFunc,postFunc);
    return ast.transform(trans);
}
