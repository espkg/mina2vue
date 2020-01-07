import * as t from '@babel/types';
function handleProperty(path, rootPath) {
    const { node } = path;
    if (t.isObjectExpression(node.value)) {
        const propsPath = path.get('value.properties');
        const propTypePath = propsPath.filter((propPath) => t.isNodesEquivalent(propPath.node.key, t.identifier('type')))[0];
        const typeNode = propTypePath.node.value;
        let watchPropNode = t.objectProperty(node.key, t.nullLiteral());
        propsPath.forEach((propPath) => {
            const propNode = propPath.node;
            const keyName = propNode.key.name;
            const watchPropIndex = rootPath.findIndex((propPath) => t.isNodesEquivalent(propPath.node.key, t.identifier('watch')));
            switch (keyName) {
                case 'value':
                    if (t.isNodesEquivalent(typeNode, t.identifier('Object'))) {
                        propPath.replaceWith(t.objectProperty(t.identifier('default'), t.arrowFunctionExpression([], propNode.value)));
                    }
                    else if (t.isNodesEquivalent(typeNode, t.identifier('Array'))) {
                        propPath.replaceWith(t.objectProperty(t.identifier('default'), t.arrowFunctionExpression([], propNode.value)));
                    }
                    else {
                        propPath.replaceWith(t.objectProperty(t.identifier('default'), propNode.value));
                    }
                    break;
                case 'observer':
                    if (t.isNodesEquivalent(typeNode, t.identifier('Object')) || t.isNodesEquivalent(typeNode, t.identifier('Array'))) {
                        watchPropNode = t.objectProperty(node.key, t.objectExpression([
                            t.objectMethod('method', t.identifier('handler'), propNode.value.params, propNode.value.body),
                            t.objectProperty(t.identifier('deep'), t.booleanLiteral(true))
                        ]));
                    }
                    else {
                        watchPropNode = t.objectProperty(node.key, t.arrowFunctionExpression(propNode.value.params, propNode.value.body));
                    }
                    if (watchPropIndex === -1) {
                        rootPath[rootPath.length - 1].insertAfter(t.objectProperty(t.identifier('watch'), t.objectExpression([watchPropNode])));
                    }
                    else {
                        const propsPath = rootPath[watchPropIndex].get('value.properties');
                        if (propsPath.length) {
                            propsPath[propsPath.length - 1].insertAfter(watchPropNode);
                        }
                        else {
                            rootPath[watchPropIndex].replaceWith(t.objectProperty(t.identifier('watch'), t.objectExpression([watchPropNode])));
                        }
                    }
                    propPath.remove();
                    break;
            }
        });
    }
}
function handleProperties(path, rootPath) {
    const { node } = path;
    const propsPath = path.get('value.properties');
    propsPath.forEach((propPath) => {
        handleProperty(propPath, rootPath);
    });
    path.replaceWith(t.objectProperty(t.identifier('props'), node.value));
}
function handleData(path) {
    const { node } = path;
    path.replaceWith(t.objectProperty(t.identifier('data'), t.arrowFunctionExpression([], node.value)));
}
function handleLifeCycles(path) {
    const { node } = path;
    const keyName = node.key.name;
    const keyNameMap = {
        ready: 'mounted',
        attached: 'beforeMount',
        detached: 'destroyed',
        behaviors: 'mixins',
        onLoad: 'created',
        onReady: 'mounted',
        onUnload: 'destroyed'
    };
    if (t.isObjectMethod(node)) {
        path.replaceWith(t.objectMethod('method', t.identifier(keyNameMap[keyName]), node.params, node.body));
    }
    else if (t.isObjectProperty(node)) {
        const { value } = node;
        if (t.isFunctionExpression(value) || t.isArrowFunctionExpression(value)) {
            path.replaceWith(t.objectMethod('method', t.identifier(keyNameMap[keyName]), value.params, value.body));
        }
        else {
            path.replaceWith(t.objectProperty(t.identifier(keyNameMap[keyName]), value));
        }
    }
}
function handleOtherProperties(path, rootPath) {
    const { node } = path;
    const rootPropsPath = rootPath.get('arguments.0.properties');
    const methodsPropIndex = rootPropsPath.findIndex((propPath) => propPath.node && t.isNodesEquivalent(propPath.node.key, t.identifier('methods')));
    if (t.isObjectMethod(node) || (t.isArrowFunctionExpression(node.value) || t.isFunctionExpression(node.value))) {
        if (methodsPropIndex === -1) {
            rootPropsPath[rootPropsPath.length - 1].insertAfter(t.objectProperty(t.identifier('methods'), t.objectExpression([node])));
        }
        else {
            const propsPath = rootPropsPath[methodsPropIndex].get('value.properties');
            if (propsPath.length) {
                propsPath[propsPath.length - 1].insertAfter(node);
            }
            else {
                rootPropsPath[methodsPropIndex].replaceWith(t.objectProperty(t.identifier('methods'), t.objectExpression([node])));
            }
        }
        path.remove();
    }
}
export default (api, options = {}) => {
    return {
        visitor: {
            CallExpression(path) {
                const { node } = path;
                const { callee } = node;
                const rootName = options.rootName || (options.type === 'page' ? 'Page' : 'Component');
                if (options.type === 'page') {
                    if (callee.name === rootName) {
                        const pageArgNode = node.arguments[0];
                        const propsPath = path.get('arguments.0.properties');
                        propsPath.forEach((propPath) => {
                            const { name } = propPath.node.key;
                            switch (name) {
                                case 'data':
                                    handleData(propPath);
                                    break;
                                case 'onLoad':
                                case 'onReady':
                                case 'onUnload':
                                    handleLifeCycles(propPath);
                                    break;
                                default:
                                    handleOtherProperties(propPath, path);
                            }
                        });
                        path.parentPath.replaceWith(t.exportDefaultDeclaration(pageArgNode));
                    }
                }
                else if (options.type === 'component') {
                    if (callee.name === rootName) {
                        const componentArgNode = node.arguments[0];
                        const propsPath = path.get('arguments.0.properties');
                        propsPath.forEach((propPath) => {
                            const { name } = propPath.node.key;
                            switch (name) {
                                case 'properties':
                                    handleProperties(propPath, propsPath);
                                    break;
                                case 'data':
                                    handleData(propPath);
                                    break;
                                case 'attached':
                                case 'detached':
                                case 'behaviors':
                                case 'ready':
                                    handleLifeCycles(propPath);
                                    break;
                                default:
                                    handleOtherProperties(propPath, path);
                            }
                        });
                        path.parentPath.replaceWith(t.exportDefaultDeclaration(componentArgNode));
                    }
                }
            }
        }
    };
};
//# sourceMappingURL=structure.js.map