import transformer from './transformer';
export default function (sourceCode, options = { type: 'page' }) {
    const distCode = transformer(sourceCode, options);
    return distCode;
}
//# sourceMappingURL=index.js.map