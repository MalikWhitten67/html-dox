let imports = document.querySelector('meta[imports]').getAttribute('imports');
let debugOn = document.querySelector('meta[debug]') ? document.querySelector('meta[debug]').getAttribute('debug') : false;
let hooked = false;
imports = imports.split(',');
let templates = [];
let importedElements = [];
let parser = new DOMParser();
window.variables = {};
window.state = {};
window.props = {};

let fetchPromises = imports.map(function (imported) {
  let name = imported.split('/').pop().split('.')[0].toLowerCase();
  return fetch(imported)
    .then(function (response) {
      return response.text();
    })
    .then(function (data) {
      return {
        name: name,
        data: data,
      };
    });
});
let methods = {


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
    window.postMessage({ render: $elName }, "*");

    hooked = true;
  },
  return: () => {
    if (hooked) {
      hooked = false;
    }
    if (methods.hashChangeListener) {
      window.removeEventListener("hashchange", methods.hashChangeListener);
      methods.hashChangeListener = null;
     
    }
  },
  sendStatus: (msg, code) => {
    if (hooked) {
      throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");
    }

    if (typeof code === 'number') {
      document.getElementById(methods.rootElement).innerHTML = JSON.stringify({ msg, code });
      hooked = true;
    } else {
      throw new Error("Invalid status code");
    }



  },

  redirect: (url) => {

    url = url.replace('#', '');
    if (hooked) {
      throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");
    }
    window.location.hash = '#' + url;
    hooked = true;

  },

  sendFile: (file) => {
    let element = methods.rootElement;
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

      window.$URL_PARAMS = params;
      window.$URL_QUERY = query;




      methods.rootElement = this.rootElement
      methods.hashChangeListener = this.hashChangeListener
      const res = methods


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


      window.$URL_PARAMS = params;
      window.$URL_QUERY = query;


      methods.rootElement = this.rootElement
      methods.hashChangeListener = this.hashChangeListener
      const res = methods

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
            window.$CURRENT_URL = window.location.hash.substring(1);

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
        window.$URL_QUERY = query;
        window.$URL_PARAMS = params;


        methods.rootElement = this.rootElement
        methods.hashChangeListener = this.hashChangeListener
        const res = methods

        callback(req, res);
      }
    });
  }
}
window.Router = Router


function handleVariables(html) {
  Object.keys(window.variables).forEach(function (variable) {
    if (Array.isArray(window.variables[variable])) {
      let value = window.variables[variable];
      value.forEach(function (v) {
        Object.keys(v).forEach(function (vname) {
          let vvalue = v[vname];
          let regex = new RegExp('{{' + variable + '.' + vname + '}}', 'g');
          html.body.innerHTML = html.body.innerHTML.replaceAll(regex, vvalue);
          if(debugOn) {
            console.log(`[DoxDom: ${regex}]`, "assert");
          }

        });
      });
      return html;

    }
    let regex = new RegExp('{{' + variable + '}}', 'g');
    html.body.innerHTML = html.body.innerHTML.replaceAll(regex, window.variables[variable]);
  });
  return html;


}

function executeJs(js) {
   
  try {
   
    let output = eval(js);
 
   

    // Return the output
    return output;
  } catch (e) {
    if (debugOn) {
      console.error(`[DoxDom: ${e}]`, "assert");
    }
    console.error(e);
    return null;
  }
}


function eventAttributes(html) {
  let elements = html.body.querySelectorAll('*');
  let events = [
    '*click',
    '*dblclick',
    '*mousedown',
    '*mouseup',
    '*mousemove',
    '*mouseover',
  ]
  elements.forEach(function (element) {
     events.forEach(function (event) {
      if (element.getAttribute(event)) {
        let code = element.getAttribute(event);
        element.removeAttribute(event);
        element.addEventListener(event.substring(1), function (e) {
          executeJs(code);
        });
      }
     })
  })
}


function handleProps(html) {
  Object.keys(window.props).forEach(function (prop) {
    if (Array.isArray(window.props[prop])) {
      let value = window.props[prop];
      value.forEach(function (v) {
        Object.keys(v).forEach(function (vname) {
          let vvalue = v[vname];
          let regex = new RegExp('{{' + prop + '.' + vname + '}}', 'g');
          html.body.innerHTML = html.body.innerHTML.replaceAll(regex, vvalue);

        });
      });
      return html;

    }
    let regex = new RegExp('{{' + prop + '}}', 'g');
    html.body.querySelectorAll('*').forEach(function (element) {
      if (element.getAttribute(prop)) {
         
        window[prop] = element.getAttribute(prop);
         
        element.outerHTML = element.outerHTML.replaceAll(regex, window[prop]);
      }
    });
    if (window.props[prop] !== null || window.props[prop] !== '') {
      html.body.innerHTML = html.body.innerHTML.replaceAll(regex, window.props[prop]);
    }

  });
  return html;
}
function doxMethods(element) {

 
  element.on = function (event, callback) {
    document.addEventListener(event, function (e) {
      if(element.id && e.target.id == element.id) {
        callback(e);
      } 
    })
  };
  
  element.toggleClass = function (className) {
    if (element.classList.contains(className)) {
      element.classList.remove(className);
    } else {
      element.classList.add(className);
    }
    return element;
  } 
  element.css = function (css) {
    if (css) {
      element.style.cssText = css;
      return element;
    }
    return element.style.cssText;
  }
  element.attr = function (attribute, value) {
    if (value) {
      element.setAttribute(attribute, value);
      return element;
    }
    return element.getAttribute(attribute);
  }
  element.val = function (value) {
    if (value) {
      element.value = value;
      return element;
    }
    return element.value;
  }

  element.classes = function (classes) {
    if (classes) {
      element.className = classes;
      return element;
    }
    return element.className;
  }
  element.animate = function (keyframes, options) {
    if (keyframes && options) {
      element.animate(keyframes, options);
      return element;
    }
    return element.animate;
  }

  element.pre = function (element) {
    element.prepend(element);
    return element;
  }
  element.html = function (html) {
    if (html) {
      element.innerHTML = html;
      return element;
    }
    return element.innerHTML;
  }
  element.add = function (tag, attributes) {
    let el = document.createElement(tag);
    Object.keys(attributes).forEach(function (attribute) {
      el.setAttribute(attribute, attributes[attribute]);
    });
    element.appendChild(el);
    return doxMethods(el);
  }
  element.remove = function () {
    element.parentNode.removeChild(element);
  }
  element.parent = function () {
    return doxMethods(element.parentNode);
  }

  element.search = function (string) {
    // search html for value
    let regex = new RegExp(string, 'g');
    let matches = element.innerHTML.match(regex);
    return matches;


  }

  return element

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
    value:  value
  }, '*');
 
  window.state[name] = value

}
function effect(name, callback) {
  window.addEventListener('message', function (event) {
    if (event.data.type == 'state') {
      if (event.data.name == name) {
        callback(event.data.value)
      }
    }
  });
}
function setDox(html) {
  let dox = {
    querySelector: function (selector) {
      let el = document.querySelector(selector) || html.body.querySelector(selector);


      return doxMethods(el);
    },

    awaitElement: async function (selector) {
     
      let element = document.querySelector(selector);
    
      if (element) {
        return doxMethods(element);
      }
    
      return new Promise((resolve, reject) => {
        let hasResolved = false; // Flag to prevent multiple resolutions
    
        const observer = new MutationObserver((mutations) => {
          if (!hasResolved) {
            element = document.querySelector(selector);
            if (element) {
              hasResolved = true;
              observer.disconnect();
              resolve(doxMethods(element));
            }
          }
        });
    
        observer.observe(document.documentElement, {
          childList: true,
          subtree: true,
        });
      });
    },
    getId: function (id) {
      let el = html.body.querySelector('#' + id) || document.querySelector('#' + id);
      return doxMethods(el);
    },
    driver: function (name, options) {
      this[name] = options
      // ex: dox.driver('puppeteer', { headless: false });
    },
    add: function (tag, attributes = {}) {


      let el = document.createElement(tag);
      Object.keys(attributes).forEach(function (attribute) {
        el.setAttribute(attribute, attributes[attribute]);
      });

      return doxMethods(el);




    },
    validate: function (type, value, options) {
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
            setTimeout(function () {
              executeJs(tdo);
            }, time);
          }
          alert(options.message.required);
        }

        if (value && regex && !regex.test(value)) {
          // Handle regex-based email validation
          setStyles();
          if (time && tdo) {
            setTimeout(function () {
              executeJs(tdo);
            }, time);
          }
          alert(options.message.invalid);
          setStyles();
        } else if (!regex) {
          let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            setStyles();
            if (time && tdo) {
              setTimeout(function () {
                executeJs(tdo);
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
            setTimeout(function () {
              executeJs(tdo);
            }, time);
          }
          setStyles();
          alert(options.message.required);
        }

        if (minLength && value.length < minLength) {
          // Handle minimum length password validation
          if (time && tdo) {
            setTimeout(function () {
              executeJs(tdo);
            }, time);
          }
          setStyles();
          alert(options.message.tooShort);
        }

        if (maxLength && value.length > maxLength) {
          // Handle maximum length password validation
          if (time && tdo) {
            setTimeout(function () {
              executeJs(tdo);
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
  let content = html.body.innerHTML;

  const ifRegex = /#if\s*\(([\s\S]*?)\)\s*;([\s\S]*?)(?:#else([\s\S]*?))?#endif/;

  let match = content.match(ifRegex);
  while (match) {
    let [fullMatch, condition, ifStatement, elseStatement] = match;
     condition = condition.replaceAll('&gt;', '>').replaceAll('&lt;', '<').replaceAll('&amp;', '&');
    // replace &gt; with > && &lt; with <
    let processedStatement;
    
    if (executeJs(condition)) {
      processedStatement = ifStatement.includes('return') ? ifStatement : `<script>${ifStatement}</script>`;
    } else {
      processedStatement = elseStatement && !elseStatement.includes('#if') ? (elseStatement.includes('return') ? elseStatement : `<script>${elseStatement}</script>`) : '';
    }
     
    

    
    content = content.replace(fullMatch, processedStatement);
    match = content.match(ifRegex);
  }

  content = content.replaceAll('return', '');
  html.body.innerHTML = content;
  return html;
}

let memory = {}; // Create a memory object to store the initial state and elements

function handleState(html) {
  let content = html.body.innerHTML;
  let stateRegex = /{{\s*state\.([\s\S]*?)\s*}}/g;
  let matches = content.match(stateRegex);

  if (matches) {
    matches.forEach(function (m) {
      let stateName = m.replace('{{state.', '').replace('}}', '').trim();
      let stateValue = window.state[stateName] || 'no_value';

      // Check if the state expression is inside a <slot> element
      if (html.body.querySelector('dox-shadow') && html.body.querySelector('dox-shadow').innerHTML.includes(m)) {
        if(debugOn) {
          console.log('[Setting up state] ', stateName, stateValue)
        }
        let slot = html.body.querySelector('dox-shadow');
        content = html.body.innerHTML;

        if (slot.children.length > 0) {
          slot.querySelectorAll('*').forEach(function (element) {
            // Check if inside of an attribute or HTML
            let attributes = element.attributes;
            for (let i = 0; i < attributes.length; i++) {
              if (attributes[i].value.includes(m)) {
                attributes[i].value = attributes[i].value.replaceAll(m, stateValue);
                memory[stateName] = {
                  element: element,
                  attribute: attributes[i].name,
                  currentValue: stateValue,
                };
              }
            }
            if (element.innerHTML.includes(m)) {
              element.innerHTML = element.innerHTML.replaceAll(m, stateValue);
              memory[stateName] = {
                element: element,
                currentValue: stateValue,
              };
            }
          });
        } else {
          console.log('slot has no children');
          slot.innerHTML = slot.innerHTML.replaceAll(m, stateValue);
          memory[stateName] = {
            element: slot,
            currentValue: stateValue,
          };
        }
        slot.setAttribute('data-state', stateName);
        content = html.body.innerHTML;
        html.body.innerHTML = content;
      }

      
    });

    // Update the HTML content with the modified version
    

    // Set up effects for each state to track changes
    for (let stateName in memory) {
       

      effect(stateName, async function (value) {
        if(debugOn) {
          console.log('[State Change] ', stateName, value)
        }
        window.renderLock = true;
        await new Promise((resolve) => setTimeout(resolve, 0));
        let el = await dox.awaitElement(`[data-state="${stateName}"]`);
        el.innerHTML = el.innerHTML.replaceAll(memory[stateName].currentValue, value);
      
        memory[stateName].currentValue = value;
        window.postMessage({dox:'stateChange', message:' Do not update', kill:'$true'}, '*')
        window.renderLock = false;

        
      });
    }
   
  }

  return html;
}








function executeStatement(statement) {
  // Check if the statement contains 'return'
  if (statement.includes('return')) {
    const returnIndex = statement.indexOf('return');
    const returnValue = statement.slice(returnIndex + 6).trim(); // 6 is the length of 'return'

    // Check if the value after 'return' is a function
    if (returnValue.startsWith('function')) {
      // If it's a function, convert it to a function object and execute it
      try {
        const func = new Function(returnValue);
        return func() || '';
      } catch (error) {
        if(debugOn) {
          console.log('[Error] ', error)
        }
        return '';
      }
    } else {
      // If it's not a function, treat it as a regular string statement
      return returnValue;
    }
  }

  // If the statement does not contain 'return', treat it as a regular string statement
  return statement;
}



function handleMarkdown(html) {
  let code = html.body.querySelectorAll('markdown');
  code.forEach(function (c) {
    c.style.display = 'flex';
    c.style.flexDirection = 'column';

    let h = c.innerHTML;

    h = h.replace('&gt;', '>');

    // Replace **text** with <strong>text</strong>
    let strongRegex = /\*\*([\s\S]*?)\*\*/g;

    // Replace # hello world with <h1>hello world</h1> - <h6>hello world</h6>
    let headingRegex = /#{1,6}\s+(.*)/g;

    // Replace *text* with <em>text</em>
    let emRegex = /\*([\s\S]*?)\*/g;

    // Replace > quote with <blockquote>quote</blockquote>
    let quoteRegex = /> (.+)(\n|$)/g;

    let linkRegex = /\[(.*?)\]\((.*?)\)/g;

    // Replace --- with <hr>
    let hrRegex = /^---$/gm;
    let tableRegex = /\|(.+)\|/g;


    // Replace `code` with <code>code</code>
    let codeRegex = /`([^`]+)`/g;

    // Replace unordered list items: - item with <li>item</li>
    let ulRegex = /- (.+)(\n|$)/g;

    // Replace ordered list items: 1. item with <li>item</li>
    let olRegex = /\d+\. (.+)(\n|$)/g;

    h = h.replace(codeRegex, '<code>$1</code>');
    h = h.replace(linkRegex, '<a  style="color: #007bff; text-decoration:none" href="$2">$1</a>');
    h = h.replace(quoteRegex, '<blockquote style="border-left: 5px solid #eeeeee; padding-left: 10px;">$1</blockquote>');
    h = h.replace(hrRegex, '<hr>');
    h = h.replace(strongRegex, '<strong>$1</strong>');
    h = h.replace(headingRegex, function (match, p1) {
      let level = match.split(' ')[0].length;

      if (level > 6) {
        throw new Error('Heading level cannot be greater than 6');
      }
      return '<h' + level + '>' + p1 + '</h' + level + '>';
    });
    h = h.replace(tableRegex, function (match, p1) {
      let rows = p1.split('\n');
      let table = '<table class="table table-striped table-bordered">';
      rows.forEach(function (row) {
        let cols = row.split('|');
        let tr = '<tr>';
        cols.forEach(function (col) {
          tr += '<td>' + col + '</td>';
        });
        tr += '</tr>';
        table += tr;
      });
      table += '</table>';
      return table;
    });
    h = h.replace(emRegex, '<em>$1</em>');
    h = h.replace(ulRegex, '<li>$1</li>');
    h = h.replace(olRegex, '<li>$1</li>');

    html.body.innerHTML = html.body.innerHTML.replace(c.innerHTML, h);
  });

  return html;
}




 let deferedScriptsFunctions =  {}

function handleScripts(html) {
  if (html) {

    var scripts = html.body.querySelectorAll('script');
    
    var variableRegex = /let\s+(\w+)\s*=\s*([\s\S]*?)(?:;|$)/g;
    var importRegex = /import\s+{(.*?)}\s+from\s+['"](.*?)['"]/g;

    var beforeRenderScripts = [];

    for (var i = 0; i < scripts.length; i++) {
      var script = scripts[i];

       

      if (!script.hasAttribute('execute') && !script.hasAttribute('props') && !script.hasAttribute('defered')) {
        var s = script.innerHTML;
        var match;

        while ((match = variableRegex.exec(s)) !== null) {
          var name = match[1].trim();
          var value = match[2].trim()


          if (value.includes('{')) {
            value = value.replace('{', '').replace('}', '').trim();
            value = value.split(',').map(function (v) {
              var vname = v.split(':')[0].trim();
              var vvalue = v.split(':')[1].trim();
              var obj = {};
              obj[vname] = vvalue;
              return obj;
            });

          }


          window.variables[name] =   eval(value);
          window[name] = eval(value);





        }


      } else if (script.getAttribute('execute') === 'beforeRender') {
        var s = script.innerHTML;
        beforeRenderScripts.push(s);
      } 

      else if (script.hasAttribute('props')) {
        var s = script.innerHTML;
        var match;


        while ((match = variableRegex.exec(s)) !== null) {
          var name = match[1].trim();
          var value = match[2].trim();

          if (value.includes('{')) {
            value = value.replace('{', '').replace('}', '').trim();
            value = value.split(',').map(function (v) {
              var vname = v.split(':')[0].trim();
              var vvalue = v.split(':')[1].trim();
              var obj = {};
              obj[vname] = vvalue;
              return obj;
            });




          }

          var elementsWithProp = html.querySelectorAll(`[${name}]`);
          elementsWithProp.forEach(function (el) {
            var propValue = el.getAttribute(name);
            el.innerHTML = el.innerHTML.replaceAll('{{' + name + '}}', propValue);
            el.removeAttribute(name);
          });



          value =  executeJs(value);
          window.props[name] = value;
          window[name] = value;




        }



      }
    }
    

    

    return {
      html: html,
      beforeRenderScripts: beforeRenderScripts

    };
  }

}
window.args = {};
 // Add a flag to check if the script has already been fetched
const fetchedScripts = {};

window.defer = async function (e, name, fn) {
  e.preventDefault(); // Prevent the default click behavior

  let script = await dox.awaitElement('#' + name);

  if (script && !fetchedScripts[name]) {
    try {
      let data = await fetch(script.src).then((response) => response.text());

      // split async or regular
      let async = data.includes('async');
     
      if(match) {
        let [fullMatch, name, args, body] = match;
        console.log(fullMatch, name, args, body)
      }

      fetchedScripts[name] = true;
    } catch (error) {
      if (debugOn) {
        console.log('[Defer Error] ', error, fn);
      }
      return;
    }
  }

  try {
    fn();
  } catch (error) {
    if (debugOn) {
      console.log('[Defer Error] ', error, fn);
    }
    return;
  }
};






let cached = {};

function handleImports(htm) {
  let imports = htm.querySelectorAll('import');
  let fetchPromises = [];

  for (var i = 0; i < imports.length; i++) {
    let src = imports[i].getAttribute('src');
    let name = src.split('/').pop().split('.')[0].toLowerCase();

    if (cached[name]) {
      let element = document.createElement(name);
      element.innerHTML = cached[name];
      imports[i].replaceWith(element);
      continue;
    }

    let fetchPromise = fetch(src)
      .then(function (response) {
        return response.text();
      })
      .then(function (data) {
        let d = parser.parseFromString(data, 'text/html');
        return handleImports(d).then(function (updatedHtml) {
          let { html, beforeRenderScripts } = handleScripts(updatedHtml);

          html = handleLogic(html);
          html = handleMarkdown(html);
          html = handleState(html);

          // Execute the beforeRender scripts
          beforeRenderScripts.forEach(function (script) {
            if (script.includes('dox')) {
              setDox(html);
            }
            let s = document.createElement('script');
            let id = name + '-script';

            if (!document.getElementById(id)) {
              s.innerHTML = script;
              s.type = 'module';
              s.id = id;
              if (!document.getElementById(id)) {
                document.head.appendChild(s);
              }
            }
          });

          // check if element has slot for children
          if (htm.querySelector(name) && htm.querySelector(name).querySelector('slot')) {
            dox.awaitElement(name).then(function (element) {
              let slot = element.querySelector('slot');
              let children = document.querySelector(name).innerHTML;
              slot.innerHTML = children;
            });
          }

          // remove ``` with <!-- -->
          let matches = html.body.outerHTML.match(/```([\s\S]*?)```/g);

          if (matches) {
            matches.forEach(function (match) {
              html.body.outerHTML = html.body.outerHTML.replaceAll(match, '<!-- ' + match + ' -->');
            });
          }

          // Replace the import with the html
          if (htm.querySelector(name)) {
            htm.querySelectorAll(name).forEach(function (el) {
              let element = document.createElement(el.tagName);

              // set all attributes
              let attributes = el.attributes;
              for (let i = 0; i < attributes.length; i++) {
                element.setAttribute(attributes[i].name, attributes[i].value);
              }

              element.innerHTML = html.body.innerHTML;
              el.replaceWith(element);
            });
          }

          importedElements.push({
            name: name,
            element: html
          });

          // Cache the HTML content
          cached[name] = html.body.innerHTML;
        });
      });

    fetchPromises.push(fetchPromise);
  }

  return Promise.all(fetchPromises).then(function () {
    return htm;
  });
}

function processElement(el) {
  if(debugOn){
    console.log('[Processing Engine]: Deriving values from dynamically appended element -> ', el.element);
  }
  el = el.element;

  let parent = el.parentElement; // Use 'parentElement' instead of 'parent'
  let tagName = el.tagName.toLowerCase();



  importedElements.forEach(function (importedElement) {


    if (importedElement.name === tagName) {

      let newel = handleScripts(importedElement.element).html;

      newel = handleVariables(newel);
      newel = handleMarkdown(newel);
      newel = handleState(newel);
      // Find the corresponding element in the new HTML
      newel = newel.body.querySelector(tagName);
      // awaitElement
    
      // If the new element is empty, don't replace the original element
      if (!newel || newel.innerHTML.trim() === '') {
        return;
      }

      // Create a new element with the same tag name
      let ele = document.createElement(tagName);

      // Copy over the attributes from the original element to the new element
      for (let i = 0; i < el.attributes.length; i++) {
        let { name, value } = el.attributes[i];
        ele.setAttribute(name, value);
        if(debugOn){
          console.log(`[Processing Engine]: Setting attribute for <${tagName}/> -> `, name, value);
        }
      }

      // Copy over the content from the new HTML's element to the new element
      ele.innerHTML = newel.innerHTML;


      // If the new element's content includes 'dox', set do
      ele.setAttribute('data-dynamic_element', 'true')

      if (ele.innerHTML.includes('dox')) {
        setDox(ele);
      }


      // Replace each original element with the new element
      document.querySelectorAll(tagName).forEach(function (e) {
        let duplicate = document.createElement(tagName);
        for (let i = 0; i < e.attributes.length; i++) {
          let { name, value } = e.attributes[i];
          duplicate.setAttribute(name, value);
        }
        
        duplicate.innerHTML = ele.innerHTML;
        
        try {
          e.replaceWith(duplicate);
        } catch (error) {
          if(debugOn){
            console.log('[Processing Engine]: Error replacing element -> ', error);
          }
        }
        if(debugOn){
          console.log('[Processing Engine]: Replacing dynamic element -> ', e, duplicate);
        }
      });
    }
  });
}

 

// Create a function to handle new elements and set up MutationObserver
function observeNewElements() {
  if (observeNewElements.observerActive) return;
  observeNewElements.observerActive = true;

  let observer = new MutationObserver(function (mutations) {
    let isProcessing = false;

    mutations.forEach(function (mutation) {
      if (isProcessing) return;
      isProcessing = true;

      if (mutation.type === 'childList') {
        window.onmessage = function (event) {
          console.log(event.data);
          if (event.data.dox == 'stateChange' && event.data.kill == '$true') {
            return;
          }
        };
        let addedNodes = mutation.addedNodes;
        addedNodes.forEach(function (node) {
          if (node.tagName) {
            let tagName = node.tagName.toLowerCase();
            let el = document.querySelector(tagName) || document.body.querySelectorAll(tagName);
            let parent = node.parentNode;

             if(debugOn){
              console.log('[Processing Engine]: New element added -> ', el, parent, {locked: window.renderLock});
             }
            if (!window.renderLock) {
              // Check if the element's tagName is not the same as the state element's tag
              if(parent && !parent.hasAttribute('data-state')) {
                processElement({
                  element: el,
                  parent: parent,
                });
                document.body.innerHTML = handleProps(document).body.innerHTML;
                if(debugOn){
                   // magenta text
                  console.log('%c[Processing Engine]: waking up 🥱 ', 'color: #ff00ff');
                }
              }
              
              if (document.body.innerHTML.includes('${{')) {
                let matches = document.body.innerHTML.match(/\${{([\s\S]*?)}}/gs);
                if (matches) {
                  matches.forEach(function (match) {
                    let js = match.replace('${{', '').replace('}}', '');
                    js = js.replaceAll('&gt;', '>').replaceAll('&lt;', '<');
                    // replace strings and check for null instance
                    
                    let value;
                    try {
                    value = executeJs(js);
                    } catch (error) {
                      
                      if(debugOn){
                        console.error('%c[Js Parse Engine]: 😭 Error parsing ' + match, 'reason: ' + error, 'parent',  el)  
                      }
                    }

                    document.body.innerHTML = document.body.innerHTML.replaceAll(match, value);
                    if(debugOn){
                       // dark green text
                      console.log(`%c[Js Parse Engine]: Replacing ${match} with -> `,  'color: #006400', value);
                    }
                    return;
                  });
                }
              }
            }
          }
        });
      }

      isProcessing = false;
    });

    observeNewElements.observerActive = false;
  
    observer.disconnect();
    if(debugOn){
        console.log('%c[Processing Engine]: sleeping 😴', 'color: #ff00ff');
    }
    observeNewElements(); // Reconnect the observer for future changes
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

Promise.all(fetchPromises)
  .then(function (fetchedTemplates) {
    templates = fetchedTemplates;
    return Promise.all(
      templates.map(function (template) {
        let d = parser.parseFromString(template.data, 'text/html');
        let matches = d.body.outerHTML.match(/```([\s\S]*?)```/g);


        if (matches) {
          matches.forEach(function (match) {
            d.body.outerHTML = d.body.outerHTML.replaceAll(match, '<!-- ' + match + ' -->');
            if(debugOn){
              console.log('[Comment Parser]: Replacing' + '```' + match + '```' + ' with ' + '<!-- ' + match + ' -->');
            }
          })
        }
        let { beforeRenderScripts } = handleScripts(d);


        let fetchPromises = [];

        beforeRenderScripts.forEach(function (script) {

          if (script.includes('fetch')) {
            setDox(d);
            let fetchPromise =  executeJs(script);
            fetchPromises.push(fetchPromise);
          } else if (script.includes('dox')) {
            setDox(d);
            let s = document.createElement('script');
            let id = template.name + '-script';
            if (!document.getElementById(id)) {
              s.innerHTML = script;
              s.type = 'module';
              
              s.id = id;
              try {
                document.head.appendChild(s);
               } catch (error) {
                  if(debugOn){
                    console.log('[BeforeRender Execution Engine]: something went wrong -> ', error);
                  }
               }
            }
          } else {

            let s = document.createElement('script');
            let id = template.name + '-script';
            if (!document.getElementById(id)) {
              s.innerHTML = script;
              s.type = 'module';

              s.id = id;
             try {
              document.head.appendChild(s);
             } catch (error) {
                if(debugOn){
                  console.log('[BeforeRender Execution Engine]: something went wrong -> ', error);
                }
             }

            }
          }
          if(debugOn){
            let color = script.includes('fetch') ? '#ff00ff' : '#006400';
            let msg = '[BeforeRender Execution Engine]: Executing script -> ' + script;
            console.log('%c' + msg, 'color: ' + color);
          }
        });




        return Promise.all(fetchPromises)
          .then(function () {
            return handleImports(d);
          })
          .then(function (updatedHtml) {
            let { html, beforeRenderScripts } = handleScripts(updatedHtml);




            beforeRenderScripts.forEach(function (script) {
              if (script.includes('dox')) {
                setDox(html);
                let s = document.createElement('script');
                let id = template.name + '-script';

                if (!document.getElementById(id)) {
                  s.innerHTML = script;
                  s.id = id;
                  s.type = 'module';
                  document.head.appendChild(s);
                }
              } else {
                let s = document.createElement('script');
                let id = template.name + '-script';
                if (!document.getElementById(id)) {
                  s.innerHTML = script;
                  s.type = 'module';
                  s.id = id;
                  document.head.appendChild(s);
                }
              }
            });


            Object.keys(window.props).forEach(function (variable) {
              let regex = new RegExp('{{' + variable + '}}', 'g');

              html.body.innerHTML = html.body.innerHTML.replaceAll(regex, window.props[variable]);
            });
            if(debugOn){
              console.log('[Template Parser]: Parsing template -> ', template);
            }

            html = handleMarkdown(html);
            html = handleVariables(html);
            html = handleLogic(html);
            html = handleState(html);
            template.data = html.body.innerHTML;

            


            return {
              template: template

            }
          });
      })
    );
  })
  .then(function (updatedTemplates) {
    let scripts = updatedTemplates
    updatedTemplates.forEach(function (template) {

      if (template.template.data.includes('${{')) {
        let matches =  template.template.data.match(/\${{([\s\S]*?)}}/g);
        if (matches) {
          matches.forEach(function (match) {
            
            let js = match.replace('${{', '').replace('}}', '');
            js = js.replaceAll('&gt;', '>').replaceAll('&lt;', '<');
            let value =  executeJs(js);
            template.template.data = template.template.data.replaceAll(match, value);
          });
        }
      }
      if(debugOn){
        console.log('[Js Parse Engine]: Parsing template -> ', template);
      }
      window[template.template.name] = template.template.data;
      window.dox = dox;

    });



  })
  .then(function () {

    imports.forEach(function (importElement) {
      if (importElement.endsWith('.js')) {
        fetch(importElement)
          .then(response => response.text())
          .then(data => {
            let script = document.createElement('script');
            let id = importElement.split('/').pop().split('.')[0].toLowerCase() + '-script';


            script.id = id;

            script.innerHTML = data;
            script.type = 'module';
            if (!document.getElementById(id)) {

              document.head.appendChild(script);
              
            }

             
          })

      }

    });

    observeNewElements();

  })

  .catch(function (error) {
    console.error('Error fetching templates:', error);
  });