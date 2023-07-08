let dox;
let currentRender;
let templates = [];
let importsTag = document.querySelector('imports')
let importmeta = document.querySelector('[imports]')
// remove whitespace
let imports;
if (importmeta) {
    imports = importmeta.getAttribute('imports').replace(/\s/g, '')
} else if (importsTag) {
    throw new Error('<imports> is deprecated use <meta imports="/someimport,/someimport"> instead! read latest git release for more info: https://github.com/MalikWhitten67/html-dox/releases/latest')
}
if(imports.length > 0 ) {
    imports = imports.split(',')
} else{
    throw new Error('No imports found! Please add <meta imports="/someimport,/someimport"> to your html file')
}
 
// remove empty strings
imports = imports.filter(Boolean)
let cache = {}

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








 
 function waitForElm(selector) {
    return new Promise((resolve) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver((mutations) => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    });
}

const parser = async (data) => {
    let dom = new DOMParser();
    let html = dom.parseFromString(data, 'text/html');
    html = html.body
    let body = document.body

 
 

    let _export = html.querySelector('export');

    _export ? _export.style.display = 'none' : null;
    let _vars = html.querySelectorAll('var');

    _vars.forEach((item) => {
       

        item.style.display = 'none';
        let varName = item.getAttribute('name');
        let varValue = item.innerHTML.replace(/\s/g, '');
        window[varName] = varValue 
        if (item.html) {
            window[varName + 'Element'] = item;
        } else {

            window[varName + 'Element'] = item;
        }




        if (item.hasAttribute('state')) {
            let state = item.getAttribute('state')

            if (getState(state) == undefined || getState(state) == null) {
                setState(state, '')
            }
            effect((state), (statev) => {
                setTimeout(() => {
                    item.innerHTML = statev
                }, 0)
            })
        }
        html.querySelectorAll('*').forEach((element) => {
            let matches = element.innerHTML.match(/{{(.*?)}}/g);
            let attrmatches = element.outerHTML.match(/{{(.*?)}}/g);
            let original = element.innerHTML;
            // check if attribute has {{}}
            if (attrmatches) {
                attrmatches.forEach((match) => {
                    let attr = match.split('{{')[1].split('}}')[0];
                    // check if it is from a var
                    if (attr == varName) {
                        if (element.parentNode) {
                            element.outerHTML = element.outerHTML.replace(match, varValue)
                        }
                    }
                });
            } else
                if (matches && element.innerHTML.includes(`{{${varName}}}`)) {


                    matches.forEach((match) => {

                        window.onmessage = (e) => {
                            if (e.origin == window.location.origin && e.data.type == 'setVar') {
                                let name = e.data.name
                                let value = e.data.value
                                if (item.getAttribute('name') == name) {
                                    window[name] = value
                                    item.innerHTML = value
                                }

                            }
                        }
                        element.innerHTML = element.innerHTML.replace(match, JSON.parse(item.innerHTML))
                    });
                } else {
                    window.onmessage = (e) => {
                        if (e.origin == window.location.origin && e.data.type == 'setVar') {
                            let name = e.data.name
                            let value = e.data.value
                            if (item.getAttribute('name') == name) {
                                window[name] = value
                                item.innerHTML = value
                            }

                        }
                    }
                }


        });

        item.remove()

        return;
    })
   
    
    async function setData(dhtml) {
       
        dhtml = dhtml.body
        
      
        let _vars = dhtml.querySelectorAll('var');
      
       
      
        for (const item of _vars) {
          item.style.display = 'none';
          let varName = item.getAttribute('name');
          let varValue = item.innerHTML.replace(/\s/g, '');
          window[varName] = varValue;
          if (item.html) {
            window[varName + 'Element'] = item;
          } else {
            window[varName + 'Element'] = item;
          }
      
          if (item.hasAttribute('state')) {
            let state = item.getAttribute('state');
      
            if (getState(state) == undefined || getState(state) == null) {
              setState(state, '');
            }
            effect(state, (statev) => {
              setTimeout(() => {
                item.innerHTML = statev;
              }, 0);
            });
          }
          for (const element of dhtml.querySelectorAll('*')) {
            let matches = element.innerHTML.match(/{{(.*?)}}/g);
            let attrmatches = element.outerHTML.match(/{{(.*?)}}/g);
            let original = element.innerHTML;
            // check if attribute has {{}}
            if (attrmatches) {
              for (const match of attrmatches) {
                let attr = match.split('{{')[1].split('}}')[0];
                // check if it is from a var
                if (attr == varName) {
                  if (element.parentNode) {
                    element.outerHTML = element.outerHTML.replace(match, varValue);
                  }
                }
              }
            } else if (matches && element.innerHTML.includes(`{{${varName}}}`)) {
              for (const match of matches) {
                window.onmessage = (e) => {
                  if (e.origin == window.location.origin && e.data.type == 'setVar') {
                    let name = e.data.name;
                    let value = e.data.value;
                    if (item.getAttribute('name') == name) {
                      window[name] = value;
                      item.innerHTML = value;
                    }
                  }
                };
                element.innerHTML = element.innerHTML.replace(match, JSON.parse(item.innerHTML));
              }
            } else {
              window.onmessage = (e) => {
                if (e.origin == window.location.origin && e.data.type == 'setVar') {
                  let name = e.data.name;
                  let value = e.data.value;
                  if (item.getAttribute('name') == name) {
                    window[name] = value;
                    item.innerHTML = value;
                  }
                }
              };
            }
          }
      
          item.remove();
        }
      
        for (const element of dhtml.querySelectorAll('*')) {
          if (element.hasAttribute('props')) {
            let props = element.getAttribute('props').split(':');
      
             
            for (const prop of props) {
              if (prop === 'children') {
                if (element.querySelector('slot')) {
                  if (element.innerHTML.includes('{{children}}')) {
                    let value = element.querySelector('slot').innerHTML;
                    element.innerHTML = element.innerHTML.replace('{{children}}', value);
                  }
                }
              } else {
                let matches = element.innerHTML.match(new RegExp(`{{${prop}}}`, 'g'));
      
                if (matches) {
                  for (const match of matches) {
                    templates.forEach((template) => {
                      let dom = new DOMParser();
                      let html = dom.parseFromString(template.template, 'text/html');
                      if (html.querySelector(`[${prop}]`)) {
                        let value = html.querySelector(`[${prop}]`).getAttribute(prop);
                        element.innerHTML = element.innerHTML.replace(match, value);
                      }
                    });
                  }
                }
              }
            }
          }
        }
      }
      
      
    window.setData = setData
    if (_export) {
        _export = _export.innerHTML.replace(/\s/g, '');
        _export = _export.split(',');
        _export = _export.filter(Boolean);




        _export.forEach(async (item) => {


            function methods(element) {



                element.inject = (code) => {
                    element.innerHTML = code;
                    return methods(element);
                };

                let props = sessionStorage.getItem('$dox-props') ? JSON.parse(sessionStorage.getItem('$dox-props')) : [];
                props = props[element.tagName];
                if (props) {
                    element.props = props;
                }
                element.class = (name) => {
                    element.className = name;
                    return methods(element);
                };
                element.add = (elementName, options) => {
                    let newElement = document.createElement(elementName);
                    if (options) {
                        Object.keys(options).forEach((key) => {
                            newElement.setAttribute(key, options[key]);
                        });
                    }
                    element.appendChild(newElement);

                    return methods(newElement);
                }
                element.delete = () => {
                    element.remove()
                    return methods(element)
                }

                element.parent = () => {

                    return methods(element.parentNode);
                };
                element.query = (target) => {

                    let el = document.querySelector(target);

                    if (el) {
                        return methods(el);
                    }

                }
                element.classes = (name, option) => {
                    if (option == 'add') element.classList.add(name);
                    if (option == 'remove') element.classList.remove(name);
                    if (option == 'toggle') element.classList.toggle(name);
                    return methods(element);
                };
                element.html = (code) => {
                    if (code) {
                        element.innerHTML = code;
                        return methods(element);
                    } else {
                        return element.innerHTML

                    }
                }

                element.prepend = (code) => {
                    element.innerHTML = code + element.innerHTML;
                    return methods(element);
                };
                element.append = (code) => {

                    element.innerHTML += code;
                    return methods(element);
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
                    return methods(element);
                };
                element.before = (code) => {
                    element.insertAdjacentHTML('beforebegin', code);
                    return methods(element);
                };
                element.attr = (name, value) => {
                    if (value) {
                        element.setAttribute(name, value);
                        return methods(element);
                    } else {
                        return element.getAttribute(name);
                    }
                };
                element.replace = (elementName, code) => {
                    let newElement = document.createElement(elementName);
                    newElement.innerHTML = code;
                    element.parentNode.replaceChild(newElement, element);
                    return methods(newElement);
                };
                element.on = (event, callback) => {
                    element.addEventListener(event, (e) => {
                        Object.defineProperty(e, 'target', {
                            value: methods(e.target),
                        });
                        Object.defineProperty(e, 'currentTarget', {
                            value: methods(e.currentTarget),
                        });
                        callback(e);
                        return methods(element);
                    });
                };
                element.setProp = (prop, value) => {

                    if (value) {
                        html.querySelector(element.tagName).setAttribute(prop, value)
                        
                        return methods(element)
                    }
                }
                element.css = (prop, value) => {
                    if (value) {
                        element.style[prop] = value;
                        return methods(element);
                    } else {
                        return element.style[prop]
                    }
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
                        return methods(element);
                    };
                    element.map = (callback, index) => {
                        if (index) {
                            childs.forEach((item) => {
                                callback(item, index);
                            });
                        } else {
                            childs.forEach((item) => {
                                callback(item);
                            });
                        }
                        return methods(element);
                    };
                    traverse(element);
                    return childs;

                };


                return element;
            }

            dox = {
                route: () => {
                    return window.currentRoute
                },
                currentRender: () => {
                    return currentRender
                },
                setProp: (element, prop, value) => {

                    let el = html.querySelector(element)

                    if (el) {
                        el.setAttribute(prop, value)
                        
                    }
                    return methods(el)
                },
                setVar: (name, value) => {
                    window[name] = value
                    window.postMessage({
                        type: 'setVar',
                        name: name,
                        value: value
                    }, window.location.origin)


                },
                current: () => {
                    // check if this fucntion is inside of a attribute like <button onclick="dox.current()">

                    let element = document.activeElement

                    if (element) {
                        element.isActive = true
                        return methods(element)
                    }
                },
                domChange: (type, eventive = false, callback = () => { }) => {


                    var initialRenderCompleted = false;

                    var observer = new MutationObserver(function (mutations) {
                        if (initialRenderCompleted && type === 'changed') {
                            mutations.forEach(function (mutation) {
                                callback(mutation);
                            });
                        } else {

                            callback()
                        }
                    });

                    observer.observe(document, {
                        childList: true,
                        subtree: true
                    });

                    // only work after initial render
                    setTimeout(() => {
                        initialRenderCompleted = true;
                        if (eventive) {
                            // base callback if user wants to do something after initial render
                            callback()
                        }


                    }, 100);
                },

                add: (element, attributes) => {
                    let el = document.createElement(element);


                    Object.keys(attributes).forEach((item) => {
                        el.setAttribute(item, attributes[item]);
                    });
                    el = methods(el);

                    return methods(el);

                },

                title: (title) => {
                    document.title = title;
                },

                querySelector: (selector) => {

                    return waitForElm(selector).then((elm) => {
                        return methods(elm)
                    })
                    


                },

                querySelectorAll: (selector) => {

                    return waitForElm(selector).then((elm) => {
                        let elms = document.querySelectorAll(selector);
                        elms.forEach((item) => {
                            item = methods(item);
                        });
                        return elms;
                    })

                },
                html: document.querySelector('html').innerHTML,
                text: document.querySelector('html').innerText,
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
                                if (headers.responseType == 'json') {
                                    return response.json()
                                } else {
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
                                if (headers.responseType == 'json') {
                                    return response.json()
                                } else {
                                    return response.text()
                                }
                            })
                            .then((data) => {
                                callback(data);
                            });

                    } else if (JSON.parse(data)) {
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
                setMeta: (name = null, property = null, content, other = false, discord = false) => {
                    if (property) {
                        if (discord) {
                            if (content.includes('https') || content.includes('http')) {
                                content = content + '?a=b'
                                return
                            }
                        }
                        if (document.querySelector(`meta[property="${property}"]`)) {
                            document.querySelector(`meta[property="${property}"]`).setAttribute('content', content)

                            if (other) document.querySelector(`meta[property="${property}"]`).setAttribute(other, content);
                            return
                        }
                        else {

                            let meta = document.createElement('meta');
                            if (discord) {
                                if (content.includes('https') || content.includes('http')) {
                                    content = content + '?a=b'
                                    return
                                }
                            }
                            if (other) {

                                Object.keys(other).forEach((item) => {
                                    cosole.log(item)
                                    meta.setAttribute(item, other[item])
                                })
                            }
                            meta.setAttribute('property', property);
                            meta.setAttribute('content', content);
                            if (name) meta.setAttribute('name', name);
                            document.querySelector('head').appendChild(meta);
                        }

                    }
                    else if (name) {

                        let meta = document.createElement('meta');
                        meta.setAttribute('name', name);
                        meta.setAttribute('content', content);
                        if (other) {

                            Object.keys(other).forEach((item) => {

                                meta.setAttribute(item, other[item])
                            })
                        }
                        document.querySelector('head').appendChild(meta);
                    }
                },






            }

            window.dox = dox;
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

            html.querySelectorAll('[state]').forEach((element) => {
                let state = element.getAttribute('state')
                element.id = state
                if (getState(state) == undefined || getState(state) == null) {
                    setState(state, '')
                }
                element.innerHTML = element.innerHTML + getState(state)

                setTimeout(() => {
                    effect((state), (statev) => {
                        setTimeout(() => {
                            if (element.tagName == 'INPUT' || element.tagName == 'TEXTAREA') element.value = statev;
                            if (element.tagName == 'SELECT') element.value = statev;
                            if (element.tagName == 'IMG') element.src = statev;
                            if (element.tagName == 'A') element.href = statev;
                            if (element.tagName == 'IFRAME') element.src = statev;
                            if (element.tagName == 'VIDEO') element.src = statev;
                            if (element.tagName == 'AUDIO') element.src = statev;
                            if (element.tagName == 'EMBED') element.src = statev;
                            if (element.tagName == 'OBJECT') element.src = statev;
                            if (element.tagName == 'SOURCE') element.src = statev;
                            if (element.tagName == 'TRACK') element.src = statev;
                            else element.innerHTML = statev;
                            document.querySelector(`#${state}`).innerHTML = statev
                        }, 0)
                    })
                }, 0)
            })
            html.querySelectorAll('*').forEach(async (element) => {
                if (element.innerHTML.includes('{{')) {
                  let matches = element.innerHTML.match(/{{(.*?)}}/g);
                  let original = element.innerHTML;
              
                  let matchesWithNewlines = element.innerHTML.match(/{{(.*?)}}/gs);
                  if (matchesWithNewlines) {
                    matchesWithNewlines.forEach(async (match) => {
                      let data = match.split('{{')[1].split('}}}')[0].trim();
                      if (data.startsWith('map(') && data.endsWith('}}')) {
                        match = match.replace('&gt;', '>');
                        let json = data.split('map(')[1].split(')')[0];
              
                        let returnMethod = match.split('return(')[1].split('){')[0].trim();
                        let returnHTML = match.split('){')[1].trim().split('}}')[0].trim();
                         
                        returnHTML = returnHTML.replace(/json\./g, '');
              
                        let parentElement = document.createElement('div');
              
                        async function setData(e) {
                            let name;
                            let value;
                            if (e && e.data && e.data.name == json) {

                                
                                parentElement.innerHTML = '';
                                name = e.data.name;
                                value = e.data.value;
                                parsed = JSON.parse(JSON.stringify(window[name]));
                              

                                let elements = [];
                                let func
                                let modifiedData;
                                if (returnMethod.length > 0) {
                                    func = new Function('json', `return ${json}.${returnMethod}`);
                                    modifiedData = func(parsed);
                                } else {
                                    modifiedData = parsed;
                                }




                                modifiedData.forEach((item) => {

                                    let divElement;

                                    let embeddedHTML = returnHTML;

                                    Object.entries(item).forEach(([key, value]) => {
                                        embeddedHTML = embeddedHTML.replace(new RegExp(`{${key}}`, 'g'), value);
                                      });

                                    divElement = embeddedHTML;
                                     
                                    parentElement.innerHTML = parentElement.innerHTML + divElement;
                                    
                                });

                                function waitForElm(selector) {
                                    return new Promise(resolve => {
                                        if (document.querySelector(selector)) {
                                            return resolve(document.querySelector(selector));
                                        }
                        
                                        const observer = new MutationObserver(mutations => {
                                            if (document.querySelector(selector)) {
                                                resolve(document.querySelector(selector));
                                                observer.disconnect();
                                            }
                                        });
                        
                                        observer.observe(document.body, {
                                            childList: true,
                                            subtree: true
                                        });
                                    });
                                }
                                let elm = await waitForElm(`[map="${json}"]`);

                                
                                if (elm) {
                                     
                                    let container = document.createElement('div');
                                    container.innerHTML = parentElement.innerHTML;
                                    container.setAttribute('container-map', json);
                                    if(!elm.querySelector(`[container-map="${json}"]`)) {
                                        
                                         elm.innerHTML = elm.innerHTML + container.innerHTML;
                                    }else{
                                        elm.querySelector(`[container-map="${json}"]`).innerHTML = parentElement.innerHTML;
                                    }
                                } 
                                document.body.innerHTML = document.body.innerHTML.replace(/{{(.*?)}}/gs, '')
                                if (document.body.innerHTML.includes('}')) {
                                    document.body.innerHTML = document.body.innerHTML.replace(/}/g, '')
                                }
                            }

                           else if (json == name || window[json]) {
                                

                                parentElement.innerHTML = '';

                                let parsed = JSON.parse(window[json]);
                              

                                let elements = [];
                                let func
                                let modifiedData;
                                if (returnMethod.length > 0) {
                                    func = new Function('json', `return ${json}.${returnMethod}`);
                                    modifiedData = func(parsed);
                                } else {
                                    modifiedData = parsed;
                                }




                                modifiedData.forEach((item) => {

                                    let divElement;

                                    let embeddedHTML = returnHTML;

                                    Object.entries(item).forEach(([key, value]) => {
                                        embeddedHTML = embeddedHTML.replace(new RegExp(`{${key}}`, 'g'), value);
                                      });

                                    divElement = embeddedHTML;
                                     
                                    parentElement.innerHTML = parentElement.innerHTML + divElement;
                                    
                                });

                                function waitForElm(selector) {
                                    return new Promise(resolve => {
                                        if (document.querySelector(selector)) {
                                            return resolve(document.querySelector(selector));
                                        }
                        
                                        const observer = new MutationObserver(mutations => {
                                            if (document.querySelector(selector)) {
                                                resolve(document.querySelector(selector));
                                                observer.disconnect();
                                            }
                                        });
                        
                                        observer.observe(document.body, {
                                            childList: true,
                                            subtree: true
                                        });
                                    });
                                }
                                let elm = await waitForElm(`[map="${json}"]`);

                                
                                if (elm) {
                                     
                                    let container = document.createElement('div');
                                    container.innerHTML = parentElement.innerHTML;
                                    container.setAttribute('container-map', json);
                                    if(!elm.querySelector(`[container-map="${json}"]`)) {
                                        
                                         elm.innerHTML = elm.innerHTML + container.innerHTML;
                                    }else{
                                        elm.querySelector(`[container-map="${json}"]`).innerHTML = parentElement.innerHTML;
                                    }
                                } 
                                document.body.innerHTML = document.body.innerHTML.replace(/{{(.*?)}}/gs, '')
                                if (document.body.innerHTML.includes('}')) {
                                    document.body.innerHTML = document.body.innerHTML.replace(/}/g, '')
                                }
                            }
                        }
                        document.body.innerHTML = document.body.innerHTML.replace(/{{(.*?)}}/gs, '');
                      
              
                       setData();
              
                        window.addEventListener('message', (e) => {
                          if (e.origin == window.location.origin && e.data.type == 'setVar') {
                            
                            console.log(e.data)
                            setData(e);
                          }
                        });
                      }
                    });
                  }
                }
              });
              
              
              
             
              



            let modules = html.querySelectorAll('import');

            

            if (html.querySelector(item).hasAttribute('props')) {
                let el = html.querySelector(item)

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

                    if (prop == 'children') {
                        if (html.querySelector(item).querySelector('slot')) {
                            if (html.querySelector(item).innerHTML.includes('{{children}}')) {
                                let value = html.querySelector(item).querySelector('slot').innerHTML;
                                html.querySelector(item).innerHTML = html.querySelector(item).innerHTML.replace('{{children}}', value);
                            }
                        }
                    }
                    else {

                        if (body.querySelector(item).getAttribute(prop)) {

                            html.querySelector(item).innerHTML = html.querySelector(item).innerHTML.replace(`{{${prop}}}`, body.querySelector(item).getAttribute(prop));
                        }
                    }

                });
            }



            if (document.querySelector(item)) {

                templates.push({
                    element: document.querySelector(item),
                    parent: document.querySelector(item).parentNode,
                    template: template.innerHTML,
                    html: html,
                    file: item,
                    body: body,
                    imports: html.querySelectorAll('import'),
                });
                
            }
           

 











        });

    }

    // lazy load images








    html.querySelectorAll('type').forEach((item) => {
        if (!item.parentNode.tagName == 'types') {
            throw new Error('Type must be inside of types tag')
        }

        // Check if 2 subtypes have the same name
        let subtypes = item.querySelectorAll('subtype');
        let names = [];


        types.push({
            var: item.getAttribute('var') ? item.getAttribute('var') : null,
            prop: item.getAttribute('prop') ? item.getAttribute('prop') : null,
            type: item.getAttribute('type') ? item.getAttribute('type') : null,
            default: item.getAttribute('default') ? item.getAttribute('default') : null,
        });

        function checkType() {
            types.forEach((type) => {
              if (type.var) {
                if (names.includes(type.var)) {
                  let variable = window[type.var];
                  if (!variable) throw new Error(`Variable "${type.var}" is not defined`);
                  let innerval = variable.trim();
                 
          
                  if(type.type.toLowerCase() === 'array') {
                    if(!Array.isArray(variable)) {
                      throw new Error(`Variable "${type.var}" is not an array`);
                    }
                  }else if (type.type.toLowerCase() === 'url') {
                    if(!innerval.includes('http') && !innerval.includes('https')) {
                      throw new Error(`Variable "${type.var}" is not a url`);
                    }
                  }
                  if (type.type.toLowerCase() === 'string') {
                    // Type check for string
                    if (!isNaN(parseFloat(innerval))) {
                      throw new Error(`Variable "${type.var}" is a number, not a string`);
                    } else if (innerval.toLowerCase() === 'true' || innerval.toLowerCase() === 'false') {
                      throw new Error(`Variable "${type.var}" is a boolean, not a string`);
                    }
                  } else if (type.type.toLowerCase() === 'number') {
                    // Type check for number
                    if (isNaN(parseFloat(innerval))) {
                      throw new Error(`Variable "${type.var}" is a string, not a number`);
                    }
                  } else if (type.type.toLowerCase() === 'boolean') {
                    // Type check for boolean
                    if (innerval.toLowerCase() !== 'true' && innerval.toLowerCase() !== 'false') {
                      throw new Error(`Variable "${type.var}" is a string, not a boolean`);
                    }
                  } else {
                    throw new Error(`Unsupported type: ${type.type}`);
                  }
                } else {
                  names.push(type.var);
                  window[type.var] = type.default;
                  checkType();
                }
              } else if (type.prop) {
                if (html.querySelector(`[${type.prop}]`) || document.querySelector(`[${type.prop}]`)) {
                  let value = html.querySelector(`[${type.prop}]`)?.getAttribute(type.prop) || document.querySelector(`[${type.prop}]`)?.getAttribute(type.prop);
          
                  if (type.type.toLowerCase() === 'string') {
                    // Type check for string
                    if (!isNaN(parseFloat(value)) && !isFinite(value)) {
                      throw new Error(`Prop "${type.prop}" is a number, not a string`);
                    } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
                      throw new Error(`Prop "${type.prop}" is a boolean, not a string`);
                    } else if (!isNaN(parseFloat(value)) && isFinite(value)) {
                      throw new Error(`Prop "${type.prop}" is a number, not a string`);
                    }
                  } else if (type.type.toLowerCase() === 'boolean') {
                    // Type check for boolean
                    if (!isNaN(parseFloat(value))) {
                      throw new Error(`Prop "${type.prop}" is a number, not a boolean`);
                    } else if (value.toLowerCase() !== 'true' && value.toLowerCase() !== 'false') {
                      throw new Error(`Prop "${type.prop}" is a string, not a boolean`);
                    }
                  }
                } else {
                  throw new Error(`Prop "${type.prop}" is not defined or is defined more than once`);
                }
              } else {
                throw new Error('Type must have var or prop attribute');
              }
            });
          }
          


        checkType()

        window.checkType = checkType

    });







}




class Router {
    constructor(routes) {
        this.routes = routes || {};
        this.currentRoute = '';

        // Attach event listeners to handle hash changes and DOMContentLoaded
        window.addEventListener('hashchange', () => {
            this.route();
            
        });
        window.addEventListener('DOMContentLoaded', () => {
            this.route();
        });

        this.fallbackRoute = '';
        this.errorOn = false;
    }

    route() {
        const hash = window.location.hash.slice(1); // Remove the "#" character
        this.currentRoute = hash;
        this.navigate();
    }

    render(route) {
         
       
        templates.forEach(async (item) => {
    
         
            let parent = item.parent;
         
            let template = item.template;
           
            let element = item.element;

           
            
            if (parent.getAttribute('route') == route) {
                

                
                
                element.innerHTML = '';
                window.currentRender = element;
                async function waitForElm(selector){
                    return new Promise((resolve) => {
                      if (document.querySelector(selector)) {
                        return resolve(document.querySelector(selector));
                      }
                  
                      const observer = new MutationObserver((mutations) => {
                        if (document.querySelector(selector)) {
                          resolve(document.querySelector(selector));
                          observer.disconnect();
                        }
                      });
                  
                      observer.observe(document.body, {
                        childList: true,
                        subtree: true,
                      });
                    });
                }
                await waitForElm(element.tagName)
                if(item.imports.length > 0){
                    
                item.imports.forEach(async (item) => {
                    
                    let src = item.getAttribute('src');
                    let exports = item.getAttribute('exports').split(',');
                  
                    let data;
                    if(!window[src]) {
                        data = await  fetch(src).then((res) => res.text())
 
                        window[src] = data
                    }
                   

                    let dom = new DOMParser();
                    let dhtml = dom.parseFromString(window[src], 'text/html');
                    await setData(dhtml)
                    let body = dhtml.querySelector('body');
                    
                    let newdom = dom.parseFromString(template, 'text/html');
                    let newbody = newdom.querySelector('body');
                     
                    exports.forEach((item) => {
                        if(body.querySelector(item)) {
                            let el = body.querySelector(item)
                            let html = el.innerHTML;
                            dhtml.querySelector(item).innerHTML = html;
                             

                             
                            
                           
                          
                            newbody.querySelector(item).innerHTML = html;
                            template = newbody.innerHTML;
                            
                        }
                    })
                    
                     document.title = parent.getAttribute('title');
                     await setTimeout(() => {
                        window.checkType()
                        element.innerHTML = template;
                         
                         
                     }, 5)
                     
                 
                 
                     

                })
                }
                else{
                    
                    document.title = parent.getAttribute('title');
                    await setTimeout(() => {
                        window.checkType()
                        element.innerHTML = template;
                    }, 5)

                    }
                     

               
                
                
                
            } else {
                element.innerHTML = '';
            }
        });
    }

    navigate() {
        let matchingRoute = false;

        if (this.routes) {
            Object.keys(this.routes).forEach(async (route) => {
                const { isMatch, params, query, asterisk } = this.isRouteMatch(this.currentRoute, route);

                if (isMatch) {
                    matchingRoute = true;
                    let baseRoute = route;
                    let queries = { ...query };
 
                    if (
                        Object.keys(query).length > 0 &&
                        window.location.hash.includes('?') &&
                        params
                      ) {
                        baseRoute = route.split('?')[0];
                        route = route.split(':')[0];
                        this.render(route);
                      } else if (
                        Object.keys(query).length > 0 &&
                        window.location.hash.includes('?') &&
                        asterisk
                      ) {
                        baseRoute = route.split('?')[0];
                        route = route.split('/*')[0];
                        this.render(route);
                      } else if (
                        Object.keys(params).length > 0 &&
                        !window.location.hash.includes('?')
                      ) {
                        route = route.split(':')[0];
                        this.render(route);
                      } else if (
                        Object.keys(params).length > 0 &&
                        window.location.hash.includes('?')
                      ) {
                        const routeWithoutParams = route.split(':')[0];
                        this.render(routeWithoutParams);
                      } else if (
                        Object.keys(query).length > 0 &&
                        asterisk
                      ) {
                        const routeWithoutQuery = route.split('?')[0];
                        this.render(routeWithoutQuery);
                      } else if (asterisk) {
                        const routeWithoutAsterisk = route.split('/*')[0] ? route.split('/*')[0] : route.split('*')[0];
                        
                      
                      
                        
                        this.render(routeWithoutAsterisk);
                      } else {
                        this.render(route);
                      }
            

                    setTimeout(async () => {
                        const routeHandler = this.routes[baseRoute];
                        if (routeHandler) {
                            await routeHandler({ params, query: queries, asterisk });
                             window.dox = dox;
                        }
                         
                    }, 2);

                   
                    return;
                }else{
                    this.render('404')
                    
                   
                }
            });
        } 

        if (!matchingRoute && this.fallbackRoute) {
            window.location.hash = '#' + this.fallbackRoute;
        }
    }

    isRouteMatch(route, pattern) {
        const routeSegments = route.split('/').filter((segment) => segment !== '');
        const patternSegments = pattern.split('/').filter((segment) => segment !== '');
    
        if (routeSegments.length !== patternSegments.length && !pattern.includes('*')) {
            return { isMatch: false };
        }
    
        const params = {};
        let query = {};
        let asterisk = '';
    
        for (let i = 0; i < patternSegments.length; i++) {
            const routeSegment = routeSegments[i];
            const patternSegment = patternSegments[i];
    
             
            if (patternSegment.startsWith(':') && !window.location.hash.includes('?')) {
                
                const paramName = patternSegment.slice(1);
                const paramValue = routeSegment;
                params[paramName] = paramValue;
            }else if (patternSegment.startsWith(':') && window.location.hash.includes('?')) {
                const paramName = patternSegment.split(':')[1].split('?')[0];
                const paramValue = routeSegment.split('?')[0];
                params[paramName] = paramValue;
                let queryStr = window.location.hash.split('?')[1];
                query = this.extractQuery(queryStr);
                 
                 
            }else if (patternSegment.startsWith('*') && window.location.hash.includes('?')) {
                asterisk = routeSegments.slice(i).join('/');
                asterisk = asterisk.split('?')[0];
                break;
            } else if (patternSegment.startsWith('*') && !window.location.hash.includes('?')) {
                asterisk = routeSegments.slice(i).join('/');
                break;
            }
        }
    
        return { isMatch: true, params, query, asterisk };
    }
    

    get(route, handler) {
        this.routes[route] = handler;
    }

    redirect(route) {
        window.location.hash = '#' + route;
    }

    extractParams(route, pattern) {
        const routeSegments = route.split('/').filter((segment) => segment !== '');
        const patternSegments = pattern.split('/').filter((segment) => segment !== '');
        const params = {};

        for (let i = 0; i < patternSegments.length; i++) {
            const patternSegment = patternSegments[i];

            if (patternSegment.startsWith(':')) {
                const paramName = patternSegment.slice(1);
                const paramValue = routeSegments[i];
                params[paramName] = paramValue;
            }
        }

        return params;
    }

    extractQuery(queryStr) {
        const queryPairs = queryStr.split('&');
        const query = {};

        queryPairs.forEach((pair) => {
            const [key, value] = pair.split('=');
            query[key] = decodeURIComponent(value); // Decode URI component to handle special characters
        });

        return query;
    }
}


imports.map(async (item) => {
    if (!item.endsWith('.html') && !item.endsWith('.css') && !item.endsWith('.js')) {
        throw new Error('Unsupported imported file type!');
    }
    else if (item.endsWith('.js')) {
        let preload = document.createElement('link');
        preload.setAttribute('rel', 'preload');
        preload.setAttribute('href', item);
        preload.type = 'text/javascript';
        preload.setAttribute('as', 'script');
        document.querySelector('head').appendChild(preload);

        if (!cache[item]) {
            await fetch(item)
                .then((response) => {
                    return response.text();
                })
                .then((data) => {

                    if (data.includes('document') && !item.includes('tailwind.js')) {
                        throw new Error('Imported JS file cannot contain document. Use dox instead.');
                    } else if ((data.includes('innerHTML') || data.includes('innerText')) && !item.endsWith('tailwind.js')) {
                        throw new Error('Use dox:text to return text and dox:$ to return HTML.');
                    }
                    let pscript = document.createElement('script')

                    pscript.id = 'dox-script'

                    pscript.type = 'module'
                    pscript.innerHTML = data
                    document.head.appendChild(pscript)







                });
        } else {
            (() => {
                cache[item]
            })()

        }
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
            await fetch(item)
                .then((response) => {
                    return response.text();
                })
                .then(async (data) => {
                    cache[item] = data;
                    await parser(data);
                });
        }
    }
});
 

window.Router = Router;
 


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
window.dox = dox;

