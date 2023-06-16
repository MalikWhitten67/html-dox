let templates = [];
let importsTag = document.querySelector('imports')
importsTag.style.visibility = 'hidden'
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
document.body.style.visibility = 'hidden'
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
        let preload = document.createElement('link')
        preload.setAttribute('rel', 'preload')
        preload.setAttribute('href', item)
        preload.type = 'text/css'
        preload.setAttribute('as', 'style')
        let link = document.createElement('link')
        link.setAttribute('rel', 'stylesheet')
        link.setAttribute('href', item)
        link.type = 'text/css'
        document.querySelector('head').appendChild(link)
        document.querySelector('head').appendChild(preload)
    } else if (item.endsWith('.js')) {
        fetch(item)
            .then((response) => {
                return response.text();
            })
            .then((data) => {
                if (data.includes('document') && !item.includes('tailwind.js')) {
                    throw new Error('Imported js file cannot contain document use dox instead')
                }else if (data.includes('innerHTML') || data.includes('innerText') && !item.endsWith('tailwind.js')) {
                    throw new Error('use dox:text  to return text and dox:$ to return html')
                }
                
                 let func = new Function(data)
                 func()
            })
    }
});
 

const parser = (data) => {
    let dom = new DOMParser();
    let html =  dom.parseFromString(data, 'text/html');
    html = html.querySelector('html');
    let body = document.querySelector('body');


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
                getDescendants: () => {
                    const descendants = [];
                  
                    const traverse = (node) => {
                      descendants.push(node);
                  
                      const children = node.children;
                      for (let i = 0; i < children.length; i++) {
                        children[i].inject = (code) => {
                          dox.inject(code, children[i].tagName.toLowerCase());
                        };
                        children[i].text = children[i].innerHTML.replace(/\s/g, '');
                        children[i].$ = children[i].innerHTML;
                        children[i].querySelector = (element) => {
                          return dox.querySelector(children[i].tagName.toLowerCase() + ' ' + element);
                        };
                        children[i].querySelectorAll = (element) => {
                          return dox.querySelectorAll(children[i].tagName.toLowerCase() + ' ' + element);
                        };
                  
                        const grandchildren = children[i].children;
                        for (let j = 0; j < grandchildren.length; j++) {
                          grandchildren[j].inject = (code) => {
                            dox.inject(code, grandchildren[j].tagName.toLowerCase());
                          };
                           //remove whitespace but keep spaces

                          grandchildren[j].text =   grandchildren[j].innerText;
                          grandchildren[j].$ = grandchildren[j].innerHTML;
                          grandchildren[j].querySelector = (element) => {
                            return dox.querySelector(
                              grandchildren[j].tagName.toLowerCase() + ' ' + element
                            );
                          };
                          grandchildren[j].querySelectorAll = (element) => {
                            return dox.querySelectorAll(
                              grandchildren[j].tagName.toLowerCase() + ' ' + element
                            );
                          };
                  
                          // Recursively traverse the descendants
                          traverse(grandchildren[j]);
                        }
                      }
                    };
                  
                    traverse(domlist[el]);
                    return descendants;
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
                onmouseout: (callback) => {
                    domlist[el].addEventListener('mouseout', callback)
                },
                onfocus: (callback) => {
                    domlist[el].addEventListener('focus', callback)
                },
                Animation: (animation) => {
                    domlist[el].style.animation = animation
                },
                AnimationEffect: (effect) => {
                    domlist[el].style.animationEffect = effect
                },
                AnimationDelay: (delay) => {
                    domlist[el].style.animationDelay = delay
                },
                AnimationDirection: (direction) => {
                    domlist[el].style.animationDirection = direction
                },
                
                getChildren: () => {
                    return domlist[el].$children
                },


                setState: (name, value) => {
                    states.map((item) => {
                      if (item.name === name) {
                        item.value = value;
                      }
                    });
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
                text: domlist[el].innerHTML,
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
                getDescendants: () => {
                    const descendants = [];
            
                    const traverse = (node) => {
                      descendants.push(node);
            
                      const children = node.children;
                      for (let i = 0; i < children.length; i++) {
                        traverse(children[i]);
                      }
                    };
            
                    traverse(domlist[el]);
                    return  {
                        forEach: (callback) => {
                            descendants.forEach((item) => {
                                callback(item);
                                return {
                                    querySelector: (element) => {
                                        descendants.map((item) => {
                                             dox.querySelector(item.tagName.toLowerCase() + ' ' + element);
                                        })
                                    },
                                    querySelectorAll: (element) => {
                                        descendants.map((item) => {
                                            dox.querySelectorAll(item.tagName.toLowerCase() + ' ' + element);
                                        })
                                    },
                                    setState: (name, value) => {
                                        states.map((item) => {
                                          if (item.name === name) {
                                            item.value = value;
                                          }
                                        });
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
                            })
                        },
                        map: (callback) => {
                            descendants.map((item) => {
                                callback(item);
                            })
                        },
                        


                    }
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
                useState: (initialValue) => {
                    let state = initialValue;
                    return [
                        state,
                        (newState) => {
                            state = newState;
                            watchState(state);
                        }
                    ];
                },
                watchState: (state, callback) => {
                    return (newState) => {
                        state = newState;
                        callback(state);
                    };
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
    window.dox = dox;
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


    // exported code splitting

    _export = _export.innerHTML.replace(/\s/g, '');
    _export = _export.split(',');
    _export = _export.filter(Boolean);
  
    let positions = new Set();
    
    _export.forEach((item) => {
      let template = html.querySelector(item);
      let attributes = Array.from(template.attributes).map((attr) => attr.name);
    
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
    
      if (template.getAttribute('props')) {
        let props = template.getAttribute('props').split(':');
        props.forEach((prop) => {
          let derivatives = template.querySelectorAll('[derive]');
          derivatives.forEach((subitem) => {
            let attr = subitem.getAttribute('derive');
            let derivedvalue = body.querySelector(item).getAttribute(attr);
          
            if (subitem.innerHTML.includes(`{{${attr}}}`)) {
              subitem.innerHTML = subitem.innerHTML.replace(`{{${attr}}}`, derivedvalue);
            }
          });
    
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
      if (element) {
        let parent = element.parentNode;
        if (parent.tagName === 'RENDER') {
          positions.add(parent);
          let execTime = parent.getAttribute('execTime');
          if (execTime === 'before') {
            positions.forEach((position) => {
              let siblingElement = body.querySelector(`[position="${position}"]`);
              if (siblingElement !== null && siblingElement !== element) {
                siblingElement.style.display = 'none';
              }
            });
            renderElement(element, template, 'first');
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
    
    function renderElement(target, template, position) {
      if (position === 'first') {
        target.innerHTML = template.innerHTML + target.innerHTML;
      } else if (position === 'last') {
        target.innerHTML = target.innerHTML + template.innerHTML;
      }
    }
    
};


document.addEventListener('DOMContentLoaded', () => {
   setTimeout(() => {
    document.body.style.visibility = 'visible'
    }, 200)
})
