/***
 * @fileOverview A sequential reactive templating engine for HTML.
 * @version 2.0.0
 * @license MIT
 * 
 */

let imports = document.querySelector('meta[imports]').getAttribute('imports');
let parser = new DOMParser();
let useConfigPath = document.querySelector('meta[doxconfig]') ? document.querySelector('meta[doxconfig]').getAttribute('path') : null;
let hotload = document.querySelector('meta[hotload]') ? document.querySelector('meta[hotload]').getAttribute('hotload') : null;
if (useConfigPath) {
   // ensure browser caches this
   if(hotload === 'true'){
      useConfigPath = useConfigPath + '?t=' + Date.now();
   }
   fetch(useConfigPath)
   .then(function (response) {
      return response.text();
   })
   .then(function (data) {
      window.config = JSON.parse(data);
   });
}else{
   throw new Error('No config path specified please set a <meta doxconfig="path/to/config.json"> tag in your html file');
}

/**
 * Allows you to set types through interfaces.
 * @type {Object.<string, Object>}
 */
window.types = {};

/**
 * Retrieves template data from imported URLs, parses them, and stores them as functions in window.templates.
 * @type {Object.<string, Function>}
 */

window.templates = {};
window.scripts = {};
window.props = {};
function handleProps(data) {
 let propregex = /{{prop.(\w+)}}/g;
 let matches = propregex.exec(data);
 if(matches){
   let name = matches[1];
   return [name]
 }

}
async function handleScriptImports(data) {
   let doc = parser.parseFromString(data, 'text/html');
   let imports = doc.querySelectorAll('import');

   // Create an array to store fetch promises
   const fetchPromises = [];

   imports.forEach(async function (script) {
      let src = script.getAttribute('src');
      let name = src.split('/').pop().split('.')[0].toLowerCase();
       
      if (!cache[src]) {
         fetchPromises.push(
            fetch(src)
               .then(function (response) {
                  return response.text();
               })
               .then(function (html) {
                   

                  // Encode &gt; and &lt; before using DOMParser
                  html = html.replace(/&gt;/g, '&amp;gt;').replace(/&lt;/g, '&amp;lt;');

                  cache[src] = html;

                  // Use DOMParser to parse the fetched HTML content
                  let parsedHtml = new DOMParser().parseFromString(html, 'text/html');
                  let props = handleProps(html);
                  if(props){
                     props.forEach(function(prop){
                        doc.querySelectorAll(`[${prop}]`).forEach(function (element) {
                           let propValue = element.getAttribute(prop);
                           if(!window.props[prop]){
                              window.props[prop] = propValue;
                           }
                           parsedHtml.body.innerHTML = parsedHtml.body.innerHTML.replaceAll(`{{prop.${prop}}}`, propValue);
                           
                        });
                     });
                  }
                  if (doc.querySelector(name)) {
                     doc.querySelectorAll(name).forEach(function (element) {
                        
                        element.innerHTML = parsedHtml.body.querySelector(name).innerHTML
                     });
                  }
                   
               })
         );
      } else {
         if (doc.querySelector(name)) {
            // Use DOMParser to parse the cached HTML content
            let parsedCachedHtml = new DOMParser().parseFromString(cache[src], 'text/html');
            let props = handleProps(html);
                  if(props){
                     props.forEach(function(prop){
                        doc.querySelectorAll(`[${prop}]`).forEach(function (element) {
                           let propValue = element.getAttribute(prop);
                           if(!window.props[prop]){
                              window.props[prop] = propValue;
                           }
                           parsedCachedHtml.body.innerHTML = parsedCachedHtml.body.innerHTML.replaceAll(`{{prop.${prop}}}`, propValue);
                           
                        });
                     });
                  }
                  
            doc.querySelectorAll(name).forEach(function (element) {
               element.innerHTML = parsedCachedHtml.body.querySelector(name).outerHTML;
            });
         }
      }
   });

   // Wait for all fetch promises to complete
   await Promise.all(fetchPromises);

   // Update the data with the updated HTML
   data = doc.body.innerHTML;

   // Decode &gt; and &lt; back to original characters
   data = data.replaceAll(/&gt;/g, '>').replaceAll(/&lt;/g, '<');

   return data;
}

/**
 * @function handleMarkdown
 * @param {*} html 
 * @returns  {string} - The updated html string.
 * @description - allows you to use markdown in your html templates
 */
 
function handleMarkdown(html) {
   if(window.config.Logs === "true"){
      console.log('🛠️ Markdown processor Active')
   }
   const parser = new DOMParser();
   let doc = parser.parseFromString(html, 'text/html');
   let c = doc.body;

   let h = c.innerHTML;

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

   if (h.match(codeRegex)) {
       h = h.replaceAll(codeRegex, '<code>$1</code>');
   }

   if (h.match(linkRegex)) {
       h = h.replace(linkRegex, '<a style="color: #007bff; text-decoration:none" href="$2">$1</a>');
   }

   if (h.match(quoteRegex)) {
       h = h.replace(quoteRegex, '<blockquote style="border-left: 5px solid #eeeeee; padding-left: 10px;">$1</blockquote>');
   }

   if (h.match(hrRegex)) {
       h = h.replace(hrRegex, '<hr>');
   }

   if (h.match(strongRegex)) {
       h = h.replace(strongRegex, '<strong>$1</strong>');
   }

   h = h.replace(headingRegex, function (match, p1) {
       let level = match.split(' ')[0].length;

       if (level > 6) {
           throw new Error('Heading level cannot be greater than 6');
       }
       return '<h' + level + '>' + p1 + '</h' + level + '>';
   });

   if (h.match(tableRegex)) {
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
   }

   if (h.match(emRegex)) {
       h = h.replace(emRegex, '<em>$1</em>');
   }

   if (h.match(ulRegex)) {
       // Handle nested unordered lists
       let nestedHtml = h.replace(/<li>(.+)<\/li>/g, '<li><ul><li>$1</li></ul></li>');
       h = nestedHtml.replace(ulRegex, '<li>$1</li>');
   }

   if (h.match(olRegex)) {
       // Handle nested ordered lists
       let nestedHtml = h.replace(/<li>(.+)<\/li>/g, '<li><ol><li>$1</li></ol></li>');
       h = nestedHtml.replace(olRegex, '<li>$1</li>');
   }

   c.innerHTML = h;

   if(window.config.Logs === "true"){
      console.log('😴 Markdown processor Sleeping')
   }
   return doc.documentElement.innerHTML;
}

/**
 * @ function handleEmojis
 * @param {*} html 
 * @version 1.0.0
 * @returns 
 * @description - allows you to use emojis in your html templates
 * @example
 * // use emojis in your html templates to enable set emojiEngine.active to true in config.json
 * <p> :thumbsup: </p>
 * // use custom emojis in your html templates - see config.json
 * <p> :custom_emoji: </p>
 */
function handleEmojis(html){
   let defaults = {
      ":thumbsup:": "👍",
      ":thumbsdown:": "👎",
      ":heart:": "❤️",
      ":broken_heart:": "💔",
      ":star:": "⭐",
      ":star2:": "🌟",
      ":exclamation:": "❗",
      ":question:": "❓",
      ":warning:": "⚠️",
      ":poop:": "💩",
      ":clap:": "👏",
      ":muscle:": "💪",
      ":pray:": "🙏",
      ":smile:": "😄",
      ":smiley:": "😃",
      ":grin:": "😀",
      ":laughing:": "😆",
      ":sweat_smile:": "😅",
      ":joy:": "😂",
      ":rofl:": "🤣",
      ":relaxed:": "☺️",
      ":ok_hand:": "👌",
      ":100:": "💯",
   }
   let userEmojis = window.config.Emoji.emojis ? window.config.Emoji.emojis : {};
   let emojis = {...defaults, ...userEmojis};
   
   let doc = parser.parseFromString(html, 'text/html');
   let c = doc.body;
   let h = c.innerHTML;
   for (const emoji in emojis) {
      if(!emoji.startsWith(':') || !emoji.endsWith(':')){
         throw new Error('Emoji must be in the format :emoji:')

      }
      if (Object.hasOwnProperty.call(emojis, emoji)) {
        let value = emojis[emoji];
          // set to an img element if a path
          if(value.startsWith('http') || value.startsWith('www') || value.startsWith('./')){
            value = `<img src="${value}" width="32px" height="32px" />`
          }
         h = h.replaceAll(emoji, value);
      }
   }
   c.innerHTML = h;
   return doc.documentElement.innerHTML;
}




/**
 * Holds the current application states.
 * @type {Object.<string, any>}
 */
window.states = sessionStorage.getItem('states') ? JSON.parse(sessionStorage.getItem('states')) : {};
/**
 * Fetches template data from imported URLs and stores them as functions.
 * @type {Promise<[]>}
 */
let fetchPromises = imports.split(',').map(async function (imported) {
   let name = imported.split('/').pop().split('.')[0].toLowerCase();
   
   try {
       let response = await fetch(imported);
       let data = await response.text();
       
       if (imported.endsWith('.html')) {
           data = await handleScriptImports(data);

           let func = new Function('data', 'return `' + data + '`');
           window.templates[name] = func;
           return {
               func: func,
               name: name,
           };
       } else {
           window.scripts[name] = data;
           return {
               script: data,
               name: name,
           };
       }
  
   } catch (error) {
       if(window.config.Logs === "true"){
            console.error('FETCH ERROR: ' + error);
       }
       return null;
   }
});

/**
 * Stores a state value and triggers an event to notify state changes.
 * @param {string} name - The name of the state.
 * @param {any} value - The value to set for the state.
 * @return {any} - The updated state value.
 */
 
function useState(name, value) {
 if(window.config.TypeChecking.active){
   if (window.types[name] &&   window.types[name].isUsed === "true") {
      validateType(value, window.types[name].type);
   }  
 }
  window.states[name] = value;
   
  sessionStorage.setItem('states', JSON.stringify(window.states));
  window.dispatchEvent(new CustomEvent('stateChange', { detail: { name: name, value: value } }));
  return window.states[name];
}

/**
 * @function useAuth
 * @param {*} rulesets 
 * @param {*} user 
 * @returns  {Object} - The auth object.
 * @description - allows you to set permissions for users and roles for your application
 * @example
 * // set permissions for users and roles
 * let auth = useAuth([
 * {action: 'read', role: 'admin'},
 * {action: 'write', role: 'admin'},
 * {action: 'delete', role: 'admin'},
 * {action: 'read', role: 'user'},
 * ], {roles: ['admin']});
 * // check if user can perform action
 * let canRead = auth.canPerform('read');
 * // check if user has role
 * let hasRole = auth.hasRole('admin');
 * // get user roles
 * let roles = auth.getRoles();
 * // revoke user role
 * auth.revoke('read', 'admin');
 * // grant user role
 * auth.grant('read', 'admin');
 * 
 */
function useAuth(rulesets, user) {
   const permissions = {};

   // Initialize permissions based on rulesets
   for (const ruleset of rulesets) {
       permissions[ruleset.action] = permissions[ruleset.action] || [];
       permissions[ruleset.action].push(ruleset.role);
   }

   return {
       canPerform: (action) => {
           if (!user) {
               return false; // If there's no user, deny access
           }

           const allowedRoles = permissions[action] || [];
           return user.roles.some(role => allowedRoles.includes(role));
       },

       revoke: (action, role) => {
           if (permissions[action]) {
               permissions[action] = permissions[action].filter(existingRole => existingRole !== role);
           }
       },

       grant: (action, role) => {
           if (!permissions[action]) {
               permissions[action] = [];
           }

           if (!permissions[action].includes(role)) {
               permissions[action].push(role);
           }
       },

       hasRole: (role) => user ? user.roles.includes(role) : false,

       getRoles: () => user ? user.roles : [],

       // Add more methods for fine-grained permissions, role hierarchy, etc.
   };
}

window.useAuth = useAuth;


/**
 * A shorthand for useState function.
 * @function
 */

window.setState = (name, value) => useState(name, value);

/**
 * Gets the value of a state.
 * @param {string} name - The name of the state.
 * @return {any} - The value of the state.
 */

window.getState = (name) => window.states[name];
/**
 * Adds an event listener to execute a callback function on state change.
 * @param {string} stateName - The name of the state to listen for changes.
 * @param {function} callback - The function to execute when the state changes.
 */

function effectOnStateChange(stateName, callback) {
  window.addEventListener('stateChange', function (e) {
    if (e.detail.name === stateName) {
      callback(e.detail.value);
    }
  });
}
/**
 * Handles custom logic for templates (to be implemented).
 * @param {Object} data - The template data.
 * @returns {string} - The template with logic applied.
 */

function handleLogic(data) {
   // soon
}

/**
 * Sanitizes a string of HTML content using the Sanitizer API.
 * @param {string} data - The unsanitized HTML content.
 * @returns {string} - The sanitized HTML content.
 */



 
function useSanitizer(data) {
   if (window.Sanitizer && window.config && window.config.Sanitizer && window.config.Sanitizer.active || window.config.Sanitizer.useSanitizer.active) {
      let doc = parser.parseFromString(data, 'text/html');
      let configMeta =  window.config ? window.config.Sanitizer : null;
     
      
      let sanitizerConfig = configMeta ? JSON.parse(config) : null;
      let defaultConfig = {
         allowElements: [],
         blockElements: [],
         dropElements: [],
         allowAttributes: {},
         dropAttributes: {},
         allowCustomElements: true,
         allowComments: true
      };
      let combinedConfig = sanitizerConfig || defaultConfig;
      
      let sanitizer = new Sanitizer(combinedConfig);
      let unsanitized_string = data;
      doc.body.setHTML(unsanitized_string, { sanitizer });
      return doc.body.innerHTML;
   } else if(!window.Sanitizer){
      console.warn('useSanitizer is only available in Chrome, Edge, and Opera at the moment.');
      return data;
   }else{
      return data;
   }
}
 
window.useSanitizer = (data) => useSanitizer(data);


 /**
 * Extracts and binds functions from template data to window object.
 * @param {Object} data - The template data.
 * @returns {string} - The updated template data.
 */
 function handleFunctions(data) {
   let functionRegex = /function\s+(\w+)\s*\(([\s\S]*?)\)\s*{([\s\S]*?)\s*}\s*(?=\n|<|;|$)/g;
   let match;

   while ((match = functionRegex.exec(data.html)) !== null) {
       let name = match[1];
       let args = match[2] || 'empty';
       let body = match[3];

       let paramTypes = {};
       let argsList = args.split(',').map(part => part.trim());

       argsList.forEach(function (param) {
           if (param === '') {
               return;
           }

           let [key, value] = param.split(':').map(part => part.trim());
           if (value) {
               paramTypes[key] = value;
           }
       });

       if (args.includes(':')) {
           args = args.replaceAll(':', ' = '); // convert to keyword arguments
       }

       // async function
       if(window.config.Logs){
         console.log('🛠️ creating async function ' + name)
       }
       let func = new Function(`
           return async function ${name}(${args || ''}) {
               ${body}

               if (window.config.TypeChecking.active && window.types['${name}'] && window.types['${name}'].isUsed === 'true'
                   && window.types['${name}'].params.length > 0
               ) {
                   let params = Array.from(arguments);
                   let paramTypes = ${JSON.stringify(paramTypes)};

                   for (let i = 0; i < params.length; i++) {
                       let param = params[i];
                       if (window.types['${name}'].params.includes(Object.keys(paramTypes)[i])) {
                           let type = paramTypes[Object.keys(paramTypes)[i]];

                           if (type) {
                               validateType(param, type);
                           }
                       }
                   }
               }
           }
       `)();
       

       window[name] = func;

       
   }

   return data.html;
}



/**
 * Handles variable substitution in template data.
 * @param {Object} data - The template data.
 * @returns {string} - The updated template data.
   */
 
 
async function handleVariables(data) {
   var variableRegex = /let\s+(\w+)\s*=\s*([\s\S]*?)(?:;|$)/g;
   var variables = {};
   var match;
 
   // Collect variables and their values
   while ((match = variableRegex.exec(data.html)) !== null) {
     var name = match[1];
     var value = match[2];
 
     // Evaluate the value if it's not a state
     if (!window.states[name]) {
       if (value.startsWith('fetch')) {
         // Handle fetch asynchronously and set the value
         value = await new Function(`return ${value}`)();
       } else {
         value =  new Function(`return ${value}`)();
       }
 

     
       window.states[name] = value;
       window[name] = value;
       sessionStorage.setItem('states', JSON.stringify(window.states));
     } else {
       value = window.states[name]; // Use the stored state value
     }
 
     variables[name] = value;
   }
 
   // Replace variable placeholders in the template
   for (var variable in variables) {
     data.html = data.html.replaceAll(new RegExp(`{{${variable}}}`, 'g'), variables[variable]);
   }
 
   return data.html;
 }

 // Function to handle type validation
 function validateType(value, expectedType, fnparams = null) {
   if(window.config.Logs === "true"){
      console.log('🛠️ Type engine Active')
   }
   if (expectedType === 'Function'){
       return;
   }
   if (expectedType === 'Array') {
      if (!Array.isArray(value)) {
         throw new Error(`Type mismatch. Expected array but got ${typeof value}`);
      }
   } else if (expectedType === 'Number') {
      if (typeof value !== 'number' || isNaN(value)) {
         throw new Error(`Type mismatch. Expected number but got ${typeof value}`);
      }
   } else if (typeof value !== expectedType.toLowerCase()) {
      throw new Error(`Type mismatch. Expected ${expectedType} but got ${typeof value}`);
   }
   if(window.config.Logs === "true"){
      console.log('😴 Type engine Sleeping')
   }
}

// Function to check and handle type definitions
function handleTypes(data) {
   let doc = parser.parseFromString(data, 'text/html');
   let scripts = doc.querySelectorAll('script[types]');
   
   // Create a map to store type definitions
   const typeDefinitions = new Map();

   scripts.forEach(function (script) {
      let s = script.innerHTML;
      let interfaceRegex = /interface\s+(\w+)\s*{([\s\S]*?)\s*}\s*(?=\n|<|;|$)/g;
      
      while ((match = interfaceRegex.exec(s)) !== null) {
         let interfaceName = match[1];
         let interfaceBody = match[2];

         // Parse interface body into an object
         let typeDefinition = {};
         interfaceBody.split(',').forEach(function (line) {
            let [key, value] = line.split(':').map(part => part.trim());
            typeDefinition[key] = value;
             
         });

         typeDefinitions.set(interfaceName, typeDefinition);
      }
   });

   typeDefinitions.forEach(function (typeDefinition, interfaceName) {
      const value = window[interfaceName];
       
     if(typeDefinition.isUsed === "false"){
      return
     }
      if(typeDefinition.type === 'Function'){
         window.types[interfaceName] = typeDefinition;
         return
      }
      validateType(value, typeDefinition.type);
      window.types[interfaceName] = typeDefinition;
   });
   
   return data;
}

/**
 * Handles scripts in the template by executing or processing them.
 * @param {Object} data - The template data.
 * @returns {string} - The updated template data.
 */
const cache = {};

 

async function handleScripts(data) {
   if(window.config.Logs === "true"){
      console.log('🛠️ Script engine Active')
   }
   try {
      let doc = parser.parseFromString(data.html, 'text/html');
      let scripts = doc.querySelectorAll('script');

      for (let i = 0; i < scripts.length; i++) {
         let script = scripts[i];
         if (script.hasAttribute('execute')) {
            let s =  document.createElement('script');
            s.innerHTML = script.innerHTML;
            s.type = 'module';
            document.head.appendChild(s);
         } else {
            data.html = await handleVariables({
               html: data.html,
               name: data.name,
            });
            
            if (window.config.TypeChecking.active) {
               handleTypes(data.html);
            }

            data.html = await handleFunctions({
               html: data.html,
               name: data.name,
            });
            if(window.config.Markdown.active){
            data.html = await handleMarkdown(data.html);
            }
            if(window.config.Emoji.active){
               data.html = await handleEmojis(data.html);
            }

            
         }
      }
   } catch (error) {
      throw new Error(error);
   }
   if(window.config.Logs === "true"){
      console.log('😴 Script engine Sleeping')
   }

   return data;
}


/**
 * Registers a template in the window.templates object.
 * @param {string} name - The name of the template.
 * @param {Function} data - The template function.
 */

function registerTemplate(name, data) {
  window.templates[name] = data;
}
/**
 * Renders a template by applying logic, scripts, and variables.
 * @param {string} selector - The HTML selector to render the template in.
 * @param {string} name - The name of the template.
 */

async function renderTemplate(name) {
 
 try {
   let template = window.templates[name];
  if(template){
 
   let html = await template();
    
   html = await handleScripts({
      html: html,
      name: name,
    });
     
   let doc = parser.parseFromString(await html.html, 'text/html');
   if(window.Sanitizer && window.config  && window.config.Sanitizer && window.config.Sanitizer.active){
      console.warn('Sanitizer is active - please disable to enable client execution')
      let sanitizer = new Sanitizer();
      let unsanitized_string = await template();
      doc.body.setHTML(unsanitized_string, { sanitizer });
   }
  
    
    
   doc.firstChild.id = name;
   document.querySelector(window.config.Dox.root).innerHTML = doc.firstChild.outerHTML;
  }
 } catch (error) {
   console.error('TEMPLATE ERROR: ' + error);
 }
}

/**
 * Executes when all fetch promises are resolved, registering templates and handling state changes.
 * @param {Array.<Object>} templates - The fetched templates.
 */

Promise.all(fetchPromises).then(function (templates) {
  
  // remove templats with .script
   templates = templates.filter(function (template) {
      return !template.script;
   });
  templates.forEach(function (template) {
    
    registerTemplate(template.name, template.func);
    
    var variableRegex = /let\s+(\w+)\s*=\s*([\s\S]*?)(?:;|$)/g;
    var match;

    while ((match = variableRegex.exec(template.func())) !== null) {
      var stateName = match[1];
      effectOnStateChange(stateName, function (newValue) {
        window.states[stateName] = newValue;
        sessionStorage.setItem('states', JSON.stringify(window.states));
        renderTemplate(template.name);
      });
    }
  });
  window.renderTemplate = renderTemplate;

  
  
}).then(function () {
   
   Object.keys(window.scripts).forEach(function (script) {
   let s = document.createElement('script');
   s.innerHTML = window.scripts[script];
   s.type = 'module';
   document.head.appendChild(s);
  });
});

window.onbeforeunload = function () {
  sessionStorage.removeItem('states');
};
