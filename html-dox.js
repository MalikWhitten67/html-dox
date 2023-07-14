let imports = document.querySelector('meta[imports]').getAttribute('imports');
let hooked = false;
imports = imports.split(',');
let templates = [];
let parser = new DOMParser();
window.variables = {};
window.state = {};
window.props = {};

// Create an array of fetch promises
let fetchPromises = imports.map(function(imported) {
  let name = imported.split('/').pop().split('.')[0].toLowerCase();
  return fetch(imported)
    .then(function(response) {
      return response.text();
    })
    .then(function(data) {
      return {
        name: name,
        data: data,
      };
    });
});
let methods =  {
  
      
    hashChangeListener: null,
    rootElement: null,
    
    title: (title) => {
      if (hooked) {
        throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");
      }
      document.title = title;
      hooked = true;
    },
  
    setCookie: (name, value, options) => {
      if (hooked) {
        throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");
      }
      let cookieString = `${name}=${value};`;
      if (options) {
        if (options.path) {
          cookieString += `path=${options.path};`;
        }
        if (options.domain) {
          cookieString += `domain=${options.domain};`;
        }
        if (options.maxAge) {
          cookieString += `max-age=${options.maxAge};`;
        }
        if (options.httpOnly) {
          cookieString += `httpOnly=${options.httpOnly};`;
        }
        if (options.secure) {
          cookieString += `secure=${options.secure};`;
        }
        if (options.sameSite) {
          cookieString += `sameSite=${options.sameSite};`;
        }
      }
      document.cookie = cookieString;
  
    },
    getCookie: (name) => {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        const cookieName = cookie.split('=')[0];
        if (cookieName === name) {
          const cookieValue = cookie.split('=')[1];
          const cookieOptions = cookie.split(';').slice(1).map(option => {
            const [key, value] = option.split('=').map(str => str.trim());
            return { [key]: value };
          }).reduce((acc, curr) => Object.assign(acc, curr), {});
          return {
            name: cookieName,
            value: cookieValue
          };
        }
      }
      return null;
    },
    saveState: () => {
      if (hooked) {
        throw new Error("State has already been saved cannot save again");
      }
      const route = window.location.hash.substring(1);
      // save the current route in history
      if (window.sessionStorage.getItem(route)) {
        window.location.hash = window.sessionStorage.getItem(route);
      } else {
        window.sessionStorage.setItem(route, route);
      }
      hooked = true;
  
    },
    restoreState: () => {
      if (hooked) {
        throw new Error("State has already been restored cannot restore again");
      }
      // restore the current route in history
      let route = window.location.hash.substring(1);
      if (window.sessionStorage.getItem(route)) {
        window.location.hash = window.sessionStorage.getItem(route);
      } else {
        window.location.hash = this.currentUrl;
      }
      hooked = true;
    },
    send: (data) => {
      if (hooked) {
        throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");
      }
      
      
      document.getElementById(methods.rootElement).innerHTML = data;
      hooked = true;
    },
    render: ($elName) => {
      if (hooked) {
        throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");
      }
       
     
      document.getElementById(methods.rootElement).innerHTML = window[$elName];
  
      hooked = true;
    },
    return: () => {
      if (hooked) {
        hooked = false;
      }
      if (methods.hashChangeListener) {
        window.removeEventListener("hashchange",  methods.hashChangeListener);
         methods.hashChangeListener = null;
        console.log("removed last event listener")
      }
    },
    sendStatus: (msg, code) => {
      if (hooked) {
        throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");
      }
  
      if (typeof code === 'number') {
        document.getElementById(this.rootElement).innerHTML = JSON.stringify({ msg, code });
        hooked = true;
      } else {
        throw new Error("Invalid status code");
      }
  
  
  
    },
   
    redirect: (url) => {
  
      if (hooked) {
        throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");
      }
      window.location.hash = url;
      hooked = true;
  
    },
   
    sendFile: (file) => {
      let element = this.rootElement
      if (hooked) {
        throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");
      }
  
      let xhr = new XMLHttpRequest();
      xhr.open('GET', file);
      xhr.responseType = 'blob';
      xhr.onload = function () {
        if (file.endsWith(".png" || ".jpg" || ".jpeg" || ".gif" || ".svg" || ".ico")) {
          document.getElementById(element).style = `
          position: fixed;
         top: 0;
        left: 0;
       width: 100%;
     height: 100%;
    background-color: black;
          
          `;
          document.getElementById(element).innerHTML = ` 
  <img src="${file}" style="resize: none; border: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"/>`
        } else if (file.endsWith(".json")) {
          fetch(file)
            .then(response => response.json())
            .then(data => {
              const jsonData = JSON.stringify(data);
              const html = `<textarea style="width:100%;height:100%; resize:none; border:none;">${jsonData}</textarea>`
              document.getElementById(element).innerHTML = html;
            })
        } else if (file.endsWith(".js")) {
          fetch(file)
            .then(response => response.text())
            .then(data => {
              const html = `<textarea style="width:100%;height:100%; resize:none; border:none;">${data}</textarea>`
              document.getElementById(element).innerHTML = html;
            })
        } else if (file.endsWith(".css")) {
          fetch(file)
            .then(response => response.text())
            .then(data => {
              const html = `<textarea style="width:100%;height:100%; resize:none; border:none;">${data}</textarea>`
              document.getElementById(element).innerHTML = html;
            })
        } else if (file.endsWith(".html")) {
          fetch(file)
            .then(response => response.text())
            .then(data => {
              const html = `<textarea style="width:100%;height:100%; resize:none; border:none;">${data}</textarea>`
              document.getElementById(element).innerHTML = html;
            })
        } else if (file.endsWith(".img") || file.endsWith(".png") || file.endsWith(".jpg") || file.endsWith(".jpeg") || file.endsWith(".gif") || file.endsWith(".svg") || file.endsWith(".ico")) {
          document.getElementById(element).innerHTML = `
              <img src="${file}" 
              
              style="width:100%;height:100%; resize:none; border:none; position:absolute; top:0; left:0;"
               
              />
              `
        } else if (file.endsWith(".pdf")) {
          document.getElementById(element).innerHTML = `
              <embed src="${file}" 
              
              style="width:100%;height:100%; resize:none; border:none; position:absolute; top:0; left:0;"
               
              />
              `
        } else if (file.endsWith('.mp4') || file.endsWith('.webm') || file.endsWith('.ogg')) {
          let video = document.createElement('video');
          video.src = file;
          video.controls = true;
          document.getElementById(element).appendChild(video);
        } else {
          let audio = document.createElement('audio');
          audio.src = file;
          audio.controls = true;
          document.getElementById(element).appendChild(audio);
        }
        let a = document.createElement('a');
        a.href = window.URL.createObjectURL(xhr.response);
        a.download = file;
        a.click();
      };
      xhr.send();
    }
  }
  class Router {
      constructor() {
        this.routes = {};
        this.currentUrl = ''
        this.store = {};
        this.rootElement = null;
        this.hashChangeListener = null;
        this.listeners = {}
        this.storedroutes = []
        this.errorcheck = null;
        this.headers = {}
        this.customerror = null;
        this.hooked = false;
      }
    
      get(path, callback) {
    
        const paramNames = [];
        const queryNames = [];
        const parsedPath = path.split('/').map(part => {
          if (part.startsWith(':')) {
            paramNames.push(part.substring(1));
            return '([^/]+)';
          }
          if (part.startsWith('*')) {
            paramNames.push(part.substring(1));
            return '(.*)';
          }
          if (part.startsWith('?')) {
            queryNames.push(part.substring(1));
            return '([^/]+)';
          }
          return part;
        }).join('/');
        const regex = new RegExp('^' + parsedPath + '(\\?(.*))?$');
    
    
    
        if (window.location.hash.substring(1).match(regex)) {
          this.storedroutes.push(window.location.hash.substring(1))
          this.hooked = true;
          this.routes[path] = true
          const matches = window.location.hash.substring(1).match(regex);
          const params = {};
    
          for (let i = 0; i < paramNames.length; i++) {
            params[paramNames[i]] = matches[i + 1];
          }
          if (path.includes(":") && window.location.hash.substring(1).split("?")[1]) {
            if (debug.enabled) {
              debug.log([`
                Cannot use query params with path params ${path} ${window.location.hash.substring(1).split("?")[1]}`], "assert");
            }
    
            return false;
          }
          const query = {};
    
          const queryString = window.location.hash.substring(1).split('?')[1];
          if (queryString) {
            const queryParts = queryString.split('&');
            for (let i = 0; i < queryParts.length; i++) {
              const queryParam = queryParts[i].split('=');
              query[queryParam[0]] = queryParam[1];
            }
          }
    
          const req = {
            "params": params,
            "query": query,
            "url": window.location.hash.substring(1),
            "method": "GET",
          }
    
    
          
           
        
          methods.rootElement = this.rootElement
          methods.hashChangeListener = this.hashChangeListener
          const res =  methods
           
    
          callback(req, res);
    
          return true;
        }
        
    
        this.hooked = false;
        return false;
      }
      error(callback) {
        
        this.errorcheck = true;
    
        const handleHashChange = () => {
          if (!this.storedroutes.includes(window.location.hash.substring(1))) {
           
           
            const res = methods
    
            if (this.customerror === null) {
             document.getElementById(this.rootElement).innerHTML = `<code>Cannot GET ${window.location.hash.substring(1)}</code>`;
            } else {
              callback(res);
            }
          }
        };
    
        window.onhashchange = handleHashChange;
    
        const res = methods
    
        if (!this.storedroutes.includes(window.location.hash.substring(1))) {
          if (!this.customerror) {
            document.getElementById(this.rootElement).innerHTML = `<code>Cannot GET ${window.location.hash.substring(1)}</code>`;
          } else {
            callback(res);
          }
        }
      }
    
      root(path, callback) {
        const paramNames = [];
        const queryNames = [];
        const currentPath = window.location.hash.substring(1);
    
        if (!this.hooked && !this.storedroutes.includes(currentPath)) {
          this.storedroutes.push(currentPath);
          window.location.hash = currentPath;
        }
    
        const parsedPath = path.split('/').map(part => {
          if (part.startsWith(':')) {
            paramNames.push(part.substring(1));
            return '([^/]+)';
          }
          if (part.startsWith('*')) {
            paramNames.push(part.substring(1));
            return '(.*)';
          }
          if (part.startsWith('?')) {
            queryNames.push(part.substring(1));
            return '([^/]+)';
          }
          return part;
        }).join('/');
    
        const regex = new RegExp('^' + parsedPath + '(\\?(.*))?$');
    
        if (currentPath === '') {
          if (paramNames.length === 0) {
            window.location.hash = path;
          } else {
            const updatedPath = path.split('/').map(part => {
              if (part.startsWith(':')) {
                return '';
              }
              return part;
            }).join('/');
            window.location.hash = updatedPath;
          }
        } else {
          const match = currentPath.match(regex);
          if (match) {
            const params = {};
            paramNames.forEach((name, index) => {
              params[name] = match[index + 1];
            });
            const updatedPath = path.split('/').map(part => {
              if (part.startsWith(':')) {
                return params[part.substring(1)];
              }
              return part;
            }).join('/');
            window.location.hash = updatedPath;
          }
        }
    
        this.routes[path] = true;
    
        this.currentUrl = path;
        window.$CURRENT_URL = path;
    
        if (window.location.hash.substring(1).match(regex)) {
          const matches = window.location.hash.substring(1).match(regex);
          const params = {};
    
          for (let i = 0; i < paramNames.length; i++) {
            params[paramNames[i]] = matches[i + 1];
          }
          if (path.includes(":") && window.location.hash.substring(1).split("?")[1]) {
            
                console.error(`
               [DoxDom: Cannot use query params with path params ${path} ${window.location.hash.substring(1).split("?")[1]}
              `)
               
          
            return false;
          }
          const query = {};
    
          const queryString = window.location.hash.substring(1).split('?')[1];
          if (queryString) {
            const queryParts = queryString.split('&');
            for (let i = 0; i < queryParts.length; i++) {
              const queryParam = queryParts[i].split('=');
              query[queryParam[0]] = queryParam[1];
            }
          }
          const req = {
            "params": params,
            "query": query,
            "url": window.location.hash.substring(1),
            "method": "ROOT_GET",
          }
    
    
    
    
          methods.rootElement = this.rootElement
          methods.hashChangeListener = this.hashChangeListener
          const res =  methods
         
          if (!this.hashChangeListener) {
            this.hashChangeListener = () => {
              if (window.location.hash.substring(1).match(regex)) {
                const matches = window.location.hash.substring(1).match(regex);
                const params = {};
                for (let i = 0; i < paramNames.length; i++) {
                  params[paramNames[i]] = matches[i + 1];
                }
    
                const req = {
                  params: params,
                  rootUrl: this.currentUrl,
                  url: window.location.hash.substring(1),
                };
                window.$CURRENT_URL =  window.location.hash.substring(1);
    
                const res = methods
    
                callback(req, res);
              }
            };
    
            window.addEventListener("hashchange", this.hashChangeListener);
          }
    
          callback(req, res);
    
          return true;
        }
    
        return false;
      }
    
      post(path, callback) {
    
    
        let hooked = false;
        this.sendContent = null
        const res = {
          set: (name, value) => {
              let accepted = [
                "Accept",
                "Accept-Charset",
                "Accept-Encoding",
                "Accept-Language",
                "Accept-Datetime",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers",
                "Authorization",
                "Cache-Control",
                "Connection",
                "Cookie",
                "Content-Length",
                "Content-MD5",
                "Content-Type",
                "Date",
              ]
              if (!accepted.includes(name)) {
                throw new Error({
                  message: "Invalid header name",
                  name: name,
                  accepted_headers: accepted
                })
              }
              if (typeof value !== 'string') {
                throw new Error("Invalid header value");
              }
              this.headers[name] = value;
      
      
            },
          json: (data) => {
            if (this.headers["Content-Type"] == "application/json") {
              if (hooked) {
                throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");
              }
              try {
                const jsonData = JSON.stringify(data);
                this.sendContent = jsonData
                hooked = true;
              } catch (e) {
                throw new Error("Invalid JSON data");
              }
            } else {
              throw new Error("Content-Type header must be set to application/json")
            }
          },
          jsonp: (data) => {
            if (this.headers["Content-Type"] == "application/json") {
              if (hooked) {
                throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");
              }
              try {
                const jsonData = JSON.stringify(data);
                this.sendContent = `callback(${jsonData})`
                hooked = true;
              } catch (e) {
                throw new Error("Invalid JSON data");
              }
            } else {
              throw new Error("Content-Type header must be set to application/json")
            }
    
          },
    
          text: (data) => {
            if (this.headers["Content-Type"] == "text/plain") {
              if (hooked) {
                throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");
              }
              try {
                const textData = data;
                this.sendContent = textData
                hooked = true;
              } catch (e) {
                throw new Error("Invalid text data");
              }
            }
          },
          return: () => {
            if (hooked) {
              hooked = false;
            }
            if (this.hashChangeListener) {
              window.removeEventListener("hashchange", this.hashChangeListener);
              this.hashChangeListener = null;
              console.log("removed last event listener")
            }
          },
    
        }
    
    
        callback(res)
    
        const message = {
          path: path,
          data: this.sendContent,
          headers: this.headers
        }
        window.postMessage(message, "*");
      }
    
    
    
    
      listen(path, callback) {
        if (this.listeners[path]) {
          throw new Error(`Listener already registered for route ${path}`);
        }
    
        const listener = (event) => {
          const messagePath = event.data.path;
          const data = event.data.data;
          const headers = event.data.headers;
    
          if (messagePath === path) {
            callback({
              "data": data,
              "headers": headers,
              "method": "POST"
            })
          }
        };
    
        window.addEventListener("message", listener);
        this.listeners[path] = listener;
      }
    
      stopListening(path) {
        const listener = this.listeners[path];
    
        if (listener) {
          window.removeEventListener("message", listener);
          delete this.listeners[path];
        }
      }
      use(path) {
    
        const paramNames = [];
        const queryNames = [];
        const parsedPath = path.split('/').map(part => {
          if (part.startsWith(':')) {
            paramNames.push(part.substring(1));
            return '([^/]+)';
          }
          if (part.startsWith('*')) {
            paramNames.push(part.substring(1));
            return '(.*)';
          }
          if (part.startsWith('?')) {
            queryNames.push(part.substring(1));
            return '([^/]+)';
          }
          return part;
        }
        ).join('/');
        const regex = new RegExp('^' + parsedPath + '(\\?(.*))?$');
        path = parsedPath;
        this.routes[path] = true;
        this.storedroutes.push(path);
      }
    
    
    
      bindRoot(element) {
        this.rootElement = element
      }
    
      onload(callback) {
        window.onload = () => {
    
          window.addEventListener("DOMContentLoaded", callback())
        }
      }
    
    
      on(path, callback) {
        window.addEventListener('hashchange', () => {
          const paramNames = [];
          const queryNames = [];
          const parsedPath = path.split('/').map(part => {
            if (part.startsWith(':')) {
              paramNames.push(part.substring(1));
              return '([^/]+)';
            }
            if (part.startsWith('*')) {
              paramNames.push(part.substring(1));
              return '(.*)';
            }
            if (part.startsWith('?')) {
              queryNames.push(part.substring(1));
              return '([^/]+)';
            }
            return part;
          }).join('/');
          const regex = new RegExp('^' + parsedPath + '(\\?(.*))?$');
    
          this.routes[path] = true;
    
          this.currentUrl = path;
          window.$CURRENT_URL = path;
          if (window.location.hash.substring(1).match(regex)) {
            this.storedroutes.push(window.location.hash.substring(1))
            this.routes[path] = true
            const matches = window.location.hash.substring(1).match(regex);
            const params = {};
    
            for (let i = 0; i < paramNames.length; i++) {
              params[paramNames[i]] = matches[i + 1];
            }
            if (path.includes(":") && window.location.hash.substring(1).split("?")[1]) {
              console.error("Cannot use query params with path params", path, window.location.hash.substring(1).split("?")[1]);
              return false;
            }
            const query = {};
    
            const queryString = window.location.hash.substring(1).split('?')[1];
            if (queryString) {
              const queryParts = queryString.split('&');
              for (let i = 0; i < queryParts.length; i++) {
                const queryParam = queryParts[i].split('=');
                query[queryParam[0]] = queryParam[1];
              }
            }
            const req = {
              "params": params,
              "query": query,
              "url": window.location.hash.substring(1),
              "method": "POST",
            }
    
    
            
            methods.rootElement = this.rootElement
            methods.hashChangeListener = this.hashChangeListener
            const res =  methods
    
            callback(req, res);
          }
        });
      }
  }
  window.Router =  Router;
  
 
function handleVariables(html) {
    Object.keys(window.variables).forEach(function(variable) {
         if(Array.isArray(window.variables[variable])){
             let value = window.variables[variable];
             value.forEach(function(v){
                Object.keys(v).forEach(function(vname){
                    let vvalue = v[vname];
                    let regex = new RegExp('{{' + variable + '.' + vname  +'}}', 'g');
                    html.body.innerHTML = html.body.innerHTML.replaceAll(regex, vvalue);
                     
                });
             });
             return html;
            
        }
        let regex = new RegExp('{{' + variable + '}}', 'g');
        html.body.innerHTML = html.body.innerHTML.replaceAll(regex, window.variables[variable]);
    });
    return html;


}
function doxMethods(element) {
    element.on = function(event, callback) {
       
        // check if document registered the event
        element.addEventListener(event, callback);
        if(!document.querySelector(element.tagName)){

        }
        // if not keep checking until it is
        let timer = setInterval(function(){
            if(document.querySelector(element.tagName)){
                 
                document.querySelector(element.tagName).addEventListener(event, callback);
                clearInterval(timer);
            }
        }, 1000);
          

        return  element;
    }
    element.css = function(css) {
        if(css){
            element.style.cssText = css;
            return element;
        }
        return element.style.cssText;
    }
    element.attr = function(attribute, value) {
        if(value){
            element.setAttribute(attribute, value);
            return element;
        }
        return element.getAttribute(attribute);
    }
    element.val = function(value) {
        if(value){
            element.value = value;
            return element;
        }
        return element.value;
    }
    element.text = function(text) {
        if(text){
            element.innerText = text;
            return element;
        }
        return element.innerText;
    }
    element.animate = function(keyframes, options) {
        if(keyframes && options){
            element.animate(keyframes, options);
            return element;
        }
        return element.animate;
    }
    
    element.pre = function(element) {
       element.prepend(element);
       return element;
    }
    element.html = function(html) {
         if(html){
            element.innerHTML = html;
            return element;
         }
        return element.innerHTML;
    }
    element.add = function(tag, attributes) {
        let el = document.createElement(tag);
        Object.keys(attributes).forEach(function(attribute) {
          el.setAttribute(attribute, attributes[attribute]);
        });
        element.appendChild(el);
        return doxMethods(el);
    }
    element.remove = function() {
        element.parentNode.removeChild(element);
    }
    element.parent = function() {
        return doxMethods(element.parentNode);
    }
   
    element.search = function(string) {
        // search html for value
        let regex = new RegExp(string, 'g');
        let matches = element.innerHTML.match(regex);
        return matches;


    }
    return  element;

  }
  
  function setVar(name, value) {
    window.variables[name] = value;
  }
  function getState(name) {
    return window.state[name];
  }
  function setState(name, value) {
     window.postMessage({
        type: 'state',
        name: name,
        value: value
    }, '*');
    window.state[name] = value;

  }
  function effect(name, callback) {
    window.addEventListener('message', function(event) {
        if(event.data.type == 'state'){
            if(event.data.name == name){
                callback(event.data.value)
            }
        }
    });
  }
  function setDox(html) {
    let dox = {
      querySelector: function(selector) {
        let el = html.body.querySelector(selector)  || document.querySelector(selector);
        return doxMethods(el);
      },
      getId: function(id) {
        let el =  html.body.querySelector('#' + id) || document.querySelector('#' + id);
        return doxMethods(el);
      },
      driver: function(name, options) {
        this[name] = options
        // ex: dox.driver('puppeteer', { headless: false });
      },
      add: function(tag, attributes) {
        let el = document.createElement(tag);
        Object.keys(attributes).forEach(function(attribute) {
          el.setAttribute(attribute, attributes[attribute]);
        });
       
        return doxMethods(el);
      },
      validate: function(type, value, options) {
        if (type === 'email') {
          let required = options.required;
          let regex = options.regex;
          
          let time = options.await && options.await.time ? options.await.time : null;
          let tdo = options.await && options.await.fn ? options.await.fn : null;
    
          function setStyles() {
            let inputElement = document.querySelector('input[type="email"]');
            inputElement.style.cssText = options.style;
          }
    
          function clearStyles() {
            let inputElement = document.querySelector('input[type="email"]');
            inputElement.style.cssText = '';
          }
    
          if (required && !value) {
            // Handle required email validation
            setStyles();
            if (time && tdo) {
              setTimeout(function() {
                eval(tdo);
              }, time);
            }
            alert(options.message.required);
          }
    
          if (value && regex && !regex.test(value)) {
            // Handle regex-based email validation
            setStyles();
            if (time && tdo) {
              setTimeout(function() {
                eval(tdo);
              }, time);
            }
            alert(options.message.invalid);
            setStyles();
          } else if (!regex) {
            let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              setStyles();
              if (time && tdo) {
                setTimeout(function() {
                  eval(tdo);
                }, time);
              }
              alert(options.message.invalid);
            }
          }
        } else if (type === 'password') {
          let required = options.required;
          let minLength = options.min
          let maxLength = options.max
    
          let time = options.await && options.await.time ? options.await.time : null;
          let tdo = options.await && options.await.fn ? options.await.fn : null;
          function setStyles() {
            let inputElement = document.querySelector('input[type="password"]');
            inputElement.style.cssText = options.style;
          }
          window.setStyles = setStyles;
    
          function clearStyles() {
            let inputElement = document.querySelector('input[type="password"]');
            inputElement.style.cssText = '';
          }
          window.clearStyles = clearStyles;
    
          if (required && !value) {
            // Handle required password validation
            if (time && tdo) {
              setTimeout(function() {
                eval(tdo);
              }, time);
            }
            setStyles();
            alert(options.message.required);
          }
    
          if (minLength && value.length < minLength) {
            // Handle minimum length password validation
            if (time && tdo) {
              setTimeout(function() {
                eval(tdo);
              }, time);
            }
            setStyles();
            alert(options.message.tooShort);
          }
    
          if (maxLength && value.length > maxLength) {
            // Handle maximum length password validation
            if (time && tdo) {
              setTimeout(function() {
                eval(tdo);
              }, time);
            }
            setStyles();
            alert(options.message.tooLong);
          }
        } else {
          throw new Error('Unsupported validation type: ' + type);
        }
      },
      
     setVar: setVar,
      
    };
  
    window.dox = dox;
    window.setState = setState;
    window.getState = getState;
    window.effect = effect;
  }
  window.$CURRENT_URL = window.location.hash.substring(1);
  
 
  setDox(document);
  
  function handleLogic(html) {
    if (html && html.body.outerHTML.includes('#if')) {
      let ifRegex = /#if\s*\(([\s\S]*?)\)\s*;([\s\S]*?)(?:#else([\s\S]*?))?#endif/gs;
      let match;
      while ((match = ifRegex.exec(html.body.innerHTML)) !== null) {
        let condition = match[1].trim();
        let ifStatement = match[2].trim();
        let elseStatement = match[3] ? match[3].trim() : null;
        
        if (eval(condition)) {
          if (ifStatement.includes('return')) {
            html.body.innerHTML = html.body.innerHTML.replace(match[0], ifStatement);
            html.body.innerHTML = html.body.innerHTML.replace('return', '');
          } else {
            eval(ifStatement);
          }
        } else {
          if (elseStatement && elseStatement.includes('return')) {
            html.body.innerHTML = html.body.innerHTML.replace(match[0], elseStatement);
            html.body.innerHTML = html.body.innerHTML.replace('return', '');
            return html;
          } else if (elseStatement) {
            eval(elseStatement);
            html.body.innerHTML = html.body.innerHTML.replace(match[0], '');
          }
        }
      }
    }
    
    if (html && html.body.outerHTML.includes('#for')) {
      let forRegex = /#for\s*\(([\s\S]*?)\)\s*;([\s\S]*?)(?:#endfor([\s\S]*?))?#endfor/gs;
      let match;
      while ((match = forRegex.exec(html.body.innerHTML)) !== null) {
        let condition = match[1].trim();
        let forStatement = match[2].trim();
        let endforStatement = match[3] ? match[3].trim() : null;
  
        if (eval(condition)) {
          if (forStatement.includes('return')) {
            html.body.innerHTML = html.body.innerHTML.replace(match[0], forStatement);
            html.body.innerHTML = html.body.innerHTML.replace('return', '');
          } else {
            eval(forStatement);
          }
        } else {
          if (endforStatement && endforStatement.includes('return')) {
            html.body.innerHTML = html.body.innerHTML.replace(match[0], endforStatement);
            html.body.innerHTML = html.body.innerHTML.replace('return', '');
          }
        }
      }
    }
  
    return html;
  }
  

  function handleMarkdown(html) {
    let code = html.body.querySelectorAll('markdown');
    code.forEach(function (c) {
      c.style.display = 'flex';
      c.style.flexDirection = 'column';
  
      let h = c.innerHTML;
  
      // Replace **text** with <strong>text</strong>
      let strongRegex = /\*\*([\s\S]*?)\*\*/g;
  
      // Replace # hello world with <h1>hello world</h1> - <h6>hello world</h6>
      let headingRegex = /#{1,6}\s+(.*)/g;
  
      // Replace *text* with <em>text</em>
      let emRegex = /\*([\s\S]*?)\*/g;
  
      // Replace > quote with <blockquote>quote</blockquote>
      let quoteRegex =  /^>\s(.*)$/gm;
  
      let linkRegex = /\[(.*?)\]\((.*?)\)/g;
  
      // Replace --- with <hr>
      let hrRegex = /^---$/gm;
  
      // Replace `code` with <code>code</code>
      let codeRegex = /`([^`]+)`/g;
  
      // Replace unordered list items: - item with <li>item</li>
      let ulRegex = /- (.+)(\n|$)/g;
  
      // Replace ordered list items: 1. item with <li>item</li>
      let olRegex = /\d+\. (.+)(\n|$)/g;
  
      h = h.replace(codeRegex, '<code>$1</code>');
      h = h.replace(linkRegex, '<a href="$2">$1</a>');
      h = h.replace(quoteRegex, '<blockquote>$1</blockquote>');
      h = h.replace(hrRegex, '<hr>');
      h = h.replace(strongRegex, '<strong>$1</strong>');
      h = h.replace(headingRegex, function (match, p1) {
        const level = match.trim().indexOf('#') + 1;
        return `<h${level}>${p1.trim()}</h${level}>`;
      });
      h = h.replace(emRegex, '<em>$1</em>');
      h = h.replace(ulRegex, '<li>$1</li>');
      h = h.replace(olRegex, '<li>$1</li>');
  
      html.body.innerHTML = html.body.innerHTML.replace(c.innerHTML, h);
    });
  
    return html;
  }
  
  
  
  
  function handleProps(html) {
    Object.keys(window.props).forEach(function(prop) {
        if(Array.isArray(window.props[prop])){
            let value =  window.props[prop];
            value.forEach(function(v){
               Object.keys(v).forEach(function(vname){
                   let vvalue = v[vname];
                   let regex = new RegExp('{{' + prop + '.' + vname  +'}}', 'g');
                   html.body.innerHTML = html.body.innerHTML.replaceAll(regex, vvalue);
                    
               });
            });
            return html;
           
       }
       let regex = new RegExp('{{' +  prop + '}}', 'g');
       html.body.innerHTML = html.body.innerHTML.replaceAll(regex,  window.props[prop]);
   });
   return html;
  }


  function handleScripts(html) {
    if(html){
       
        
        var scripts =  html.body.querySelectorAll('script');
        var variableRegex = /let\s+(\w+)\s*=\s*([\s\S]*?)(?:;|$)/g;
        var importRegex = /import\s+{(.*?)}\s+from\s+['"](.*?)['"]/g;
      
        var beforeRenderScripts = [];
        var afterRenderScripts = [];
        for (var i = 0; i < scripts.length; i++) {
          var script = scripts[i];
      
         
          if (!script.hasAttribute('execute') && !script.hasAttribute('props')) {
            var s = script.innerHTML;
            var match;
      
            while ((match = variableRegex.exec(s)) !== null) {
              var name = match[1].trim();
              var value = match[2].trim().replace(/"/g, '');
      
               

              if (value.includes('{')) {
                value = value.replace('{', '').replace('}', '').trim();
                value = value.split(',').map(function(v) {
                  var vname = v.split(':')[0].trim();
                  var vvalue = v.split(':')[1].trim();
                  var obj = {};
                  obj[vname] = vvalue;
                  return obj;
                });
              
              }
              
              if(isNaN(value) && !Array.isArray(value)){
                window.variables[name] = value;
                window[name] = value;
                html = handleVariables(html);
              }else{
                value = eval(value);
                window.variables[name] = value;
                window[name] = value;
                html = handleVariables(html);
              }
               
            
      
            
               
            }
          } else if (script.getAttribute('execute') === 'beforeRender') {
            var s = script.innerHTML;
            beforeRenderScripts.push(s);
          }
          else if (script.getAttribute('execute') === 'afterRender') {
            var s = script.innerHTML;
            afterRenderScripts.push(s);

          }
          else if (script.hasAttribute('props')) {
            var s = script.innerHTML;
            var match;
       
            
            while ((match = variableRegex.exec(s)) !== null) {
              var name = match[1].trim();
              var value = match[2].trim();
               
              if (value.includes('{')) {
                value = value.replace('{', '').replace('}', '').trim();
                value = value.split(',').map(function(v) {
                  var vname = v.split(':')[0].trim();
                  var vvalue = v.split(':')[1].trim();
                  var obj = {};
                  obj[vname] = vvalue;
                  return obj;
                });
              

              }
              
                value = eval(value);
                window.props[name] = value;
            
               
                
              
            }
            
            
          
          }
        }
        
      
        return {
          html: html,
          beforeRenderScripts: beforeRenderScripts,
          afterRenderScripts: afterRenderScripts,
        };
    }
    
  }
  

  function handleImports(htm) {
    let imports = htm.querySelectorAll('import');
    let fetchPromises = [];
  
    for (var i = 0; i < imports.length; i++) {
      let src = imports[i].getAttribute('src');
      let name = src.split('/').pop().split('.')[0].toLowerCase();
  
     
      let fetchPromise = fetch(src)
        .then(function(response) {
          return response.text();
        })
        .then(function(data) {
          let d = parser.parseFromString(data, 'text/html');
          return handleImports(d).then(function(updatedHtml) {
            let { html, beforeRenderScripts, afterRenderScripts } = handleScripts(updatedHtml);
  
            html = handleLogic(html);
            html = handleMarkdown(html);
            
            // Execute the beforeRender scripts
            beforeRenderScripts.forEach(function(script) {
              if (script.includes('dox')) {
                setDox(html);
              }
              let s = document.createElement('script');
              let id = name + '-script';
              
              if(!document.getElementById(id)){
                s.innerHTML = script;
                s.type = 'module';
                s.id = id;
                document.head.appendChild(s);
                // reexecute the script
                eval(script);
              }
               
                
                 
            });

            
            // remove ``` with <!-- -->
            let matches = html.body.outerHTML.match(/```([\s\S]*?)```/g);
             
            if (matches) {
              matches.forEach(function(match) {
                html.body.outerHTML = html.body.outerHTML.replaceAll(match, '<!-- ' + match + ' -->');
              })
            }

           

            
            Object.keys(window.props).forEach(function(prop) {
                
                   
                if(htm.querySelector(name) && htm.querySelector(name).getAttribute(prop)){
                    window.props[prop] = window.props[prop].replace(/"/g, '');
                    
                    html.querySelector(name).outerHTML = html.querySelector(name).outerHTML.replaceAll('{{'+prop+'}}',  htm.querySelector(name).getAttribute(prop));
                    
                }else if(htm.querySelector(name) && htm.querySelector(name).getAttribute('props') && htm.querySelector(name).getAttribute('props').includes(prop)){
                    window.props[prop] = window.props[prop].replace(/"/g, '');
                    html.querySelector(name).outerHTML = html.querySelector(name).outerHTML.replaceAll('{{'+prop+'}}', window.props[prop]);
                    
                }else{
                    html = handleProps(html);
                }
                 
                      
                    
               
             });
            // Replace the import with the html
            if(htm.querySelector(name)){
            htm.querySelectorAll(name).forEach(function(el) {
                el.outerHTML = html.body.innerHTML;
            });
        }
              
          });

           
        });
  
      fetchPromises.push(fetchPromise);
    }
  
    return Promise.all(fetchPromises).then(function() {
      return htm;
    });
  }
  Promise.all(fetchPromises)
  .then(function(fetchedTemplates) {
    templates = fetchedTemplates;
    return Promise.all(
      templates.map(function(template) {
        let d = parser.parseFromString(template.data, 'text/html');
        let matches = d.body.outerHTML.match(/```([\s\S]*?)```/g);
         
        if (matches) {
          matches.forEach(function(match) {
            d.body.outerHTML = d.body.outerHTML.replaceAll(match, '<!-- ' + match + ' -->');
          })
        }
        let { beforeRenderScripts } = handleScripts(d);
     

        let fetchPromises = [];

        beforeRenderScripts.forEach(function(script) {
         
          if (script.includes('fetch')) {
            setDox( d);
            let fetchPromise = eval(script); // Execute fetch request
            fetchPromises.push(fetchPromise);
          } else if (script.includes('dox')) {
             setDox(d);
             let s = document.createElement('script');
             let id = template.name + '-script';
             if(!document.getElementById(id)){
               s.innerHTML = script;
               s.type = 'module';
               s.id = id;
               document.head.appendChild(s);
             }
          } else {
            
            let s = document.createElement('script');
            let id = template.name + '-script';
            if(!document.getElementById(id)){
              s.innerHTML = script;
              s.type = 'module';
              s.id = id;
              document.head.appendChild(s);
            }
          }
        });

        return Promise.all(fetchPromises)
          .then(function() {
            return handleImports(d);
          })
          .then(function(updatedHtml) {
            let { html, beforeRenderScripts, afterRenderScripts } = handleScripts(updatedHtml);

            updatedHtml = handleLogic(html);
            updatedHtml = handleMarkdown(updatedHtml);

          
            beforeRenderScripts.forEach(function(script) {
              if (script.includes('dox')) {
                setDox(html);
                let s = document.createElement('script');
                let id =  template.name + '-script';
               
                if(!document.getElementById(id)){
                  s.innerHTML = script;
                  s.id = id;
                  s.type = 'module';
                  document.head.appendChild(s);
                }
              }else{
                let s = document.createElement('script');
                let id =  template.name + '-script';
                if(!document.getElementById(id)){
                  s.innerHTML = script;
                  s.type = 'module';
                  s.id = id;
                  document.head.appendChild(s);
                } 
              }
            });

            template.data = html.body.innerHTML;

            afterRenderScripts.forEach(function(script) {
                
                let s = document.createElement('script');
                let id = template.name + '-script';
                if(!document.getElementById(id)){
                  s.innerHTML = script;
                  s.type = 'module';
                  s.id = id;
                  document.head.appendChild(s);
                }
                
            });
            return template;
          });
      })
    );
  })
  .then(function(updatedTemplates) {
    updatedTemplates.forEach(function(template) {
      window[template.name] = template.data;
      window.dox = dox;
     
    });
  })
  .then(function() {
      
    imports.forEach(function(importElement) {
        if(importElement.endsWith('.js')){
           fetch(importElement)
            .then(response => response.text())
            .then(data => {
                let script = document.createElement('script');
                let id = importElement.split('/').pop().split('.')[0].toLowerCase() + '-script';
               
                script.id = id;
                   
                script.innerHTML = data;
                script.type = 'module';
                if(!document.getElementById(id)){
                  
                    document.head.appendChild(script);
                }

                 
            })
            
        }
      });
  })
  
  .catch(function(error) {
    console.error('Error fetching templates:', error);
  });