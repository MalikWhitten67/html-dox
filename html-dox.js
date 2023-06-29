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
let props = sessionStorage.getItem('$dox-props') ? JSON.parse(sessionStorage.getItem('$dox-props')) : {}


function setData(data, html, body, item) {
    let importName = item.getAttribute('exports').split(',');
    let dom = new DOMParser();
    let dhtml = dom.parseFromString(data, 'text/html');

 

    let props = {};
    
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
        let matches = element.innerHTML.match(/{{(.*?)}}/g);

        if (matches) {
            matches.forEach((match) => {

                let value = match.split('{{')[1].split('}}')[0];
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
        if (element.hasAttribute('state')) {
            let state = element.getAttribute('state')
            console.log(element.getAttribute('state'))
            element.innerHTML = element.innerHTML + getState(state)
            if (document.querySelector(element.tagName)) {
                document.querySelector(element.tagName).innerHTML = element.innerHTML
            }
            effect((state), (state) => {
                if (document.querySelector(element.tagName)) {
                    document.querySelector(element.tagName).innerHTML = state
                }
            })
        }
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
                    if (data.includes('document') && !item.includes('tailwind.js')) {
                        throw new Error('Imported JS file cannot contain document. Use dox instead.');
                    } else if ((data.includes('innerHTML') || data.includes('innerText')) && !item.endsWith('tailwind.js')) {
                        throw new Error('Use dox:text to return text and dox:$ to return HTML.');
                    }

                    let script = document.createElement('script');
                    script.innerHTML = data;
                    script.type = 'module';
                    document.querySelector('head').appendChild(script);

                });
        } else {
            let func = new Function(cache[item]);
            func();
        }
    }
});




const parser = (data) => {
    let dom = new DOMParser();
    let html = dom.parseFromString(data, 'text/html');
    html = html.querySelector('html');
    let body = document.querySelector('body');
    let states = [];
    let parsed = performance.now();
    let finished;


    let _export = html.querySelector('export');
    let _vars = html.querySelectorAll('var');

    _vars.forEach((item) => {
        item.style.display = 'none';
        let varName = item.getAttribute('name');
        let varValue = item.innerHTML;
        html.querySelectorAll('*').forEach((element) => {
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
    })
    if (_export) {
        _export = _export.innerHTML.replace(/\s/g, '');
        _export = _export.split(',');
        _export = _export.filter(Boolean);


        function methods(element) {
            element.inject = (code) => {
                console.log(element)
                element.innerHTML = code;
              };
              let props = sessionStorage.getItem('$dox-props') ? JSON.parse(sessionStorage.getItem('$dox-props')) : [];
              props = props[element.tagName];
              if (props) {
                element.props = props;
              }
              element.class = (name) => {
                element.className = name;
              };
              element.parent = () => {
                return element.parentNode;
              };
              element.classes = element.classList;
              element.html = () =>{
                return element.innerHTML;
              }
              element.text = element.innerText;
              element.prepend = (code) => {
                element.innerHTML = code + element.innerHTML;
              };
              element.append = (code) => {
                console.log(element, code)
                element.innerHTML += code;
              };
              element.blur = () => {
                element.blur();
              };
              element.fade = (time) => {
                element.style.transition = `opacity ${time}s`;
                element.style.opacity = 0;
              }
              element.focus = element.focus;
              element.queryAll = (target) => {
                 let targets = element.querySelectorAll(target);
                 element.forEach = (callback) => {
                    targets.forEach((item) => {
                        callback(item);
                    });
                  };
                 targets.forEach((item) => {
                    let el = methods(item);
                     item = el;
                 });
                    return targets;
              };
              
              element.after = (code) => {
                  element.insertAdjacentHTML('afterend', code);
              };
              element.before = (code) => {
                  element.insertAdjacentHTML('beforebegin', code);
              };
              element.attr = (name, value) => {
                  if (value) {
                      element.setAttribute(name, value);
                  } else {
                      return element.getAttribute(name);
                  }
              };
              element.replace = (elementName, code) => {
                  let newElement =  document.createElement(elementName);
                  newElement.innerHTML = code;
                  element.parentNode.replaceChild(newElement, element);
              };
              element.on = (event, callback) => {
                  element.addEventListener(event, callback);
              };
              element.getChildren = () => {
                let childs = [];
                  let traverse = (el) => {
                      
                      let children = el.children;
                      for (let i = 0; i < children.length; i++) {
                          children[i] = methods(children[i]);
                          children[i].parent = el;
                          children[i].index = i;
                         

                          childs.push(children[i]);
                          traverse(children[i]);
                      }

  
                  };
                  element.forEach = (callback) => {
                    childs.forEach((item) => {
                        callback(item);
                    });
                  };
                  element.map = (callback, index) => {
                    if(index){
                      childs.forEach((item) => {
                        callback(item, index);
                    });
                    }else{
                        childs.forEach((item) => {
                            callback(item);
                        });
                    }

                  };
                  traverse(element);
                    return childs;
                  
              };
              
              
              return element;
        }
        
        let dox = {
            currentRoute: () => {
                return window.location.hash.split('#')[1];
            },
            addEl(el) {
               
                let element = document.createElement(el);
 
              
                return methods(element);
            },
             

            querySelector: (selector) => {
                let element = document.querySelector(selector) || html.querySelector(selector);
                if (element) {
                    return methods(element);
                }
            },

            querySelectorAll: (selector) => {
                
                let elements = document.querySelectorAll(selector) || html.querySelectorAll(selector);
                elements.forEach((item) => {
                    let el = methods(item);
                    item = el;
                });
                return elements;
                
            },
            html:  document.querySelector('html').innerHTML,
            text:  document.querySelector('html').innerText,
            on: (event, callback) => {
                window.addEventListener(event, callback);
            },
            post: (url, data, callback, headers) => {
                // check if data is object - text or json
                if (typeof data === 'object') {
                    data = JSON.stringify(data);
                    fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            headers
                        },
                        body: data,
                    })
                        .then((response) => {
                            if(headers.responseType == 'json'){
                                return response.json()
                            }else{
                                return response.text()
                            }
                        })
                }
                else if (typeof data === 'string') {

                    fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'text/plain',
                            headers
                        },
                        body: data,
                    })
                        .then((response) => {
                            if(headers.responseType == 'json'){
                                return response.json()
                            }else{
                                return response.text()
                            }
                        })
                        .then((data) => {
                            callback(data);
                        });
                    
                }else if (JSON.parse(data)) {
                    fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            headers
                        },
                        body: JSON.stringify(data),
                        
                    })
                        .then((response) => response.json())
                        .then((data) => {
                            callback(data);
                        });
                }
                 
            },
            get: (url, callback, headers) => {
                fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        headers
                    },
                })
                    .then((response) => response.json())
                    .then((data) => {
                        callback(data);
                    });
            },
            put: (url, data, callback, headers) => {
                fetch(url, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        headers
                    },
                    body: JSON.stringify(data),
                })
                    .then((response) => response.json())
                    .then((data) => {
                        callback(data);
                    });
            },
            delete: (url, callback, headers) => {
                fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        headers
                    },
                })
                    .then((response) => response.json())
                    .then((data) => {
                        callback(data);
                    });
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

            let onchangeInputs = {
                'input': true,
                'textarea': true,
                'select': true,
            }
            html.querySelectorAll('*').forEach((element) => {
                if (element.hasAttribute('state')) {
                    let state = element.getAttribute('state')
                    console.log(element.getAttribute('state'))
                    element.innerHTML = element.innerHTML + getState(state)
                    if (document.querySelector(element.tagName)) {
                        document.querySelector(element.tagName).innerHTML = element.innerHTML
                    }
                    effect((state), (state) => {
                        if (document.querySelector(element.tagName)) {
                            document.querySelector(element.tagName).innerHTML = state
                        }
                    })
                }
            })


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
                            renderElement(element, template, 'first', parent.getAttribute('route'), parent.getAttribute('title'));
                        } else if (attributePos && position === 'last') {
                            renderElement(element, template, 'last', parent.getAttribute('route'), parent.getAttribute('title'));
                        }
                    } else {

                        let el = document.createElement('div');
                        el.style = 'position:fixed;top:0;left:0;right:0;bottom:0;background:white;z-index:9999; font-family: sans-serif; font-size: 30px;'
                        el.innerHTML = `<h1 style="text-align:center;margin-top:50vh">Route is blocked!</h1>`
                        element.innerHTML = el.outerHTML
                    }
                } else {
                    let el = document.querySelector(elemente)
                    let parent = el ? el.parentNode : null;
                    let template = html.querySelector(item);
                    _routes[window.location.hash] = template.innerHTML;
                    if (parent && parent.hasAttribute('route') || parent.hasAttribute('overide')) {
                        let attributePos = parent.getAttribute('route');
                        let position = parent.getAttribute('position');
                        el.innerHTML = ''
                        if (attributePos && position === 'first') {
                            renderElement(el, template, 'first', parent.getAttribute('route'), parent.getAttribute('title'));
                        } else if (attributePos && position === 'last') {
                            renderElement(el, template, 'last', parent.getAttribute('route'), parent.getAttribute('title'));
                        }

                    } else {
                        let el = document.createElement('div');
                        el.style = 'position:fixed;top:0;left:0;right:0;bottom:0;background:white;z-index:9999; font-family: sans-serif; font-size: 30px;'
                        el.innerHTML = `<h1 style="text-align:center;margin-top:50vh">Route is blocked!</h1>`
                        element.innerHTML = el.outerHTML
                    }
                }

                function renderElement(target, template, position, route, title) {
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

                        document.title = title ? title : 'html-dox'
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
                rerender()


            });




        });
    }

    // lazy load images






    window.$import = (data) => {
        if (data.endsWith('.js')) {
            fetch(data)
                .then((response) => {
                    return response.text();
                })
                .then((data) => {

                    if (data.includes('document') && !item.includes('tailwind.js')) {
                        throw new Error('Imported js file cannot contain document use dox instead')
                    } else if (data.includes('innerHTML') || data.includes('innerText') && !item.endsWith('tailwind.js')) {
                        throw new Error('use dox:text  to return text and dox:$ to return html')
                    }

                    let script = document.createElement('script')
                    script.innerHTML = data
                    script.type = 'module'
                    document.querySelector('head').appendChild(script)


                    console.log(data)
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

    }, 250)

})

const states = {};

// Function to set the state value
const setState = ($name, $value) => {
    states[$name] = $value;
    window.postMessage({ name: $name, value: $value }, '*');
};

// Function to get the state value
const getState = ($name) => {
    return states[$name];
};

// Event listener to update the state when receiving messages
window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) return;
    const { name, value } = event.data;
    states[name] = value;
});

// Function to handle side effects based on state changes
const effect = ($name, callback = () => { }) => {
    window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) return;
        const { name, value } = event.data;
        if (name === $name)
            callback(value);
        return;
    });
};
window.effect = effect
window.getState = getState

window.setState = setState