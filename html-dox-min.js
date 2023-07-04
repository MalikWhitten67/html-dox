let dox,currentRender,templates=[],importsTag=document.querySelector("imports"),importmeta=document.querySelector("[imports]"),imports;if(importmeta)imports=importmeta.getAttribute("imports").replace(/\s/g,"");else if(importsTag)throw new Error('<imports> is deprecated use <meta imports="/someimport,/someimport"> instead! read latest git release for more info: https://github.com/MalikWhitten67/html-dox/releases/latest');imports=imports.split(","),imports=imports.filter(Boolean);let cache={},types=[],contraintTypes={"dox:string":String,"dox:number":Number,"dox:boolean":Boolean,"dox:array":Array,"dox:object":Object,"dox:undefined":void 0,"dox:null":null,"dox:function":Function,"dox:regexp":RegExp,"dox:date":Date},variables=[],props=sessionStorage.getItem("$dox-props")?JSON.parse(sessionStorage.getItem("$dox-props")):{};const parser=async data=>{let dom=new DOMParser,html=dom.parseFromString(data,"text/html");html=html.querySelector("html");let body=document.querySelector("body"),states=[],parsed=performance.now(),finished;function setData(data,html,body,item){let importName=item.getAttribute("exports").split(","),dom=new DOMParser,dhtml=dom.parseFromString(data,"text/html"),props={},parsedjs=(code,parent)=>{let style;if(code.includes("style")){style=code.split(".");let e=style[1].split("=")[0],t=style[1].split("=")[1];dhtml.querySelector(parent.tagName).style[e]=t,body.querySelector(parent.tagName).style[e]=t}else if(code.includes("{{")){let value=code.split("{{")[1].split("}}")[0];eval(value)}code.includes("parent")};if(dhtml.querySelector("if")){let e=dhtml.querySelector("if"),t=e.getAttribute("prop")?e.getAttribute("prop"):null,r=e.getAttribute("is"),n=e.getAttribute("else"),o=e.parentNode,i=e.getAttribute("props")?e.getAttribute("props").split(","):null,l=html.querySelector(o.tagName);t&&i&&i.forEach((n=>{if(l.getAttribute(t)==r){let t=e.innerHTML;if(t.includes("{{")){let e=t.split("{{")[1].split("}}")[0];parsedjs(e,o)}}}))}dhtml.querySelectorAll("var").forEach((e=>{e.style.display="none";let t=e.getAttribute("name"),r=e.innerHTML;dhtml.querySelectorAll("*").forEach((e=>{let n=e.innerHTML.match(/{{(.*?)}}/g);n&&e.innerHTML.includes(`{{${t}}}`)&&n.forEach((t=>{e.innerHTML=e.innerHTML.replace(t,r)}))})),e.remove()}));let proptemplates=[];dhtml.querySelectorAll("[props]").forEach((e=>{let t=e.tagName;if(html.querySelector(t)){let r=e.getAttribute("props").split(":");r.forEach((e=>{if(props[t]=r,sessionStorage.setItem("$dox-props",JSON.stringify(props)),"children"==e)html.querySelector(t).querySelector("slot")&&dhtml.querySelector(t).innerHTML.includes("{{children}}")&&(proptemplates.length>0&&proptemplates.forEach((e=>{e.parent==dhtml.querySelector(t).parentNode&&(dhtml.querySelector(t).innerHTML=e.template)})),proptemplates.push({element:dhtml.querySelector(t),template:dhtml.querySelector(t).innerHTML,parent:dhtml.querySelector(t).parentNode?dhtml.querySelector(t).parentNode:null}),dhtml.querySelector(t).innerHTML=dhtml.querySelector(t).innerHTML.replace("{{children}}",html.querySelector(t).querySelector("slot").innerHTML));else if(html.querySelector(t).getAttribute(e)&&(proptemplates.length>0&&proptemplates.forEach((r=>{dhtml.querySelector(t).innerHTML.includes(`{{${e}}}`)&&(dhtml.querySelector(t).innerHTML=dhtml.querySelector(t).innerHTML.replace(`{{${e}}}`,html.querySelector(t).getAttribute(e)))})),dhtml.querySelector(t).innerHTML.includes(`{{${e}}}`))){proptemplates.push({element:dhtml.querySelector(t),template:dhtml.querySelector(t).innerHTML,parent:dhtml.querySelector(t).parentNode?dhtml.querySelector(t).parentNode:null});let r=html.querySelector(t).getAttribute(e);dhtml.querySelector(t).innerHTML=dhtml.querySelector(t).innerHTML.replace(`{{${e}}}`,r)}}))}})),dhtml.querySelectorAll("*").forEach((e=>{Object.values(e.attributes).forEach((t=>{let r=t.value;if(r.includes("{{")){let n=r.match(/{{(.*?)}}/g);n&&(n.forEach((t=>{let n=t.replace("{{","").replace("}}",""),o=e.parentNode.getAttribute(n),i=document.querySelector(e.parentNode.tagName);i&&i.getAttribute(n)&&(o=i.getAttribute(n)),r=r.replace(new RegExp(`{{${n}}}`,"g"),o)})),e.setAttribute(t.name,r))}}));let t=e.innerHTML.match(/{{(.*?)}}/g);if(t&&t.forEach((t=>{let r=t.split("{{")[1].split("}}")[0],n=dhtml.querySelector(e.tagName).parentNode.tagName;html.querySelectorAll("*").forEach((t=>{if(t.tagName==n){let n=t.getAttribute(r);if(n){"true"==n.toString().toLowerCase()&&(n=n.toString().toLowerCase());let t=e.innerHTML.replace(new RegExp(`{{${r}}}`,"g"),n);e.innerHTML=t}}}))})),e.hasAttribute("state")){let t=e.getAttribute("state");e.innerHTML=e.innerHTML+getState(t),document.querySelector(e.tagName)&&(document.querySelector(e.tagName).innerHTML=e.innerHTML),effect(t,(t=>{document.querySelector(e.tagName)&&(document.querySelector(e.tagName).innerHTML=t)}))}item.getAttribute("exports").split(",").forEach((async e=>{const t=await dhtml.querySelector(e);t&&(html.querySelector(e).innerHTML=t.innerHTML,document.querySelector(e)&&(document.querySelector(e).innerHTML=t.innerHTML))}))}))}let imports=html.querySelectorAll("import");imports.forEach((e=>{let t=e.getAttribute("src");if(!t.endsWith(".html"))throw new Error("Unsupported imported file type!");window[t]?setData(window[t],html,body,e):fetch(t).then((e=>e.text())).then((r=>{window[t]=r,setData(r,html,body,e)}))}));let _export=html.querySelector("export");_export.style.display="none";let _vars=html.querySelectorAll("var");_vars.forEach((e=>{e.style.display="none";let t=e.getAttribute("name"),r=e.innerHTML;html.querySelectorAll("*").forEach((e=>{let n=e.innerHTML.match(/{{(.*?)}}/g);n&&e.innerHTML.includes(`{{${t}}}`)&&n.forEach((t=>{e.innerHTML=e.innerHTML.replace(t,r)}))})),e.remove()})),_export&&(_export=_export.innerHTML.replace(/\s/g,""),_export=_export.split(","),_export=_export.filter(Boolean),_export.forEach((async e=>{let t=html.querySelector(e);[].forEach((r=>{if(t.hasAttribute(r)&&"typeof"===r){let n=types.find((e=>e.name===t.getAttribute(r)));if(!n)throw new Error(`Type "${t.getAttribute(r)}" does not exist`);{let t,r=contraintTypes[n.constraint],o=body.querySelector(e).innerHTML;if("false"===n.isStrict)return;if(r===Number){if(t=Number(o),t=isNaN(t)?0:t,0===t)throw new Error(`Invalid value for type "${n.name}": ${o} (expected number)`)}else if(r===Boolean)if("true"===o.toLowerCase())t=!0;else{if("false"!==o.toLowerCase())throw new Error(`Invalid value for type "${n.name}": ${o} (expected boolean)`);t=!1}else{if(r!==String)throw new Error(`Invalid constraint type for type "${n.name}": ${n.constraint}`);t=o}}}}));if(html.querySelectorAll("[state]").forEach((e=>{let t=e.getAttribute("state");e.id=t,null!=getState(t)&&null!=getState(t)||setState(t,""),e.innerHTML=e.innerHTML+getState(t),setTimeout((()=>{effect(t,(r=>{setTimeout((()=>{"INPUT"!=e.tagName&&"TEXTAREA"!=e.tagName||(e.value=r),"SELECT"==e.tagName&&(e.value=r),"IMG"==e.tagName&&(e.src=r),"A"==e.tagName&&(e.href=r),"IFRAME"==e.tagName&&(e.src=r),"VIDEO"==e.tagName&&(e.src=r),"AUDIO"==e.tagName&&(e.src=r),"EMBED"==e.tagName&&(e.src=r),"OBJECT"==e.tagName&&(e.src=r),"SOURCE"==e.tagName&&(e.src=r),"TRACK"==e.tagName?e.src=r:e.innerHTML=r,document.querySelector(`#${t}`).innerHTML=r}),0)}))}),0)})),window.rerender=r,html.querySelector(e).hasAttribute("props")){let r=html.querySelector(e).getAttribute("props").split(":");r.forEach((n=>{if(props[e]=r,sessionStorage.setItem("$dox-props",JSON.stringify(props)),t.querySelectorAll("[derive]").forEach((t=>{let r=t.getAttribute("derive"),n=body.querySelector(e).getAttribute(r);t.innerHTML.includes(`{{${r}}}`)&&(t.innerHTML=t.innerHTML.replace(`{{${r}}}`,n))})),"children"==n){if(html.querySelector(e).querySelector("slot")&&html.querySelector(e).innerHTML.includes("{{children}}")){let t=html.querySelector(e).querySelector("slot").innerHTML;html.querySelector(e).innerHTML=html.querySelector(e).innerHTML.replace("{{children}}",t)}}else if(html.querySelector(e).getAttribute(n)&&html.querySelector(e).innerHTML.includes(`{{${n}}}`)){let t=html.querySelector(e).getAttribute(n);html.querySelector(e).innerHTML=html.querySelector(e).innerHTML.replace(`{{${n}}}`,t)}}))}if(document.querySelector(e)){let r=html.querySelector(e);body.querySelector(e).innerHTML=r.innerHTML,templates.push({element:document.querySelector(e),parent:document.querySelector(e).parentNode,template:t.innerHTML,html:html,body:body})}function r(t){if(html.querySelector(e)){html.querySelectorAll("import").forEach((e=>{let t=e.getAttribute("src");if(!t.endsWith(".html"))throw new Error("Unsupported imported file type!");window[t]?setData(window[t],html,body,e):fetch(t).then((e=>e.text())).then((r=>{window[t]=r,setData(r,html,body,e)}))}))}}function n(e){e.inject=t=>(e.innerHTML=t,n(e));let t=sessionStorage.getItem("$dox-props")?JSON.parse(sessionStorage.getItem("$dox-props")):[];return t=t[e.tagName],t&&(e.props=t),e.class=t=>(e.className=t,n(e)),e.add=(t,r)=>{let o=document.createElement(t);return r&&Object.keys(r).forEach((e=>{o.setAttribute(e,r[e])})),e.appendChild(o),n(o)},e.delete=()=>(e.remove(),n(e)),e.parent=()=>n(e.parentNode),e.query=e=>{let t=document.querySelector(e);if(t)return n(t)},e.classes=(t,r)=>("add"==r&&e.classList.add(t),"remove"==r&&e.classList.remove(t),"toggle"==r&&e.classList.toggle(t),n(e)),e.html=t=>t?(e.innerHTML=t,n(e)):e.innerHTML,e.prepend=t=>(e.innerHTML=t+e.innerHTML,n(e)),e.append=t=>(e.innerHTML+=t,n(e)),e.blur=()=>{e.blur()},e.fade=t=>{e.style.transition=`opacity ${t}s`,e.style.opacity=0},e.focus=e.focus,e.queryAll=t=>{let r=e.querySelectorAll(t);return e.forEach=e=>{r.forEach((t=>{e(t)}))},r.forEach((e=>{e=n(e)})),r},e.after=t=>(e.insertAdjacentHTML("afterend",t),n(e)),e.before=t=>(e.insertAdjacentHTML("beforebegin",t),n(e)),e.attr=(t,r)=>r?(e.setAttribute(t,r),n(e)):e.getAttribute(t),e.replace=(t,r)=>{let o=document.createElement(t);return o.innerHTML=r,e.parentNode.replaceChild(o,e),n(o)},e.on=(t,r)=>{e.addEventListener(t,(t=>(Object.defineProperty(t,"target",{value:n(t.target)}),Object.defineProperty(t,"currentTarget",{value:n(t.currentTarget)}),r(t),n(e))))},e.setProp=(t,o)=>{if(o)return html.querySelector(e.tagName).setAttribute(t,o),r(),n(e)},e.css=(t,r)=>r?(e.style[t]=r,n(e)):e.style[t],e.getChildren=()=>{let t=[],r=e=>{let o=e.children;for(let i=0;i<o.length;i++)o[i]=n(o[i]),o[i].parent=e,o[i].index=i,t.push(o[i]),r(o[i])};return e.forEach=r=>(t.forEach((e=>{r(e)})),n(e)),e.map=(r,o)=>(o?t.forEach((e=>{r(e,o)})):t.forEach((e=>{r(e)})),n(e)),r(e),t},e}r(),dox={route:()=>window.currentRoute,currentRender:()=>currentRender,setProp:(e,t,o)=>{let i=html.querySelector(e);return i&&(i.setAttribute(t,o),r()),n(i)},domChange:(e,t=!1,r=(()=>{}))=>{var n=!1;new MutationObserver((function(t){n&&"changed"===e?t.forEach((function(e){r(e)})):r()})).observe(document,{childList:!0,subtree:!0}),setTimeout((()=>{n=!0,t&&r()}),100)},add:(e,t)=>{let r=document.createElement(e);return Object.keys(t).forEach((e=>{r.setAttribute(e,t[e])})),r=n(r),n(r)},title:e=>{document.title=e},querySelector:e=>{let t=document.querySelector(e);return t&&(t=n(t)),t},querySelectorAll:e=>{let t=currentRender.querySelectorAll(e)||html.querySelectorAll(e)||body.querySelectorAll(e)||null,r=[];return t.forEach((e=>{r.push(n(e))})),r},html:document.querySelector("html").innerHTML,text:document.querySelector("html").innerText,on:(e,t)=>{window.addEventListener(e,t)},post:(e,t,r,n)=>{"object"==typeof t?(t=JSON.stringify(t),fetch(e,{method:"POST",headers:{"Content-Type":"application/json",headers:n},body:t}).then((e=>"json"==n.responseType?e.json():e.text()))):"string"==typeof t?fetch(e,{method:"POST",headers:{"Content-Type":"text/plain",headers:n},body:t}).then((e=>"json"==n.responseType?e.json():e.text())).then((e=>{r(e)})):JSON.parse(t)&&fetch(e,{method:"POST",headers:{"Content-Type":"application/json",headers:n},body:JSON.stringify(t)}).then((e=>e.json())).then((e=>{r(e)}))},get:(e,t,r)=>{fetch(e,{method:"GET",headers:{"Content-Type":"application/json",headers:r}}).then((e=>e.json())).then((e=>{t(e)}))},put:(e,t,r,n)=>{fetch(e,{method:"PUT",headers:{"Content-Type":"application/json",headers:n},body:JSON.stringify(t)}).then((e=>e.json())).then((e=>{r(e)}))},delete:(e,t,r)=>{fetch(e,{method:"DELETE",headers:{"Content-Type":"application/json",headers:r}}).then((e=>e.json())).then((e=>{t(e)}))},setMeta:(e=null,t=null,r,n=!1,o=!1)=>{if(t){if(o&&(r.includes("https")||r.includes("http")))return void(r+="?a=b");if(document.querySelector(`meta[property="${t}"]`))return document.querySelector(`meta[property="${t}"]`).setAttribute("content",r),void(n&&document.querySelector(`meta[property="${t}"]`).setAttribute(n,r));{let i=document.createElement("meta");if(o&&(r.includes("https")||r.includes("http")))return void(r+="?a=b");n&&Object.keys(n).forEach((e=>{cosole.log(e),i.setAttribute(e,n[e])})),i.setAttribute("property",t),i.setAttribute("content",r),e&&i.setAttribute("name",e),document.querySelector("head").appendChild(i)}}else if(e){let t=document.createElement("meta");t.setAttribute("name",e),t.setAttribute("content",r),n&&Object.keys(n).forEach((e=>{t.setAttribute(e,n[e])})),document.querySelector("head").appendChild(t)}}},window.dox=dox}))),body.querySelectorAll("type").forEach((e=>{let t=e.querySelectorAll("subtype");types.push({name:e.getAttribute("name"),constraint:e.getAttribute("constraint"),isStrict:e.getAttribute("isStrict")}),e.querySelectorAll("subtype").forEach((e=>{if(!contraintTypes[e.getAttribute("constraint")])throw new Error("The constraint type does not exist");types.push({name:e.getAttribute("name"),constraint:e.getAttribute("constraint")})})),t.forEach((e=>{if(!contraintTypes[e.getAttribute("constraint")])throw new Error("The constraint type does not exist");types.push({name:e.getAttribute("name"),constraint:e.getAttribute("constraint")})})),html.querySelectorAll("[subtype]").forEach((e=>{if(e.innerHTML.includes("{{")){let t=e.innerHTML.split("{{")[1].split("}}")[0];body.querySelectorAll(`[${t}]`).forEach((r=>{let n=r.getAttribute(t),o=e.getAttribute("subtype"),i=types.find((e=>e.name===o)),l=i.isStrict;if(i&&l){let e,t=contraintTypes[i.constraint];if(t===Number){if(e=Number(n),e=isNaN(e)?0:e,0===e)throw new Error(`Invalid  value for subtype "${o}": ${n} (expected number)`)}else if(t===Boolean)if("true"===n.toLowerCase())e=!0;else{if("false"!==n.toLowerCase())throw new Error(`Invalid attribute value for subtype "${o}": ${n} (expected boolean)`);e=!1}else{if(t!==String)throw new Error(`Invalid constraint type for subtype "${o}": ${i.constraint}`);e=n}}}))}}))})),html.querySelectorAll("type").forEach((e=>{let t=e.querySelectorAll("subtype"),r=[];t.forEach((t=>{if(r.push(t.getAttribute("name")),r.filter(((e,t)=>r.indexOf(e)!==t)).length>0)throw new Error("Two subtypes cannot have the same name");if(t.getAttribute("name")===e.getAttribute("name"))throw new Error("Types and subtypes cannot have the same name")})),types.push({name:e.getAttribute("name"),constraint:e.getAttribute("constraint"),isStrict:e.getAttribute("isStrict")}),e.querySelectorAll("subtype").forEach((e=>{if(!contraintTypes[e.getAttribute("constraint")])throw new Error("The constraint type does not exist");types.push({name:e.getAttribute("name"),constraint:e.getAttribute("constraint"),isStrict:e.getAttribute("isStrict")})})),html.querySelectorAll("[subtype]").forEach((e=>{if(e.innerHTML.includes("{{")){let t=e.innerHTML.split("{{")[1].split("}}")[0];body.querySelectorAll(`[${t}]`).forEach((r=>{let n=r.getAttribute(t),o=e.getAttribute("subtype"),i=types.find((e=>e.name===o)),l=i.isStrict;if(i&&l){let e,t=contraintTypes[i.constraint];if(t===Number){if(e=Number(n),e=isNaN(e)?0:e,0===e)throw new Error(`Invalid  value for subtype "${o}": ${n} (expected number)`)}else if(t===Boolean)if("true"===n.toLowerCase())e=!0;else{if("false"!==n.toLowerCase())throw new Error(`Invalid attribute value for subtype "${o}": ${n} (expected boolean)`);e=!1}else{if(t!==String)throw new Error(`Invalid constraint type for subtype "${o}": ${i.constraint}`);e=n}}}))}}))}))};class Router{constructor(e){this.routes=e||{},this.currentRoute="",window.addEventListener("hashchange",(()=>{this.route()})),window.addEventListener("DOMContentLoaded",(()=>{this.route()})),this.fallbackRoute="",this.errorOn=!1}route(){const e=window.location.hash.slice(1);this.currentRoute=e,this.navigate()}render(e){templates.forEach((t=>{let r=t.parent,n=t.template,o=t.element;r.getAttribute("route")==e?(rerender(),o.innerHTML=n,window.currentRender=o):o.innerHTML=""}))}navigate(){let e=!1;this.routes&&Object.keys(this.routes).forEach((async t=>{const{isMatch:r,params:n,query:o,asterisk:i}=this.isRouteMatch(this.currentRoute,t);if(r){if(e=!0,Object.keys(o).length>0&&window.location.hash.includes("?")){t=window.location.hash.split("?")[0].replace("#","");const e=this.routes[t];return this.render(t),await setTimeout((()=>{}),2),e({params:n,query:o}),void(window.dox=window.dox||{})}if(Object.keys(n).length>0&&!window.location.hash.includes("?")){const e=this.routes[t],r=t.split("/:")[0];return this.render(r),await setTimeout((()=>{}),2),e({params:n,query:o}),void(window.dox=window.dox||{})}if(i){const e=this.routes[t],r=t.split("/*")[0];return this.render(r),window.dox=window.dox||{},await setTimeout((()=>{}),2),void e({asterisk:i})}{const e=this.routes[t];return this.render(t),await setTimeout((()=>{e({params:n,query:o})}),2),void(window.dox=window.dox||{})}}})),!e&&this.fallbackRoute&&(window.location.hash="#"+this.fallbackRoute)}isRouteMatch(e,t){const r=e.split("/").filter((e=>""!==e)),n=t.split("/").filter((e=>""!==e));if(r.length!==n.length&&!t.includes("*"))return{isMatch:!1};const o={};let i={},l="";for(let e=0;e<n.length;e++){const t=r[e],s=n[e];if(s.startsWith(":")){const e=t;o[s.slice(1)]=e}else if(s.includes("?")){const e=s.split("?")[1];i=this.extractQuery(e)}else{if(s.includes("*")){l=r.slice(e).join("/");break}if(t!==s)return{isMatch:!1}}}return{isMatch:!0,params:o,query:i,asterisk:l}}get(e,t){this.routes[e]=t}redirect(e){window.location.hash="#"+e}extractParams(e,t){const r=e.split("/").filter((e=>""!==e)),n=t.split("/").filter((e=>""!==e)),o={};for(let e=0;e<n.length;e++){const t=n[e];if(t.startsWith(":")){const n=t.slice(1),i=r[e];o[n]=i}}return o}extractQuery(e){const t=e.indexOf("?");if(-1!==t){const r=e.slice(t+1).split("&"),n={};return r.forEach((e=>{const[t,r]=e.split("=");n[t]=decodeURIComponent(r)})),n}return{}}extractAsterics(e){const t=e.indexOf("*");if(-1!==t){const r=e.slice(t+1).split("&"),n={};return r.forEach((e=>{const[t,r]=e.split("=");n[t]=decodeURIComponent(r)})),n}}}imports.map((e=>{if(!(e.endsWith(".html")||e.endsWith(".css")||e.endsWith(".js")))throw new Error("Unsupported imported file type!");if(e.endsWith(".js")){let t=document.createElement("link");t.setAttribute("rel","preload"),t.setAttribute("href",e),t.type="text/javascript",t.setAttribute("as","script"),document.querySelector("head").appendChild(t),cache[e]?cache[e]:fetch(e).then((e=>e.text())).then((t=>{if(t.includes("document")&&!e.includes("tailwind.js"))throw new Error("Imported JS file cannot contain document. Use dox instead.");if((t.includes("innerHTML")||t.includes("innerText"))&&!e.endsWith("tailwind.js"))throw new Error("Use dox:text to return text and dox:$ to return HTML.");let r=document.createElement("script");r.id="dox-script",r.type="module",r.innerHTML=t,document.head.appendChild(r)}))}if(e.endsWith(".html")){let t=document.createElement("link");t.setAttribute("rel","preload"),t.setAttribute("href",e),t.type="text/html",t.setAttribute("as","document"),document.querySelector("head").appendChild(t),cache[e]?parser(cache[e]):fetch(e).then((e=>e.text())).then((async t=>{cache[e]=t,await parser(t)}))}})),window.Router=Router;const states={},setState=(e,t)=>{states[e]=t,window.postMessage({name:e,value:t},"*")},getState=e=>states[e];window.addEventListener("message",(e=>{if(e.origin!==window.location.origin)return;const{name:t,value:r}=e.data;states[t]=r}));const effect=(e,t=(()=>{}))=>{window.addEventListener("message",(r=>{if(r.origin!==window.location.origin)return;const{name:n,value:o}=r.data;n===e&&t(o)}))};window.effect=effect,window.getState=getState,window.setState=setState,window.dox=dox;export default dox;