function doxMethods(element){
 element.on = function(event, callback){
    document.addEventListener(event, (e) =>{
        if(e.target.id == element.id){
            callback(e);
            
        }
    });
    return element;
 };
 element.html = function(html){
    if(html){
        element.innerHTML = html;
        return element;
    }else{
        return element.innerHTML;
    }
 };
 element.text = function(text){
    if(text){
        element.innerText = text;
    }else{
        return element.innerText;
    }
 };
 element.val = function(value){
    if(value){
        element.value = value;
        return element;
    }else{
        return element.value;
    }

 };
 element.attr = function(attr, value){
    if(value){
        element.setAttribute(attr, value);
        return element;
    }else{
        return element.getAttribute(attr);
    }
 }
 element.search = function(query){
     // search htmlstring for query
     let html = element.innerHTML;
     let regex = new RegExp(query, "g");
     let matches = html.match(regex);
     return matches;
 }
 element.append = function(html){
    element.innerHTML += html;
    return element;
 }
 element.prepend = function(html){
    element.innerHTML = html + element.innerHTML;
    return element;
 }
 element.css = function(property, value){
    if(value){
        element.style[property] = value;
        return element;
    }else{
        return element.style[property];
    }
 }
 element.queryAll = function(query){
    let elements = document.querySelectorAll(query);
    elements.forEach(element => {
        doxMethods(element);
    });
    return elements;
 }
 element.query = function(query){
    let element = document.querySelector(query);
    doxMethods(element);
    return element;
 }
}
 
function awaitElement(query){
    return new Promise((resolve, reject) =>{
        let element = document.querySelector(query) || document.getElementById(query) || document.getElementsByClassName(query)[0] || document.getElementsByName(query)[0];
        if(element){
            resolve(element);
        }else{
            reject("Element not found");
        }
    });
}
/**
 *  dox2.0
 * @function $
 * @param {*} query 
 * @returns  {HTMLElement} element
 * @description - allows you to manipulate dox dom elements
 * @Version 2.0
 * @example
 * // get element by id
 * let element = await $("elementId");
 * // get element by class
 * let element = await $(".elementClass");
 * // get element by name
 * let element = await $("elementName");
 * // get element by tag
 * let element = await $("elementTag");
 * 
 */
function $(query){
   return awaitElement(query).then(element =>{
    doxMethods(element);
    return element;
   }).catch(err => console.log(err));
}


window.$ = $;