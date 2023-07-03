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

        templates.forEach((item) => {
            let parent = item.parent;
            let template = item.template;
            let element = item.element;

            let title = parent.getAttribute('title');
            if (title) {
                document.title = title;
            }
            if (parent.getAttribute('route') == route) {

                rerender();
                element.innerHTML = template;
                window.currentRender = element;
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
      
              if (Object.keys(query).length > 0 && window.location.hash.includes('?')) {
                route = window.location.hash.split('?')[0].replace('#', '');
                const routeHandler = this.routes[route];
                this.render(route);
                await setTimeout(() => {}, 2); // Wait for the DOM to be ready
                routeHandler({ params, query });
                window.dox = window.dox || {};
                return;
              } else if (Object.keys(params).length > 0 && !window.location.hash.includes('?')) {
                const routeHandler = this.routes[route];
                const routeWithoutParams = route.split('/:')[0];
                // Render the corresponding route
                this.render(routeWithoutParams);
      
                await setTimeout(() => {}, 2); // Wait for the DOM to be ready
                routeHandler({ params, query });
      
                window.dox = window.dox || {};
      
                return;
              } else if (asterisk) {
               
                const routeHandler = this.routes[route];
                const routeWithoutAsterisk =  route.split('/*')[0];
                console.log(routeWithoutAsterisk)
                this.render(routeWithoutAsterisk);
      
                await setTimeout(() => {}, 2); // Wait for the DOM to be ready
      
                // Pass the asterisk value as a parameter to the route handler
                routeHandler({ asterisk });
      
                window.dox = window.dox || {};
      
                return;
              } else {
                const routeHandler = this.routes[route];
                this.render(route);
      
                await setTimeout(() => {}, 2); // Wait for the DOM to be ready
                routeHandler({ params, query });
                window.dox = window.dox || {};
                return;
              }
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
            console.log('patternSegment', patternSegment);
            // Capture the remaining path after the asterisk
            asterisk = routeSegments.slice(i).join('/');
            break;
          } else if (routeSegment !== patternSegment) {
            return { isMatch: false };
          }
        }
      
        return { isMatch: true, params, query, asterisk };
      }
      
      

    // Rest of the code remains the same


 


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

window.Router = Router;




const parser = (data) => {
    let dom = new DOMParser();
    let html = dom.parseFromString(data, 'text/html');
    html = html.querySelector('html');
    let body = document.querySelector('body');
    let states = [];
    let parsed = performance.now();
    let finished;

    function setData(data, html, body, item) {
        let importName = item.getAttribute('exports').split(',');
        let dom = new DOMParser();
        let dhtml = dom.parseFromString(data, 'text/html');



        let props = {};

        let parsedjs = (code, parent) => {
            let style;
            if (code.includes('style')) {
                // style.propertie = value     // ex:   {{style.background = "red"}}
                style = code.split('.')
                // get propterie and value
                let prop = style[1].split('=')[0]
                let value = style[1].split('=')[1]

                dhtml.querySelector(parent.tagName).style[prop] = value
                body.querySelector(parent.tagName).style[prop] = value
            } else {
                if (code.includes('{{')) {
                    let value = code.split('{{')[1].split('}}')[0]
                    eval(value)
                }
            }
            if (code.includes('parent')) {

            }
        }
        if (dhtml.querySelector('if')) {
            let el = dhtml.querySelector('if')

            let prop = el.getAttribute('prop') ? el.getAttribute('prop') : null
            let is = el.getAttribute('is')
            let elseis = el.getAttribute('else')
            let elparent = el.parentNode
            let parentprops = el.getAttribute('props') ? el.getAttribute('props').split(',') : null

            let rendered = html.querySelector(elparent.tagName)
            if (prop && parentprops) {
                parentprops.forEach((item) => {

                    let propvalue = rendered.getAttribute(prop)
                    if (propvalue == is) {
                        let template = el.innerHTML
                        if (template.includes('{{')) {
                            let value = template.split('{{')[1].split('}}')[0]
                            parsedjs(value, elparent)
                        }
                    }

                })
            }

        }
        dhtml.querySelectorAll('var').forEach((item) => {
            item.style.display = 'none';
            let varName = item.getAttribute('name');
            let varValue = item.innerHTML;
            dhtml.querySelectorAll('*').forEach((element) => {
                let matches = element.innerHTML.match(/{{(.*?)}}/g);
                if (matches && element.innerHTML.includes(`{{${varName}}}`)) {
                    matches.forEach((match) => {
                        element.innerHTML = element.innerHTML.replace(match, varValue)
                    });
                }
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
            exported.forEach(async (exportItem) => {
                const el = await dhtml.querySelector(exportItem);
                if (el) {
                    html.querySelector(exportItem).innerHTML = el.innerHTML;
                    document.querySelector(exportItem) ? document.querySelector(exportItem).innerHTML = el.innerHTML : null
                }

            });

        });










    }

    let imports = html.querySelectorAll('import');

    imports.forEach((item) => {

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

    });

    let _export = html.querySelector('export');
    _export.style.display = 'none';
    let _vars = html.querySelectorAll('var');

    _vars.forEach((item) => {

        item.style.display = 'none';
        let varName = item.getAttribute('name');
        let varValue = item.innerHTML;
        html.querySelectorAll('*').forEach((element) => {
            let matches = element.innerHTML.match(/{{(.*?)}}/g);
            if (matches && element.innerHTML.includes(`{{${varName}}}`)) {
                matches.forEach((match) => {
                    element.innerHTML = element.innerHTML.replace(match, varValue)
                });
            }

        });
        item.remove();
        return;
    })
    if (_export) {
        _export = _export.innerHTML.replace(/\s/g, '');
        _export = _export.split(',');
        _export = _export.filter(Boolean);




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
                element: document.querySelector(item),
                template: template.innerHTML,
                parent: document.querySelector(item).parentNode,
                html: html,
                body: body
            });


            function rerender(blocked) {


                let element = document.querySelector(item)
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
            dox.domChange('changed', (mutation) => {
                window.hasChanged = true
            })
            window.dox = dox;









        });

    }

    // lazy load images








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

                            dox.domChange('changed', (mutation) => {

                                if (document.querySelector('#dox-script')) {
                                    document.querySelector('#dox-script').remove()
                                    let script = document.createElement('script')


                                    script.id = 'dox-script'
                                    script.type = 'module'
                                    script.innerHTML = data

                                    document.head.appendChild(script)

                                }
                            })


                  



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
            fetch(item)
                .then((response) => {
                    return response.text();
                })
                .then((data) => {
                    cache[item] = data;
                    parser(data);
                });
        }
    }
});

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



export default dox;
 