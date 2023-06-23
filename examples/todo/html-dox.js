let templates = [];
let importsTag = document.querySelector('imports')
importsTag.style.display = 'none'
let toplevelprops = []
// remove whitespace
let imports = importsTag.innerHTML.replace(/\s/g, '')
// split by comma
imports = imports.split(',')
// remove empty strings
imports = imports.filter(Boolean)

let cache = {}
if (document.querySelector('script') && !document.querySelector('script').getAttribute('src').includes('html-dox.js')) {
    throw new Error('html-dox.js must be the last script tag in the body')
} else if (document.querySelector('style')) {
    throw new Error('Style tags are not supported in dox!')
} else if (document.querySelector('link')) {
    throw new Error('Link tags are not supported in dox!')
}
document.body.style.display = 'none'
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
let variables = []
let props =    sessionStorage.getItem('$dox-props') ? JSON.parse(sessionStorage.getItem('$dox-props')) : {}
 

 function setData(data, html, body, item) {
    let importName = item.getAttribute('exports').split(',');
    let dom = new DOMParser();
    let dhtml = dom.parseFromString(data, 'text/html');

    dhtml.querySelectorAll('*').forEach((element) => {
        
         
      
        
        if (element.hasAttribute('style')) {
            let styles = element.getAttribute('style').split(';');
            styles.forEach((style, index) => {
                console.error(`Error in line ${index + 1} conflicting styles embedded in dox are not supported at:\n${element.innerHTML.split('<')[0]}`);
            });
        }
    });

    dhtml.querySelectorAll('*').forEach((element) => {
        let attributes = Object.values(element.attributes);
         
         
        attributes.forEach((attr) => {
           
           let attrValue = attr.value;
             
            if (attrValue.includes('{{')) {
                let matches = attrValue.match(/{{(.*?)}}/g);
                
                if (matches) {
                    matches.forEach((match) => {
                        let value = match.replace('{{', '').replace('}}', '');
                        let prop = element.parentNode.getAttribute(value);
                        let parent = document.querySelector(element.parentNode.tagName);
                        if (parent && parent.getAttribute(value)) {
                            prop = parent.getAttribute(value);
                        }
                        attrValue = attrValue.replace(new RegExp(`{{${value}}}`, 'g'), prop);
                    });
                    element.setAttribute(attr.name, attrValue);
                }
            }
        });
    });
    

    dhtml.querySelectorAll('*').forEach((element) => {
      
        let matches = element.innerHTML.match(/{{(.*?)}}/g);
       
        if (matches) {
            matches.forEach((match) => {
                
                let value =  match.split('{{')[1].split('}}')[0];
                let el = dhtml.querySelector(element.tagName);
                let parent = el.parentNode.tagName;
                html.querySelectorAll('*').forEach((item) => {
                    if (item.tagName == parent) {
                        let prop = item.getAttribute(value);
                        if (prop) {
                            if (prop.toString().toLowerCase() == 'true') {
                                prop = prop.toString().toLowerCase();
                            }
                            let attrValue = element.innerHTML.replace(new RegExp(`{{${value}}}`, 'g'), prop);
                            element.innerHTML = attrValue;
                        }
                    }
                });
            });
        }
    });
    

    let props = {};

    dhtml.querySelectorAll('[props]').forEach((item) => {
        let name = item.tagName;
        if (html.querySelector(name)) {
            let $props = item.getAttribute('props').split(':');
            $props.forEach((prop) => {
                props[name] = $props;
                sessionStorage.setItem('$dox-props', JSON.stringify(props));
                if (prop == 'children') {
                    if (html.querySelector(name).querySelector('slot')) {
                        if (dhtml.querySelector(name).innerHTML.includes('{{children}}')) {
                            dhtml.querySelector(name).innerHTML = dhtml.querySelector(name).innerHTML.replace('{{children}}', html.querySelector(name).querySelector('slot').innerHTML);
                        }
                    }
                }
            });
        }
    });

    document.querySelectorAll('img, svg').forEach((item) => {
        let src = item.getAttribute('src') || item.getAttribute('data-src');
        let preload = document.createElement('link');
        preload.setAttribute('rel', 'preload');
        preload.setAttribute('href', src);
        preload.type = 'image/*';
        preload.setAttribute('as', 'image');
        document.querySelector('head').appendChild(preload);
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    item.setAttribute('src', src);
                    observer.unobserve(item);
                }
            });
        });
        observer.observe(item);
    });

    dhtml.querySelectorAll('var').forEach((item) => {
        item.style.display = 'none';
        let varName = item.getAttribute('name');
        let varValue = item.innerHTML;
        dhtml.querySelectorAll('*').forEach((element) => {
            if (element.innerHTML.includes(`{{${varName}}}`)) {
                element.innerHTML = element.innerHTML.replace(`{{${varName}}}`, varValue);
            }
            toplevelprops.forEach((item) => {
                if (element.innerHTML.includes(`{{${item.name}}}`)) {
                    element.innerHTML = element.innerHTML.replace(`{{${item.name}}}`, item.value);
                }
            });
        });
        item.remove();
        return;
    });

    dhtml.querySelectorAll('*').forEach((element) => {
        let exported = item.getAttribute('exports').split(',');
        exported.forEach((exportItem) => {
            let el = exportItem.replace(/\s/g, '');
            importName.forEach((importItem) => {
                if (importItem == el) {
                    if (html.querySelector(el)) {
                        html.querySelector(el).innerHTML = dhtml.querySelector(el).innerHTML;
                        if (body.querySelector(el) && dhtml.querySelector(el)) {
                            body.querySelector(el).innerHTML = dhtml.querySelector(el).innerHTML;
                        }
                    }
                }
            });
        });
    });
}


imports.map((item) => {
    if (!item.endsWith('.html') && !item.endsWith('.css') && !item.endsWith('.js')) {
        throw new Error('Unsupported imported file type!');
    }

    if (item.endsWith('.html')) {
        let preload = document.createElement('link');
        preload.setAttribute('rel', 'preload');
        preload.setAttribute('href', item);
        preload.type = 'text/html';
        preload.setAttribute('as', 'document');
        document.querySelector('head').appendChild(preload);

        if (cache[item]) {
            parser(cache[item]);
        } else {
            fetch(item)
                .then((response) => {
                    return response.text();
                })
                .then((data) => {
                    cache[item] = data;
                    parser(data);
                });
        }
    } else if (item.endsWith('.css')) {
        let preload = document.createElement('link');
        preload.setAttribute('rel', 'preload');
        preload.setAttribute('href', item);
        preload.type = 'text/css';
        preload.setAttribute('as', 'style');
        document.querySelector('head').appendChild(preload);

        let style = document.createElement('style');
        if (!cache[item]) {
            fetch(item)
                .then((response) => {
                    return response.text();
                })
                .then((data) => {
                    cache[item] = data;
                    style.innerHTML = data;
                    document.querySelector('head').appendChild(style);
                });
        } else {
            let style = document.createElement('style');
            style.innerHTML = cache[item];
            document.querySelector('head').appendChild(style);
        }
    } else if (item.endsWith('.js')) {
        let preload = document.createElement('link');
        preload.setAttribute('rel', 'preload');
        preload.setAttribute('href', item);
        preload.type = 'text/javascript';
        preload.setAttribute('as', 'script');
        document.querySelector('head').appendChild(preload);

        if (!cache[item]) {
            fetch(item)
                .then((response) => {
                    return response.text();
                })
                .then((data) => {
                    if (data.includes('import ')) {
                        throw new Error('Import statements with the "from" keyword are not allowed. Use $import instead.');
                    } else if (data.includes('export ')) {
                        throw new Error('Export statements are not allowed. Use $export instead.');
                    } else if (data.includes('document') && !item.includes('tailwind.js')) {
                        throw new Error('Imported JS file cannot contain document. Use dox instead.');
                    } else if ((data.includes('innerHTML') || data.includes('innerText')) && !item.endsWith('tailwind.js')) {
                        throw new Error('Use dox:text to return text and dox:$ to return HTML.');
                    }

                    let func = new Function(data);
                    func();
                });
        } else {
            let func = new Function(cache[item]);
            func();
        }
    }
});

function reloadjsdox() {
    imports.map((item) => {
        if (!item.endsWith('.js')) return;
        if (!cache[item]) {
            fetch(item)
                .then((response) => {
                    return response.text();
                })
                .then((data) => {
                    if (data.includes('import ')) {
                        throw new Error('Import statements with the "from" keyword are not allowed. Use $import instead.');
                    } else if (data.includes('export ')) {
                        throw new Error('Export statements are not allowed. Use $export instead.');
                    } else if (data.includes('document') && !item.includes('tailwind.js')) {
                        throw new Error('Imported JS file cannot contain document. Use dox instead.');
                    } else if ((data.includes('innerHTML') || data.includes('innerText')) && !item.endsWith('tailwind.js')) {
                        throw new Error('Use dox:text to return text and dox:$ to return HTML.');
                    }

                    let func = new Function(data);
                    func();
                });
        } else {
            let func = new Function(cache[item]);
            func();
        }
    })

}


const parser = (data) => {
    let dom = new DOMParser();
    let html = dom.parseFromString(data, 'text/html');
    html = html.querySelector('html');
    let body = document.querySelector('body');
    let states = [];
    let parsed = performance.now();
    let finished;

    let _export = html.querySelector('export');
    if (_export) {
        _export = _export.innerHTML.replace(/\s/g, '');
        _export = _export.split(',');
        _export = _export.filter(Boolean);

        let dox = {
            currentRoute: () => {
                return window.location.hash.split('#')[1];
            },
            rendered: (callback = () => { }) => {
                document.querySelectorAll('*').forEach((element) => {
                    
                  
        
                    if (element.parentNode.tagName == 'RENDER' && element.innerHTML.length > 0
                    ) {
                        
                        callback({
                            name: element.tagName,
                            props:    JSON.parse(sessionStorage.getItem('$dox-props'))[element.tagName],
                             
                            
                            html: element.innerHTML,
                            rendered: finished + 'ms'
        
                        })
        
                    }
                })
        
            },
            append: (target, code) => {
                let targetEl = document.querySelector(target);
                if (targetEl) {
                    targetEl.innerHTML += code;
                }
            },
            prepend: (target, code) => {
               
                let targetEl = document.querySelector(target);
                if (targetEl) {
                    targetEl.innerHTML = code + targetEl.innerHTML;
                }
            },
            after: (target, code) => {
                let targetEl = document.querySelector(target);
                if (targetEl) {
                    targetEl.insertAdjacentHTML('afterend', code);
                }
            },
            before: (target, code) => {
                let targetEl = document.querySelector(target);
                if (targetEl) {
                    targetEl.insertAdjacentHTML('beforebegin', code);
                }
            },
        
            querySelector: (selector) => {
                let el = document.querySelector(selector) || html.querySelector(selector);
         
                if (el) {
                    let methods = {
                        getDescendants: () => {
                            let descendants = [];
                            let traverse = (el) => {
        
                                let children = el.children;
                                for (let i = 0; i < children.length; i++) {
                                    descendants.push(children[i]);
                                    traverse(children[i]);
                                }
                            }
                            traverse(el);
        
                            return {
                                forEach: (callback) => {
                                    descendants.forEach((item) => {
                                        callback({
                                            id: item.id,
                                            class: item.className,
                                            text: item.innerText,
                                            setHtml: (value) => {
                                                item.innerHTML = value;
                                            },
                                            parent: item.parentNode,
                                            on: (event, callback) => {
                                                item.addEventListener(event, callback);
                                            },
                                            append: (value) => {
                                                item.innerHTML += value;
                                            },
                                            getItem: (name) => {
                                                return item.querySelector(`#${name}`);
                                            },
                                            getHtml: () => {
                                                return item.innerHTML;
                                            },
                                            getChildren: () => {
                                                let children = [];
                                                item.querySelectorAll('*').forEach((item) => {
                                                    if (item.parentNode === el) {
                                                        children.push(item);
                                                    }
                                                });
                                                return children;
                                            },
                                            getAncestors: () => {
                                                let ancestors = [];
                                                let parent = item.parentNode;
                                                while (parent) {
                                                    ancestors.push(parent);
                                                    parent = parent.parentNode;
                                                }
                                                return ancestors;
                                            },
                                            props: () => {
                                                return props[item.tagName] || [];
                                            },
                                            querySelector: (selector) => {
                                               return dox.querySelector(selector);
                                            },
                                            querySelectorAll: (selector) => {
                                                return dox.querySelectorAll(selector);
                                            },
                                            fadeIn: (time) => {
                                                item.style.opacity = 0;
                                                item.style.transition = `opacity ${time}s`;
                                                item.style.opacity = 1;
                                            },
                                            fadeOut: (time) => {
                                                item.style.opacity = 1;
                                                item.style.transition = `opacity ${time}s`;
                                                item.style.opacity = 0;
                                            },
        
                                            on: (event, callback) => {
                                                item.addEventListener(event, callback);
                                            },
                                            inject: (code) => {
                                                item.innerHTML = code;
        
                                            },
                                            state: (name) => {
                                                let state = states.find((state) => state.name === name);
                                                if (state) {
                                                    return state.value;
                                                } else {
                                                    throw new Error(`State "${name}" does not exist`);
                                                }
                                            },
                                            setState: (name, value) => {
                                                let state = states.find((state) => state.name === name);
                                                if (state) {
                                                    state.value = value;
                                                } else {
                                                    states.push({
                                                        name,
                                                        value
                                                    });
                                                }
                                            }
                                            ,
                                            watch: (name, callback) => {
                                                let state = states.find((state) => state.name === name);
                                                if (state) {
                                                    callback(state.value);
                                                } else {
                                                    throw new Error(`State "${name}" does not exist`);
                                                }
                                            }
        
                                        });
                                    });
        
                                },
                                on: (event, callback) => {
                                    descendants.forEach((item) => {
                                        item.addEventListener(event, callback);
                                    });
                                },
                                map: (callback) => {
                                    let mapped = [];
                                    descendants.forEach((item) => {
                                        mapped.push(callback(item));
                                    });
                                    return mapped;
                                },
                                querySelector: (selector) => {  dox.querySelector(selector) },
                                querySelectorAll: (selector) => {
                                    descendants = descendants.filter((item) => {
                                        return item.matches(selector);
                                    });
                                    return descendants;
                                },
                                append: (target, code) => {
                                    let targetEl = document.querySelector(target);
                                    if (targetEl) {
                                        targetEl.innerHTML += code;
                                    }
                                },
                                prepend: (target, code) => {
                                    
                                    let targetEl = document.querySelector(target);
                                    if (targetEl) {
                                        targetEl.innerHTML = code + targetEl.innerHTML;
                                    }
                                },
                                after: (target, code) => {
                                    let targetEl = document.querySelector(target);
                                    if (targetEl) {
                                        targetEl.insertAdjacentHTML('afterend', code);
                                    }
                                },
                                before: (target, code) => {
                                    let targetEl = document.querySelector(target);
                                    if (targetEl) {
                                        targetEl.insertAdjacentHTML('beforebegin', code);
                                    }
                                },
                                inject: (target, code) => {
                                    let targetEl = document.querySelector(target);
                                    if (targetEl) {
                                        targetEl.innerHTML = code;
                                    }
                                },
                                html: () => {
                                    let html = '';
                                    descendants.forEach((item) => {
                                        html += item.outerHTML;
                                    });
                                    return html;
                                },
                                getAncestors: () => {
                                    let ancestors = [];
                                    let parent = el.parentNode;
                                    while (parent) {
                                        ancestors.push(parent);
                                        parent = parent.parentNode;
                                    }
                                    return ancestors;
                                }
                            }
                        },
                       attr: (name, value) => {
                            if(value)
                            el.setAttribute(name, value);
                            else{
                                return el.getAttribute(name)
                            }
                        },
                        replaceType: (tagName) => {
                            let newel = document.createElement(tagName);
                            newel.innerHTML = el.innerHTML;
                            let att = Object.values(el.attributes);
                            att.forEach((item) => {
                                newel.setAttribute(item.name, item.value);
                            });
                            el.classList.forEach((item) => {
                                newel.classList.add(item);
                            });
                            el.parentNode.replaceChild(newel, el);
        
                        },
                       
                        on: (event, callback) => {
                            el.addEventListener(event, callback);
                        },
                        insertAdjacentHTML: (position, code) => {
                            el.insertAdjacentHTML(position, code);
                        },
                        prepend: (code) => {
                            el.innerHTML = code + el.innerHTML;
                        },
                        props:  sessionStorage.getItem('$dox-props') ? JSON.parse(sessionStorage.getItem('$dox-props'))[el.tagName] : [],
                         
                        inject: (target, code) => {
                            let targetEl = document.querySelector(target);
                            if (targetEl) {
                                targetEl.innerHTML = code;
                            }
                        },
                        parent:  el.parentNode,
                        getAncestors: () => {
                            let ancestors = [];
                            let parent = el.parentNode;
                            while (parent) {
                                ancestors.push(parent);
                                parent = parent.parentNode;
                            }
                            return ancestors;
                        },
                        text: el.innerText,
                        html: el.innerHTML,
                        getChildren: () => {
                            let children = [];
                            el.querySelectorAll('*').forEach((item) => {
                                if (item.parentNode === el) {
                                    children.push(item);
                                }
                            });
                            return children;
                        }
        
                    }
                    return methods;
                } else {
                    return null;
                }
            },
            querySelectorAll: (selector) => {
                let els = document.querySelectorAll(selector) || html.querySelectorAll(selector);
                if (els) {
                    let methods = {
                        forEach: (callback) => {
        
                            els.forEach((item) => {
                                callback({
                                    attr: (name, value) => {
                                        if(value)
                                        item.setAttribute(name, value);
                                        else{
                                            return item.getAttribute(name)
                                        }
                                    },
                                    id: item.id,
                                    class: item.className,
                                    text: item.innerText,
                                    html: item.innerHTML,
                                    getChildren: () => {
                                        let children = [];
                                        item.querySelectorAll('*').forEach((item) => {
                                            if (item.parentNode === el) {
                                                children.push(item);
                                                children.push({
                                                    methods: methods
                                                })
                                            }
                                        });
                                        return children;
                                    },
                                    getAncestors: () => {
                                        let ancestors = [];
                                        let parent = item.parentNode;
                                        while (parent) {
                                            ancestors.push(parent);
                                            parent = parent.parentNode;
                                        }
                                        return ancestors;
                                    },
                                    parent: item.parentNode,
                                    querySelector: (selector) => {
                                        els = els.filter((item) => {
                                            return item.matches(selector);
                                        });
                                        return els;
                                    },
                                    fadeIn: (time) => {
                                        item.style.opacity = 0;
                                        item.style.transition = `opacity ${time}s`;
                                        item.style.opacity = 1;
                                    },
                                    fadeOut: (time) => {
                                        item.style.opacity = 1;
                                        item.style.transition = `opacity ${time}s`;
                                        item.style.opacity = 0;
                                    },
        
                                    on: (event, callback) => {
                                        item.addEventListener(event, callback);
                                    },
                                    inject: (code) => {
                                        item.innerHTML = code;
                                    },
                                    state: (name) => {
                                        let state = states.find((state) => state.name === name);
                                        if (state) {
                                            return state.value;
                                        } else {
                                            throw new Error(`State "${name}" does not exist`);
                                        }
                                    },
                                    setState: (name, value) => {
                                        let state = states.find((state) => state.name === name);
                                        if (state) {
                                            state.value = value;
                                        } else {
                                            states.push({
                                                name,
                                                value
                                            });
                                        }
                                    }
                                    ,
                                    watch: (name, callback) => {
                                        let state = states.find((state) => state.name === name);
                                        if (state) {
                                            callback(state.value);
                                        } else {
                                            throw new Error(`State "${name}" does not exist`);
                                        }
                                    }
        
                                });
                            });
                        }
                        ,
                        map: (callback) => {
                            let mapped = [];
                            els.forEach((item) => {
                                mapped.push(callback(item));
                            });
                            return mapped;
                        },
                        querySelector: (selector) => { dox.querySelector(selector) },
                        querySelectorAll: (selector) => {
                            els = els.filter((item) => {
                                return item.matches(selector);
                            });
                            return els;
                        },
                        inject: (target, code) => {
                            let targetEl = document.querySelector(target);
                            if (targetEl) {
                                targetEl.innerHTML = code;
                            }
                        }
                        ,
        
                        getAncestors: () => {
                            let ancestors = [];
                            let parent = el.parentNode;
                            while (parent) {
                                ancestors.push(parent);
                                parent = parent.parentNode;
                            }
                            return ancestors;
                        },
                        text:  els.forEach((item) => {return item.innerText}),
                        html:  els.forEach((item) => {return item.innerHTML}),
                        getChildren: () => {
                            let children = [];
                            el.querySelectorAll('*').forEach((item) => {
                                if (item.parentNode === el) {
                                    children.push(item);
                                }
                            });
                            return children;
                        }
                    }
                    return methods;
                } else {
                    return null;
                }
            },
        
        }
        window.dox = dox;
        _export.forEach((item) => {

 
            let template = html.querySelector(item);

             
            let attributes = [];



            attributes.forEach((attribute) => {
                if (template.hasAttribute(attribute)) {
                    if (attribute === 'typeof') {

                        let type = types.find((type) => type.name === template.getAttribute(attribute));

                        if (type) {
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
                                    throw new Error(`Invalid value for type "${type.name}": ${value} (expected number)`);
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
            });

            let onchangeInputs =  {
                'input': true,
                'textarea': true,
                'select': true,
            }
           
         
             
            if (html.querySelector(item).hasAttribute('props')) {
                let $props = html.querySelector(item).getAttribute('props').split(':');
               
                $props.forEach((prop) => {
                   
                  
                    props[item] = $props
                    sessionStorage.setItem('$dox-props', JSON.stringify(props))
                    
                    let derivatives = template.querySelectorAll('[derive]');
                    derivatives.forEach((subitem) => {
                        let attr = subitem.getAttribute('derive');
                        let derivedvalue = body.querySelector(item).getAttribute(attr);

                        if (subitem.innerHTML.includes(`{{${attr}}}`)) {
                            subitem.innerHTML = subitem.innerHTML.replace(`{{${attr}}}`, derivedvalue);
                        }
                    });
   
                    let propElements = template.innerHTML.split('{{');
                    
                    propElements.forEach((element) => {
                        let prop = element.split('}}')[0];
                       
                        if (template.innerHTML.includes(`{{${prop}}}`)) {
                            template.innerHTML = template.innerHTML.replace(`{{${prop}}}`, body.querySelector(item).getAttribute(prop));
                        }

                    })
                    if (template.innerHTML.includes(`{{${prop}}}`)) {
                         
                        // replace {{prop}} with the value of the prop
                        template.innerHTML = template.innerHTML.replace(`{{${prop}}}`, body.querySelector(item).getAttribute(prop));
                    }
                });
            }

            templates.push({
                name: template.tagName,
                template: template.innerHTML,
            });


            let element = body.querySelector(item);

            element.innerHTML = template.innerHTML;
  
            function rerender(blocked) {


                if (element) {

                    document.querySelector(element.tagName).innerHTML = element.innerHTML;
                    let modules = html.querySelectorAll('import')

                    modules.forEach((item) => {
                        let file = item.getAttribute('src');

                        if (!file.endsWith('.html')) {
                            throw new Error('Unsupported imported file type!');
                        }

                        if (!window[file]) {


                            fetch(file)
                                .then((response) => {
                                    return response.text();
                                })
                                .then((data) => {

                                    window[file] = data
                                    setData(data, html, body, item)
                                })
                            return;

                        } else {

                            setData(window[file], html, body, item)
                        }

                    });
                }
                
            }




            let routes = document.querySelector('meta[config]')
            let root = routes.getAttribute('fallback')


            let _routes = {}
            if (routes) {
                routes = routes.getAttribute('routes')
                routes = routes.split(',')
                routes.forEach((item) => {
                    _routes[`#${item}`] = `#${item}`
                }
                )

            }
            root = '#' + root




 

            function showRender(elemente) {
                let rendered = false;

                finished = performance.now() - parsed;

                if (!_routes[window.location.hash]) {
                    window.location.hash = root;
                }
                if (element && !elemente) {
                    rerender()
                    let parent = element ? element.parentNode : null;
                    let template = html.querySelector(item);
                    _routes[window.location.hash] = template.innerHTML;

                    if (parent && parent.hasAttribute('route') || parent.hasAttribute('overide')) {
                        let attributePos = parent.getAttribute('route');
                        let position = parent.getAttribute('position');
                        if (attributePos && position === 'first') {
                            renderElement(element, template, 'first', parent.getAttribute('route'));
                        } else if (attributePos && position === 'last') {
                            renderElement(element, template, 'last', parent.getAttribute('route'));
                        }
                    } else {

                        let el = document.createElement('div');
                        el.style = 'position:fixed;top:0;left:0;right:0;bottom:0;background:white;z-index:9999; font-family: sans-serif; font-size: 30px;'
                        el.innerHTML = `<h1 style="text-align:center;margin-top:50vh">Route is blocked!</h1>`
                        element.innerHTML = el.outerHTML
                    }
                }else{
                    let el = document.querySelector(elemente)
                    let parent = el ? el.parentNode : null;
                    let template = html.querySelector(item);
                    _routes[window.location.hash] = template.innerHTML;
                    if(parent && parent.hasAttribute('route') || parent.hasAttribute('overide')){
                        let attributePos = parent.getAttribute('route');
                        let position = parent.getAttribute('position');
                        el.innerHTML = ''
                        if (attributePos && position === 'first') {
                            renderElement(el, template, 'first', parent.getAttribute('route'));
                        } else if (attributePos && position === 'last') {
                            renderElement(el, template, 'last', parent.getAttribute('route'));
                        }

                    }else{
                        let el = document.createElement('div');
                        el.style = 'position:fixed;top:0;left:0;right:0;bottom:0;background:white;z-index:9999; font-family: sans-serif; font-size: 30px;'
                        el.innerHTML = `<h1 style="text-align:center;margin-top:50vh">Route is blocked!</h1>`
                        element.innerHTML = el.outerHTML
                    }    
                }

                function renderElement(target, template, position, route) {
                    _routes[route] = template.innerHTML;
                    route = '#' + route;
                    let errored;
                    !route ? errored = true : errored = false;



                    target.querySelectorAll('*').forEach((element) => {
                        if (element.hasAttribute('route')) {
                            element.innerHTML = '';
                        }
                    });

                    if (route === window.location.hash && !errored) {
                        element.innerHTML = template.innerHTML;
                        return;
                    } else {
                        element.innerHTML = '';
                    }
                }



            }

            if (!_routes[window.location.hash]) {
                window.location.hash = root;
            }

            showRender();

            window.addEventListener('hashchange', () => {
                document.querySelector('html').setAttribute('root', window.location.hash.split('#')[1]);
                showRender();
                reloadjsdox()
                rerender()


            });

            


        });
    }

    // lazy load images
     
    


  

    window.$import = (data) => {
        if (data.endsWith('.js')) {
            fetch(file)
                .then((response) => {
                    return response.text();
                })
                .then((data) => {
                    if (data.includes('import ')) {
                        throw new Error('Import statements with the "from" keyword are not allowed. Use $import instead.');
                    } else if (data.includes('export ')) {
                        throw new Error('Export statements are not allowed. Use $export instead.');
                    } else
                        if (data.includes('document') && !item.includes('tailwind.js')) {
                            throw new Error('Imported js file cannot contain document use dox instead')
                        } else if (data.includes('innerHTML') || data.includes('innerText') && !item.endsWith('tailwind.js')) {
                            throw new Error('use dox:text  to return text and dox:$ to return html')
                        }

                    let func = new Function(data)
                    func()
                })
        } else {
            return window[data]
        }
    }
    window.$export = (name, value) => {
        window[name] = value
    }
    

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





    

}



document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.body.style.display = 'block'
        
    }, 150)
    
})
 
const states = {};

// Function to set the state value
const setState = (name, value) => {
  states[name] = value;
  window.postMessage({ name: name, value: value }, '*');
};

// Function to get the state value
const getState = (name) => {
  return states[name];
};

// Event listener to update the state when receiving messages
window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin) return;
  const { name, value } = event.data;
  states[name] = value;
});

// Function to handle side effects based on state changes
const effect = ($name, callback = () => {}) => {
  window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) return;
    const { name, value } = event.data;
    if(name ===  $name )
    callback(value);
    return;
  });
};
window.getState = getState

 