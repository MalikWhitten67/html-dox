let hooked = false;
 
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
  
  
     
  
      
      renderTemplate($elName);
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
      let element = window.config.Dox.root;
      if (hooked) {
        throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");
      }
  
      let xhr = new XMLHttpRequest();
      xhr.open('GET', file);
      xhr.responseType = 'blob';
      xhr.onload = function () {
        if (file.endsWith(".png" || ".jpg" || ".jpeg" || ".gif" || ".svg" || ".ico")) {
          document.querySelector(element).style = `
            position: fixed;
           top: 0;
          left: 0;
         width: 100%;
       height: 100%;
      background-color: black;
            
            `;
          document.querySelector(element).innerHTML = ` 
    <img src="${file}" style="resize: none; border: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"/>`
        } else if (file.endsWith(".json")) {
          fetch(file)
            .then(response => response.json())
            .then(data => {
              const jsonData = JSON.stringify(data);
              const html = `<textarea style="width:100%;height:100%; resize:none; border:none;">${jsonData}</textarea>`
              document.querySelector(element).innerHTML = html;
            })
        } else if (file.endsWith(".js")) {
          fetch(file)
            .then(response => response.text())
            .then(data => {
              const html = `<textarea style="width:100%;height:100%; resize:none; border:none;">${data}</textarea>`
              document.querySelector(element).innerHTML = html;
            })
        } else if (file.endsWith(".css")) {
          fetch(file)
            .then(response => response.text())
            .then(data => {
              const html = `<textarea style="width:100%;height:100%; resize:none; border:none;">${data}</textarea>`
              document.querySelector(element).innerHTML = html;
            })
        } else if (file.endsWith(".html")) {
          fetch(file)
            .then(response => response.text())
            .then(data => {
              const html = `<textarea style="width:100%;height:100%; resize:none; border:none;">${data}</textarea>`
              document.querySelector(element).innerHTML = html;
            })
        } else if (file.endsWith(".img") || file.endsWith(".png") || file.endsWith(".jpg") || file.endsWith(".jpeg") || file.endsWith(".gif") || file.endsWith(".svg") || file.endsWith(".ico")) {
          document.querySelector(element).innerHTML = `
                <img src="${file}" 
                
                style="width:100%;height:100%; resize:none; border:none; position:absolute; top:0; left:0;"
                 
                />
                `
        } else if (file.endsWith(".pdf")) {
          document.querySelector(element).innerHTML = `
                <embed src="${file}" 
                
                style="width:100%;height:100%; resize:none; border:none; position:absolute; top:0; left:0;"
                 
                />
                `
        } else if (file.endsWith('.mp4') || file.endsWith('.webm') || file.endsWith('.ogg')) {
          let video = document.createElement('video');
          video.src = file;
          video.controls = true;
          document.querySelector(element).appendChild(video);
        } else {
          let audio = document.createElement('audio');
          audio.src = file;
          audio.controls = true;
          document.querySelector(element).appendChild(audio);
        }
        let a = document.createElement('a');
        a.href = window.URL.createObjectURL(xhr.response);
        a.download = file;
        a.click();
      };
      xhr.send();
    }
  }

/**
 * @fileoverview Router class for handling routing throughout your app.
 * @version 1.0.3
 * @license MIT
 * @example
 * import Router from "./router/router.js" || use window.Router
 * const app = new Router('/')
 * app.use('/')
 * app.get('/', (req, res) => {
 *   res.return() // remove last hook
 *   res.render('index')
 * })
 * app.on('/', (req, res) => {
 *  res.return() // remove last hook
 * res.render('index')
 * })
 */
class Router {
    constructor(rootPath) {
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
      if(rootPath){
        this.root(rootPath, () => {})
      }
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
          if (window.config.log === 'true') {
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
  
  /**
 * Represents a method for handling POST requests throughout your app.
 *
 * @method post
 * @param {string} path - The path for the POST request.
 * @param {postCallback} callback - The callback function to handle the request.
 */

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
  
  /**
 * Callback function for handling POST requests.
 *
 * @callback postCallback
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 */
  
  

    /**
     * Represents a method for listening to POST requests throughout your app.
     * @method listen
     * @param {string} path - The path for the POST request.
     * @param {postCallback} callback - The callback function to handle the request.
     * @returns {void}
     * @example
     * app.listen('/test', (req, res) => {
     *  console.log(req.data)
     * })
     * 
     */
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
  
      if(window.config.log === 'true'){
        console.log(`[DoxDom: Listening for POST requests on route ${path}]`)
      }
      window.addEventListener("message", listener);
      this.listeners[path] = listener;
    }
    /**
     * kill a listener
     *  @method stopListening
     * @param {string} path - The path for the POST request.
     * @returns {void}
     * @example
     * app.stopListening('/test')
     * 
     * 
     * **/
  
    stopListening(path) {
      const listener = this.listeners[path];
  
      if (listener) {
        window.removeEventListener("message", listener);
        delete this.listeners[path];
      }
    }
    /**
     * @method use
     * @param {*} path 
     * @returns {void}
     * @example
     * app.use('/test')
     * @description - bind paths to the router to be used within methods
     */
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
  
  
   /**
    * @method bindRoot
    * @param {*} element 
    * @dprecated - dox2.0 handles it based on the config file
    */
    bindRoot(element) {
      this.rootElement = element
    }
  
    /**
     * @method onload
     * @param {*} callback 
     * @returns {void}
     * @example
     * app.onload(() => {
     *  console.log("loaded")
     * })
     */

    onload(callback) {
       if(document.readyState === "complete" || document.readyState === "interactive" ) {
         callback()
       }
    }
  
    /**
     * @method on
     * @param {*} path 
     * @param {*} callback 
     * @description - listen for patch changes and if path matches run callback
     * @returns {void}
     * @example
     * app.on('/test', (req, res) => {
     * res.render('test')
     * })
     */
  
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
  export default Router
  window.Router = Router