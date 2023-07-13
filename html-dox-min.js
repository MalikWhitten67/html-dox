let imports=document.querySelector("meta[imports]").getAttribute("imports"),hooked=!1;imports=imports.split(",");let templates=[],parser=new DOMParser;window.variables={},window.state={},window.props={};let fetchPromises=imports.map((function(e){let t=e.split("/").pop().split(".")[0].toLowerCase();return fetch(e).then((function(e){return e.text()})).then((function(e){return{name:t,data:e}}))}));function handleVariables(e){return Object.keys(window.variables).forEach((function(t){if(Array.isArray(window.variables[t])){return window.variables[t].forEach((function(n){Object.keys(n).forEach((function(s){let r=n[s],o=new RegExp("{{"+t+"."+s+"}}","g");e.body.innerHTML=e.body.innerHTML.replaceAll(o,r)}))})),e}let n=new RegExp("{{"+t+"}}","g");e.body.innerHTML=e.body.innerHTML.replaceAll(n,window.variables[t])})),e}function doxMethods(e){return{html:function(t){if(!t)return e.innerHTML;e.innerHTML=t},add:function(t,n){let s=document.createElement(t);return Object.keys(n).forEach((function(e){s.setAttribute(e,n[e])})),e.appendChild(s),s}}}function setVar(e,t){window.variables[e]=t}function getState(e){return window.state[e]}function setState(e,t){window.postMessage({type:"state",name:e,value:t},"*"),window.state[e]=t}function effect(e,t){window.addEventListener("message",(function(n){"state"==n.data.type&&n.data.name==e&&t(n.data.value)}))}function setDox(e){let t={querySelector:function(t){return doxMethods(e.body.querySelector(t)||document.querySelector(t))},driver:function(e,n){t[e]=n},add:function(t,n){let s=document.createElement(t);return Object.keys(n).forEach((function(e){s.setAttribute(e,n[e])})),e.body.appendChild(s),doxMethods(s)},setVar:setVar};window.dox=t,window.setState=setState,window.getState=getState,window.effect=effect}function handleScripts(e){if(e){for(var t=e.body.querySelectorAll("script"),n=/let\s+(\w+)\s*=\s*([\s\S]*?)(?:;|$)/g,s=[],r=[],o=0;o<t.length;o++){var i=t[o];if(i.hasAttribute("execute")||i.hasAttribute("props")){if("beforeRender"===i.getAttribute("execute")){h=i.innerHTML;s.push(h)}else if("afterRender"===i.getAttribute("execute")){h=i.innerHTML;r.push(h)}else if(i.hasAttribute("props")){for(h=i.innerHTML;null!==(a=n.exec(h));){d=a[1].trim();(l=a[2].trim()).includes("{")&&(l=(l=l.replace("{","").replace("}","").trim()).split(",").map((function(e){var t=e.split(":")[0].trim(),n=e.split(":")[1].trim(),s={};return s[t]=n,s})))}window.props[d]=l}}else for(var a,h=i.innerHTML;null!==(a=n.exec(h));){var l,d=a[1].trim();(l=a[2].trim().replace(/"/g,"")).includes("{")&&(l=(l=l.replace("{","").replace("}","").trim()).split(",").map((function(e){var t=e.split(":")[0].trim(),n=e.split(":")[1].trim(),s={};return s[t]=n,s}))),window.variables[d]=l,e=handleVariables(e)}}return{html:e,beforeRenderScripts:s,afterRenderScripts:r}}}function handleImports(htm){let imports=htm.querySelectorAll("import"),fetchPromises=[];for(var i=0;i<imports.length;i++){let src=imports[i].getAttribute("src"),name=src.split("/").pop().split(".")[0].toLowerCase(),fetchPromise=fetch(src).then((function(e){return e.text()})).then((function(data){let d=parser.parseFromString(data,"text/html");return handleImports(d).then((function(updatedHtml){let{html:html,beforeRenderScripts:beforeRenderScripts,afterRenderScripts:afterRenderScripts}=handleScripts(updatedHtml);if(beforeRenderScripts.forEach((function(script){script.includes("dox")&&setDox(html),eval(script)})),html.body.outerHTML.includes("`")){let e=html.body.outerHTML.split("```")[1];html.body.outerHTML=html.body.outerHTML.replaceAll("```"+e+"```","\x3c!-- "+e+" --\x3e")}Object.keys(window.props).forEach((function(e){htm.querySelector(name).getAttribute(e)?(window.props[e]=window.props[e].replace(/"/g,""),html.querySelector(name).outerHTML=html.querySelector(name).outerHTML.replaceAll("{{"+e+"}}",htm.querySelector(name).getAttribute(e))):(window.props[e]=window.props[e].replace(/"/g,""),html.querySelector(name).outerHTML=html.querySelector(name).outerHTML.replaceAll("{{"+e+"}}",window.props[e]))})),htm.querySelector(name).innerHTML=html.body.querySelector(name).innerHTML}))}));fetchPromises.push(fetchPromise)}return Promise.all(fetchPromises).then((function(){return htm}))}setDox(document),Promise.all(fetchPromises).then((function(fetchedTemplates){return templates=fetchedTemplates,Promise.all(templates.map((function(template){let d=parser.parseFromString(template.data,"text/html");if(d.body.outerHTML.includes("`")){let e=d.body.outerHTML.split("```")[1];d.body.outerHTML=d.body.outerHTML.replaceAll("```"+e+"```","\x3c!-- "+e+" --\x3e")}let{beforeRenderScripts:beforeRenderScripts}=handleScripts(d),fetchPromises=[];return beforeRenderScripts.forEach((function(script){if(script.includes("fetch")){setDox(d);let fetchPromise=eval(script);fetchPromises.push(fetchPromise)}else script.includes("dox")&&(setDox(d),eval(script))})),Promise.all(fetchPromises).then((function(){return handleImports(d)})).then((function(updatedHtml){let{html:html,beforeRenderScripts:beforeRenderScripts,afterRenderScripts:afterRenderScripts}=handleScripts(updatedHtml);return beforeRenderScripts.forEach((function(script){script.includes("dox")&&(setDox(html),eval(script))})),template.data=html.body.innerHTML,afterRenderScripts.forEach((function(script){eval(script)})),template}))})))})).then((function(updatedTemplates){updatedTemplates.forEach((function(template){window[template.name]=template.data,window.dox=dox;let methods={hashChangeListener:null,rootElement:null,title:e=>{if(hooked)throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");document.title=e,hooked=!0},setCookie:(e,t,n)=>{if(hooked)throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");let s=`${e}=${t};`;n&&(n.path&&(s+=`path=${n.path};`),n.domain&&(s+=`domain=${n.domain};`),n.maxAge&&(s+=`max-age=${n.maxAge};`),n.httpOnly&&(s+=`httpOnly=${n.httpOnly};`),n.secure&&(s+=`secure=${n.secure};`),n.sameSite&&(s+=`sameSite=${n.sameSite};`)),document.cookie=s},getCookie:e=>{const t=document.cookie.split(";");for(let n=0;n<t.length;n++){const s=t[n].trim(),r=s.split("=")[0];if(r===e){const e=s.split("=")[1];s.split(";").slice(1).map((e=>{const[t,n]=e.split("=").map((e=>e.trim()));return{[t]:n}})).reduce(((e,t)=>Object.assign(e,t)),{});return{name:r,value:e}}}return null},saveState:()=>{if(hooked)throw new Error("State has already been saved cannot save again");const e=window.location.hash.substring(1);window.sessionStorage.getItem(e)?window.location.hash=window.sessionStorage.getItem(e):window.sessionStorage.setItem(e,e),hooked=!0},restoreState:()=>{if(hooked)throw new Error("State has already been restored cannot restore again");let e=window.location.hash.substring(1);window.sessionStorage.getItem(e)?window.location.hash=window.sessionStorage.getItem(e):window.location.hash=this.currentUrl,hooked=!0},send:e=>{if(hooked)throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");document.getElementById(methods.rootElement).innerHTML=e,hooked=!0},render:e=>{if(hooked)throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");document.getElementById(methods.rootElement).innerHTML=window[e],hooked=!0},return:()=>{hooked&&(hooked=!1),methods.hashChangeListener&&(window.removeEventListener("hashchange",methods.hashChangeListener),methods.hashChangeListener=null,console.log("removed last event listener"))},sendStatus:(e,t)=>{if(hooked)throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");if("number"!=typeof t)throw new Error("Invalid status code");document.getElementById(this.rootElement).innerHTML=JSON.stringify({msg:e,code:t}),hooked=!0},redirect:e=>{if(hooked)throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");window.location.hash=e,hooked=!0},sendFile:e=>{let t=this.rootElement;if(hooked)throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");let n=new XMLHttpRequest;n.open("GET",e),n.responseType="blob",n.onload=function(){if(e.endsWith(".png"))document.getElementById(t).style="\n              position: fixed;\n             top: 0;\n            left: 0;\n           width: 100%;\n         height: 100%;\n        background-color: black;\n              \n              ",document.getElementById(t).innerHTML=` \n      <img src="${e}" style="resize: none; border: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"/>`;else if(e.endsWith(".json"))fetch(e).then((e=>e.json())).then((e=>{const n=`<textarea style="width:100%;height:100%; resize:none; border:none;">${JSON.stringify(e)}</textarea>`;document.getElementById(t).innerHTML=n}));else if(e.endsWith(".js"))fetch(e).then((e=>e.text())).then((e=>{const n=`<textarea style="width:100%;height:100%; resize:none; border:none;">${e}</textarea>`;document.getElementById(t).innerHTML=n}));else if(e.endsWith(".css"))fetch(e).then((e=>e.text())).then((e=>{const n=`<textarea style="width:100%;height:100%; resize:none; border:none;">${e}</textarea>`;document.getElementById(t).innerHTML=n}));else if(e.endsWith(".html"))fetch(e).then((e=>e.text())).then((e=>{const n=`<textarea style="width:100%;height:100%; resize:none; border:none;">${e}</textarea>`;document.getElementById(t).innerHTML=n}));else if(e.endsWith(".img")||e.endsWith(".png")||e.endsWith(".jpg")||e.endsWith(".jpeg")||e.endsWith(".gif")||e.endsWith(".svg")||e.endsWith(".ico"))document.getElementById(t).innerHTML=`\n                  <img src="${e}" \n                  \n                  style="width:100%;height:100%; resize:none; border:none; position:absolute; top:0; left:0;"\n                   \n                  />\n                  `;else if(e.endsWith(".pdf"))document.getElementById(t).innerHTML=`\n                  <embed src="${e}" \n                  \n                  style="width:100%;height:100%; resize:none; border:none; position:absolute; top:0; left:0;"\n                   \n                  />\n                  `;else if(e.endsWith(".mp4")||e.endsWith(".webm")||e.endsWith(".ogg")){let n=document.createElement("video");n.src=e,n.controls=!0,document.getElementById(t).appendChild(n)}else{let n=document.createElement("audio");n.src=e,n.controls=!0,document.getElementById(t).appendChild(n)}let s=document.createElement("a");s.href=window.URL.createObjectURL(n.response),s.download=e,s.click()},n.send()}};class Router{constructor(){this.routes={},this.currentUrl="",this.store={},this.rootElement=null,this.hashChangeListener=null,this.listeners={},this.storedroutes=[],this.errorcheck=null,this.headers={},this.customerror=null,this.hooked=!1}get(e,t){const n=[],s=[],r=e.split("/").map((e=>e.startsWith(":")?(n.push(e.substring(1)),"([^/]+)"):e.startsWith("*")?(n.push(e.substring(1)),"(.*)"):e.startsWith("?")?(s.push(e.substring(1)),"([^/]+)"):e)).join("/"),o=new RegExp("^"+r+"(\\?(.*))?$");if(window.location.hash.substring(1).match(o)){this.storedroutes.push(window.location.hash.substring(1)),this.hooked=!0,this.routes[e]=!0;const s=window.location.hash.substring(1).match(o),r={};for(let e=0;e<n.length;e++)r[n[e]]=s[e+1];if(e.includes(":")&&window.location.hash.substring(1).split("?")[1])return debug.enabled&&debug.log([`\n                    Cannot use query params with path params ${e} ${window.location.hash.substring(1).split("?")[1]}`],"assert"),!1;const i={},a=window.location.hash.substring(1).split("?")[1];if(a){const e=a.split("&");for(let t=0;t<e.length;t++){const n=e[t].split("=");i[n[0]]=n[1]}}const h={params:r,query:i,url:window.location.hash.substring(1),method:"GET"};methods.rootElement=this.rootElement,methods.hashChangeListener=this.hashChangeListener;return t(h,methods),!0}return this.hooked=!1,!1}error(e){this.errorcheck=!0;window.onhashchange=()=>{if(!this.storedroutes.includes(window.location.hash.substring(1))){const t=methods;null===this.customerror?document.getElementById(this.rootElement).innerHTML=`<code>Cannot GET ${window.location.hash.substring(1)}</code>`:e(t)}};const t=methods;this.storedroutes.includes(window.location.hash.substring(1))||(this.customerror?e(t):document.getElementById(this.rootElement).innerHTML=`<code>Cannot GET ${window.location.hash.substring(1)}</code>`)}root(e,t){const n=[],s=[],r=window.location.hash.substring(1);this.hooked||this.storedroutes.includes(r)||(this.storedroutes.push(r),window.location.hash=r);const o=e.split("/").map((e=>e.startsWith(":")?(n.push(e.substring(1)),"([^/]+)"):e.startsWith("*")?(n.push(e.substring(1)),"(.*)"):e.startsWith("?")?(s.push(e.substring(1)),"([^/]+)"):e)).join("/"),i=new RegExp("^"+o+"(\\?(.*))?$");if(""===r)if(0===n.length)window.location.hash=e;else{const t=e.split("/").map((e=>e.startsWith(":")?"":e)).join("/");window.location.hash=t}else{const t=r.match(i);if(t){const s={};n.forEach(((e,n)=>{s[e]=t[n+1]}));const r=e.split("/").map((e=>e.startsWith(":")?s[e.substring(1)]:e)).join("/");window.location.hash=r}}if(this.routes[e]=!0,this.currentUrl=e,window.location.hash.substring(1).match(i)){const s=window.location.hash.substring(1).match(i),r={};for(let e=0;e<n.length;e++)r[n[e]]=s[e+1];if(e.includes(":")&&window.location.hash.substring(1).split("?")[1])return console.error(`\n[DoxDom: Cannot use query params with path params ${e} ${window.location.hash.substring(1).split("?")[1]}\n`),!1;const o={},a=window.location.hash.substring(1).split("?")[1];if(a){const e=a.split("&");for(let t=0;t<e.length;t++){const n=e[t].split("=");o[n[0]]=n[1]}}const h={params:r,query:o,url:window.location.hash.substring(1),method:"ROOT_GET"};methods.rootElement=this.rootElement,methods.hashChangeListener=this.hashChangeListener;const l=methods;return this.hashChangeListener||(this.hashChangeListener=()=>{if(window.location.hash.substring(1).match(i)){const e=window.location.hash.substring(1).match(i),s={};for(let t=0;t<n.length;t++)s[n[t]]=e[t+1];const r={params:s,rootUrl:this.currentUrl,url:window.location.hash.substring(1)};t(r,methods)}},window.addEventListener("hashchange",this.hashChangeListener)),t(h,l),!0}return!1}post(e,t){let n=!1;this.sendContent=null;t({set:(e,t)=>{let n=["Accept","Accept-Charset","Accept-Encoding","Accept-Language","Accept-Datetime","Access-Control-Request-Method","Access-Control-Request-Headers","Authorization","Cache-Control","Connection","Cookie","Content-Length","Content-MD5","Content-Type","Date"];if(!n.includes(e))throw new Error({message:"Invalid header name",name:e,accepted_headers:n});if("string"!=typeof t)throw new Error("Invalid header value");this.headers[e]=t},json:e=>{if("application/json"!=this.headers["Content-Type"])throw new Error("Content-Type header must be set to application/json");if(n)throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");try{const t=JSON.stringify(e);this.sendContent=t,n=!0}catch(e){throw new Error("Invalid JSON data")}},jsonp:e=>{if("application/json"!=this.headers["Content-Type"])throw new Error("Content-Type header must be set to application/json");if(n)throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");try{const t=JSON.stringify(e);this.sendContent=`callback(${t})`,n=!0}catch(e){throw new Error("Invalid JSON data")}},text:e=>{if("text/plain"==this.headers["Content-Type"]){if(n)throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");try{const t=e;this.sendContent=t,n=!0}catch(e){throw new Error("Invalid text data")}}},return:()=>{n&&(n=!1),this.hashChangeListener&&(window.removeEventListener("hashchange",this.hashChangeListener),this.hashChangeListener=null,console.log("removed last event listener"))}});const s={path:e,data:this.sendContent,headers:this.headers};window.postMessage(s,"*")}listen(e,t){if(this.listeners[e])throw new Error(`Listener already registered for route ${e}`);const n=n=>{const s=n.data.path,r=n.data.data,o=n.data.headers;s===e&&t({data:r,headers:o,method:"POST"})};window.addEventListener("message",n),this.listeners[e]=n}stopListening(e){const t=this.listeners[e];t&&(window.removeEventListener("message",t),delete this.listeners[e])}use(e){const t=[],n=[],s=e.split("/").map((e=>e.startsWith(":")?(t.push(e.substring(1)),"([^/]+)"):e.startsWith("*")?(t.push(e.substring(1)),"(.*)"):e.startsWith("?")?(n.push(e.substring(1)),"([^/]+)"):e)).join("/");new RegExp("^"+s+"(\\?(.*))?$");e=s,this.routes[e]=!0,this.storedroutes.push(e)}bindRoot(e){this.rootElement=e}onload(e){window.onload=()=>{window.addEventListener("DOMContentLoaded",e())}}on(e,t){window.addEventListener("hashchange",(()=>{const n=[],s=[],r=e.split("/").map((e=>e.startsWith(":")?(n.push(e.substring(1)),"([^/]+)"):e.startsWith("*")?(n.push(e.substring(1)),"(.*)"):e.startsWith("?")?(s.push(e.substring(1)),"([^/]+)"):e)).join("/"),o=new RegExp("^"+r+"(\\?(.*))?$");if(this.routes[e]=!0,this.currentUrl=e,window.location.hash.substring(1).match(o)){this.storedroutes.push(window.location.hash.substring(1)),this.routes[e]=!0;const s=window.location.hash.substring(1).match(o),r={};for(let e=0;e<n.length;e++)r[n[e]]=s[e+1];if(e.includes(":")&&window.location.hash.substring(1).split("?")[1])return console.error("Cannot use query params with path params",e,window.location.hash.substring(1).split("?")[1]),!1;const i={},a=window.location.hash.substring(1).split("?")[1];if(a){const e=a.split("&");for(let t=0;t<e.length;t++){const n=e[t].split("=");i[n[0]]=n[1]}}const h={params:r,query:i,url:window.location.hash.substring(1),method:"POST"};methods.rootElement=this.rootElement,methods.hashChangeListener=this.hashChangeListener;t(h,methods)}}))}}window.Router=new Router,imports.forEach((function(importElement){importElement.endsWith(".js")&&fetch(importElement).then((e=>e.text())).then((data=>{eval(data)}))}))}))})).catch((function(e){console.error("Error fetching templates:",e)}));