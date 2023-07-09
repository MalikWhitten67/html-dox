let dox;
let currentRender;
let templates = [];
let importsTag = document.querySelector('imports')   
let importmeta = document.querySelector('[imports]')
// remove whitespace
let imports;
if(importmeta){
  imports = importmeta.getAttribute('imports').replace(/\s/g, '')
}else if(importsTag){
    throw new Error('<imports> is deprecated use <meta imports="/someimport,/someimport"> instead! read latest git release for more info: https://github.com/MalikWhitten67/html-dox/releases/latest')
}
 
imports = imports.split(',')
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




 

imports.map((item) => {
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
       
        preload.setAttribute('as', 'document');
        document.querySelector('head').appendChild(preload);

        if (cache[item]) {
            parser(cache[item]);
        } else {
            fetch(item)
                .then((response) => {
                    return response.text();
                })
                .then(async (data) => {
                    cache[item] = data;
                     parser(data);
                });
        }
    }
});

const parser = async (data) => {
    let dom = new DOMParser();
    let html = dom.parseFromString(data, 'text/html');
    html = html.body
    let body = document.body
    
    

     
    html.querySelectorAll('*').forEach((item) => {
         
        if (item.innerHTML.includes('{{')) {
            let matchesWithNewlines = item.innerHTML.match(/{{(.*?)}}/gs);
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
                      if (e) {
                        parentElement.innerHTML = '';
                        name = e.data.data.name;
                        value = e.data.data.value;
                     
                        parsed =  JSON.parse(JSON.stringify(value))
                
                        let func;
                        let modifiedData;
                        if (returnMethod.length > 0) {
                          func = new Function('json', `return ${json}.${returnMethod}`);
                          modifiedData = func(parsed);
                        } else {
                          modifiedData = parsed;
                        }
                
                        modifiedData.forEach((item) => {
                          console.log(item)
                          let divElement;
                          let embeddedHTML = returnHTML;
                          let dom = new DOMParser();
                          let html = dom.parseFromString(embeddedHTML, 'text/html');
                   
                           
                          let match =  html.body.outerHTML.match(/{(.*?)}/gs);
                          match.forEach((it) => {
                              
                              let vv = it.split(`{${json}.`)[1].split('}')[0]
                           
                              html.body.innerHTML = html.body.innerHTML.replace(`{${json}.${vv}}`,   item[vv])
                              embeddedHTML = html.body.innerHTML
                            });
                            
  
                        
                          divElement = embeddedHTML;
                          parentElement.innerHTML = parentElement.innerHTML + divElement;
                        });
                        
                        
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
                         
                        await waitForElm(`[map="${json}"]`);
                        let elm =  document.querySelector(`[map="${json}"]`);
                
                        
                        
                        if (elm) {
                          if (elm.innerHTML.length == 0) {
                            elm.innerHTML = parentElement.innerHTML;
                          } else if (elm.innerHTML.length > 0) {
                            if (!elm.querySelector(`[container-map="${json}"]`)) {
                              let container = document.createElement('div');
                              container.innerHTML = parentElement.innerHTML;
                              container.setAttribute('container-map', json);
                             
                            } else {
                              console.log(elm.querySelector(`[container-map="${json}"]`))
                              elm.querySelector(`[container-map="${json}"]`).innerHTML = parentElement.innerHTML;
                              
                            }
                          }
                        }
                        
                       
                         
                         
                      } else if (window[json]) {
                        parentElement.innerHTML = '';
                
                        let parsed = JSON.parse(window[json]);
                        console.log(parsed);
                
                        let elements = [];
                        let func;
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
                
                      
                        let elm =  document.querySelector(`[map="${json}"]`);
                     
                
                        
                        if (elm) {
                          if (elm.innerHTML.length == 0) {
                            elm.innerHTML = parentElement.innerHTML;
                          } else if (elm.innerHTML.length > 0) {
                            if (!elm.querySelector(`[container-map="${json}"]`)) {
                              let container = document.createElement('div');
                              container.innerHTML = parentElement.innerHTML;
                              container.setAttribute('container-map', json);
                              elm.appendChild(container);
                            } else {
                              elm.querySelector(`[container-map="${json}"]`).innerHTML = parentElement.innerHTML;
                            }
                          }
                        }
                        document.querySelector(`[map="${json}"]`).style.display = 'block'
                          
                      }
                       
                    }
                
                    setData();
                
                    window.addEventListener('message', (e) => {
                      if (e.origin == window.location.origin && e.data.type == 'setVar') {
                        
                        html.querySelectorAll('[var]').forEach((item) => {
                          let varName = item.getAttribute('var');
                          let varValue = item.innerHTML;
                          window[varName] = varValue;
                          item.remove();
                        });
                                
                        setData(e);
                      }
                    });
                  }
                  
                });
            }
          }
        if(item.tagName == 'import') {
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
    
                    });
            } else {
                setData(window[file], html, body, item)
            }
        }
        if(item.tagName == 'var'){
   
            let varName = item.getAttribute('name');
            let varValue = item.innerHTML;
            if(item.innerHTML.length  > 0){
                window[varName] = varValue;
              
            }else{
                window[varName] = ''
            }

                 
        html.innerHTML = html.innerHTML.replace(`{{${varName}}}`, varValue);
        item.remove();
        return;
        }
         

         

    });
   
  
 
      

  
    
      
      
     
    html.querySelectorAll('img').forEach((item) => {
           
        item.setAttribute('loading', 'lazy');
        let preload = document.createElement('link');
        preload.setAttribute('rel', 'preload');
        preload.setAttribute('href', item.getAttribute('src'));
        
        preload.setAttribute('as', 'image');
        document.querySelector('head').appendChild(preload);
        // load img chunk by chunk
        let src = item.getAttribute('src');
        let img = new Image();
        img.src = src;
        img.onload = () => {
            item.src = src;
       
            return
        }
    });
    html.querySelectorAll('a').forEach((item) => {
        item.setAttribute('target', '_blank');
        if (item.hasAttribute('href') && item.getAttribute('href').startsWith('/')){
             item.setAttribute('href',  '#'+item.getAttribute('href'))
        
           
        }

    }) 
      

  

    let _export = html.querySelector('export');
     
  
    let el = html.querySelector('export')
    if (_export) {
        _export = _export.innerHTML.replace(/\s/g, '');
        _export = _export.split(',');
        _export = _export.filter(Boolean);

        el.remove()
        


        _export.forEach(async (item) => {


            let template = html.querySelector(item);

 

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


            window.rerender = rerender


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

                html.querySelectorAll('[props]').forEach((item) => {
                    
                     
                  
                    let props = item.getAttribute('props').split(':');
                    props.forEach((prop) => {
                        if (item.hasAttribute('typeof')) {
                            let type = item.getAttribute('typeof').split('{{:')[1].split('}}')[0];
                            let value = item.getAttribute(prop);
                        
                            if (type === '<Json>') {
                              try {
                                let parsedValue = JSON.parse(value);
                               
                              } catch (error) {
                                throw new Error(`Invalid value for type "${type}": ${value} (expected JSON)`);
                              }
                            } else if (type === '<String>') {
                              if (value === 'true' || value === 'false' || value === 'null') {
                                throw new Error(`Invalid value for type "${type}": ${value} (expected string)`);
                              }
                            } else if (type === '<Number>') {
                              if (isNaN(parseFloat(value)) || !isFinite(value)) {
                                throw new Error(`Invalid value for type "${type}": ${value} (expected number)`);
                              }
                            } else if (type === '<Boolean>') {
                              if (value !== 'true' && value !== 'false') {
                                throw new Error(`Invalid value for type "${type}": ${value} (expected boolean)`);
                              }
                            } else if (type === '<Array>') {
                              try {
                                let parsedValue = JSON.parse(value);
                                if (!Array.isArray(parsedValue)) {
                                  throw new Error(`Invalid value for type "${type}": ${value} (expected array)`);
                                }
                              } catch (error) {
                                throw new Error(`Invalid value for type "${type}": ${value} (expected array)`);
                              }
                            } else {
                              throw new Error(`Unsupported type: ${type}`);
                            }
                          }
                    })
                   
                  
                   
                  });
                  
                  
                  
            }

         
              if(document.querySelector(item)){
                    

      


        templates.push({
            element: document.querySelector(item),
            parent: document.querySelector(item).parentNode,
            template: template.innerHTML,
            html:  html,
            body: body
        });
    } 
                
                function rerender(ele) {
 
       
                    let element = document.querySelector(ele)
                     
                    if (element) {
    
                        templates.forEach((item) => {
                            if(item.element == element){
                                let modules =  item.html.querySelectorAll('import')
                                
          
                         
    
                        modules.forEach(async (item) => {
                            let file = item.getAttribute('src');
    
                            if (!file.endsWith('.html')) {
                                throw new Error('Unsupported imported file type!');
                            }
    
                            if (!window[file]) {
    
    
                                fetch(file)
                                    .then((response) => {
                                        return response.text();
                                    })
                                    .then(async (data) => {
    
                                       
                                        window[file] = data
                                        setData(data, html, document.body, item)
                                    })
                                return;
    
                            } else {
    
                                
                                setData(window[file], html, document.body, item)
                                
                            }
    
                        });
                            }
                        })
                 
                        
                    }
                    
    
                }
                rerender()
            

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
                    element.addEventListener(event, callback);
                    return methods(element);
                };
                element.setProp = (prop, value) => {
                    
                    if(value){
                        html.querySelector(element.tagName).setAttribute(prop, value)
                        rerender()
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
                        rerender()
                    }
                    return methods(el)
                },
                current: () =>{
                    // check if this fucntion is inside of a attribute like <button onclick="dox.current()">

                    let element = document.activeElement
                     
                    if(element){
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

                setVar: (name, value) => {
                    window[name] = value;
                    window.postMessage({
                        type: 'setVar',
                        data: {
                            name: name,
                            value: value
                        }
                    }, window.location.origin);
                    
                },
                add: (element, attributes) => {
                    let el = document.createElement(element);

                    if (attributes) {
                        Object.keys(attributes).forEach((key) => {
                            el.setAttribute(key, attributes[key]);
                        });
                    }
                    el = methods(el);

                    return methods(el);

                },

                title: (title) => {
                    document.title = title;
                },

                querySelector: (selector) => {

                    let el = document.querySelector(selector)

                    if (el) {

                        el = methods(el);

                    }
                    return el


                },

                querySelectorAll: (selector) => {

                    let element = currentRender

                    let els = element.querySelectorAll(selector) || html.querySelectorAll(selector) || body.querySelectorAll(selector) || null;
                    let elements = [];
                    els.forEach((item) => {
                        elements.push(methods(item));
                    });
                    return elements;

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

        });

    }


    html.querySelectorAll('var').forEach((item) => {
         
        if (item.hasAttribute('typeof')) {
            let type = item.getAttribute('typeof').split('{{:')[1].split('}}')[0];
            let value = item.innerHTML;
             
        
            if (type === '<Json>') {
              try {
                 JSON.parse(value);
                 
              } catch (error) {
                throw new Error(`Invalid value for type "${type}": ${value} (expected JSON)`);
              }
            } else if (type === '<String>') {
              if (value === 'true' || value === 'false' || value === 'null') {
                throw new Error(`Invalid value for type "${type}": ${value} (expected string)`);
              }
            } else if (type === '<Number>') {
              if (isNaN(parseFloat(value)) || !isFinite(value)) {
                throw new Error(`Invalid value for type "${type}": ${value} (expected number)`);
              }
            } else if (type === '<Boolean>') {
              if (value !== 'true' && value !== 'false') {
                throw new Error(`Invalid value for type "${type}": ${value} (expected boolean)`);
              }
            } else if (type === '<Array>') {
              try {
                let parsedValue = JSON.parse(value);
                if (!Array.isArray(parsedValue)) {
                  throw new Error(`Invalid value for type "${type}": ${value} (expected array)`);
                }
              } catch (error) {
                throw new Error(`Invalid value for type "${type}": ${value} (expected array)`);
              }
            } else {
              throw new Error(`Unsupported type: ${type}`);
            }
          }
      });
      

  


    
    

}





class Router {
    constructor(routes) {
        this.routes = routes || {};
        this.currentRoute = '';

        // Attach event listeners to handle hash changes and DOMContentLoaded
        window.addEventListener('hashchange', () => {
             this.route();
             rerender()
        });
        window.addEventListener('DOMContentLoaded', () => {
            this.route();
        });

        this.fallbackRoute = '';
        this.errorOn = false;
    }

    route() {
        window.render = performance.now()
        
        const hash = window.location.hash.slice(1); // Remove the "#" character
        this.currentRoute = hash;
        this.navigate();
    }

    render(route) {

        templates.forEach((item) => {
            let parent = item.parent;
            let template = item.template;
            let element = item.element;
            element.innerHTML = '';
            if (parent.getAttribute('route') ===  route) {
                let rendered = window.render - performance.now()
                rendered = Math.abs(rendered).toFixed(2)
                
               
                document.title = parent.getAttribute('title');
              
                window.rerender(element.tagName)
                 
               
               
                let dom  = new DOMParser().parseFromString(template, 'text/html');
                 
                dom.body.innerHTML = dom.body.innerHTML.replace(/{{(.*?)}}}/gs, '');
                let comment = document.createComment(`${element.tagName} Rendered in ${rendered}ms`);
                dom.body.prepend(comment)
                element.innerHTML =  dom.body.innerHTML;
                window.dox = dox;
               
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
      
              if (Object.keys(query).length > 0 && window.location.hash.includes('?')) {
                route = window.location.hash.split('?')[0].replace('#', '');
                const routeHandler = this.routes[route];
                this.render(route);
               
                routeHandler({ params, query });
                window.dox = window.dox || {};
                return;
              } else if (Object.keys(params).length > 0 && !window.location.hash.includes('?')) {
                const routeHandler = this.routes[route];
                const routeWithoutParams = route.split('/:')[0];
                // Render the corresponding route
                this.render(routeWithoutParams);
      
                
                routeHandler({ params, query });
      
                window.dox = window.dox || {};
      
                return;
              } else if (asterisk) {
               
                const routeHandler = this.routes[route];
                const routeWithoutAsterisk =  route.split('/*')[0];
                this.render(routeWithoutAsterisk);
      
               
      
                // Pass the asterisk value as a parameter to the route handler
                routeHandler({ asterisk });
      
                window.dox = window.dox || {};
      
                return;
              } else {
                const routeHandler = this.routes[route];
                this.render(route);
      
               
                routeHandler({ params, query });
                window.dox = window.dox || {};
                return;
              }
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
      
          if (patternSegment.startsWith(':')) {
            const paramName = patternSegment.slice(1);
            const paramValue = routeSegment;
            params[paramName] = paramValue;
          } else if (patternSegment.includes('?')) {
            const patternSegmentsWithQuery = patternSegment.split('?');
            const queryStr = patternSegmentsWithQuery[1];
            query = this.extractQuery(queryStr);
          } else if (patternSegment.includes('*')) {
            // Capture the remaining path after the asterisk
            asterisk = routeSegments.slice(i).join('/');
            break;
          } else if (routeSegment !== patternSegment) {
            return { isMatch: false };
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
    extractQuery(route) {
        const queryIndex = route.indexOf('?');
        if (queryIndex !== -1) {
            const queryStr = route.slice(queryIndex + 1);
            const queryPairs = queryStr.split('&');
            const query = {};

            queryPairs.forEach((pair) => {
                const [key, value] = pair.split('=');
                query[key] = decodeURIComponent(value); // Decode URI component to handle special characters
            });

            return query;
        }

        return {};
    }
    extractAsterics(route) {
        const queryIndex = route.indexOf('*');
        // /route/* - returns /route/anything/here/anything/here
        if (queryIndex !== -1) {
            const queryStr = route.slice(queryIndex + 1);
            const queryPairs = queryStr.split('&');
            const query = {};

            queryPairs.forEach((pair) => {
                const [key, value] = pair.split('=');
                query[key] = decodeURIComponent(value); // Decode URI component to handle special characters
            });

            return query;
        }
    }

}

 
async function setData(data, html, body, item) {



    let dom = new DOMParser();
    let dhtml = dom.parseFromString(data, 'text/html').body

    let props = {};

    dhtml.querySelectorAll('*').forEach((item) => {

        item.style.display = 'none';
        let varName = item.getAttribute('name');

        let varValue = item.innerHTML;
        window[varName] = varValue;
        dhtml.innerHTML = dhtml.innerHTML.replace(`{{${varName}}}`, varValue);

        item.remove();

        if (item.tagName === 'var') {
            item.style.display = 'none';
            let varName = item.getAttribute('name');
            let varValue = item.innerHTML;
            window[varName] = varValue;

            dhtml.querySelectorAll('*').forEach((element) => {
                let matches = element.innerHTML.match(/{{(.*?)}}/g);
                if (matches && element.innerHTML.includes(`{{${varName}}}`)) {
                    matches.forEach((match) => {
                        element.innerHTML = element.innerHTML.replace(match, varValue);
                    });
                }
            });
            if (item.hasAttribute('typeof')) {
                let type = item.getAttribute('typeof').split('{{:')[1].split('}}')[0];
                let value = varValue;

                if (type === '<Json>') {
                    try {
                        let parsedValue = JSON.parse(value);

                    } catch (error) {
                        throw new Error(`Invalid value for type "${type}": ${value} (expected JSON)`);
                    }
                } else if (type === '<String>') {
                    if (value === 'true' || value === 'false' || value === 'null') {
                        throw new Error(`Invalid value for type "${type}": ${value} (expected string)`);
                    }
                } else if (type === '<Number>') {
                    if (isNaN(parseFloat(value)) || !isFinite(value)) {
                        throw new Error(`Invalid value for type "${type}": ${value} (expected number)`);
                    }
                } else if (type === '<Boolean>') {
                    if (value !== 'true' && value !== 'false') {
                        throw new Error(`Invalid value for type "${type}": ${value} (expected boolean)`);
                    }
                } else if (type === '<Array>') {
                    try {
                        let parsedValue = JSON.parse(value);
                        if (!Array.isArray(parsedValue)) {
                            throw new Error(`Invalid value for type "${type}": ${value} (expected array)`);
                        }
                    } catch (error) {
                        throw new Error(`Invalid value for type "${type}": ${value} (expected array)`);
                    }
                } else {
                    throw new Error(`Unsupported type: ${type}`);
                }
            }

        }
        else if (item.hasAttribute('props')) {
            let name = item.tagName;
            if (html.querySelector(name)) {
                let $props = item.getAttribute('props').split(':');
                $props.forEach(async (prop) => {
                    props[name] = $props;
                    sessionStorage.setItem('$dox-props', JSON.stringify(props))

                    if (prop == 'children') {

                        if (html.querySelector(name).querySelector('slot')) {
                            if (dhtml.querySelector(name).innerHTML.includes('{{children}}')) {
                                if (proptemplates.length > 0) {
                                    proptemplates.forEach((item) => {
                                        if (item.parent == dhtml.querySelector(name).parentNode) {
                                            dhtml.querySelector(name).innerHTML = item.template
                                        }
                                    })

                                }
                                proptemplates.push({
                                    element: dhtml.querySelector(name),
                                    template: dhtml.querySelector(name).innerHTML,
                                    parent: dhtml.querySelector(name).parentNode ? dhtml.querySelector(name).parentNode : null,
                                })


                                dhtml.querySelector(name).innerHTML = dhtml.querySelector(name).innerHTML.replace(`{{children}}`, html.querySelector(name).querySelector('slot').innerHTML);



                            }
                        }
                    } else {
                        if (html.querySelector(name).getAttribute(prop)) {

                            if (proptemplates.length > 0) {
                                proptemplates.forEach((item) => {

                                    if (dhtml.querySelector(name).innerHTML.includes(`{{${prop}}}`)) {
                                        dhtml.querySelector(name).innerHTML = dhtml.querySelector(name).innerHTML.replace(`{{${prop}}}`, html.querySelector(name).getAttribute(prop));

                                    }
                                })

                            }
                            if (dhtml.querySelector(name).innerHTML.includes(`{{${prop}}}`)) {
                                proptemplates.push({
                                    element: dhtml.querySelector(name),
                                    template: dhtml.querySelector(name).innerHTML,
                                    parent: dhtml.querySelector(name).parentNode ? dhtml.querySelector(name).parentNode : null,
                                })

                                let value = html.querySelector(name).getAttribute(prop);
                                dhtml.querySelector(name).innerHTML = dhtml.querySelector(name).innerHTML.replace(`{{${prop}}}`, value);
                            }
                        }
                    }
                });
            }
            let attributes = Object.values(item.attributes);


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
            let matches = item.innerHTML.match(/{{(.*?)}}/g);

            if (matches) {
                matches.forEach((match) => {

                    let value = match.split('{{')[1].split('}}')[0];
                    let el = dhtml.querySelector(item.tagName);
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
            if (item.hasAttribute('state')) {
                let state = element.getAttribute('state')


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
        }
    });


    if (item.getAttribute('exports')) {
        console.log(item.getAttribute('exports'))

        let exported = item.getAttribute('exports').split(',');
        exported.forEach(async (exportItem) => {

            let el = dhtml.querySelector(exportItem) ? dhtml.querySelector(exportItem) : html.querySelector(exportItem)
         
            document.querySelector(exportItem).innerHTML = el.innerHTML

        });
    }










}

window.Router = Router;
window.dox = dox;
 

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


 