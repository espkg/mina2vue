var emptyTags = {
    area: 1,
    base: 1,
    basefont: 1,
    br: 1,
    col: 1,
    frame: 1,
    hr: 1,
    img: 1,
    input: 1,
    isindex: 1,
    link: 1,
    meta: 1,
    param: 1,
    embed: 1,
    '?xml': 1
};
var ampRe = /&/g;
var ltRe = /</g;
var gtRe = />/g;
var quotRe = /"/g;
var eqRe = /=/g;
var config = {
    disableAttribEscape: false
};
function escapeAttrib(s) {
    if (config.disableAttribEscape === true) {
        return s.toString();
    }
    if (s == null) {
        return '';
    }
    if (s.toString && typeof s.toString === 'function') {
        return s.toString().replace(ampRe, '&amp;').replace(ltRe, '&lt;').replace(gtRe, '&gt;')
            .replace(quotRe, '&#34;').replace(eqRe, '&#61;');
    }
    else {
        return '';
    }
}
export default function HTMLGenerator(item, parent, eachFn) {
    if (Array.isArray(item)) {
        return item.map(function (subitem) {
            return HTMLGenerator(subitem, parent, eachFn);
        }).join('');
    }
    var orig = item;
    if (eachFn) {
        item = eachFn(item, parent);
    }
    if (typeof item !== 'undefined' && typeof item.type !== 'undefined') {
        switch (item.type) {
            case 'text':
                return item.data;
            case 'directive':
                return '<' + item.data + '>';
            case 'comment':
                return '<!--' + item.data + '-->';
            case 'style':
            case 'script':
            case 'tag':
                var result = '<' + item.name;
                if (item.attribs && Object.keys(item.attribs).length > 0) {
                    result += ' ' + Object.keys(item.attribs).map(function (key) {
                        return key + '="' + escapeAttrib(item.attribs[key]) + '"';
                    }).join(' ');
                }
                if (item.children) {
                    if (!orig.render) {
                        orig = parent;
                    }
                    result += '>' + HTMLGenerator(item.children, orig, eachFn) + (emptyTags[item.name] ? '' : '</' + item.name + '>');
                }
                else {
                    if (emptyTags[item.name]) {
                        result += '>';
                    }
                    else {
                        result += '></' + item.name + '>';
                    }
                }
                return result;
            case 'cdata':
                return '<!CDATA[' + item.data + ']]>';
        }
    }
    return item;
}
HTMLGenerator.configure = function (userConfig) {
    if (userConfig !== undefined) {
        for (const k in config) {
            if (userConfig[k] !== undefined) {
                config[k] = userConfig[k];
            }
        }
    }
};
//# sourceMappingURL=generator.js.map