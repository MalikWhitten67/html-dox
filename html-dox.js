let templates = []
let importsTag = document.querySelector('imports')
importsTag.style.display = 'none'
// remove whitespace
let imports = importsTag.innerHTML.replace(/\s/g, '')
// split by comma
imports = imports.split(',')
// remove empty strings
imports = imports.filter(Boolean)

if (document.querySelector('script') && !document.querySelector('script').getAttribute('src').includes('html-dox.js')) {
    throw new Error('html-dox.js must be the last script tag in the body')
} else if (document.querySelector('style')) {
    throw new Error('Style tags are not supported in dox!')
} else if (document.querySelector('link')) {
    throw new Error('Link tags are not supported in dox!')
}
let types = []
// constraint types - for type checking

let contraintTypes = {
    'dox:string': String,
    'dox:number': Number,
    'dox:boolean': Boolean,
    'dox:array': Array,
    'dox:object': Object,
    'dox:undefined': undefined,
    'dox:null': null,
    'dox:function': Function,
    'dox:regexp': RegExp,
    'dox:date': Date,
}
// import checking // import file if type is valid
imports.map((item) => {

    if (!item.endsWith('.html') && !item.endsWith('.css') && !item.endsWith('.js')) {
        throw new Error('Unsupported imported file type!')
    }
    if (item.endsWith('.html')) {
        fetch(item)
            .then((response) => {
                return response.text();
            })
            .then((data) => {

                importsTag.innerHTML = templates;
                parser(data);
            });
    } else if (item.endsWith('.css')) {
        let link = document.createElement('link')
        link.setAttribute('rel', 'stylesheet')
        link.setAttribute('href', item)
        document.querySelector('head').appendChild(link)
    } else if (item.endsWith('.js')) {
        fetch(item)
            .then((response) => {
                return response.text();
            })
            .then((data) => {
                if (data.includes('document')) {
                    throw new Error('Imported js file cannot contain document use dox instead')
                }else if (data.includes('innerHTML') || data.includes('innerText') ) {
                    throw new Error('use dox:ineject() instead of innerHTML or innerText')
                }
                let script = document.createElement('script')
                script.innerHTML = data
                script.type = 'module'
                setTimeout(() => {
                    document.querySelector('body').appendChild(script)
                }, 100);
            })
    }
});



const parser = (data) => {
    let dom = new DOMParser();
    let html = dom.parseFromString(data, 'text/html');
    let body = document.querySelector('body');
    let bodyfunc = body.querySelectorAll('function');
    let functions = [];


    let states = [];


    let _export = html.querySelector('export') || null;
    let elements = [...html.querySelectorAll('*')].map((item) => item.tagName);

    elements = elements.filter((item, index) => elements.indexOf(item) === index);
    elements = elements.map((item) => item.toLowerCase());
    elements = elements.filter((item) => item !== 'html' && item !== 'body' && item !== 'head' && item !== 'meta' && item !== 'div' && item !== 'function' && item !== 'render' && item !== 'type' && item !== 'subtype' && item !== 'export');
    elements = elements.map((item) => 'html-dox$' + item);
    // remove dom elements
    let domelements = ['HTML', 'BODY', 'HEAD', 'META', 'FUNCTION', 'RENDER', 'TYPE', 'SUBTYPE', 'EXPORT']
    domelements.map((item) => {
        let index = elements.indexOf(item);
        if (index > -1) {
            elements.splice(index, 1);
        }
    })
    let modules = html.querySelectorAll('import')
    modules.forEach((item) => {
        let file = item.getAttribute('src')
        if (!file.endsWith('.html')) {
            throw new Error('Unsupported imported file type!')
        }
        fetch(file)
            .then((response) => {
                return response.text();
            }
            )
            .then((data) => {
                let importName = item.getAttribute('exports').split(',')
                let dom = new DOMParser();
                let dhtml = dom.parseFromString(data, 'text/html');
                let elements = [...dhtml.querySelectorAll('*')].map((item) => item.tagName);
                if( dhtml.querySelector('export')){
                    let exported = dhtml.querySelector('export').innerHTML.split(',') 
                    
                   exported.map((item) => {
                     
                      if(dhtml.querySelector(item)){
                         // remove whitespace on import
                        let el = item.replace(/\s/g, '')
                        importName.map((item) => {
                            if(item == el){
                                if(html.querySelector(el)){
                                    body.querySelector(el).innerHTML = dhtml.querySelector(el).innerHTML
                                }
                            }
                        })
                      }
                   } )
                }
            })
             
             
    })
    const dox = {
        
        querySelector: (element) => {
            let el = element
            let domlist = {}
            elements = elements.filter((item, index) => elements.indexOf(item) === index);


            elements = elements.map((item) => item.toLowerCase());
            elements = elements.map((item) => {
                let ele = item.replace('html-dox$', '')
                return ele
            })

            // ...

            elements.forEach((item) => {

                const element = document.querySelector(item);
                if (element && element.innerHTML.length > 0) {
                    item = 'html-dox$' + item;
                     [...element.children].map((item) => {
                         element.$children = [...element.children]
                         element.$children.map((item) => {
                            item.inject = (code) => {
                                dox.inject(code, item.tagName.toLowerCase());
                            } ,
                            item.querySelector = (element) => {
                                dox.querySelector(item.tagName.toLowerCase() + ' ' + element);
                            }
                            item.querySelectorAll = (element) => {
                                dox.querySelectorAll(item.tagName.toLowerCase() + ' ' + element);
                            }
                            item.$children = [...item.children]
                         })
                         
                     })
                   
                    domlist[item] = element;
                     
                 
                   
                }
            });

            // ...


            console.log(domlist)
            let supported_queries = ['html-dox$', 'dox$']

            let query = supported_queries.find((item) => el.includes(item));
            console.log(query, el)
            if (!query) {
                throw new Error('Unsupported query');
            }

            if (query == 'dox$') {
                el = el.replace('dox$', 'html-dox$');
            }
            if (!domlist[el]) {
                throw new Error(`Element "${el}" does not exist`);

            }
           


            return {
                dom: domlist[el],
                outerHTML: domlist[el].outerHTML,
                outerText: domlist[el].outerText,
                style: domlist[el].style,
                classList: domlist[el].classList,
                attributes: domlist[el].attributes,
                children: domlist[el].children,
                childNodes: domlist[el].childNodes,
                firstChild: domlist[el].firstChild,
                lastChild: domlist[el].lastChild,
                nextSibling: domlist[el].nextSibling,
                previousSibling: domlist[el].previousSibling,
                parentNode: domlist[el].parentNode,
                inject: (code) => {
                    el = el.replace('html-dox$', '')
                    dox.inject(code, el);
                },
                querySelector: (element) => {
                    el = el.replace('html-dox$', '')
                    dox.querySelector(el + ' ' + element);
                },
                onclick: (callback) => {

                    domlist[el].addEventListener('click', callback)
                },
                onhover: (callback) => {
                    domlist[el].addEventListener('mouseover', callback)
                },
                getChildren: () => {
                    return domlist[el].$children
                },


                setState: (name, value) => {
                    states.map((item) => {
                        if (item.name === name) {
                            item.value = value;
                        }
                    })
                },
                getState: (name) => {
                    states.map((item) => {
                        if (item.name === name) {
                            return item.value;
                        }
                    }
                    )
                },
            }


        },
        querySelectorAll: (element) => {
            let el = element
            let domlist = {}
            elements = elements.filter((item, index) => elements.indexOf(item) === index);

            elements = elements.map((item) => item.toLowerCase());
            elements.map((item) => {
                let ele = item.replace('html-dox$', '')
                domlist[item] = document.querySelector(ele);


            })
            let supported_queries = ['html-dox$', 'dox$']

            let query = supported_queries.find((item) => el.includes(item));
            if (!query) {
                throw new Error('Unsupported query');
            }

            if (query == 'dox$') {
                el = el.replace('dox$', 'html-dox$');
            }
            if (!domlist[el]) {
                throw new Error(`Element "${el}" does not exist`);

            }
            return {
                dom: domlist[el],
                outerHTML: domlist[el].outerHTML,
                outerText: domlist[el].outerText,
                style: domlist[el].style,
                classList: domlist[el].classList,
                attributes: domlist[el].attributes,
                children: domlist[el].children,
                childNodes: domlist[el].childNodes,
                firstChild: domlist[el].firstChild,
                lastChild: domlist[el].lastChild,
                nextSibling: domlist[el].nextSibling,
                previousSibling: domlist[el].previousSibling,
                parentNode: domlist[el].parentNode,
                inject: (code) => {
                    el = el.replace('html-dox$', '')
                    dox.inject(code, el);
                },
                querySelector: (element) => {
                    el = el.replace('html-dox$', '')
                    dox.querySelector(el + ' ' + element);
                },
                forEach: (callback) => {
                    domlist[el].forEach((item) => {
                        callback(item);
                    })
                },
                map: (callback) => {
                    domlist[el].map((item) => {
                        callback(item);
                    })
                },
                filter: (callback) => {
                    domlist[el].filter((item) => {
                        callback(item);
                    })
                },
                reduce: (callback) => {
                    domlist[el].reduce((item) => {
                        callback(item);
                    })
                },
                reduceRight: (callback) => {
                    domlist[el].reduceRight((item) => {
                        callback(item);
                    })
                },
                every: (callback) => {
                    domlist[el].every((item) => {
                        callback(item);
                    })
                },
                some: (callback) => {
                    domlist[el].some((item) => {
                        callback(item);
                    })
                },
                setState: (name, value) => {
                    states.map((item) => {
                        if (item.name === name) {
                            item.value = value;
                        }
                    })
                },
                onclick: (callback) => {
                    domlist[el].onclick = callback
                },
                getState: (name) => {
                    states.map((item) => {
                        if (item.name === name) {
                            return item.value;
                        }
                    }
                    )
                },
            }

        },
        inject: (code, element) => {
            // remove html-dox$ from element
            elements = elements.map((item) => 'html-dox$' + item);
            elements = element.replace('html-dox$', '')
            elements = elements.toLowerCase();
            // check if element exists in elements
            if (elements.includes(elements)) {
                document.querySelector(element).innerHTML = code;
            }
        },
        state: (name, value) => {
            states.push({
                name: name,
                value: value
            })
        },
        setState: (name, value) => {
            states.map((item) => {
                if (item.name === name) {
                    item.value = value;
                }
            })
        },
        getState: (name) => {
            states.map((item) => {
                if (item.name === name) {
                    return item.value;
                }
            })
        },


    }
    //  dox functions

    let _var = html.querySelectorAll('var');
    let bodyvar = body.querySelectorAll('var');

    _var.forEach((item) => {
        let name = item.getAttribute('name');
        let value = item.getAttribute('value');
        if (!name) {
            throw new Error('Variable name is required!');
        }
        if (!value) {
            throw new Error('Variable value is required!');
        }
        if (name && value) {
            window[name] = value;
        }
    })
    bodyvar.forEach((item) => {
        let name = item.getAttribute('name');
        let value = item.getAttribute('value');
        if (!name) {
            throw new Error('Variable name is required!');
        }
        if (!value) {
            throw new Error('Variable value is required!');
        }
        if (name && value) {
            window[name] = value;
        }
    })
    html.querySelectorAll('[usevar]').forEach((item) => {
        if (item.innerHTML.includes('{{')) {
            let value = item.innerHTML.split('{{')[1].split('}}')[0];

            item.innerHTML = window[value];
        }
    })


    window.dox = dox;
    function useState(initialValue) {
        let state = initialValue;
        return [
            state,
            (newState) => {
                state = newState;
                watchState(state);
            }
        ];
    }

    function watchState(state, callback) {
        return (newState) => {
            state = newState;
            callback(state);
        };
    }

    window.watchState = watchState;
    window.useState = useState;
    window.setState = dox.setState;

    let events = {
        click: (element, callback = () => { }) => {
            let domlist = {}
            elements.map((item) => {
                item = item.toLowerCase();
                domlist[item] = document.querySelector(item);
                // lowercase
            })


            if (!domlist[element]) {
                throw new Error(`Element "${element}" does not exist`);
            }

            console.log(domlist)


            callback();
        }
    }


    // type checking

    body.querySelectorAll('type').forEach((item) => {
        let subtypes = item.querySelectorAll('subtype');
        types.push({
            name: item.getAttribute('name'),
            constraint: item.getAttribute('constraint'),
            isStrict: item.getAttribute('isStrict')
        });

        item.querySelectorAll('subtype').forEach((subitem) => {
            if (!contraintTypes[subitem.getAttribute('constraint')]) {
                throw new Error('The constraint type does not exist');
                return;
            }
            types.push({
                name: subitem.getAttribute('name'),
                constraint: subitem.getAttribute('constraint')
            });
        });
        subtypes.forEach((subitem) => {
            if (!contraintTypes[subitem.getAttribute('constraint')]) {
                throw new Error('The constraint type does not exist');
                return;
            }
            types.push({
                name: subitem.getAttribute('name'),
                constraint: subitem.getAttribute('constraint')
            });
        });

        let subtypElements = html.querySelectorAll('[subtype]');
        subtypElements.forEach((thisitem) => {
            if (thisitem.innerHTML.includes('{{')) {
                let value = thisitem.innerHTML.split('{{')[1].split('}}')[0];
                body.querySelectorAll(`[${value}]`).forEach((item) => {
                    let attrValue = item.getAttribute(value);

                    let subtypeName = thisitem.getAttribute('subtype');
                    let subtype = types.find((type) => type.name === subtypeName);
                    let strict = subtype.isStrict;

                    if (subtype && strict) {
                        let constraintType = contraintTypes[subtype.constraint];
                        let convertedValue;

                        if (constraintType === Number) {
                            convertedValue = Number(attrValue);
                            convertedValue = isNaN(convertedValue) ? 0 : convertedValue;
                            if (convertedValue === 0) {
                                throw new Error(`Invalid  value for subtype "${subtypeName}": ${attrValue} (expected number)`);
                            }


                        } else if (constraintType === Boolean) {
                            if (attrValue.toLowerCase() === 'true') {
                                convertedValue = true;
                            } else if (attrValue.toLowerCase() === 'false') {
                                convertedValue = false;
                            } else {
                                throw new Error(`Invalid attribute value for subtype "${subtypeName}": ${attrValue} (expected boolean)`);
                            }
                        } else if (constraintType === String) {
                            convertedValue = attrValue;
                        }
                        else {
                            throw new Error(`Invalid constraint type for subtype "${subtypeName}": ${subtype.constraint}`);
                        }
                    }

                });
            }
        });
    });
    html.querySelectorAll('type').forEach((item) => {
        console.log(item)
        // Check if 2 subtypes have the same name
        let subtypes = item.querySelectorAll('subtype');
        let names = [];
        subtypes.forEach((subitem) => {
            names.push(subitem.getAttribute('name'));
            if (names.filter((name, index) => names.indexOf(name) !== index).length > 0) {
                throw new Error('Two subtypes cannot have the same name');
                return;
            } else if (subitem.getAttribute('name') === item.getAttribute('name')) {
                throw new Error('Types and subtypes cannot have the same name');
                return;
            }
        });

        types.push({
            name: item.getAttribute('name'),
            constraint: item.getAttribute('constraint'),
            isStrict: item.getAttribute('isStrict')
        });

        item.querySelectorAll('subtype').forEach((subitem) => {
            if (!contraintTypes[subitem.getAttribute('constraint')]) {
                throw new Error('The constraint type does not exist');
                return;
            }
            types.push({
                name: subitem.getAttribute('name'),
                constraint: subitem.getAttribute('constraint'),
                isStrict: subitem.getAttribute('isStrict')

            });
        });

        let subtypElements = html.querySelectorAll('[subtype]');
        subtypElements.forEach((thisitem) => {
            // Check if template value {{}}
            if (thisitem.innerHTML.includes('{{')) {
                let value = thisitem.innerHTML.split('{{')[1].split('}}')[0];
                body.querySelectorAll(`[${value}]`).forEach((item) => {
                    let attrValue = item.getAttribute(value);

                    let subtypeName = thisitem.getAttribute('subtype');
                    let subtype = types.find((type) => type.name === subtypeName);
                    let strict = subtype.isStrict;

                    if (subtype && strict) {
                        let constraintType = contraintTypes[subtype.constraint];
                        console.log(constraintType)
                        let convertedValue;

                        if (constraintType === Number) {
                            convertedValue = Number(attrValue);
                            convertedValue = isNaN(convertedValue) ? 0 : convertedValue;
                            if (convertedValue === 0) {
                                throw new Error(`Invalid  value for subtype "${subtypeName}": ${attrValue} (expected number)`);
                            }

                        } else if (constraintType === Boolean) {
                            if (attrValue.toLowerCase() === 'true') {
                                convertedValue = true;
                            } else if (attrValue.toLowerCase() === 'false') {
                                convertedValue = false;
                            } else {
                                throw new Error(`Invalid attribute value for subtype "${subtypeName}": ${attrValue} (expected boolean)`);
                            }
                        } else if (constraintType === String) {
                            convertedValue = attrValue;
                        }
                        else {
                            throw new Error(`Invalid constraint type for subtype "${subtypeName}": ${subtype.constraint}`);
                        }
                    }

                });
            }
        });

    });


    // exported code splitting

    _export = _export.innerHTML.replace(/\s/g, '');
    _export = _export.split(',');
    _export = _export.filter(Boolean);
    _export.map((item) => {
        console.log(item)
        let template = html.querySelector(item);
        let attributes = template.attributes;
        attributes = Array.from(attributes);
        attributes.forEach((attribute) => {

            if (template.hasAttribute(attribute)) {

                if (attribute === 'typeof') {
                    console.log('typeof')
                    if (types.find((type) => type.name === template.getAttribute(attribute))) {
                        let type = types.find((type) => type.name === template.getAttribute(attribute));
                        let constraintType = contraintTypes[type.constraint];
                        let value = body.querySelector(item).innerHTML;
                        let convertedValue;

                        if (type.isStrict === 'false') {
                            return;
                        }
                        if (constraintType === Number) {
                            convertedValue = Number(value);
                            convertedValue = isNaN(convertedValue) ? 0 : convertedValue;
                            if (convertedValue === 0) {
                                throw new Error(`Invalid  value for type "${type.name}": ${value} (expected number)`);
                            }
                        } else if (constraintType === Boolean) {
                            if (value.toLowerCase() === 'true') {
                                convertedValue = true;
                            } else if (value.toLowerCase() === 'false') {
                                convertedValue = false;
                            } else {
                                throw new Error(`Invalid value for type "${type.name}": ${value} (expected boolean)`);
                            }
                        } else if (constraintType === String) {
                            convertedValue = value;
                        } else {
                            throw new Error(`Invalid constraint type for type "${type.name}": ${type.constraint}`);
                        }
                    } else {
                        throw new Error(`Type "${template.getAttribute(attribute)}" does not exist`);

                    }
                }
            }

        })
        if (template.getAttribute('props')) {
            let props = template.getAttribute('props').split(':')
            props.map((prop) => {
                let derivatives = template.querySelectorAll('[derive]')
                derivatives.forEach((subitem) => {
                    let attr = subitem.getAttribute('derive');
                    let derivedvalue = body.querySelector(item).getAttribute(attr);
                    console.log(derivedvalue)
                    if (subitem.innerHTML.includes(`{{${attr}}}`)) {
                        subitem.innerHTML = subitem.innerHTML.replace(`{{${attr}}}`, derivedvalue);
                    }





                })
                if (template.innerHTML.includes(`{{${prop}}}`)) {
                    // replace {{prop}} with the value of the prop
                    template.innerHTML = template.innerHTML.replace(`{{${prop}}}`, body.querySelector(item).getAttribute(prop));

                }
            })
        }
        templates.push({
            name: template.tagName,
            template: template.innerHTML,
        });

        let positions = []
        function renderElement(target, template, position) {
            if (position === 'first') {
                target.innerHTML = template.innerHTML + target.innerHTML;
            } else if (position === 'last') {
                target.innerHTML = target.innerHTML + template.innerHTML;
            }
        }

        let element = body.querySelector(item);
        if (element) {
            let parent = element.parentNode;
            if (parent.tagName === 'RENDER') {
                let positions = new Set();
                positions.add(parent);

                positions = Array.from(positions);
                positions = positions.map((item) => item.getAttribute('position').toLowerCase());
                positions = positions.filter((item) => item !== 'first' && item !== 'last');

                let execTime = parent.getAttribute('execTime');
                if (execTime === 'before') {
                    renderElement(element, template, 'first');
                    positions.forEach((position) => {
                        let siblingElement = body.querySelector(`[position="${position}"]`);
                        if (siblingElement !== null && siblingElement !== element) {
                            siblingElement.style.display = 'none';
                        }
                    });
                } else if (execTime === 'after') {
                    renderElement(element, template, 'last');
                    positions.forEach((position) => {
                        let siblingElement = body.querySelector(`[position="${position}"]`);
                        if (siblingElement !== null && siblingElement !== element) {
                            siblingElement.style.display = 'none';
                        }
                    });
                }

                let attributePos = parent.hasAttribute('position');
                let position = parent.getAttribute('position');
                if (attributePos && position === 'first') {
                    renderElement(element, template, 'first');
                } else if (attributePos && position === 'last') {
                    renderElement(element, template, 'last');
                }
            } else {
                throw new Error('The element must be inside a render tag');
            }
        }


    });
};

