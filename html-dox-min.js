let imports=document.querySelector("meta[imports]").getAttribute("imports"),hooked=!1;imports=imports.split(",");let templates=[],parser=new DOMParser;window.variables={},window.state={},window.props={};let fetchPromises=imports.map((function(e){let t=e.split("/").pop().split(".")[0].toLowerCase();return fetch(e).then((function(e){return e.text()})).then((function(e){return{name:t,data:e}}))})),methods={hashChangeListener:null,rootElement:null,title:e=>{if(hooked)throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");document.title=e,hooked=!0},setCookie:(e,t,n)=>{if(hooked)throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");let r=`${e}=${t};`;n&&(n.path&&(r+=`path=${n.path};`),n.domain&&(r+=`domain=${n.domain};`),n.maxAge&&(r+=`max-age=${n.maxAge};`),n.httpOnly&&(r+=`httpOnly=${n.httpOnly};`),n.secure&&(r+=`secure=${n.secure};`),n.sameSite&&(r+=`sameSite=${n.sameSite};`)),document.cookie=r},getCookie:e=>{const t=document.cookie.split(";");for(let n=0;n<t.length;n++){const r=t[n].trim(),o=r.split("=")[0];if(o===e){const e=r.split("=")[1];r.split(";").slice(1).map((e=>{const[t,n]=e.split("=").map((e=>e.trim()));return{[t]:n}})).reduce(((e,t)=>Object.assign(e,t)),{});return{name:o,value:e}}}return null},saveState:()=>{if(hooked)throw new Error("State has already been saved cannot save again");const e=window.location.hash.substring(1);window.sessionStorage.getItem(e)?window.location.hash=window.sessionStorage.getItem(e):window.sessionStorage.setItem(e,e),hooked=!0},restoreState:()=>{if(hooked)throw new Error("State has already been restored cannot restore again");let e=window.location.hash.substring(1);window.sessionStorage.getItem(e)?window.location.hash=window.sessionStorage.getItem(e):window.location.hash=this.currentUrl,hooked=!0},send:e=>{if(hooked)throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");document.getElementById(methods.rootElement).innerHTML=e,hooked=!0},render:e=>{if(hooked)throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");document.getElementById(methods.rootElement).innerHTML=window[e],hooked=!0},return:()=>{hooked&&(hooked=!1),methods.hashChangeListener&&(window.removeEventListener("hashchange",methods.hashChangeListener),methods.hashChangeListener=null,console.log("removed last event listener"))},sendStatus:(e,t)=>{if(hooked)throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");if("number"!=typeof t)throw new Error("Invalid status code");document.getElementById(this.rootElement).innerHTML=JSON.stringify({msg:e,code:t}),hooked=!0},redirect:e=>{if(hooked)throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");window.location.hash=e,hooked=!0},sendFile:e=>{let t=this.rootElement;if(hooked)throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");let n=new XMLHttpRequest;n.open("GET",e),n.responseType="blob",n.onload=function(){if(e.endsWith(".png"))document.getElementById(t).style="\n          position: fixed;\n         top: 0;\n        left: 0;\n       width: 100%;\n     height: 100%;\n    background-color: black;\n          \n          ",document.getElementById(t).innerHTML=` \n  <img src="${e}" style="resize: none; border: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);"/>`;else if(e.endsWith(".json"))fetch(e).then((e=>e.json())).then((e=>{const n=`<textarea style="width:100%;height:100%; resize:none; border:none;">${JSON.stringify(e)}</textarea>`;document.getElementById(t).innerHTML=n}));else if(e.endsWith(".js"))fetch(e).then((e=>e.text())).then((e=>{const n=`<textarea style="width:100%;height:100%; resize:none; border:none;">${e}</textarea>`;document.getElementById(t).innerHTML=n}));else if(e.endsWith(".css"))fetch(e).then((e=>e.text())).then((e=>{const n=`<textarea style="width:100%;height:100%; resize:none; border:none;">${e}</textarea>`;document.getElementById(t).innerHTML=n}));else if(e.endsWith(".html"))fetch(e).then((e=>e.text())).then((e=>{const n=`<textarea style="width:100%;height:100%; resize:none; border:none;">${e}</textarea>`;document.getElementById(t).innerHTML=n}));else if(e.endsWith(".img")||e.endsWith(".png")||e.endsWith(".jpg")||e.endsWith(".jpeg")||e.endsWith(".gif")||e.endsWith(".svg")||e.endsWith(".ico"))document.getElementById(t).innerHTML=`\n              <img src="${e}" \n              \n              style="width:100%;height:100%; resize:none; border:none; position:absolute; top:0; left:0;"\n               \n              />\n              `;else if(e.endsWith(".pdf"))document.getElementById(t).innerHTML=`\n              <embed src="${e}" \n              \n              style="width:100%;height:100%; resize:none; border:none; position:absolute; top:0; left:0;"\n               \n              />\n              `;else if(e.endsWith(".mp4")||e.endsWith(".webm")||e.endsWith(".ogg")){let n=document.createElement("video");n.src=e,n.controls=!0,document.getElementById(t).appendChild(n)}else{let n=document.createElement("audio");n.src=e,n.controls=!0,document.getElementById(t).appendChild(n)}let r=document.createElement("a");r.href=window.URL.createObjectURL(n.response),r.download=e,r.click()},n.send()}};class Router{constructor(){this.routes={},this.currentUrl="",this.store={},this.rootElement=null,this.hashChangeListener=null,this.listeners={},this.storedroutes=[],this.errorcheck=null,this.headers={},this.customerror=null,this.hooked=!1}get(e,t){const n=[],r=[],o=e.split("/").map((e=>e.startsWith(":")?(n.push(e.substring(1)),"([^/]+)"):e.startsWith("*")?(n.push(e.substring(1)),"(.*)"):e.startsWith("?")?(r.push(e.substring(1)),"([^/]+)"):e)).join("/"),s=new RegExp("^"+o+"(\\?(.*))?$");if(window.location.hash.substring(1).match(s)){this.storedroutes.push(window.location.hash.substring(1)),this.hooked=!0,this.routes[e]=!0;const r=window.location.hash.substring(1).match(s),o={};for(let e=0;e<n.length;e++)o[n[e]]=r[e+1];if(e.includes(":")&&window.location.hash.substring(1).split("?")[1])return debug.enabled&&debug.log([`\n                Cannot use query params with path params ${e} ${window.location.hash.substring(1).split("?")[1]}`],"assert"),!1;const i={},a=window.location.hash.substring(1).split("?")[1];if(a){const e=a.split("&");for(let t=0;t<e.length;t++){const n=e[t].split("=");i[n[0]]=n[1]}}const l={params:o,query:i,url:window.location.hash.substring(1),method:"GET"};methods.rootElement=this.rootElement,methods.hashChangeListener=this.hashChangeListener;return t(l,methods),!0}return this.hooked=!1,!1}error(e){this.errorcheck=!0;window.onhashchange=()=>{if(!this.storedroutes.includes(window.location.hash.substring(1))){const t=methods;null===this.customerror?document.getElementById(this.rootElement).innerHTML=`<code>Cannot GET ${window.location.hash.substring(1)}</code>`:e(t)}};const t=methods;this.storedroutes.includes(window.location.hash.substring(1))||(this.customerror?e(t):document.getElementById(this.rootElement).innerHTML=`<code>Cannot GET ${window.location.hash.substring(1)}</code>`)}root(e,t){const n=[],r=[],o=window.location.hash.substring(1);this.hooked||this.storedroutes.includes(o)||(this.storedroutes.push(o),window.location.hash=o);const s=e.split("/").map((e=>e.startsWith(":")?(n.push(e.substring(1)),"([^/]+)"):e.startsWith("*")?(n.push(e.substring(1)),"(.*)"):e.startsWith("?")?(r.push(e.substring(1)),"([^/]+)"):e)).join("/"),i=new RegExp("^"+s+"(\\?(.*))?$");if(""===o)if(0===n.length)window.location.hash=e;else{const t=e.split("/").map((e=>e.startsWith(":")?"":e)).join("/");window.location.hash=t}else{const t=o.match(i);if(t){const r={};n.forEach(((e,n)=>{r[e]=t[n+1]}));const o=e.split("/").map((e=>e.startsWith(":")?r[e.substring(1)]:e)).join("/");window.location.hash=o}}if(this.routes[e]=!0,this.currentUrl=e,window.$CURRENT_URL=e,window.location.hash.substring(1).match(i)){const r=window.location.hash.substring(1).match(i),o={};for(let e=0;e<n.length;e++)o[n[e]]=r[e+1];if(e.includes(":")&&window.location.hash.substring(1).split("?")[1])return console.error(`\n               [DoxDom: Cannot use query params with path params ${e} ${window.location.hash.substring(1).split("?")[1]}\n              `),!1;const s={},a=window.location.hash.substring(1).split("?")[1];if(a){const e=a.split("&");for(let t=0;t<e.length;t++){const n=e[t].split("=");s[n[0]]=n[1]}}const l={params:o,query:s,url:window.location.hash.substring(1),method:"ROOT_GET"};methods.rootElement=this.rootElement,methods.hashChangeListener=this.hashChangeListener;const d=methods;return this.hashChangeListener||(this.hashChangeListener=()=>{if(window.location.hash.substring(1).match(i)){const e=window.location.hash.substring(1).match(i),r={};for(let t=0;t<n.length;t++)r[n[t]]=e[t+1];const o={params:r,rootUrl:this.currentUrl,url:window.location.hash.substring(1)};window.$CURRENT_URL=window.location.hash.substring(1);t(o,methods)}},window.addEventListener("hashchange",this.hashChangeListener)),t(l,d),!0}return!1}post(e,t){let n=!1;this.sendContent=null;t({set:(e,t)=>{let n=["Accept","Accept-Charset","Accept-Encoding","Accept-Language","Accept-Datetime","Access-Control-Request-Method","Access-Control-Request-Headers","Authorization","Cache-Control","Connection","Cookie","Content-Length","Content-MD5","Content-Type","Date"];if(!n.includes(e))throw new Error({message:"Invalid header name",name:e,accepted_headers:n});if("string"!=typeof t)throw new Error("Invalid header value");this.headers[e]=t},json:e=>{if("application/json"!=this.headers["Content-Type"])throw new Error("Content-Type header must be set to application/json");if(n)throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");try{const t=JSON.stringify(e);this.sendContent=t,n=!0}catch(e){throw new Error("Invalid JSON data")}},jsonp:e=>{if("application/json"!=this.headers["Content-Type"])throw new Error("Content-Type header must be set to application/json");if(n)throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");try{const t=JSON.stringify(e);this.sendContent=`callback(${t})`,n=!0}catch(e){throw new Error("Invalid JSON data")}},text:e=>{if("text/plain"==this.headers["Content-Type"]){if(n)throw new Error("Cannot send headers after they where already sent please refrain from using double res functions and call res.return() to resend to client");try{const t=e;this.sendContent=t,n=!0}catch(e){throw new Error("Invalid text data")}}},return:()=>{n&&(n=!1),this.hashChangeListener&&(window.removeEventListener("hashchange",this.hashChangeListener),this.hashChangeListener=null,console.log("removed last event listener"))}});const r={path:e,data:this.sendContent,headers:this.headers};window.postMessage(r,"*")}listen(e,t){if(this.listeners[e])throw new Error(`Listener already registered for route ${e}`);const n=n=>{const r=n.data.path,o=n.data.data,s=n.data.headers;r===e&&t({data:o,headers:s,method:"POST"})};window.addEventListener("message",n),this.listeners[e]=n}stopListening(e){const t=this.listeners[e];t&&(window.removeEventListener("message",t),delete this.listeners[e])}use(e){const t=[],n=[],r=e.split("/").map((e=>e.startsWith(":")?(t.push(e.substring(1)),"([^/]+)"):e.startsWith("*")?(t.push(e.substring(1)),"(.*)"):e.startsWith("?")?(n.push(e.substring(1)),"([^/]+)"):e)).join("/");new RegExp("^"+r+"(\\?(.*))?$");e=r,this.routes[e]=!0,this.storedroutes.push(e)}bindRoot(e){this.rootElement=e}onload(e){window.onload=()=>{window.addEventListener("DOMContentLoaded",e())}}on(e,t){window.addEventListener("hashchange",(()=>{const n=[],r=[],o=e.split("/").map((e=>e.startsWith(":")?(n.push(e.substring(1)),"([^/]+)"):e.startsWith("*")?(n.push(e.substring(1)),"(.*)"):e.startsWith("?")?(r.push(e.substring(1)),"([^/]+)"):e)).join("/"),s=new RegExp("^"+o+"(\\?(.*))?$");if(this.routes[e]=!0,this.currentUrl=e,window.$CURRENT_URL=e,window.location.hash.substring(1).match(s)){this.storedroutes.push(window.location.hash.substring(1)),this.routes[e]=!0;const r=window.location.hash.substring(1).match(s),o={};for(let e=0;e<n.length;e++)o[n[e]]=r[e+1];if(e.includes(":")&&window.location.hash.substring(1).split("?")[1])return console.error("Cannot use query params with path params",e,window.location.hash.substring(1).split("?")[1]),!1;const i={},a=window.location.hash.substring(1).split("?")[1];if(a){const e=a.split("&");for(let t=0;t<e.length;t++){const n=e[t].split("=");i[n[0]]=n[1]}}const l={params:o,query:i,url:window.location.hash.substring(1),method:"POST"};methods.rootElement=this.rootElement,methods.hashChangeListener=this.hashChangeListener;t(l,methods)}}))}}function handleVariables(e){return Object.keys(window.variables).forEach((function(t){if(Array.isArray(window.variables[t])){return window.variables[t].forEach((function(n){Object.keys(n).forEach((function(r){let o=n[r],s=new RegExp("{{"+t+"."+r+"}}","g");e.body.innerHTML=e.body.innerHTML.replaceAll(s,o)}))})),e}let n=new RegExp("{{"+t+"}}","g");e.body.innerHTML=e.body.innerHTML.replaceAll(n,window.variables[t])})),e}function doxMethods(e){return e.on=function(t,n){e.addEventListener(t,n),document.querySelector(e.tagName);let r=setInterval((function(){document.querySelector(e.tagName)&&(document.querySelector(e.tagName).addEventListener(t,n),clearInterval(r))}),1e3);return e},e.css=function(t){return t?(e.style.cssText=t,e):e.style.cssText},e.attr=function(t,n){return n?(e.setAttribute(t,n),e):e.getAttribute(t)},e.val=function(t){return t?(e.value=t,e):e.value},e.text=function(t){return t?(e.innerText=t,e):e.innerText},e.animate=function(t,n){return t&&n?(e.animate(t,n),e):e.animate},e.pre=function(e){return e.prepend(e),e},e.html=function(t){return t?(e.innerHTML=t,e):e.innerHTML},e.add=function(t,n){let r=document.createElement(t);return Object.keys(n).forEach((function(e){r.setAttribute(e,n[e])})),e.appendChild(r),doxMethods(r)},e.remove=function(){e.parentNode.removeChild(e)},e.parent=function(){return doxMethods(e.parentNode)},e.search=function(t){let n=new RegExp(t,"g");return e.innerHTML.match(n)},e}function setVar(e,t){window.variables[e]=t}function getState(e){return window.state[e]}function setState(e,t){window.postMessage({type:"state",name:e,value:t},"*"),window.state[e]=t}function effect(e,t){window.addEventListener("message",(function(n){"state"==n.data.type&&n.data.name==e&&t(n.data.value)}))}function setDox(html){let dox={querySelector:function(e){return doxMethods(html.body.querySelector(e)||document.querySelector(e))},getId:function(e){return doxMethods(html.body.querySelector("#"+e)||document.querySelector("#"+e))},driver:function(e,t){this[e]=t},add:function(e,t={}){let n=document.createElement(e);return Object.keys(t).forEach((function(e){n.setAttribute(e,t[e])})),doxMethods(n)},validate:function(type,value,options){if("email"===type){let required=options.required,regex=options.regex,time=options.await&&options.await.time?options.await.time:null,tdo=options.await&&options.await.fn?options.await.fn:null;function setStyles(){document.querySelector('input[type="email"]').style.cssText=options.style}function clearStyles(){document.querySelector('input[type="email"]').style.cssText=""}if(required&&!value&&(setStyles(),time&&tdo&&setTimeout((function(){eval(tdo)}),time),alert(options.message.required)),value&&regex&&!regex.test(value))setStyles(),time&&tdo&&setTimeout((function(){eval(tdo)}),time),alert(options.message.invalid),setStyles();else if(!regex){let emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;emailRegex.test(value)||(setStyles(),time&&tdo&&setTimeout((function(){eval(tdo)}),time),alert(options.message.invalid))}}else{if("password"!==type)throw new Error("Unsupported validation type: "+type);{let required=options.required,minLength=options.min,maxLength=options.max,time=options.await&&options.await.time?options.await.time:null,tdo=options.await&&options.await.fn?options.await.fn:null;function setStyles(){document.querySelector('input[type="password"]').style.cssText=options.style}function clearStyles(){document.querySelector('input[type="password"]').style.cssText=""}window.setStyles=setStyles,window.clearStyles=clearStyles,required&&!value&&(time&&tdo&&setTimeout((function(){eval(tdo)}),time),setStyles(),alert(options.message.required)),minLength&&value.length<minLength&&(time&&tdo&&setTimeout((function(){eval(tdo)}),time),setStyles(),alert(options.message.tooShort)),maxLength&&value.length>maxLength&&(time&&tdo&&setTimeout((function(){eval(tdo)}),time),setStyles(),alert(options.message.tooLong))}}},setVar:setVar};window.dox=dox,window.setState=setState,window.getState=getState,window.effect=effect}function handleLogic(html){if(html&&html.body.outerHTML.includes("#if")){let ifRegex=/#if\s*\(([\s\S]*?)\)\s*;([\s\S]*?)(?:#else([\s\S]*?))?#endif/gs,match;for(;null!==(match=ifRegex.exec(html.body.innerHTML));){let condition=match[1].trim();condition=condition.replaceAll("&gt;",">"),condition=condition.replaceAll("&lt;","<");let ifStatement=match[2].trim(),elseStatement=match[3]?match[3].trim():null;if(eval(condition))ifStatement.includes("return")?(html.body.innerHTML=html.body.innerHTML.replace(match[0],ifStatement),html.body.innerHTML=html.body.innerHTML.replace("return","")):eval(ifStatement);else{if(elseStatement&&elseStatement.includes("return"))return html.body.innerHTML=html.body.innerHTML.replace(match[0],elseStatement),html.body.innerHTML=html.body.innerHTML.replace("return",""),html;elseStatement&&(eval(elseStatement),html.body.innerHTML=html.body.innerHTML.replace(match[0],""))}}}if(html&&html.body.outerHTML.includes("#for")){let forRegex=/#for\s*\(([\s\S]*?)\)\s*;([\s\S]*?)(?:#endfor([\s\S]*?))?#endfor/gs,match;for(;null!==(match=forRegex.exec(html.body.innerHTML));){let condition=match[1].trim(),forStatement=match[2].trim(),endforStatement=match[3]?match[3].trim():null;eval(condition)?forStatement.includes("return")?(html.body.innerHTML=html.body.innerHTML.replace(match[0],forStatement),html.body.innerHTML=html.body.innerHTML.replace("return","")):eval(forStatement):endforStatement&&endforStatement.includes("return")&&(html.body.innerHTML=html.body.innerHTML.replace(match[0],endforStatement),html.body.innerHTML=html.body.innerHTML.replace("return",""))}}return html}function handleMarkdown(e){return e.body.querySelectorAll("markdown").forEach((function(t){t.style.display="flex",t.style.flexDirection="column";let n=t.innerHTML;n=n.replace("&gt;",">");n=n.replace(/`([^`]+)`/g,"<code>$1</code>"),n=n.replace(/\[(.*?)\]\((.*?)\)/g,'<a  style="color: #007bff; text-decoration:none" href="$2">$1</a>'),n=n.replace(/> (.+)(\n|$)/g,'<blockquote style="border-left: 5px solid #eeeeee; padding-left: 10px;">$1</blockquote>'),n=n.replace(/^---$/gm,"<hr>"),n=n.replace(/\*\*([\s\S]*?)\*\*/g,"<strong>$1</strong>"),n=n.replace(/#{1,6}\s+(.*)/g,(function(e,t){let n=e.split(" ")[0].length;if(n>6)throw new Error("Heading level cannot be greater than 6");return"<h"+n+">"+t+"</h"+n+">"})),n=n.replace(/\|(.+)\|/g,(function(e,t){let n=t.split("\n"),r='<table class="table table-striped table-bordered">';return n.forEach((function(e){let t=e.split("|"),n="<tr>";t.forEach((function(e){n+="<td>"+e+"</td>"})),n+="</tr>",r+=n})),r+="</table>",r})),n=n.replace(/\*([\s\S]*?)\*/g,"<em>$1</em>"),n=n.replace(/- (.+)(\n|$)/g,"<li>$1</li>"),n=n.replace(/\d+\. (.+)(\n|$)/g,"<li>$1</li>"),e.body.innerHTML=e.body.innerHTML.replace(t.innerHTML,n)})),e}function handleScripts(html){if(html){for(var scripts=html.body.querySelectorAll("script"),variableRegex=/let\s+(\w+)\s*=\s*([\s\S]*?)(?:;|$)/g,importRegex=/import\s+{(.*?)}\s+from\s+['"](.*?)['"]/g,beforeRenderScripts=[],afterRenderScripts=[],i=0;i<scripts.length;i++){var script=scripts[i];if(script.hasAttribute("execute")||script.hasAttribute("props")){if("beforeRender"===script.getAttribute("execute")){var s=script.innerHTML;beforeRenderScripts.push(s)}else if("afterRender"===script.getAttribute("execute")){var s=script.innerHTML;afterRenderScripts.push(s)}else if(script.hasAttribute("props"))for(var s=script.innerHTML,match;null!==(match=variableRegex.exec(s));){var name=match[1].trim(),value=match[2].trim();value.includes("{")&&(value=value.replace("{","").replace("}","").trim(),value=value.split(",").map((function(e){var t=e.split(":")[0].trim(),n=e.split(":")[1].trim(),r={};return r[t]=n,r})));var elementsWithProp=html.querySelectorAll(`[${name}]`);elementsWithProp.forEach((function(e){var t=e.getAttribute(name);e.innerHTML=e.innerHTML.replaceAll("{{"+name+"}}",t),e.removeAttribute(name)})),value=eval(value),window.props[name]=value,window[name]=value}}else for(var s=script.innerHTML,match;null!==(match=variableRegex.exec(s));){var name=match[1].trim(),value=match[2].trim();value.includes("{")&&(value=value.replace("{","").replace("}","").trim(),value=value.split(",").map((function(e){var t=e.split(":")[0].trim(),n=e.split(":")[1].trim(),r={};return r[t]=n,r}))),value.startsWith("'")||value.startsWith('"')?(value=value.replace(/"/g,""),window.variables[name]=value,window[name]=value,html=handleVariables(html)):(value=eval(value),window.variables[name]=value,window[name]=value,html=handleVariables(html))}}return{html:html,beforeRenderScripts:beforeRenderScripts,afterRenderScripts:afterRenderScripts}}}function handleImports(htm){let imports=htm.querySelectorAll("import"),fetchPromises=[];for(var i=0;i<imports.length;i++){let src=imports[i].getAttribute("src"),name=src.split("/").pop().split(".")[0].toLowerCase(),fetchPromise=fetch(src).then((function(e){return e.text()})).then((function(data){let d=parser.parseFromString(data,"text/html");return handleImports(d).then((function(updatedHtml){let{html:html,beforeRenderScripts:beforeRenderScripts,afterRenderScripts:afterRenderScripts}=handleScripts(updatedHtml);html=handleLogic(html),html=handleMarkdown(html),beforeRenderScripts.forEach((function(script){script.includes("dox")&&setDox(html);let s=document.createElement("script"),id=name+"-script";document.getElementById(id)||(s.innerHTML=script,s.type="module",s.id=id,document.head.appendChild(s),eval(script))}));let matches=html.body.outerHTML.match(/```([\s\S]*?)```/g);matches&&matches.forEach((function(e){html.body.outerHTML=html.body.outerHTML.replaceAll(e,"\x3c!-- "+e+" --\x3e")})),htm.querySelector(name)&&htm.querySelectorAll(name).forEach((function(e){let t=document.createElement(e.tagName),n=e.attributes;for(let e=0;e<n.length;e++)t.setAttribute(n[e].name,n[e].value);t.innerHTML=html.body.innerHTML,e.parentNode.replaceChild(t,e)}))}))}));fetchPromises.push(fetchPromise)}return Promise.all(fetchPromises).then((function(){return htm}))}window.Router=Router,window.$CURRENT_URL=window.location.hash.substring(1),setDox(document),Promise.all(fetchPromises).then((function(fetchedTemplates){return templates=fetchedTemplates,Promise.all(templates.map((function(template){let d=parser.parseFromString(template.data,"text/html"),matches=d.body.outerHTML.match(/```([\s\S]*?)```/g);matches&&matches.forEach((function(e){d.body.outerHTML=d.body.outerHTML.replaceAll(e,"\x3c!-- "+e+" --\x3e")}));let{beforeRenderScripts:beforeRenderScripts}=handleScripts(d),fetchPromises=[];return beforeRenderScripts.forEach((function(script){if(script.includes("fetch")){setDox(d);let fetchPromise=eval(script);fetchPromises.push(fetchPromise)}else if(script.includes("dox")){setDox(d);let e=document.createElement("script"),t=template.name+"-script";document.getElementById(t)||(e.innerHTML=script,e.type="module",e.id=t,document.head.appendChild(e))}else{let e=document.createElement("script"),t=template.name+"-script";document.getElementById(t)||(e.innerHTML=script,e.type="module",e.id=t,document.head.appendChild(e))}})),Promise.all(fetchPromises).then((function(){return handleImports(d)})).then((function(e){let{html:t,beforeRenderScripts:n,afterRenderScripts:r}=handleScripts(e);return e=handleMarkdown(e=handleLogic(t)),n.forEach((function(e){if(e.includes("dox")){setDox(t);let n=document.createElement("script"),r=template.name+"-script";document.getElementById(r)||(n.innerHTML=e,n.id=r,n.type="module",document.head.appendChild(n))}else{let t=document.createElement("script"),n=template.name+"-script";document.getElementById(n)||(t.innerHTML=e,t.type="module",t.id=n,document.head.appendChild(t))}})),Object.keys(window.props).forEach((function(e){let n=new RegExp("{{"+e+"}}","g");t.body.innerHTML=t.body.innerHTML.replaceAll(n,window.props[e])})),template.data=t.body.innerHTML,r.forEach((function(e){let t=document.createElement("script"),n=template.name+"-script";document.getElementById(n)||(t.innerHTML=e,t.type="module",t.id=n,document.head.appendChild(t))})),template}))})))})).then((function(e){e.forEach((function(e){window[e.name]=e.data,window.dox=dox}))})).then((function(){imports.forEach((function(e){e.endsWith(".js")&&fetch(e).then((e=>e.text())).then((t=>{let n=document.createElement("script"),r=e.split("/").pop().split(".")[0].toLowerCase()+"-script";n.id=r,n.innerHTML=t,n.type="module",document.getElementById(r)||document.head.appendChild(n)}))}))})).catch((function(e){console.error("Error fetching templates:",e)}));