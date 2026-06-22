(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))n(a);new MutationObserver(a=>{for(const o of a)if(o.type==="childList")for(const l of o.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&n(l)}).observe(document,{childList:!0,subtree:!0});function t(a){const o={};return a.integrity&&(o.integrity=a.integrity),a.referrerPolicy&&(o.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?o.credentials="include":a.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(a){if(a.ep)return;a.ep=!0;const o=t(a);fetch(a.href,o)}})();var Qs=0,B="",$={CHANGE:"change",CHANGED:"changed",PAGE_UNLOAD:"page_unload"},ce="v-lark",Xs=new RegExp(`(?:([\\w-]+)${B})?([^(]+)\\(([\\s\\S]*?)?\\)`),as=/^(\$?)([\w]*)<(.*?)>(?:<([\w ,]*)>)?$/,os=/(?:^.*\/\/[^/]+|#.*$)/gi,ls=/^[^#]*#?!?/,Ys=/([^=&?/#]+)=?([^&#?]*)/g,Zs=/(?!^)=|&/,Js=/[#?].*$/,ze="http://www.w3.org/2000/svg",Qe="http://www.w3.org/1998/Math/MathML",et=/<([a-z][^/\0>\x20\t\r\n\f]+)/i,st=48,je=0,tt={svg:ze,math:Qe};function Re(){return++Qs}var nt={"&":"amp","<":"lt",">":"gt",'"':"#34","'":"#39","`":"#96"},at=/[&<>"'`]/g;function Xe(e){return String(e??"")}function ot(e){return String(e??"").replace(at,s=>"&"+nt[s]+";")}var lt={"!":"%21","'":"%27","(":"%28",")":"%29","*":"%2A"},rt=/[!')(*]/g;function it(e){return encodeURIComponent(Xe(e)).replace(rt,s=>lt[s])}var ct=/['"\\]/g;function pt(e){return Xe(e).replace(ct,"\\$&")}function dt(e,s,t){const n=e[B];for(let a=n;--a;)if(t=B+a,e[t]===s)return t;return t=B+e[B]++,e[t]=s,t}function Bs(e){if(e.length<2||e[0]!==B)return!1;for(let s=1;s<e.length;s++){const t=e.charCodeAt(s);if(t<48||t>57)return!1}return!0}var ht=9,ve=[],Ye=!1,rs=(()=>{try{if(typeof globalThis?.scheduler?.yield=="function")return globalThis.scheduler.yield.bind(globalThis.scheduler)}catch{}})();async function ut(){Ye=!1;const e=performance.now();for(;ve.length>0;){const s=ve.shift();try{s()}catch(t){console.error("scheduler task error:",t)}if(ve.length>0&&performance.now()-e>ht)if(rs)await rs();else{Ss();return}}}function Ss(){setTimeout(()=>ut(),0),Ye=!0}function Q(e,s){ve.push(()=>e(...s)),Ye||Ss()}function Et(e){if(typeof e!="object"||e===null)return!1;const s=Object.getPrototypeOf(e);return s===null||s===Object.prototype}function ft(e){return typeof e=="object"&&e!==null}function Fe(e){return ft(e)?e:(console.error("fallback to Object.fromEntries, even an empty object {}."),Array.isArray(e)?Object.fromEntries(e.entries()):{})}function yt(e){return!e||typeof e!="object"&&typeof e!="function"}function gt(e){return!e||typeof e!="object"}var mt=0;function Be(e){return(e||"lark_")+mt++}function C(){}function w(e,s){return e!=null&&Object.prototype.hasOwnProperty.call(e,s)}function bt(e){const s=[];for(const t in e)w(e,t)&&s.push(t);return s}function U(e,...s){for(const t of s)if(t)for(const n in t)w(t,n)&&(e[n]=t[n]);return e}function _(e,s,t,n){const a=Array.isArray(e)?e:[e];let o;for(const l of a)try{o=l.apply(t,s)}catch(r){n?.(r)}return o}var Ze=new Set;function Ts(e,s,t,n){let a=!1;for(const o in e)if(w(e,o)){const l=e[o],r=s[o];(!yt(l)||r!==l)&&!n.has(o)&&(t.add(o),a=!0),s[o]=l}return a}function _s(e,s){if(gt(s)){const t=String(s);return Bs(t)&&w(e,t)?e[t]:s}if(Et(s)||Array.isArray(s)){for(const t in s)if(w(s,t)){const n=s[t],a=_s(e,n);s[t]=a}return s}return s}function Rs(e){return e?typeof e=="object"?e:document.getElementById(e):null}function kt(e,s){return Element.prototype.getAttribute.call(e,s)??""}function vt(e,s){const t=e.getAttribute("id");if(t)return t;e.autoId=1;const n=Be(s);return e.id=n,n}function Ft(e,s){const t=typeof e=="string"?document.getElementById(e):e,n=typeof s=="string"?document.getElementById(s):s;if(!t||!n)return!1;if(t===n)return!0;try{return(n.compareDocumentPosition(t)&16)===16}catch{return!1}}function A(e){const s={},n=e.replace(Js,""),a=e===n&&Zs.test(n)?"":n;return e.replace(a,"").replace(Ys,(o,l,r)=>{try{s[l]=decodeURIComponent(r||"")}catch{s[l]=r||""}return""}),{path:a,params:s}}function As(e,s,t){const n=[];let a=!1;for(const o in s)if(w(s,o)){const l=String(s[o]??"");(!t||l||t.has(o))&&(n.push(`${o}=${encodeURIComponent(l)}`),a=!0)}return a&&(e+=(e&&(~e.indexOf("?")?"&":"?"))+n.join("&")),e}function Ds(e,s){const t={};if(!e)return t;for(const n of e){const a=String(s?n[s]:n);t[a]=s?n:(t[a]||0)+1}return t}var Ae=new Set;function Ps(e,s){if(Array.isArray(e)){if(e.length%2!==0)throw new Error("Invalid array of [id, content] pairs");const t=[];for(let n=0;n<e.length;n+=2){const a=e[n],o=e[n+1],l=Ps(a,o);l!==C&&t.push(l)}return()=>{for(const n of t)n()}}if(s&&!Ae.has(e)){Ae.add(e);const t=document.createElement("style");return t.setAttribute("from","lark"),t.id=e,t.textContent=s,document.head.append(t),()=>{Ae.delete(e),t.remove()}}return C}var pe=new WeakMap;function xt(e){let s=pe.get(e);return s||(s={signs:new Map,deleted:!1},pe.set(e,s)),s}function wt(e,s){const t=xt(e);if(t.deleted)return()=>!1;const n=(t.signs.get(s)??0)+1;return t.signs.set(s,n),()=>{const a=pe.get(e);return!!a&&!a.deleted&&a.signs.get(s)===n}}function Is(e){const s=pe.get(e);s?(s.deleted=!0,s.signs.clear()):pe.set(e,{signs:new Map,deleted:!0})}function Ct(e,s){return s.frequency-e.frequency||s.lastTimestamp-e.lastTimestamp}var se=class{entries=[];lookup=new Map;bufferSize;maxSize;capacity;onRemove;comparator;constructor(e={}){this.maxSize=e.maxSize??20,this.bufferSize=e.bufferSize??5,this.capacity=this.maxSize+this.bufferSize,this.onRemove=e.onRemove,this.comparator=e.sortComparator??Ct}prefixKey(e){return B+e}get(e){const s=this.prefixKey(e),t=this.lookup.get(s);if(t)return t.frequency++,t.lastTimestamp=Re(),t.value}forEach(e){for(const s of this.entries)e(s.value)}set(e,s){const t=this.prefixKey(e),n=this.lookup.get(t);if(n){n.value=s,n.frequency++,n.lastTimestamp=Re();return}this.entries.length>=this.capacity&&this.evictEntries();const a={originalKey:e,value:s,frequency:1,lastTimestamp:Re()};this.entries.push(a),this.lookup.set(t,a)}del(e){const s=this.prefixKey(e),t=this.lookup.get(s);if(!t)return;this.lookup.delete(s);const n=this.entries.indexOf(t);n!==-1&&this.entries.splice(n,1),this.onRemove&&this.onRemove(e)}has(e){return this.lookup.has(this.prefixKey(e))}get size(){return this.entries.length}clear(){if(this.onRemove)for(const e of this.entries)this.onRemove(e.originalKey);this.entries=[],this.lookup.clear()}evictEntries(){const e=this.entries,s=this.bufferSize;if(s<=0||e.length===0)return;if(e.length<=s){for(const o of e)this.lookup.delete(this.prefixKey(o.originalKey)),this.onRemove&&this.onRemove(o.originalKey);this.entries=[];return}const t=this.comparator,n=[];for(const o of e)if(n.length<s){let l=n.length;for(;l>0&&t(o,n[l-1])>0;)l--;n.splice(l,0,o)}else if(t(o,n[s-1])>0){n.pop();let l=n.length;for(;l>0&&t(o,n[l-1])>0;)l--;n.splice(l,0,o)}const a=new Set(n);for(const o of n)this.lookup.delete(this.prefixKey(o.originalKey)),this.onRemove&&this.onRemove(o.originalKey);this.entries=e.filter(o=>!a.has(o))}},q=class{listeners=new Map;firingDepth=0;pendingCompaction;on(e,s){const t=B+e;let n=this.listeners.get(t);return n||(n=[],this.listeners.set(t,n)),n.push({handler:s,executing:0}),this}off(e,s){const t=B+e;if(s){const n=this.listeners.get(t);if(!n)return this;if(this.firingDepth>0){for(const a of n)if(a.handler===s){a.handler=C,(this.pendingCompaction??=new Set).add(t);break}}else{for(let a=0;a<n.length;a++)if(n[a].handler===s){n.splice(a,1);break}n.length===0&&this.listeners.delete(t)}}else this.listeners.delete(t),Reflect.deleteProperty(this,`on${e[0].toUpperCase()+e.slice(1)}`);return this}fire(e,s,t,n){const a=B+e,o=this.listeners.get(a);s||(s={}),s.type=e,this.firingDepth++;try{if(o){const i=o.length;for(let c=0;c<i;c++){const d=n?i-1-c:c,h=o[d];h&&h.handler!==C&&(h.executing=1,_([h.handler],[s],this,C),h.executing="")}}const l=`on${e[0].toUpperCase()+e.slice(1)}`,r=this[l];typeof r=="function"&&_([r],[s],this,C),t&&this.off(e)}finally{if(this.firingDepth--,this.firingDepth===0&&this.pendingCompaction){for(const l of this.pendingCompaction){const r=this.listeners.get(l);if(r){for(let i=r.length-1;i>=0;i--)r[i].handler===C&&r.splice(i,1);r.length===0&&this.listeners.delete(l)}}this.pendingCompaction=void 0}}return this}},xe={},ee={},De=new Set,is=Ze,he=!1,ue=new q;function Bt(e){const s=e.split(",");for(const t of s)w(ee,t)?ee[t]++:ee[t]=1;return s}function St(e){for(const s of e)w(ee,s)&&--ee[s]<=0&&(Reflect.deleteProperty(ee,s),Reflect.deleteProperty(xe,s))}var V={get(e){return e?xe[e]:xe},set(e,s){return he=Ts(e,xe,De,s||Ze)||he,V},digest(e,s){if(e&&V.set(e,s),he){he=!1;const t=De;is=t,De=new Set,ue.fire($.CHANGED,{keys:t})}},diff(){return is},clean(e){return{make:function(){const s=Bt(e);this.on("destroy",()=>{St(s)})}}},on(e,s){return ue.on(e,s),V},off(e,s){return ue.off(e,s),V},fire(e,s,t){return ue.fire(e,s,t),V}},Ee=new q,Pe=new se,cs=new se,W=Tt(),fe,$e=0,Ms=!1,ne,ps,ds,ae,Ie,hs,z,G="history",oe=[];function Tt(){return{href:"",srcQuery:"",srcHash:"",query:{path:"",params:{}},hash:{path:"",params:{}},params:{},get:(e,s)=>s??""}}function _t(e,s){return this.params[e]||(s!==void 0?s:"")}function Rt(e){if(z&&(ne||(ne=z.routes||{},ps=z.unmatchedView,ds=z.defaultView,ae=z.defaultPath||"/",Ie=z.rewrite),!e.view)){let t=G==="history"&&e.query.path||e.hash.path||ae||"/";!ne[t]&&t==="/"&&ae&&ae!=="/"&&(t=ae),Ie&&(t=Ie(t,e.params,ne));const n=ne[t]||ps||ds;e.path=t,e.view=typeof n=="string"?n:n?.view||"",typeof n=="object"&&n&&U(e,n)}}function At(e,s){const t=e.href,n=s.href,a=t+B+n,o=cs.get(a);if(o)return o;let l=!1;const r={},i=(p,k,u)=>{const E=k||"",y=u||"";E!==y&&(r[p]={from:E,to:y},l=!0)},c=new Set([...Object.keys(e.params),...Object.keys(s.params)]);for(const p of c)i(p,e.params[p],s.params[p]);const d={params:r,force:!t,changed:l};i("path",e.path,s.path),r.path&&(d.path=r.path,d.changed=!0);const h="view";i(h,e.view,s.view),r[h]&&(d.view=r[h],d.changed=!0);const g={changed:l,diff:d};return cs.set(a,g),g}function Ke(e,s){if(G==="history"){const a=e||"/",o=window.location.pathname+window.location.search;if(a===o)return;s?window.history.replaceState(null,"",a):window.history.pushState(null,"",a);return}const t=z?.hashbang||"#!",n=e===""?"":t+e;s?window.location.replace(n):window.location.hash=n}function Dt(e,s,t,n,a,o){e=As(e,s,o);const l=G==="history"?t.srcQuery:t.srcHash;e!==l&&($e=a?1:0,Ke(e,n),G==="history"&&S.notify&&S.notify())}var S={parse(e){e=e||window.location.href;const s=Pe.get(e);if(s)return s;let t,n,a,o;if(G==="history")try{const i=new URL(e,window.location.origin);t=i.pathname+i.search,n=i.hash?i.hash.replace(/^#!?/,""):"",a=A(t),o=n?A(n):{path:"",params:{}}}catch{t=e.replace(os,""),n=e.replace(ls,""),a=A(t),o=A(n)}else t=e.replace(os,""),n=e.replace(ls,""),a=A(t),o=A(n);const l=U({},a.params,o.params),r={href:e,srcQuery:t,srcHash:n,query:{path:a.path,params:a.params},hash:{path:o.path,params:o.params},params:l,get:_t};return Ms&&(Rt(r),Pe.set(e,r)),r},diff(){const e=S.parse(),s=At(W,e);return W=e,!$e&&s.changed&&(fe=s.diff,fe.path&&(document.title=hs||document.title),Ee.fire($.CHANGED,Fe(fe))),$e=0,fe},to(e,s,t,n){let a="",o;if(!s&&typeof e=="object")o=e;else{const c=A(e);a=c.path,o={...c.params},s&&U(o,s)}const l=W.path||"",r=W.params,i=new Set;for(const c in W.query.params)w(W.query.params,c)&&i.add(c);if(a){if(G==="hash"&&!w(window,"history"))for(const c of i)w(o,c)||(o[c]="")}else r&&(a=l,o=U({},r,o));Dt(a,o,W,t,n,i)},beforeEach(e){return oe.push(e),()=>{const s=oe.indexOf(e);s!==-1&&oe.splice(s,1)}},join(...e){let s=e.join("/");s=s.replace(/\/\.\//g,"/");const t=/\/[^/]+\/\.\.\//;for(;t.test(s);)s=s.replace(t,"/");return s=s.replace(/\/{2,}/g,"/"),s},on(e,s){return Ee.on(e,s),S},off(e,s){return Ee.off(e,s),S},fire(e,s,t){return Ee.fire(e,s,t),S},_bind(){hs=document.title;let s=G==="history"?window.location.pathname+window.location.search:S.parse().srcHash,t;const n=()=>{if(t)return;Pe.clear();const a=S.parse(),o=G==="history"?a.srcQuery:a.srcHash;if(o!==s){const l={p:0,reject:()=>{l.p=1,t="",Ke(s)},resolve:()=>{l.p=1,s=o,t="",Ke(o),S.diff()},prevent:()=>{t=1}};if(S.fire($.CHANGE,l),t||l.p)return;if(oe.length===0){l.resolve();return}const r=W,i=a,c=oe.slice();let d=Promise.resolve(!0);for(const h of c)d=d.then(g=>g===!1?!1:h(i,r));d.then(h=>{l.p||(h===!1?l.reject():l.resolve())},()=>{l.p||l.reject()})}};S.notify=n,G==="history"||window.addEventListener("hashchange",n),window.addEventListener("popstate",n),window.addEventListener("beforeunload",a=>{const o={};S.fire($.PAGE_UNLOAD,o);const l=o.msg;l&&(a.returnValue=l)}),S.diff()},_setConfig(e){z=e,G=e.routeMode||"history"}};function Pt(){Ms=!0}var le={},Y={},Ls={},It={},Mt=0,us=new se({maxSize:30,bufferSize:10}),ie;function Lt(e){const s=us.get(e);if(s)return U({},s,{value:e});const t=e.match(Xs)||[],n={id:t[1]||"",name:t[2]||"",params:t[3]||""};return us.set(e,n),U({},n,{value:e})}function Ot(e,s){const t=[],n=e.getAttribute(`@${s}`),a=!!Y[s];if(!n&&!a)return t;let o=e,l;if(n&&(l=Lt(n)),l&&!l.id||a){let r="#",i=0;for(;o&&o!==document.body;){const h=o.id;if(h&&ie?.(h)){r=h;break}o=o.parentElement}const c=e.id;c&&ie?.(c)&&(i=1,r=c);let d=r;do{const h=d?ie?.(d):void 0;if(h){const g=h.view;if(g){const p=g.eventSelectorMap[s];if(p)for(const k of p.selectors){const u={value:k,id:d,name:k,params:""};k?!i&&Ut(e,k)&&t.push(u):i&&t.unshift(u)}if(g.template&&!i){l&&!l.id&&(l.id=d);break}i=0}}if(h)d=h.parentId||"";else break}while(d)}return l&&t.push({id:l.id,value:l.value,name:l.name,params:l.params}),t}function Ut(e,s){try{return e.matches?.(s)??!1}catch{return!1}}function Es(e){const s=e.target,t=e.type;let n="",a=s;for(;a&&a!==document.body;){const o=Ot(a,t);if(o.length)for(const i of o){const{id:c,name:d,params:h}=i;if(n!==c){if(n&&e.isPropagationStopped?.())break;n=c}const p=(c?ie?.(c):void 0)?.view;if(p){const k=d+B+t,u=Reflect.get(p,k);if(u){const E=e;E.eventTarget=s,E.params=h?A(h).params:{},_(u,[E],p,C)}}}const l=a.getAttribute("data-range-fid"),r=a.getAttribute("data-range-guid");if(l&&r&&Ls[l]?.[r]?.[t]||e.isPropagationStopped?.())break;a=a.parentElement}}var Se={bind(e,s=!1){const t=le[e]||0;t===0&&document.body.addEventListener(e,Es,!0),le[e]=t+1,s&&(Y[e]=(Y[e]||0)+1)},unbind(e,s=!1){const t=le[e]||0;if(t<=1?(document.body.removeEventListener(e,Es,!0),Reflect.deleteProperty(le,e)):le[e]=t-1,s){const n=Y[e]||0;n<=1?Reflect.deleteProperty(Y,e):Y[e]=n-1}},clearRangeEvents(e){Reflect.deleteProperty(Ls,e),Reflect.deleteProperty(It,e)},setFrameGetter(e){ie=e},nextElementGuid(){return++Mt}},R={rootId:"root",routeMode:"history",hashbang:"#!",error:e=>{throw e}};function Je(e,s){const t=typeof e=="string"?[e]:e,n=(()=>{if(R.require){const a=R.require(t);return a&&typeof a.then=="function"?a:Promise.resolve([])}return Promise.all(t.map(a=>import(a.startsWith(".")||a.startsWith("/")?a:`./${a}`).then(l=>l&&(l.__esModule||typeof l.default=="function")?l.default:l).catch(l=>{const r=R.error;r&&r(l instanceof Error?l:new Error(String(l)))})))})();return s&&n.then(a=>{s(...a)}),n}var K={option:[1,"<select multiple>"],thead:[1,"<table>"],col:[2,"<table><colgroup>"],tr:[2,"<table><tbody>"],td:[3,"<table><tbody><tr>"],area:[1,"<map>"],param:[1,"<object>"],svg:[1,'<svg xmlns="'+ze+'">'],math:[1,'<math xmlns="'+Qe+'">'],_:[0,""]};K.optgroup=K.option;K.tbody=K.tfoot=K.colgroup=K.caption=K.thead;K.th=K.td;var es=document.implementation.createHTMLDocument(""),Os=es.createElement("base");Os.href=document.location.href;es.head.appendChild(Os);var jt={INPUT:["value","checked"],TEXTAREA:["value"],OPTION:["selected"]};function te(e,s){if(!(s instanceof Element))return;const t=s.getAttribute("id");t&&(e.unmountZone(t),e.children().includes(t)&&e.unmountFrame(t))}function $t(e,s){const t=es.createElement("div"),n=s.namespaceURI;let a;if(n===ze)a="svg";else if(n===Qe)a="math";else{const r=et.exec(e);a=r?r[1]:""}const o=K[a]||K._;t.innerHTML=o[1]+e;let l=o[0];for(;l--;){const r=t.lastChild;r&&t.replaceChildren(r)}return t}function ye(e){if(e.nodeType!==1)return;const s=e;if(s.compareKeyCached)return s.cachedCompareKey;let t=s.autoId?"":s.getAttribute("id")||void 0;if(!t){const n=s.getAttribute(ce);n&&(t=A(n).path||void 0)}return s.compareKeyCached=1,s.cachedCompareKey=t||"",t}function Kt(e,s){const t=jt[e.nodeName];if(!t)return 0;let n=0;for(const a of t)Reflect.get(e,a)!==Reflect.get(s,a)&&(n=1,Reflect.set(e,a,Reflect.get(s,a)));return n}function Gt(e,s,t,n){Reflect.deleteProperty(e,"compareKeyCached");const o=e.attributes,l=s.attributes;for(let r=o.length;r--;){const i=o[r].name;s.hasAttribute(i)||(i==="id"?n||t.idUpdates.push([e,""]):(t.hasChanged=1,e.removeAttribute(i)))}for(let r=l.length;r--;){const i=l[r],c=i.name,d=i.value;e.getAttribute(c)!==d&&(c==="id"?t.idUpdates.push([e,d]):(t.hasChanged=1,e.setAttribute(c,d)))}}function Us(e,s,t,n,a){let o=e.lastChild,l=s.firstChild,r=0;const i=new Map,c=new Map;for(;o;){r++;const h=ye(o);if(h){let g=i.get(h);g||(g=[],i.set(h,g)),g.push(o)}o=o.previousSibling}for(;l;){const h=ye(l);h&&c.set(h,(c.get(h)??0)+1),l=l.nextSibling}for(l=s.firstChild,o=e.firstChild;l;){r--;const h=l;l=l.nextSibling;const g=ye(h);let p=g?i.get(g):void 0;if(p&&(p=p.slice())&&p.length){const k=p.pop();for(;k!==o&&o;){const u=o.nextSibling;e.appendChild(o),o=u}if(o=k.nextSibling,g){const u=c.get(g);u&&c.set(g,u-1)}fs(k,h,e,t,n)}else if(o){const k=o,u=ye(k);u&&i.has(u)&&c.get(u)?(r++,t.hasChanged=1,t.domOps.push([8,e,h,k])):(o=o.nextSibling,fs(k,h,e,t,n))}else t.hasChanged=1,t.domOps.push([1,e,h])}let d=e.lastChild;for(;r-- >0;)d&&(te(n,d),t.domOps.push([2,e,d]),d=d.previousSibling,t.hasChanged=1)}function fs(e,s,t,n,a,o){const l=e instanceof Element?e:null,r=s instanceof Element?s:null,i=l!==null&&r!==null&&l.isEqualNode&&l.isEqualNode(r);if(Kt(e,s)||!i)if(e.nodeType===s.nodeType&&e.nodeName===s.nodeName)if(l!==null&&r!==null){const c=l,d=r,h=d.getAttribute(ce);let g=!0;if(h){const p=c.getAttribute("id")||"",k=A(h).path,u=c.getAttribute(ce),E=u?A(u).path:"";p&&k===E&&(g=!1)}Gt(c,d,n,!!h),g&&Us(c,d,n,a)}else e.nodeValue!==s.nodeValue&&(n.hasChanged=1,e.nodeValue=s.nodeValue);else n.hasChanged=1,te(a,e),n.domOps.push([4,t,s,e])}function Nt(){return{idUpdates:[],views:[],domOps:[],hasChanged:0}}function Ht(e){for(const s of e)switch(s[0]){case 1:s[1].appendChild(s[2]);break;case 2:s[1].removeChild(s[2]);break;case 4:s[1].replaceChild(s[2],s[3]);break;case 8:s[1].insertBefore(s[2],s[3]);break}}function Vt(e){for(const[s,t]of e)t?s.setAttribute("id",t):s.removeAttribute("id")}var qt={INPUT:["value","checked"],TEXTAREA:["value"],OPTION:["selected"]};function ys(e,s){return e.compareKey&&s.compareKey===e.compareKey||!e.compareKey&&!s.compareKey&&e.tag===s.tag||e.tag===B||s.tag===B}function Te(e,s,t){const n=e.tag;if(n===je)return document.createTextNode(e.html);const a=typeof n=="string"?n:n.toString(),o=tt[a]||s.namespaceURI,l=document.createElementNS(o,a);return js(l,e,t),l.innerHTML=e.html,l}function js(e,s,t,n){let a=0;const o=s.attrsMap||{},l=s.attrsSpecials||{};if(n){const r=n.attrsMap||{},i=n.attrsSpecials||{};for(const c in r)if(!w(o,c)){a=1;const d=i[c];d?t?t.nodeProps.push([e,d,""]):Reflect.set(e,d,""):e.removeAttribute(c)}}for(const r in o){const i=o[r],c=l[r];if(c)Reflect.get(e,c)!==i&&(a=1,t?t.nodeProps.push([e,c,i]):Reflect.set(e,c,i));else{const d=n?.attrsMap;(!d||d[r]!==i)&&(a=1,e.setAttribute(r,String(i??"")))}}return a}function gs(e,s){const t=qt[e.nodeName];if(!t)return 0;const n=s.attrsMap||{};let a=0;for(const o of t){const l=n[o];l!==void 0&&Reflect.get(e,o)!==l&&(a=1,Reflect.set(e,o,l))}return a}function ge(e,s,t,n,a,o,l,r,i){const c=t.tag,d=n.tag;if(c===je||d===je){c===d?t.html!==n.html&&(a.changed=1,e.nodeValue=n.html):(a.changed=1,te(o,e),s.replaceChild(Te(n,s,a),e));return}if(c===d){if(t.attrs===n.attrs&&t.html===n.html){n.hasSpecials&&gs(e,n);return}let h=0;(t.attrs!==n.attrs||n.hasSpecials)&&(h=js(e,n,a,t),h&&(a.changed=1));let g=!0;if(n.isLarkView){const p=e.getAttribute("id")||"",k=n.isLarkView,u=t.isLarkView||"";p&&k===u&&(g=!1)}gs(e,n),g&&!n.selfClose&&$s(e,t,n,a,o,l,r,i)}else a.changed=1,te(o,e),s.replaceChild(Te(n,s,a),e)}function Wt(e){const s=e.length;if(s===0)return[];const t=[],n=[],a=new Array(s);let o=0;for(let r=0;r<s;r++){const i=e[r];if(i<0)continue;let c=0,d=o;for(;c<d;){const h=c+d>>>1;e[n[h]]<i?c=h+1:d=h}n[c]=r,a[r]=c>0?n[c-1]:-1,c===o&&o++}let l=n[o-1];for(let r=o-1;r>=0;r--)t[r]=l,l=a[l];return t}function $s(e,s,t,n,a,o,l,r){if(!s){n.changed=1,e.innerHTML=t.html,Q(r,[]);return}if(s.html===t.html){Q(r,[]);return}const i=s.children,c=t.children,d=i?.length||0,h=c?.length||0;if(d===0&&h===0){Q(r,[]);return}const g=e.childNodes,p=new Array(d);for(let F=0;F<d;F++)p[F]=g[F];const k=new Set;let u=0,E=d-1,y=0,m=h-1;for(;u<=E&&y<=m;){const F=i[u],x=c[y];if(!ys(x,F)||x.tag===B||F.tag===B)break;ge(p[u],e,F,x,n,a,o,l,r),k.add(p[u]),u++,y++}for(;u<=E&&y<=m;){const F=i[E],x=c[m];if(!ys(x,F)||x.tag===B||F.tag===B)break;ge(p[E],e,F,x,n,a,o,l,r),k.add(p[E]),E--,m--}if(u>E&&y>m){n.asyncCount===0&&Q(r,[]);return}const f={};for(let F=u;F<=E;F++){const x=i[F];x?.compareKey&&(f[x.compareKey]||(f[x.compareKey]=[]),f[x.compareKey].push({domNode:p[F],vdomNode:x}))}const b=m-y+1,v=new Array(b);for(let F=0;F<b;F++){const H=c[y+F].compareKey,M=H?f[H]:void 0;if(M&&M.length>0){const ts=M.shift();M.length===0&&delete f[H];const ns=i.indexOf(ts.vdomNode,u);v[F]=ns>=0?ns:-1,k.add(ts.domNode)}else v[F]=-1}if(y>m){for(let F=0;F<d;F++){const x=p[F];x&&!k.has(x)&&x.parentNode===e&&(te(a,x),n.changed=1,e.removeChild(x))}n.asyncCount===0&&Q(r,[]);return}if(u>E){const F=E<d?p[E+1]??null:null;for(let x=y;x<=m;x++){n.changed=1;const H=Te(c[x],e,n);e.insertBefore(H,F)}n.asyncCount===0&&Q(r,[]);return}const T=Wt(v);let L=T.length-1,D=E+1<d?p[E+1]:null;for(let F=b-1;F>=0;F--){const x=y+F,H=c[x];if(L>=0&&T[L]===F){const M=v[F];ge(p[M],e,i[M],H,n,a,o,l,r),D=p[M],L--}else if(v[F]>=0){const M=v[F];n.changed=1,e.insertBefore(p[M],D),ge(p[M],e,i[M],H,n,a,o,l,r),D=p[M]}else{n.changed=1;const M=Te(H,e,n);e.insertBefore(M,D),D=M}}for(let F=0;F<d;F++){const x=p[F];x&&!k.has(x)&&x.parentNode===e&&(te(a,x),n.changed=1,e.removeChild(x))}n.asyncCount===0&&Q(r,[])}function zt(e){return{viewId:e,viewRenders:[],nodeProps:[],asyncCount:0,changed:0,domOps:[]}}var Qt=class{viewId;data;refData;changedKeys=new Set;hasChangedFlag=0;digestingQueue=[];version=0;snapshotVersion;vdom;constructor(e){this.viewId=e,this.data={vId:e};const s={};s[B]=1,this.refData=s,this.hasChangedFlag=1}get(e){let s=this.data;return e&&(s=this.data[e]),s}set(e,s){return Ts(e,this.data,this.changedKeys,s||Ze)&&(this.version++,this.hasChangedFlag=1),this}digest(e,s,t){e&&this.set(e,s);const n=this.digestingQueue;t&&n.push(t),!(n.length>0&&n[0]===null)&&this.runDigest(n)}runDigest(e){const s=e.length;e.push(null);const t=this.changedKeys,n=this.hasChangedFlag;this.hasChangedFlag=0,this.changedKeys=new Set;const a=P.get(this.viewId),o=a?.view,l=Rs(this.viewId);if(n&&o&&l&&o.signature>0&&a){const r=o.template;if(typeof r=="function")if(R.virtualDom){const c=r(this.data,this.viewId,this.refData),d=zt(this.viewId),h=()=>{this.vdom=c,(d.changed||!o.rendered)&&o.endUpdate(this.viewId);for(const[g,p,k]of d.nodeProps)Reflect.set(g,p,k);for(const g of d.viewRenders)g.render&&_(g.render,[],g,C)};$s(l,this.vdom,c,d,a,t,o,h)}else{const i=r(this.data,this.viewId,this.refData,ot,Xe,it,dt,pt),c=$t(i,l),d=Nt();Us(l,c,d,a),Vt(d.idUpdates),Ht(d.domOps);for(const h of d.views)h.render&&_(h.render,[],h,C);(d.hasChanged||!o.rendered)&&o.endUpdate(this.viewId)}}if(e.length>s+1)this.runDigest(e);else{const r=e.slice();e.length=0;for(const i of r)i&&i()}}snapshot(){return this.snapshotVersion=this.version,this}altered(){if(this.snapshotVersion!==void 0)return this.version!==this.snapshotVersion}translate(e){return typeof e!="string"||!Bs(e)?e:w(this.refData,e)?this.refData[e]:e}parse(e){const s=e.trim();if(!s)return;if(/^-?\d+(?:\.\d+)?$/.test(s))return Number(s);if(!/^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/.test(s))return;let t=this.refData;for(const n of s.split(".")){if(t==null||typeof t!="object")return;t=t[n]}return t}getChangedKeys(){return this.changedKeys}},_e={};function Xt(e){return _e[e]}function I(e,s){const n=A(e).path;n&&(_e[n]=s)}function Ks(e){const t=A(e).path;t&&Reflect.deleteProperty(_e,t)}function Yt(){return _e}function Zt(e){const s=P.getAll(),t=[];for(const[,n]of s)n.viewPath&&A(n.viewPath).path===e&&t.push({frame:n,fullPath:n.viewPath});for(const{frame:n,fullPath:a}of t)n.mountView(a)}function Jt(e,s){e.accept(t=>{const n=t?.default??t;typeof n=="function"?(I(s,n),Zt(s)):e.invalidate()})}function en(e,s){e.dispose(()=>{Ks(s)})}var ss={};typeof window<"u"&&(ss.window=window);typeof document<"u"&&(ss.document=document);var N=class j{id="";owner=0;updater;signature=0;rendered;template;locationObserved={flag:0,keys:[],observePath:!1};observedStateKeys;resources={};endUpdatePending;_events=new q;get protoEventState(){return Object.getPrototypeOf(this)}get eventObjectMap(){return this.protoEventState.$evtObjMap??{}}get eventSelectorMap(){return this.protoEventState.$selMap??{}}get globalEventList(){return this.protoEventState.$globalEvtList??[]}init(){}render(){this.updater.digest()}on(s,t){return this._events.on(s,t),this}off(s,t){return this._events.off(s,t),this}fire(s,t,n,a){return this._events.fire(s,t,n,a),this}get ownerFrame(){return this.owner}beginUpdate(s){this.signature>0&&this.endUpdatePending!==void 0&&this.ownerFrame.unmountZone(s)}endUpdate(s,t){if(this.signature>0){const n=s||this.id;let a;t?a=t:(a=this.endUpdatePending,this.endUpdatePending=1,this.rendered=!0);const o=this.ownerFrame;o.mountZone(n),a||setTimeout(this.wrapAsync(()=>{j.runInvokes(o)}),0)}}wrapAsync(s,t){const n=this.signature;return(...a)=>{if(n>0&&n===this.signature)return s.apply(t||this,a)}}observeLocation(s,t=!1){const n=this.locationObserved;if(n.flag=1,typeof s=="object"&&!Array.isArray(s)){const a=s;a.path&&(t=!0);const o=a.params;(typeof o=="string"||Array.isArray(o))&&(s=o)}n.observePath=t,s&&(typeof s=="string"?n.keys=s.split(","):Array.isArray(s)&&(n.keys=s))}observeState(s){typeof s=="string"?this.observedStateKeys=s.split(","):this.observedStateKeys=s}capture(s,t,n=!1){const a=this.resources;if(t)j.destroyResource(a,s,!0,t),a[s]={entity:t,destroyOnRender:n};else{const o=a[s];return o?o.entity:void 0}return t}release(s,t=!0){return j.destroyResource(this.resources,s,t)}leaveTip(s,t){const n=function(o){const l=o.type===$.CHANGE,r=l?"a":"b",i=l?"b":"a";n[r]?(o.prevent?.(),o.reject?.()):t()&&(o.prevent?.(),n[i]=1,o.resolve?.())},a=o=>{t()&&(o.msg=s)};S.on($.CHANGE,n),S.on($.PAGE_UNLOAD,a),this.on("unload",n),this.on("destroy",()=>{S.off($.CHANGE,n),S.off($.PAGE_UNLOAD,a)})}static makes;static prepare(s){if(s.makes)return s.makes;const t=[];s.makes=t;const n={},a=[],o={},l=Reflect.get(s.prototype,"mixins");l&&Array.isArray(l)&&j.mergeMixins(l,s,t);for(const r in s.prototype){if(!w(s.prototype,r))continue;const i=Reflect.get(s.prototype,r);if(typeof i!="function")continue;const c=r.match(as);if(!c)continue;const d=c[1],h=c[2],g=c[3],p=c[4],k={};if(p)for(const E of p.split(","))k[E]=!0;const u=g.split(",");for(const E of u){const y=ss[h];let m=1;if(d){if(y){a.push({handler:i,element:y,eventName:E,modifiers:k});continue}m=2;let v=o[E];v||(v=o[E]={selectors:[]}),v[h]||(v[h]=1,v.selectors.push(h))}n[E]=(n[E]||0)|m;const f=h+B+E,b=Reflect.get(s.prototype,f);if(!b)Reflect.set(s.prototype,f,i);else if(typeof b=="function"){const v=i,T=b;T.marker&&(v.marker?Reflect.set(s.prototype,f,j.processMixinsSameEvent(v,T)):w(s.prototype,r)&&Reflect.set(s.prototype,f,i))}}}return j.wrapMethod(Fe(s.prototype),"render","$renderWrap"),Reflect.set(s.prototype,"$evtObjMap",n),Reflect.set(s.prototype,"$globalEvtList",a),Reflect.set(s.prototype,"$selMap",o),t}static delegateEvents(s,t=!1){const n=s.eventObjectMap,a=s.eventSelectorMap,o=s.globalEventList;for(const l in n)w(n,l)&&(t?Se.unbind(l,!!a[l]):Se.bind(l,!!a[l]));for(const l of o)if(t)l.element.removeEventListener(l.eventName,l.boundHandler);else{const r=l.handler,i=l.element,c=l.modifiers;l.boundHandler=function(d){const h=d;if(h.eventTarget=i,c){const g=d;if(c.ctrl&&!g.ctrlKey||c.shift&&!g.shiftKey||c.alt&&!g.altKey||c.meta&&!g.metaKey)return}_(r,[d],s,C)},l.element.addEventListener(l.eventName,l.boundHandler)}}static destroyAllResources(s,t){const n=s.resources;for(const a in n)if(w(n,a)){const o=n[a];(t||o.destroyOnRender)&&j.destroyResource(n,a,!0)}}static runInvokes(s){const t=s.invokeList;if(t)for(;t.length;){const n=t.shift();n&&!n.removed&&s.invoke(n.name,n.args)}}static wrapMethod(s,t,n){const a=s[t];if(typeof a!="function")return;const o=a,l=function(...r){if(this.signature>0){this.signature++,this.fire("render"),j.destroyAllResources(this,!1);const c=Fe(this)[t],d=typeof c=="function"?c:o;return _(d===l?o:d,r,this,C)}};s[t]=l,s[n]=l}static processMixinsSameEvent(s,t){let n;if(t.handlerList)n=t;else{const a=function(...o){_(a.handlerList??[],o,this,C)};a.handlerList=[t],a.marker=1,n=a}return n.handlerList=(n.handlerList??[]).concat(s.handlerList??[s]),n}static mergeMixins(s,t,n){const a=Fe(t.prototype),o={};for(const l of s)for(const r in l){if(!w(l,r))continue;const i=l[r];if(typeof i!="function")continue;const c=i,d=o[r];if(r==="make"){n.push(c);continue}as.test(r)?d?o[r]=j.processMixinsSameEvent(c,d):(c.marker=1,o[r]=c):d||(o[r]=c)}for(const l in o)w(a,l)||(a[l]=o[l])}static destroyResource(s,t,n,a){const o=s[t];if(!o||o.entity===a)return;const l=o.entity;if(l&&typeof l=="object"){const r=l.destroy;typeof r=="function"&&n&&_(r,[],l,C)}return Reflect.deleteProperty(s,t),l}static extend(s,t){const n=s??{},a=n.make,o=[];typeof a=="function"&&o.push(a);const l=this,r=class extends l{constructor(i,c,d,h,g){super(i,c,d,h,[]);const p=this;for(const E in n)w(n,E)&&E!=="make"&&E!=="render"&&(p[E]=n[E]);this.id=i,this.owner=c,this.updater=new Qt(i);const k=[d,{node:h,deep:!this.template}],u=o.concat(g||[]);u.length&&_(u,k,this,C)}};for(const i in n)w(n,i)&&i!=="make"&&Reflect.set(r.prototype,i,n[i]);if(t)for(const i in t)w(t,i)&&Reflect.set(r,i,t[i]);return r}static merge(...s){const t=this.makes||[];return j.mergeMixins(s,this,t),this}static accept(s,t){s&&Jt(s,t)}static dispose(s,t){s&&en(s,t)}},O=new Map,me,be,sn=64,Me=[],Le=new q,P=class Z extends q{id;_parentId=void 0;get parentId(){return this._parentId}childrenMap={};childrenCount=0;readyCount=0;readyMap=new Set;viewInstance;get view(){return this.viewInstance}invokeList=[];signature=1;hasAltered=0;destroyed=0;viewPath;originalTemplate;holdFireCreated=0;childrenCreated=0;childrenAlter=0;constructor(s,t){super(),this.id=s,t&&(this._parentId=t),O.set(s,this);const n=document.getElementById(s);n&&(n.frame=this,n.frameBound=1),Z.fire("add",{frame:this})}mountView(s,t){const n=document.getElementById(this.id),a=this.parentId;!this.hasAltered&&n&&(this.hasAltered=1,this.originalTemplate=n.innerHTML),this.unmountView(),this.destroyed=0;const o=A(s||""),l=o.path;if(!n||!l)return;this.viewPath=s;const r=o.params;ln(a||this.id,s,r);const i={...r};t&&U(i,t);const c=this.signature,d=Xt(l);if(d){this.doMountView(d,i,n,c);return}Je(l,h=>{if(c===this.signature)if(typeof h=="function"){const g=h;I(l,g),this.doMountView(g,i,n,c)}else{const g=new Error(`Cannot load view: ${l}`),p=R.error;p&&p(g)}})}doMountView(s,t,n,a){if(a!==this.signature)return;const o=N.prepare(s),l=s,r=new l(this.id,this,t,n,o);this.viewInstance=r,r.signature=1,N.delegateEvents(r);const i=_(r.init,[t,{node:n,deep:!r.template}],r,C),c=++this.signature;Promise.resolve(i).then(()=>{c===this.signature&&(r.template?r.render():(this.hasAltered=0,r.endUpdatePendingFlag||r.endUpdate()))})}unmountView(){const s=this.view;if(this.invokeList=[],!s)return;be||(be={id:this.id}),this.destroyed=1,this.unmountZone(),Ge(this,be),s.signature>0&&s.fire("destroy",void 0,!0,!0),Se.clearRangeEvents(this.id),delete this.viewInstance;const t=document.getElementById(this.id);t&&this.originalTemplate&&(t.innerHTML=this.originalTemplate),be=void 0,Is(s)}mountFrame(s,t,n){Ge(this,{id:s});let a=O.get(s);return a||(this.childrenMap[s]||this.childrenCount++,this.childrenMap[s]=s,a=Me.pop(),a?an(a,s,this.id):a=new Z(s,this.id)),a.mountView(t,n),a}unmountFrame(s){const t=s?this.childrenMap[s]:this.id,n=O.get(t);if(!n)return;const a=n.readyCount>0,o=n.parentId;n.unmountView(),nn(t,a),on(n),Me.length<sn&&Me.push(n);const l=O.get(o||"");l&&l.childrenMap[t]&&(Reflect.deleteProperty(l.childrenMap,t),l.childrenCount--,we(l))}mountZone(s){const t=s||this.id;this.holdFireCreated=1;const n=document.getElementById(t);if(!n)return;const a=n.querySelectorAll(`[${ce}]`),o=[];a.forEach(l=>{if(!(l instanceof HTMLElement)||tn(l))return;const r=vt(l,"frame_");l.frameBound=1;const i=kt(l,ce);o.push([r,i])});for(const[l,r]of o)this.mountFrame(l,r);this.holdFireCreated=0,we(this)}unmountZone(s){for(const t in this.childrenMap)w(this.childrenMap,t)&&(!s||t!==s)&&this.unmountFrame(t);we(this)}children(){const s=[];for(const t in this.childrenMap)w(this.childrenMap,t)&&s.push(t);return s}parent(s=1){let t,n=this.parentId,a=s>>>0||1;for(;n&&a--;)t=O.get(n),n=t?.parentId;return t}invoke(s,t){let n;const a=this.view;if(a&&a.rendered){const o=Reflect.get(a,s);typeof o=="function"&&(n=_(o,t||[],a,C))}else{const o=B+s;let l;for(const i of this.invokeList)if(i.key===o){l=i;break}l&&(l.removed=t===l.args);const r={name:s,args:t||[],key:o};this.invokeList.push(r)}return n}invokeTyped(s,t){return this.invoke(s,t)}static get(s){return O.get(s)}static getAll(){return O}static getRoot(){return me}static createRoot(s){if(!me){s=s||"root";let t=document.getElementById(s);t||(t=document.body,t.id=s),me=new Z(s)}return me}static on(s,t){return Le.on(s,t),Z}static off(s,t){return Le.off(s,t),Z}static fire(s,t){Le.fire(s,t)}};function tn(e){return!!e.frameBound}function nn(e,s){const t=O.get(e);if(!t)return;O.delete(e),P.fire("remove",{frame:t,fcc:s});const n=document.getElementById(e);n&&(n.frameBound=0,Reflect.deleteProperty(n,"frame"))}function we(e){if(!e.childrenCreated&&!e.holdFireCreated&&e.childrenCount===e.readyCount){e.childrenCreated||(e.childrenCreated=1,e.childrenAlter=0,e.fire("created"));const s=e.parentId;if(s){const t=O.get(s);t&&!t.readyMap.has(e.id)&&(t.readyMap.add(e.id),t.readyCount++,we(t))}}}function Ge(e,s){if(!e.childrenAlter&&e.childrenCreated){e.childrenCreated=0,e.childrenAlter=1,e.fire("alter",s);const t=e.parentId;if(t){const n=O.get(t);n&&n.readyMap.has(e.id)&&(n.readyCount--,n.readyMap.delete(e.id),Ge(n,s))}}}function an(e,s,t){Reflect.set(e,"id",s),e._parentId=t,e.childrenMap={},e.childrenCount=0,e.readyCount=0,e.signature=1,e.readyMap=new Set,e.invokeList=[],O.set(s,e)}function on(e){Reflect.set(e,"id",""),e._parentId=void 0,e.childrenMap={},e.readyMap=new Set}function ln(e,s,t){const a=O.get(e)?.view;if(!a)return;const o=a.updater.refData;if(o&&s.indexOf(B)>0){_s(o,t);const r=t[B];r&&typeof r=="object"&&(U(t,r),Reflect.deleteProperty(t,B))}}var ke={},Oe=null;function rn(e,s){const t=R.crossConfigs||window.crossConfigs,n=R.projectName||"",a=e.indexOf("/"),o=a>-1?e.substring(0,a):e;if(o===n)return Promise.resolve();if(!ke[o]){if(Oe||(Oe=Ds(t||[],"projectName")),!Oe[o])return Promise.reject(new Error(`Cannot find ${o} from crossConfigs`));ke[o]=Je(`${o}/prepare`).then(r=>{let i=r[0];if(i&&typeof i=="object"&&i!==null){const c=i;c.__esModule&&(i=c.default)}if(typeof i=="function")return i({bizCode:s})}).catch(r=>{throw Reflect.deleteProperty(ke,o),r})}return ke[o]}var cn=(e,s)=>{let t="<div>Loading...</div>";if(e&&typeof e=="object"){const n=e.skeleton;typeof n=="string"&&(t=n)}return`<div id="mf_${s}">${t}</div>`};N.extend({template:cn,init(e){this.$sign=0,this.on("destroy",()=>{this.$sign=-1}),this.assign?.(e)},assign(e){this.$view=typeof e.view=="string"?e.view:"";const s=e.params,t=s&&typeof s=="object"?s:{};return this.$params={...e,...t},this.updater.set({skeleton:e.skeleton,skeletonParams:e.skeletonParams||{},bizCode:e.bizCode}),this.$sign>0&&this.updateView(),!1},async updateView(){const e=++this.$sign,t=this.updater.get().bizCode;try{await rn(this.$view,t)}catch(c){const d=document.getElementById("mf_"+this.id);if(d){const h=c instanceof Error?c:new Error(String(c));d.innerHTML=h.message||String(h)}}if(this.$sign!==e)return;const n=P.get("mf_"+this.id),o=A(this.$view).path,l=n?.viewPath?A(n.viewPath).path:"",r=n?.view;if(o===l&&r&&typeof r.assign=="function"){_(r.assign,[this.$params],r,C)&&r.render();return}const i=this.owner;i&&typeof i!="number"&&i.mountFrame("mf_"+this.id,this.$view,this.$params)},render(){const e=this.$params;this.updater.digest({skeleton:e?.skeleton}),this.updateView()},callView(e,...s){return P.get("mf_"+this.id)?.invoke(e,s)}});var Ne=class{data;cacheInfo;constructor(e={}){this.data=e}get(e){return this.data[e]}set(e,s){return typeof e=="string"?this.data[e]=s:U(this.data,e),this}},He=1,Gs=2;(class{id="";busy=0;destroyed=0;taskQueue=[];prevArgs=[];_emitter=new q;constructor(){this.id=Be("service")}get emitter(){return this._emitter}get internals(){const e=this.constructor;return{metaList:e._metaList,payloadCache:e._payloadCache,pendingCacheKeys:e._pendingCacheKeys,syncFn:e._syncFn,staticEmitter:e._staticEmitter}}get type(){return this.constructor}all(e,s){return Ce(this,e,s,He,!1),this}one(e,s){return Ce(this,e,s,Gs,!1),this}save(e,s){return Ce(this,e,s,He,!0),this}enqueue(e){return this.destroyed||(this.taskQueue.push(e),this.dequeue(...this.prevArgs)),this}dequeue(...e){!this.busy&&!this.destroyed&&(this.busy=1,setTimeout(()=>{if(this.busy=0,!this.destroyed){const s=this.taskQueue.shift();s&&(this.prevArgs=e,_(s,e,this,C))}},0))}destroy(){this.destroyed=1,this.taskQueue=[]}on(e,s){return this._emitter.on(e,s),this}off(e,s){return this._emitter.off(e,s),this}fire(e,s){return this._emitter.fire(e,s),this}static _metaList={};static _payloadCache=new se({maxSize:20,bufferSize:5});static _pendingCacheKeys={};static _syncFn=C;static _staticEmitter=new q;static _cacheMax=20;static _cacheBuffer=5;static add(e){Array.isArray(e)||(e=[e]);for(const s of e)if(s){const t=s.name,n=s.cache;s.cache=n?n|0:0,this._metaList[t]=s}}static meta(e){const s=typeof e=="string"?e:String(e.name??""),t=this._metaList[s];return t||e}static create(e){const s=this.meta(e),t=ks(e.cache)||s.cache||0,n=new Ne;n.set(s),n.cacheInfo={name:s.name,after:typeof s.after=="function"?s.after:void 0,cleans:typeof s.cleanKeys=="string"?s.cleanKeys:void 0,key:t?bs(s,e):"",time:0},e!==null&&n.set(e);const a=s.before;return typeof a=="function"&&_(a,[n],n,C),this._staticEmitter.fire("begin",{payload:n}),n}static get(e,s){let t,n=!1;return s||(t=this.cached(e)),t||(t=this.create(e),n=!0),{entity:t,needsUpdate:n}}static cached(e){const s=this.meta(e),t=ks(e.cache)||s.cache||0;let n="";if(t&&(n=bs(s,e)),n){const a=this._pendingCacheKeys[n];if(a){const l=a.entity;return l instanceof Ne?l:void 0}const o=this._payloadCache.get(n);if(o&&o.cacheInfo){if(Date.now()-o.cacheInfo.time>t){this._payloadCache.del(n);return}return o}}}static clear(e){const s=new Set((typeof e=="string"?e:e.join(",")).split(",")),t=[];this._payloadCache.forEach(n=>{const a=n?.cacheInfo;a&&a.key&&s.has(a.name)&&t.push(a.key)});for(const n of t)this._payloadCache.del(n)}static on(e,s){this._staticEmitter.on(e,s)}static off(e,s){this._staticEmitter.off(e,s)}static fire(e,s){this._staticEmitter.fire(e,s)}static extend(e,s,t){const n=this;class a extends n{static _metaList={};static _payloadCache=new se({maxSize:s||n._cacheMax,bufferSize:t||n._cacheBuffer});static _pendingCacheKeys={};static _syncFn=e;static _staticEmitter=new q;static _cacheMax=s||n._cacheMax;static _cacheBuffer=t||n._cacheBuffer}return a}});var ms=new WeakMap;function pn(e){let s=ms.get(e);return s===void 0&&(s=JSON.stringify(e),ms.set(e,s)),s}function bs(e,s){return JSON.stringify(s)+B+pn(e)}function ks(e){if(typeof e=="number")return e|0;if(typeof e=="string"){const s=Number(e);return Number.isFinite(s)?s|0:0}return 0}function Ce(e,s,t,n,a){if(e.destroyed)return;if(e.busy){const u=()=>Ce(e,s,t,n,a);e.enqueue(u);return}e.busy=1;let o;typeof s=="string"?o=[{name:s}]:Array.isArray(s)?o=s:o=[s];const l=e.internals,{syncFn:r,pendingCacheKeys:i,staticEmitter:c}=l;let d=0;const h=o.length,g=new Array(h+1),p=[],k=(u,E)=>{const y=g[u+1];let m=!1;if(E?(p[u]=E,c.fire("fail",{payload:y,error:E})):(m=!0,c.fire("done",{payload:y})),!e.destroyed){const f=d===h;f&&(e.busy=0,n===He&&(g[0]=p,_(t,g,e,C))),n===Gs&&_(t,[E||null,y,f,u],e,C)}m&&c.fire("end",{payload:y,error:E})};for(const u of o){if(!u)continue;const E=typeof u=="string"?{name:u}:u,y=e.type.get(E,a),m=y.entity,f=m.cacheInfo?.key||"";g[d+1]=m;const b=k.bind(null,d++);if(f&&i[f])i[f].push(b);else if(y.needsUpdate)if(f){const v=[b];v.entity=m,i[f]=v,r(m,()=>{const L=i[f],D=L.entity;D instanceof Ne&&D.cacheInfo&&(D.cacheInfo.time=Date.now(),l.payloadCache.set(f,D)),Reflect.deleteProperty(i,f);for(const F of L)typeof F=="function"&&F()})}else r(m,b);else b()}}var re={MSG_PING:"LARK_DEVTOOL_PING",MSG_PONG:"LARK_DEVTOOL_PONG",MSG_REQUEST_TREE:"LARK_DEVTOOL_REQUEST_TREE",MSG_TREE:"LARK_DEVTOOL_TREE",MSG_TREE_DELTA:"LARK_DEVTOOL_TREE_DELTA"};function dn(e){const s=e.eventObjectMap,t=s?Object.keys(s):[],n=e.resources?Object.keys(e.resources):[],a=typeof e.assign=="function";let o=null;try{const l=e.updater?.refData;if(l&&typeof l=="object"){o={};for(const r of Object.keys(l)){const i=l[r];o[r]=i===null||typeof i!="object"?i:`[${typeof i}]`}}}catch{}return{id:e.id,rendered:!!e.rendered,signature:e.signature,observedStateKeys:e.observedStateKeys??null,locationObserved:{flag:e.locationObserved.flag,keys:e.locationObserved.keys,observePath:e.locationObserved.observePath},hasTemplate:!!e.template,eventMethodKeys:t,resourceKeys:n,hasAssign:a,updaterData:o}}function Ns(e){const s=P.get(e);if(!s)return null;const t=s.view,n=[];for(const a of s.children()){const o=Ns(a);o&&n.push(o)}return{id:s.id,parentId:s.parentId??null,viewPath:s.viewPath??null,childrenCount:s.childrenCount,readyCount:s.readyCount,childrenCreated:s.childrenCreated,childrenAlter:s.childrenAlter,destroyed:s.destroyed,view:t?dn(t):null,children:n}}function Hs(){const e=P.getRoot();if(!e)return{root:null,totalFrames:0,timestamp:Date.now(),rootId:""};const s=Ns(e.id);let t=0;const n=a=>{if(a){t++;for(const o of a.children)n(o)}};return n(s),{root:s,totalFrames:t,timestamp:Date.now(),rootId:e.id}}var vs=!1,Fs="";function hn(){vs||typeof window>"u"||(vs=!0,window.addEventListener("message",e=>{const s=e.data;if(!s||typeof s!="object")return;const t=s.type;if(t===re.MSG_PING){const n=e.source;n&&n.postMessage({type:re.MSG_PONG},{targetOrigin:"*"});return}if(t===re.MSG_REQUEST_TREE){const n=Hs(),a=e.source;a&&a.postMessage({type:re.MSG_TREE,data:n},{targetOrigin:"*"})}}),P.on("add",()=>{xs()}),P.on("remove",()=>{xs()}))}function xs(){if(window===window.parent)return;const e=Hs(),s=JSON.stringify(e);s!==Fs&&(Fs=s,window.parent.postMessage({type:re.MSG_TREE_DELTA,data:e},"*"))}var ws=!1,J=[],X=0,Ve=!1;function Ue(e){const s=!!e,t=Date.now();for(;;){const n=J[X];if(!n){J.length=0,X=0,Ve=!1;return}if(s&&e){if(e.timeRemaining()<=0){qe();return}}else if(Date.now()-t>st&&J.length>X+3){qe();return}const a=J[X+1],o=J[X+2];_(n,o,a,C),X+=3}}function qe(){const e=window.scheduler;e&&typeof e.postTask=="function"?e.postTask(()=>Ue(),{priority:"background"}):typeof window.requestIdleCallback=="function"?window.requestIdleCallback(Ue):setTimeout(Ue,0)}function un(e,s,t){J.push(e,t,s||[]),Ve||(Ve=!0,qe())}var We=0;function En(e){return!!e&&(typeof e=="object"||typeof e=="function")&&typeof e.then=="function"}function fn(e){const s=e.locationObserved;let t=!1;if(s.flag&&(s.observePath&&(t=!!S.diff()?.path),!t&&s.keys.length)){const a=S.diff()?.params;if(a){for(const o of s.keys)if(t=w(a,o),t)break}}return t}function yn(e,s){const t=e.observedStateKeys;if(!t)return!1;for(const n of t)if(s.has(n))return!0;return!1}function gn(e,s){const t=[e],n=a=>{for(;a.length>0;){const o=a.pop(),l=o,r=o.view;if(!r||l.dispatcherUpdateTag===We||r.signature<=1)continue;l.dispatcherUpdateTag=We;const i=s?yn(r,s):fn(r);let c;if(i){const h=_(r.renderMethod??r.render,[],r,C);En(h)&&(c=h)}const d=o.children();if(c)c.then(()=>{const h=[];for(let g=d.length-1;g>=0;g--){const p=P.get(d[g]);p&&h.push(p)}n(h)});else for(let h=d.length-1;h>=0;h--){const g=P.get(d[h]);g&&a.push(g)}}};n(t)}function Cs(e){const s=P.getRoot();if(!s)return;const n=e.view;if(n){const a=String(typeof n=="object"&&n!==null?n.to||"":n);s.mountView(a)}else We++,gn(s,e.keys)}function mn(e,s,t){const n=new CustomEvent(s,{bubbles:!0,cancelable:!0,...t});e.dispatchEvent(n)}var Vs=1,qs=0;function bn(e,s){s==null&&(s=30*1e3);const t=P.get(e),n=Date.now()+s;return new Promise(a=>{const o=()=>{Date.now()>n||!t?a(qs):t.childrenCount===t.readyCount?a(Vs):setTimeout(o,9)};setTimeout(o,9)})}function kn(e){return e===void 0?R:R[e]}var Ws={getConfig:kn,setConfig(e){return e&&typeof e=="object"&&U(R,e),R},config(e){return e?typeof e=="string"?R[e]:(U(R,e),R):R},boot(e){e&&typeof e=="object"&&U(R,e),S._setConfig(R),Se.setFrameGetter(n=>P.get(n)),S.on($.CHANGED,n=>{n&&Cs(n)}),V.on($.CHANGED,n=>{n&&Cs(n)}),ws=!0,Pt(),hn();const s=P.createRoot(R.rootId);S._bind();const t=R.defaultView||"";t&&!s.view&&s.mountView(t)},isBooted(){return ws},mark:wt,unmark:Is,dispatch:mn,task:un,delay(e){return new Promise(s=>setTimeout(s,e))},use:Je,waitZoneViewsRendered:bn,WAIT_OK:Vs,WAIT_TIMEOUT_OR_NOT_FOUND:qs,toMap:Ds,toTry:_,toUrl:As,parseUrl:A,mix:U,has:w,keys:bt,inside:Ft,node:Rs,applyStyle:Ps,guid:Be,Cache:se,nodeId(e){return e.id||(e.id=Be("l_")),e.id},Base:q,Router:S,State:V,View:N,Frame:P};typeof window<"u"&&(window.__lark_Framework=Ws,window.__lark_State=V,window.__lark_Router=S,window.__lark_Frame=P,window.__lark_View=N,window.__lark_invalidateViewClass=Ks,window.__lark_getViewClassRegistry=Yt,window.__lark_registerViewClass=I);const vn={title:"Configuration",description:"Full reference for lark-docs.config.ts defineConfig options",sidebarPosition:2,headings:[{level:2,text:"defineConfig",slug:"defineconfig"},{level:2,text:"Options Reference",slug:"options-reference"},{level:3,text:"`docs`",slug:"docs"},{level:3,text:"`baseUrl`",slug:"baseurl"},{level:3,text:"`routeMode`",slug:"routemode"},{level:3,text:"`title`",slug:"title"},{level:3,text:"`description`",slug:"description"},{level:3,text:"`lang`",slug:"lang"},{level:3,text:"`nav`",slug:"nav"},{level:3,text:"`sidebar`",slug:"sidebar"},{level:3,text:"`markdown`",slug:"markdown"},{level:3,text:"`highlight`",slug:"highlight"},{level:3,text:"`search`",slug:"search"},{level:2,text:"Complete Example",slug:"complete-example"}],relativePath:"/Users/hangtiancheng/github/lark/packages/lark-docs/docs/get-started/configuration.md"},Fn={pageData:vn,template:function(e,s,t){return`<h1 id="configuration" class="scroll-mt-20">Configuration <a class="link link-hover text-base-content/30 no-underline" href="#configuration" aria-hidden="true">#</a></h1>
<p><code>@lark.js/docs</code> is configured through a <code>lark-docs.config.ts</code> file using the <code>defineConfig</code> helper. This page documents every configuration option.</p>
<h2 id="defineconfig" class="scroll-mt-20">defineConfig <a class="link link-hover text-base-content/30 no-underline" href="#defineconfig" aria-hidden="true">#</a></h2>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#F97583">import</span><span style="color:#E1E4E8"> { defineConfig } </span><span style="color:#F97583">from</span><span style="color:#9ECBFF"> "@lark.js/docs"</span><span style="color:#E1E4E8">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583">export</span><span style="color:#F97583"> default</span><span style="color:#B392F0"> defineConfig</span><span style="color:#E1E4E8">({</span></span>
<span class="line"><span style="color:#E1E4E8">  docs: </span><span style="color:#9ECBFF">"docs"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#E1E4E8">  baseUrl: </span><span style="color:#9ECBFF">"/docs/"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#E1E4E8">  routeMode: </span><span style="color:#9ECBFF">"history"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#E1E4E8">  title: </span><span style="color:#9ECBFF">"My Library"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#6A737D">  // ... all options below</span></span>
<span class="line"><span style="color:#E1E4E8">});</span></span>
<span class="line"></span></code></pre>
<p><code>defineConfig</code> is a type-safe identity function — it returns the argument unchanged and exists purely for TypeScript inference at the call site.</p>
<h2 id="options-reference" class="scroll-mt-20">Options Reference <a class="link link-hover text-base-content/30 no-underline" href="#options-reference" aria-hidden="true">#</a></h2>
<h3 id="docs" class="scroll-mt-20"><code>docs</code> <a class="link link-hover text-base-content/30 no-underline" href="#docs" aria-hidden="true">#</a></h3>
<p>Type: <code>string</code> — Default: <code>&quot;docs&quot;</code></p>
<p>The source directory containing <code>.md</code> files, relative to the project root.</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#B392F0">docs</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"docs"</span><span style="color:#E1E4E8">; </span><span style="color:#6A737D">// resolves to &#x3C;project>/docs/</span></span>
<span class="line"><span style="color:#B392F0">docs</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"content"</span><span style="color:#E1E4E8">; </span><span style="color:#6A737D">// resolves to &#x3C;project>/content/</span></span>
<span class="line"></span></code></pre>
<h3 id="baseurl" class="scroll-mt-20"><code>baseUrl</code> <a class="link link-hover text-base-content/30 no-underline" href="#baseurl" aria-hidden="true">#</a></h3>
<p>Type: <code>string</code> — Default: <code>&quot;/docs/&quot;</code></p>
<p>Common URL prefix for all generated routes. Every route path is prefixed with this value.</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#B392F0">baseUrl</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"/docs/"</span><span style="color:#E1E4E8">; </span><span style="color:#6A737D">// routes: /docs/, /docs/guide/, /docs/api/router</span></span>
<span class="line"><span style="color:#B392F0">baseUrl</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"/v2/docs/"</span><span style="color:#E1E4E8">; </span><span style="color:#6A737D">// routes: /v2/docs/, /v2/docs/guide/</span></span>
<span class="line"><span style="color:#B392F0">baseUrl</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"/"</span><span style="color:#E1E4E8">; </span><span style="color:#6A737D">// routes: /, /guide/, /api/router</span></span>
<span class="line"></span></code></pre>
<h3 id="routemode" class="scroll-mt-20"><code>routeMode</code> <a class="link link-hover text-base-content/30 no-underline" href="#routemode" aria-hidden="true">#</a></h3>
<p>Type: <code>&quot;history&quot; | &quot;hash&quot;</code> — Default: <code>&quot;history&quot;</code></p>
<p>Maps to <code>@lark.js/mvc</code> Router's route mode.</p>
<table>
<thead>
<tr>
<th>Mode</th>
<th>URL Format</th>
<th>Example</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>history</code></td>
<td><code>/docs/guide/</code></td>
<td>Clean URLs via pushState</td>
</tr>
<tr>
<td><code>hash</code></td>
<td><code>#!/docs/guide/</code></td>
<td>Hash fragment URLs</td>
</tr>
</tbody>
</table>
<h3 id="title" class="scroll-mt-20"><code>title</code> <a class="link link-hover text-base-content/30 no-underline" href="#title" aria-hidden="true">#</a></h3>
<p>Type: <code>string</code> — <strong>Required</strong></p>
<p>Site title displayed in the navbar.</p>
<h3 id="description" class="scroll-mt-20"><code>description</code> <a class="link link-hover text-base-content/30 no-underline" href="#description" aria-hidden="true">#</a></h3>
<p>Type: <code>string</code></p>
<p>Site description for meta tags and search indexing.</p>
<h3 id="lang" class="scroll-mt-20"><code>lang</code> <a class="link link-hover text-base-content/30 no-underline" href="#lang" aria-hidden="true">#</a></h3>
<p>Type: <code>string</code> — Default: <code>&quot;en-US&quot;</code></p>
<p>Language code for the HTML <code>lang</code> attribute.</p>
<h3 id="nav" class="scroll-mt-20"><code>nav</code> <a class="link link-hover text-base-content/30 no-underline" href="#nav" aria-hidden="true">#</a></h3>
<p>Type: <code>NavItem[]</code></p>
<p>Top navigation items displayed in the navbar.</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#B392F0">nav</span><span style="color:#E1E4E8">: [</span></span>
<span class="line"><span style="color:#E1E4E8">  { text: </span><span style="color:#9ECBFF">"Guide"</span><span style="color:#E1E4E8">, link: </span><span style="color:#9ECBFF">"/docs/guide/"</span><span style="color:#E1E4E8"> },</span></span>
<span class="line"><span style="color:#E1E4E8">  { text: </span><span style="color:#9ECBFF">"API"</span><span style="color:#E1E4E8">, link: </span><span style="color:#9ECBFF">"/docs/api/"</span><span style="color:#E1E4E8"> },</span></span>
<span class="line"><span style="color:#E1E4E8">  { text: </span><span style="color:#9ECBFF">"GitHub"</span><span style="color:#E1E4E8">, link: </span><span style="color:#9ECBFF">"https://github.com/..."</span><span style="color:#E1E4E8"> },</span></span>
<span class="line"><span style="color:#E1E4E8">];</span></span>
<span class="line"></span></code></pre>
<p>Each item has:</p>
<ul>
<li><code>text: string</code> — Display text</li>
<li><code>link: string</code> — URL (internal or external)</li>
<li><code>items?: NavItem[]</code> — Nested dropdown items (optional)</li>
</ul>
<h3 id="sidebar" class="scroll-mt-20"><code>sidebar</code> <a class="link link-hover text-base-content/30 no-underline" href="#sidebar" aria-hidden="true">#</a></h3>
<p>Type: <code>Record&lt;string, &quot;auto&quot; | SidebarItem[]&gt;</code></p>
<p>Sidebar configuration per URL prefix. Set to <code>&quot;auto&quot;</code> to generate from the directory structure.</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#B392F0">sidebar</span><span style="color:#E1E4E8">: {</span></span>
<span class="line"><span style="color:#9ECBFF">  "/docs/guide/"</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"auto"</span><span style="color:#E1E4E8">,     </span><span style="color:#6A737D">// auto-generate from docs/guide/</span></span>
<span class="line"><span style="color:#9ECBFF">  "/docs/api/"</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"auto"</span><span style="color:#E1E4E8">,       </span><span style="color:#6A737D">// auto-generate from docs/api/</span></span>
<span class="line"><span style="color:#9ECBFF">  "/docs/custom/"</span><span style="color:#E1E4E8">: [          </span><span style="color:#6A737D">// manual configuration</span></span>
<span class="line"><span style="color:#E1E4E8">    { text: </span><span style="color:#9ECBFF">"Overview"</span><span style="color:#E1E4E8">, link: </span><span style="color:#9ECBFF">"/docs/custom/"</span><span style="color:#E1E4E8"> },</span></span>
<span class="line"><span style="color:#E1E4E8">    { text: </span><span style="color:#9ECBFF">"Details"</span><span style="color:#E1E4E8">, link: </span><span style="color:#9ECBFF">"/docs/custom/details"</span><span style="color:#E1E4E8"> },</span></span>
<span class="line"><span style="color:#E1E4E8">  ],</span></span>
<span class="line"><span style="color:#E1E4E8">}</span></span>
<span class="line"></span></code></pre>
<p>When set to <code>&quot;auto&quot;</code>, the sidebar is generated using these rules:</p>
<ol>
<li>Routes are grouped by subdirectory</li>
<li>Items sort by <code>sidebar_position</code> (frontmatter), then alphabetically</li>
<li><code>index.md</code> becomes a top-level item</li>
<li>Subdirectories become collapsible groups</li>
</ol>
<h3 id="markdown" class="scroll-mt-20"><code>markdown</code> <a class="link link-hover text-base-content/30 no-underline" href="#markdown" aria-hidden="true">#</a></h3>
<p>Type: <code>MarkdownOptions</code></p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#B392F0">markdown</span><span style="color:#E1E4E8">: {</span></span>
<span class="line"><span style="color:#B392F0">  lineNumbers</span><span style="color:#E1E4E8">: </span><span style="color:#79B8FF">true</span><span style="color:#E1E4E8">,          </span><span style="color:#6A737D">// show line numbers in code blocks</span></span>
<span class="line"><span style="color:#B392F0">  anchor</span><span style="color:#E1E4E8">: { </span><span style="color:#B392F0">permalink</span><span style="color:#E1E4E8">: </span><span style="color:#79B8FF">true</span><span style="color:#E1E4E8"> }, </span><span style="color:#6A737D">// add # permalink links to headings</span></span>
<span class="line"><span style="color:#B392F0">  toc</span><span style="color:#E1E4E8">: { </span><span style="color:#B392F0">level</span><span style="color:#E1E4E8">: [</span><span style="color:#79B8FF">2</span><span style="color:#E1E4E8">, </span><span style="color:#79B8FF">3</span><span style="color:#E1E4E8">] },     </span><span style="color:#6A737D">// heading levels for TOC extraction</span></span>
<span class="line"><span style="color:#B392F0">  containers</span><span style="color:#E1E4E8">: {               </span><span style="color:#6A737D">// custom container labels</span></span>
<span class="line"><span style="color:#B392F0">    tip</span><span style="color:#E1E4E8">: { </span><span style="color:#B392F0">label</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"TIP"</span><span style="color:#E1E4E8"> },</span></span>
<span class="line"><span style="color:#B392F0">    warning</span><span style="color:#E1E4E8">: { </span><span style="color:#B392F0">label</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"WARNING"</span><span style="color:#E1E4E8"> },</span></span>
<span class="line"><span style="color:#B392F0">    danger</span><span style="color:#E1E4E8">: { </span><span style="color:#B392F0">label</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"DANGER"</span><span style="color:#E1E4E8"> },</span></span>
<span class="line"><span style="color:#E1E4E8">  },</span></span>
<span class="line"><span style="color:#E1E4E8">}</span></span>
<span class="line"></span></code></pre>
<h3 id="highlight" class="scroll-mt-20"><code>highlight</code> <a class="link link-hover text-base-content/30 no-underline" href="#highlight" aria-hidden="true">#</a></h3>
<p>Type: <code>HighlightOptions</code></p>
<p>Shiki syntax highlighting configuration. When omitted, code blocks render as plain escaped text.</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#B392F0">highlight</span><span style="color:#E1E4E8">: {</span></span>
<span class="line"><span style="color:#B392F0">  theme</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"github-dark"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#B392F0">  languages</span><span style="color:#E1E4E8">: [</span><span style="color:#9ECBFF">"typescript"</span><span style="color:#E1E4E8">, </span><span style="color:#9ECBFF">"javascript"</span><span style="color:#E1E4E8">, </span><span style="color:#9ECBFF">"html"</span><span style="color:#E1E4E8">, </span><span style="color:#9ECBFF">"css"</span><span style="color:#E1E4E8">, </span><span style="color:#9ECBFF">"json"</span><span style="color:#E1E4E8">, </span><span style="color:#9ECBFF">"bash"</span><span style="color:#E1E4E8">],</span></span>
<span class="line"><span style="color:#E1E4E8">}</span></span>
<span class="line"></span></code></pre>
<p>See <a href="/docs/markdown/code-highlighting/" data-lark-nav="true">Code Highlighting</a> for the full language list and theme options.</p>
<h3 id="search" class="scroll-mt-20"><code>search</code> <a class="link link-hover text-base-content/30 no-underline" href="#search" aria-hidden="true">#</a></h3>
<p>Type: <code>SearchOptions</code></p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#B392F0">search</span><span style="color:#E1E4E8">: {</span></span>
<span class="line"><span style="color:#B392F0">  provider</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"local"</span><span style="color:#E1E4E8">,  </span><span style="color:#6A737D">// "local" for client-side full-text search</span></span>
<span class="line"><span style="color:#6A737D">                      // "none" to disable search</span></span>
<span class="line"><span style="color:#E1E4E8">}</span></span>
<span class="line"></span></code></pre>
<h2 id="complete-example" class="scroll-mt-20">Complete Example <a class="link link-hover text-base-content/30 no-underline" href="#complete-example" aria-hidden="true">#</a></h2>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#F97583">import</span><span style="color:#E1E4E8"> { defineConfig } </span><span style="color:#F97583">from</span><span style="color:#9ECBFF"> "@lark.js/docs"</span><span style="color:#E1E4E8">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583">export</span><span style="color:#F97583"> default</span><span style="color:#B392F0"> defineConfig</span><span style="color:#E1E4E8">({</span></span>
<span class="line"><span style="color:#E1E4E8">  docs: </span><span style="color:#9ECBFF">"docs"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#E1E4E8">  baseUrl: </span><span style="color:#9ECBFF">"/docs/"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#E1E4E8">  routeMode: </span><span style="color:#9ECBFF">"history"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#E1E4E8">  title: </span><span style="color:#9ECBFF">"My Library"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#E1E4E8">  description: </span><span style="color:#9ECBFF">"Documentation for My Library"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#E1E4E8">  lang: </span><span style="color:#9ECBFF">"en-US"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#E1E4E8">  nav: [</span></span>
<span class="line"><span style="color:#E1E4E8">    { text: </span><span style="color:#9ECBFF">"Guide"</span><span style="color:#E1E4E8">, link: </span><span style="color:#9ECBFF">"/docs/guide/"</span><span style="color:#E1E4E8"> },</span></span>
<span class="line"><span style="color:#E1E4E8">    { text: </span><span style="color:#9ECBFF">"API"</span><span style="color:#E1E4E8">, link: </span><span style="color:#9ECBFF">"/docs/api/"</span><span style="color:#E1E4E8"> },</span></span>
<span class="line"><span style="color:#E1E4E8">  ],</span></span>
<span class="line"><span style="color:#E1E4E8">  sidebar: {</span></span>
<span class="line"><span style="color:#9ECBFF">    "/docs/guide/"</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"auto"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#9ECBFF">    "/docs/api/"</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"auto"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#E1E4E8">  },</span></span>
<span class="line"><span style="color:#E1E4E8">  markdown: {</span></span>
<span class="line"><span style="color:#E1E4E8">    anchor: { permalink: </span><span style="color:#79B8FF">true</span><span style="color:#E1E4E8"> },</span></span>
<span class="line"><span style="color:#E1E4E8">    toc: { level: [</span><span style="color:#79B8FF">2</span><span style="color:#E1E4E8">, </span><span style="color:#79B8FF">3</span><span style="color:#E1E4E8">] },</span></span>
<span class="line"><span style="color:#E1E4E8">  },</span></span>
<span class="line"><span style="color:#E1E4E8">  highlight: {</span></span>
<span class="line"><span style="color:#E1E4E8">    theme: </span><span style="color:#9ECBFF">"github-dark"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#E1E4E8">    languages: [</span><span style="color:#9ECBFF">"typescript"</span><span style="color:#E1E4E8">, </span><span style="color:#9ECBFF">"javascript"</span><span style="color:#E1E4E8">, </span><span style="color:#9ECBFF">"html"</span><span style="color:#E1E4E8">, </span><span style="color:#9ECBFF">"css"</span><span style="color:#E1E4E8">, </span><span style="color:#9ECBFF">"json"</span><span style="color:#E1E4E8">, </span><span style="color:#9ECBFF">"bash"</span><span style="color:#E1E4E8">],</span></span>
<span class="line"><span style="color:#E1E4E8">  },</span></span>
<span class="line"><span style="color:#E1E4E8">  search: { provider: </span><span style="color:#9ECBFF">"local"</span><span style="color:#E1E4E8"> },</span></span>
<span class="line"><span style="color:#E1E4E8">});</span></span>
<span class="line"></span></code></pre>
`}},xn={title:"Get Started",description:"Install, configure, and build your first documentation site",sidebarPosition:1,headings:[{level:2,text:"Installation",slug:"installation"},{level:2,text:"Bundler Configuration",slug:"bundler-configuration"},{level:3,text:"Vite (Recommended)",slug:"vite-recommended"},{level:3,text:"Webpack",slug:"webpack"},{level:3,text:"Rspack",slug:"rspack"},{level:2,text:"Entry HTML",slug:"entry-html"},{level:2,text:"Boot File",slug:"boot-file"},{level:2,text:"CSS Entry",slug:"css-entry"},{level:2,text:"Your First Page",slug:"your-first-page"},{level:2,text:"Next Steps",slug:"next-steps"}],relativePath:"/Users/hangtiancheng/github/lark/packages/lark-docs/docs/get-started/index.md"},wn={pageData:xn,template:function(e,s,t){return`<h1 id="get-started" class="scroll-mt-20">Get Started <a class="link link-hover text-base-content/30 no-underline" href="#get-started" aria-hidden="true">#</a></h1>
<p>This guide walks through installing <code>@lark.js/docs</code>, configuring your bundler, writing your first markdown page, and booting the documentation site.</p>
<h2 id="installation" class="scroll-mt-20">Installation <a class="link link-hover text-base-content/30 no-underline" href="#installation" aria-hidden="true">#</a></h2>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#B392F0">pnpm</span><span style="color:#9ECBFF"> add</span><span style="color:#9ECBFF"> @lark.js/docs</span><span style="color:#9ECBFF"> @lark.js/mvc</span><span style="color:#9ECBFF"> tailwindcss</span><span style="color:#9ECBFF"> daisyui</span></span>
<span class="line"></span></code></pre>
<div role="alert" class="alert alert-info">
<div>
<p class="font-semibold">TIP</p>
<p>Your project must have Tailwind CSS and DaisyUI installed. The theme templates use Tailwind utility classes and DaisyUI components — they are peer dependencies of <code>@lark.js/docs</code>.</p>
</div>
</div>
<h2 id="bundler-configuration" class="scroll-mt-20">Bundler Configuration <a class="link link-hover text-base-content/30 no-underline" href="#bundler-configuration" aria-hidden="true">#</a></h2>
<h3 id="vite-recommended" class="scroll-mt-20">Vite (Recommended) <a class="link link-hover text-base-content/30 no-underline" href="#vite-recommended" aria-hidden="true">#</a></h3>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#6A737D">// vite.config.ts</span></span>
<span class="line"><span style="color:#F97583">import</span><span style="color:#E1E4E8"> { defineConfig } </span><span style="color:#F97583">from</span><span style="color:#9ECBFF"> "vite"</span><span style="color:#E1E4E8">;</span></span>
<span class="line"><span style="color:#F97583">import</span><span style="color:#E1E4E8"> { larkDocPlugin } </span><span style="color:#F97583">from</span><span style="color:#9ECBFF"> "@lark.js/docs/vite"</span><span style="color:#E1E4E8">;</span></span>
<span class="line"><span style="color:#F97583">import</span><span style="color:#E1E4E8"> { larkMvcPlugin } </span><span style="color:#F97583">from</span><span style="color:#9ECBFF"> "@lark.js/mvc/vite"</span><span style="color:#E1E4E8">;</span></span>
<span class="line"><span style="color:#F97583">import</span><span style="color:#E1E4E8"> tailwindcss </span><span style="color:#F97583">from</span><span style="color:#9ECBFF"> "@tailwindcss/vite"</span><span style="color:#E1E4E8">;</span></span>
<span class="line"><span style="color:#F97583">import</span><span style="color:#E1E4E8"> docConfig </span><span style="color:#F97583">from</span><span style="color:#9ECBFF"> "./lark-docs.config"</span><span style="color:#E1E4E8">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583">export</span><span style="color:#F97583"> default</span><span style="color:#B392F0"> defineConfig</span><span style="color:#E1E4E8">({</span></span>
<span class="line"><span style="color:#E1E4E8">  plugins: [</span></span>
<span class="line"><span style="color:#B392F0">    larkDocPlugin</span><span style="color:#E1E4E8">({ config: docConfig }),</span></span>
<span class="line"><span style="color:#B392F0">    larkMvcPlugin</span><span style="color:#E1E4E8">(),</span></span>
<span class="line"><span style="color:#B392F0">    tailwindcss</span><span style="color:#E1E4E8">(),</span></span>
<span class="line"><span style="color:#E1E4E8">  ],</span></span>
<span class="line"><span style="color:#E1E4E8">});</span></span>
<span class="line"></span></code></pre>
<h3 id="webpack" class="scroll-mt-20">Webpack <a class="link link-hover text-base-content/30 no-underline" href="#webpack" aria-hidden="true">#</a></h3>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#F97583">import</span><span style="color:#E1E4E8"> { LarkDocPlugin } </span><span style="color:#F97583">from</span><span style="color:#9ECBFF"> "@lark.js/docs/webpack"</span><span style="color:#E1E4E8">;</span></span>
<span class="line"><span style="color:#F97583">import</span><span style="color:#E1E4E8"> docConfig </span><span style="color:#F97583">from</span><span style="color:#9ECBFF"> "./lark-docs.config"</span><span style="color:#E1E4E8">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583">export</span><span style="color:#F97583"> default</span><span style="color:#E1E4E8"> {</span></span>
<span class="line"><span style="color:#E1E4E8">  plugins: [</span><span style="color:#F97583">new</span><span style="color:#B392F0"> LarkDocPlugin</span><span style="color:#E1E4E8">({ config: docConfig })],</span></span>
<span class="line"><span style="color:#E1E4E8">};</span></span>
<span class="line"></span></code></pre>
<h3 id="rspack" class="scroll-mt-20">Rspack <a class="link link-hover text-base-content/30 no-underline" href="#rspack" aria-hidden="true">#</a></h3>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#F97583">import</span><span style="color:#E1E4E8"> { LarkDocPlugin } </span><span style="color:#F97583">from</span><span style="color:#9ECBFF"> "@lark.js/docs/rspack"</span><span style="color:#E1E4E8">;</span></span>
<span class="line"><span style="color:#F97583">import</span><span style="color:#E1E4E8"> docConfig </span><span style="color:#F97583">from</span><span style="color:#9ECBFF"> "./lark-docs.config"</span><span style="color:#E1E4E8">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583">export</span><span style="color:#F97583"> default</span><span style="color:#E1E4E8"> {</span></span>
<span class="line"><span style="color:#E1E4E8">  plugins: [</span><span style="color:#F97583">new</span><span style="color:#B392F0"> LarkDocPlugin</span><span style="color:#E1E4E8">({ config: docConfig })],</span></span>
<span class="line"><span style="color:#E1E4E8">};</span></span>
<span class="line"></span></code></pre>
<h2 id="entry-html" class="scroll-mt-20">Entry HTML <a class="link link-hover text-base-content/30 no-underline" href="#entry-html" aria-hidden="true">#</a></h2>
<p>Create a minimal HTML entry point:</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#E1E4E8">&#x3C;!</span><span style="color:#85E89D">doctype</span><span style="color:#B392F0"> html</span><span style="color:#E1E4E8">></span></span>
<span class="line"><span style="color:#E1E4E8">&#x3C;</span><span style="color:#85E89D">html</span><span style="color:#B392F0"> lang</span><span style="color:#E1E4E8">=</span><span style="color:#9ECBFF">"en"</span><span style="color:#E1E4E8">></span></span>
<span class="line"><span style="color:#E1E4E8">  &#x3C;</span><span style="color:#85E89D">head</span><span style="color:#E1E4E8">></span></span>
<span class="line"><span style="color:#E1E4E8">    &#x3C;</span><span style="color:#85E89D">meta</span><span style="color:#B392F0"> charset</span><span style="color:#E1E4E8">=</span><span style="color:#9ECBFF">"UTF-8"</span><span style="color:#E1E4E8"> /></span></span>
<span class="line"><span style="color:#E1E4E8">    &#x3C;</span><span style="color:#85E89D">title</span><span style="color:#E1E4E8">>My Docs&#x3C;/</span><span style="color:#85E89D">title</span><span style="color:#E1E4E8">></span></span>
<span class="line"><span style="color:#E1E4E8">  &#x3C;/</span><span style="color:#85E89D">head</span><span style="color:#E1E4E8">></span></span>
<span class="line"><span style="color:#E1E4E8">  &#x3C;</span><span style="color:#85E89D">body</span><span style="color:#E1E4E8">></span></span>
<span class="line"><span style="color:#E1E4E8">    &#x3C;</span><span style="color:#85E89D">div</span><span style="color:#B392F0"> id</span><span style="color:#E1E4E8">=</span><span style="color:#9ECBFF">"app"</span><span style="color:#E1E4E8">>&#x3C;/</span><span style="color:#85E89D">div</span><span style="color:#E1E4E8">></span></span>
<span class="line"><span style="color:#E1E4E8">    &#x3C;</span><span style="color:#85E89D">script</span><span style="color:#B392F0"> type</span><span style="color:#E1E4E8">=</span><span style="color:#9ECBFF">"module"</span><span style="color:#B392F0"> src</span><span style="color:#E1E4E8">=</span><span style="color:#9ECBFF">"./boot.ts"</span><span style="color:#E1E4E8">>&#x3C;/</span><span style="color:#85E89D">script</span><span style="color:#E1E4E8">></span></span>
<span class="line"><span style="color:#E1E4E8">  &#x3C;/</span><span style="color:#85E89D">body</span><span style="color:#E1E4E8">></span></span>
<span class="line"><span style="color:#E1E4E8">&#x3C;/</span><span style="color:#85E89D">html</span><span style="color:#E1E4E8">></span></span>
<span class="line"></span></code></pre>
<h2 id="boot-file" class="scroll-mt-20">Boot File <a class="link link-hover text-base-content/30 no-underline" href="#boot-file" aria-hidden="true">#</a></h2>
<p>The boot file registers theme views, imports compiled <code>.md</code> files, and starts the framework:</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#6A737D">// boot.ts</span></span>
<span class="line"><span style="color:#F97583">import</span><span style="color:#E1E4E8"> { Framework, View, State, registerViewClass } </span><span style="color:#F97583">from</span><span style="color:#9ECBFF"> "@lark.js/mvc"</span><span style="color:#E1E4E8">;</span></span>
<span class="line"><span style="color:#F97583">import</span><span style="color:#E1E4E8"> { routes, siteData } </span><span style="color:#F97583">from</span><span style="color:#9ECBFF"> "./routes"</span><span style="color:#E1E4E8">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583">import</span><span style="color:#E1E4E8"> {</span></span>
<span class="line"><span style="color:#E1E4E8">  createDocLayoutView,</span></span>
<span class="line"><span style="color:#E1E4E8">  createSidebarView,</span></span>
<span class="line"><span style="color:#E1E4E8">  createContentView,</span></span>
<span class="line"><span style="color:#E1E4E8">  createTocView,</span></span>
<span class="line"><span style="color:#E1E4E8">  createSearchView,</span></span>
<span class="line"><span style="color:#E1E4E8">} </span><span style="color:#F97583">from</span><span style="color:#9ECBFF"> "@lark.js/docs/theme"</span><span style="color:#E1E4E8">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583">import</span><span style="color:#E1E4E8"> docLayoutTemplate </span><span style="color:#F97583">from</span><span style="color:#9ECBFF"> "@lark.js/docs/theme/docs-layout.html"</span><span style="color:#E1E4E8">;</span></span>
<span class="line"><span style="color:#F97583">import</span><span style="color:#E1E4E8"> sidebarTemplate </span><span style="color:#F97583">from</span><span style="color:#9ECBFF"> "@lark.js/docs/theme/sidebar.html"</span><span style="color:#E1E4E8">;</span></span>
<span class="line"><span style="color:#F97583">import</span><span style="color:#E1E4E8"> contentTemplate </span><span style="color:#F97583">from</span><span style="color:#9ECBFF"> "@lark.js/docs/theme/content.html"</span><span style="color:#E1E4E8">;</span></span>
<span class="line"><span style="color:#F97583">import</span><span style="color:#E1E4E8"> tocTemplate </span><span style="color:#F97583">from</span><span style="color:#9ECBFF"> "@lark.js/docs/theme/toc.html"</span><span style="color:#E1E4E8">;</span></span>
<span class="line"><span style="color:#F97583">import</span><span style="color:#E1E4E8"> searchTemplate </span><span style="color:#F97583">from</span><span style="color:#9ECBFF"> "@lark.js/docs/theme/search.html"</span><span style="color:#E1E4E8">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#F97583">import</span><span style="color:#9ECBFF"> "./main.css"</span><span style="color:#E1E4E8">;</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6A737D">// Register theme views</span></span>
<span class="line"><span style="color:#B392F0">registerViewClass</span><span style="color:#E1E4E8">(</span></span>
<span class="line"><span style="color:#9ECBFF">  "theme/docs-layout"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#B392F0">  createDocLayoutView</span><span style="color:#E1E4E8">(View, docLayoutTemplate),</span></span>
<span class="line"><span style="color:#E1E4E8">);</span></span>
<span class="line"><span style="color:#B392F0">registerViewClass</span><span style="color:#E1E4E8">(</span><span style="color:#9ECBFF">"theme/sidebar"</span><span style="color:#E1E4E8">, </span><span style="color:#B392F0">createSidebarView</span><span style="color:#E1E4E8">(View, sidebarTemplate));</span></span>
<span class="line"><span style="color:#B392F0">registerViewClass</span><span style="color:#E1E4E8">(</span><span style="color:#9ECBFF">"theme/content"</span><span style="color:#E1E4E8">, </span><span style="color:#B392F0">createContentView</span><span style="color:#E1E4E8">(View, contentTemplate));</span></span>
<span class="line"><span style="color:#B392F0">registerViewClass</span><span style="color:#E1E4E8">(</span><span style="color:#9ECBFF">"theme/toc"</span><span style="color:#E1E4E8">, </span><span style="color:#B392F0">createTocView</span><span style="color:#E1E4E8">(View, tocTemplate));</span></span>
<span class="line"><span style="color:#B392F0">registerViewClass</span><span style="color:#E1E4E8">(</span><span style="color:#9ECBFF">"theme/search"</span><span style="color:#E1E4E8">, </span><span style="color:#B392F0">createSearchView</span><span style="color:#E1E4E8">(View, searchTemplate));</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6A737D">// Inject site data</span></span>
<span class="line"><span style="color:#E1E4E8">State.</span><span style="color:#B392F0">set</span><span style="color:#E1E4E8">({ siteData });</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6A737D">// Boot</span></span>
<span class="line"><span style="color:#E1E4E8">Framework.</span><span style="color:#B392F0">boot</span><span style="color:#E1E4E8">({</span></span>
<span class="line"><span style="color:#E1E4E8">  rootId: </span><span style="color:#9ECBFF">"app"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#E1E4E8">  routeMode: </span><span style="color:#9ECBFF">"history"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#E1E4E8">  defaultPath: </span><span style="color:#9ECBFF">"/docs/"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#E1E4E8">  defaultView: </span><span style="color:#9ECBFF">"index"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#E1E4E8">  routes,</span></span>
<span class="line"><span style="color:#E1E4E8">});</span></span>
<span class="line"></span></code></pre>
<h2 id="css-entry" class="scroll-mt-20">CSS Entry <a class="link link-hover text-base-content/30 no-underline" href="#css-entry" aria-hidden="true">#</a></h2>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#6A737D">/* main.css */</span></span>
<span class="line"><span style="color:#F97583">@import</span><span style="color:#9ECBFF"> "tailwindcss"</span><span style="color:#E1E4E8">;</span></span>
<span class="line"><span style="color:#F97583">@plugin</span><span style="color:#E1E4E8"> "daisyui";</span></span>
<span class="line"></span></code></pre>
<h2 id="your-first-page" class="scroll-mt-20">Your First Page <a class="link link-hover text-base-content/30 no-underline" href="#your-first-page" aria-hidden="true">#</a></h2>
<p>Create <code>docs/index.md</code>:</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#E1E4E8">---</span></span>
<span class="line"><span style="color:#85E89D">title</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"Home"</span></span>
<span class="line"><span style="color:#85E89D">description</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"Welcome to my documentation"</span></span>
<span class="line"><span style="color:#E1E4E8">---</span></span>
<span class="line"></span>
<span class="line"><span style="color:#79B8FF;font-weight:bold"># Welcome</span></span>
<span class="line"></span>
<span class="line"><span style="color:#E1E4E8">This is the home page of my documentation.</span></span>
<span class="line"></span>
<span class="line"><span style="color:#79B8FF;font-weight:bold">## Features</span></span>
<span class="line"></span>
<span class="line"><span style="color:#FFAB70">-</span><span style="color:#E1E4E8"> Feature one</span></span>
<span class="line"><span style="color:#FFAB70">-</span><span style="color:#E1E4E8"> Feature two</span></span>
<span class="line"><span style="color:#FFAB70">-</span><span style="color:#E1E4E8"> Feature three</span></span>
<span class="line"></span></code></pre>
<div role="alert" class="alert alert-warning">
<div>
<p class="font-semibold">WARNING</p>
<p>Always include YAML frontmatter with at least a <code>title</code> field. Without it, the title falls back to the first <code># heading</code> in the content, or the filename.</p>
</div>
</div>
<h2 id="next-steps" class="scroll-mt-20">Next Steps <a class="link link-hover text-base-content/30 no-underline" href="#next-steps" aria-hidden="true">#</a></h2>
<ul>
<li><a href="/docs/get-started/configuration/" data-lark-nav="true">Configuration</a> — Full config reference</li>
<li><a href="/docs/markdown/" data-lark-nav="true">Markdown</a> — Frontmatter, containers, code highlighting</li>
<li><a href="/docs/router/" data-lark-nav="true">Router</a> — history/hash modes, baseUrl, route rules</li>
</ul>
`}},Cn={title:"@lark.js/docs",description:"Documentation site generator for @lark.js/mvc",headings:[{level:2,text:"Features",slug:"features"},{level:2,text:"Quick Start",slug:"quick-start"},{level:2,text:"How It Works",slug:"how-it-works"},{level:2,text:"Navigation",slug:"navigation"}],relativePath:"/Users/hangtiancheng/github/lark/packages/lark-docs/docs/index.md"},Bn={pageData:Cn,template:function(e,s,t){return`<h1 id="larkjsdocs" class="scroll-mt-20">@lark.js/docs <a class="link link-hover text-base-content/30 no-underline" href="#larkjsdocs" aria-hidden="true">#</a></h1>
<p><code>@lark.js/docs</code> is to <code>@lark.js/mvc</code> what VitePress is to Vue3 — an out-of-the-box documentation site generator that produces a complete documentation site with navigation, sidebar, search, and syntax highlighting.</p>
<h2 id="features" class="scroll-mt-20">Features <a class="link link-hover text-base-content/30 no-underline" href="#features" aria-hidden="true">#</a></h2>
<ul>
<li><strong>File-based routing</strong> — Recursively scans a <code>docs/</code> directory and generates routes from <code>.md</code> files</li>
<li><strong>Dual routing modes</strong> — Supports <code>@lark.js/mvc</code> Router in both <code>history</code> and <code>hash</code> modes</li>
<li><strong>Configurable base URL</strong> — Pass <code>baseUrl</code> as a common route prefix (e.g. <code>/docs/</code>)</li>
<li><strong>Professional markdown parsing</strong> — Powered by <code>markdown-it</code> with custom plugins</li>
<li><strong>YAML frontmatter</strong> — Per-page metadata for titles, descriptions, sidebar ordering</li>
<li><strong>Syntax highlighting</strong> — Shiki-powered code blocks with VSCode-quality grammars</li>
<li><strong>Admonition containers</strong> — <code>::: tip</code>, <code>::: warning</code>, <code>::: danger</code>, <code>::: details</code></li>
<li><strong>Auto-generated sidebar</strong> — From directory structure with frontmatter-based sorting</li>
<li><strong>Full-text search</strong> — Client-side search with scored ranking</li>
<li><strong>Fixed theme</strong> — Tailwind CSS + DaisyUI, no custom CSS needed</li>
<li><strong>Multi-bundler support</strong> — Vite, Webpack, and Rspack / Rsbuild</li>
</ul>
<h2 id="quick-start" class="scroll-mt-20">Quick Start <a class="link link-hover text-base-content/30 no-underline" href="#quick-start" aria-hidden="true">#</a></h2>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#B392F0">pnpm</span><span style="color:#9ECBFF"> add</span><span style="color:#9ECBFF"> @lark.js/docs</span><span style="color:#9ECBFF"> @lark.js/mvc</span><span style="color:#9ECBFF"> tailwindcss</span><span style="color:#9ECBFF"> daisyui</span></span>
<span class="line"></span></code></pre>
<p>Configure your bundler, write markdown files, and boot the site. See <a href="/docs/get-started/" data-lark-nav="true">Get Started</a> for the full guide.</p>
<h2 id="how-it-works" class="scroll-mt-20">How It Works <a class="link link-hover text-base-content/30 no-underline" href="#how-it-works" aria-hidden="true">#</a></h2>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span>docs/                    Build Time                          Runtime (Browser)</span></span>
<span class="line"><span>  index.md               ┌──────────────────┐               ┌────────────────────┐</span></span>
<span class="line"><span>  get-started/     ───▶  │ larkDocPlugin    │  ───▶         │ lark-mvc Framework │</span></span>
<span class="line"><span>    index.md             │ (compiles .md    │               │   Router + Views   │</span></span>
<span class="line"><span>    configuration.md     │  to JS modules)  │               │   + Frame tree     │</span></span>
<span class="line"><span>  markdown/              └──────────────────┘               └────────────────────┘</span></span>
<span class="line"><span>    index.md</span></span>
<span class="line"><span></span></span></code></pre>
<p>Each <code>.md</code> file is compiled at build time into a lark-mvc View module. At runtime, the Router handles navigation and the theme Views (layout, sidebar, content, TOC, search) render the documentation interface.</p>
<h2 id="navigation" class="scroll-mt-20">Navigation <a class="link link-hover text-base-content/30 no-underline" href="#navigation" aria-hidden="true">#</a></h2>
<ul>
<li><a href="/docs/get-started/" data-lark-nav="true">Get Started</a> — Installation, configuration, and first site</li>
<li><a href="/docs/markdown/" data-lark-nav="true">Markdown</a> — Frontmatter, containers, code highlighting</li>
<li><a href="/docs/router/" data-lark-nav="true">Router</a> — history/hash modes, baseUrl, route generation</li>
<li><a href="/docs/style/" data-lark-nav="true">Styling</a> — Tailwind CSS + DaisyUI integration</li>
</ul>
`}},Sn={title:"Code Highlighting",description:"Shiki-powered syntax highlighting for code blocks",sidebarPosition:4,headings:[{level:2,text:"Configuration",slug:"configuration"},{level:2,text:"Options",slug:"options"},{level:3,text:"`theme`",slug:"theme"},{level:3,text:"`languages`",slug:"languages"},{level:2,text:"Usage in Markdown",slug:"usage-in-markdown"},{level:2,text:"Fallback Behavior",slug:"fallback-behavior"}],relativePath:"/Users/hangtiancheng/github/lark/packages/lark-docs/docs/markdown/code-highlighting.md"},Tn={pageData:Sn,template:function(e,s,t){return`<h1 id="code-highlighting" class="scroll-mt-20">Code Highlighting <a class="link link-hover text-base-content/30 no-underline" href="#code-highlighting" aria-hidden="true">#</a></h1>
<p><code>@lark.js/docs</code> uses <a href="https://shiki.style" target="_blank" rel="noopener noreferrer">Shiki</a> for syntax highlighting. Shiki produces VSCode-quality output using TextMate grammars and renders to HTML with inline styles — no external CSS needed at runtime.</p>
<h2 id="configuration" class="scroll-mt-20">Configuration <a class="link link-hover text-base-content/30 no-underline" href="#configuration" aria-hidden="true">#</a></h2>
<p>Enable syntax highlighting by adding a <code>highlight</code> section to your config:</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#6A737D">// lark-docs.config.ts</span></span>
<span class="line"><span style="color:#F97583">export</span><span style="color:#F97583"> default</span><span style="color:#B392F0"> defineConfig</span><span style="color:#E1E4E8">({</span></span>
<span class="line"><span style="color:#E1E4E8">  highlight: {</span></span>
<span class="line"><span style="color:#E1E4E8">    theme: </span><span style="color:#9ECBFF">"github-dark"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#E1E4E8">    languages: [</span><span style="color:#9ECBFF">"typescript"</span><span style="color:#E1E4E8">, </span><span style="color:#9ECBFF">"javascript"</span><span style="color:#E1E4E8">, </span><span style="color:#9ECBFF">"html"</span><span style="color:#E1E4E8">, </span><span style="color:#9ECBFF">"css"</span><span style="color:#E1E4E8">, </span><span style="color:#9ECBFF">"json"</span><span style="color:#E1E4E8">, </span><span style="color:#9ECBFF">"bash"</span><span style="color:#E1E4E8">],</span></span>
<span class="line"><span style="color:#E1E4E8">  },</span></span>
<span class="line"><span style="color:#E1E4E8">});</span></span>
<span class="line"></span></code></pre>
<div role="alert" class="alert alert-warning">
<div>
<p class="font-semibold">WARNING</p>
<p>When <code>highlight</code> is omitted from the config, code blocks render as plain escaped text without color. This is intentional — Shiki is a large dependency (~5 MB with WASM + grammars) and should only be loaded when needed.</p>
</div>
</div>
<h2 id="options" class="scroll-mt-20">Options <a class="link link-hover text-base-content/30 no-underline" href="#options" aria-hidden="true">#</a></h2>
<h3 id="theme" class="scroll-mt-20"><code>theme</code> <a class="link link-hover text-base-content/30 no-underline" href="#theme" aria-hidden="true">#</a></h3>
<p>Type: <code>string</code> — Default: <code>&quot;github-dark&quot;</code></p>
<p>The Shiki color theme. Any built-in Shiki theme is supported:</p>
<table>
<thead>
<tr>
<th>Theme</th>
<th>Style</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>github-dark</code></td>
<td>Dark, GitHub-style</td>
</tr>
<tr>
<td><code>github-light</code></td>
<td>Light, GitHub-style</td>
</tr>
<tr>
<td><code>dracula</code></td>
<td>Dark, Dracula palette</td>
</tr>
<tr>
<td><code>monokai</code></td>
<td>Dark, Monokai palette</td>
</tr>
<tr>
<td><code>one-dark-pro</code></td>
<td>Dark, Atom-style</td>
</tr>
<tr>
<td><code>nord</code></td>
<td>Dark, Nord palette</td>
</tr>
<tr>
<td><code>vitesse-dark</code></td>
<td>Dark, Vitesse-style</td>
</tr>
<tr>
<td><code>vitesse-light</code></td>
<td>Light, Vitesse-style</td>
</tr>
</tbody>
</table>
<h3 id="languages" class="scroll-mt-20"><code>languages</code> <a class="link link-hover text-base-content/30 no-underline" href="#languages" aria-hidden="true">#</a></h3>
<p>Type: <code>string[]</code></p>
<p>Languages to load. Shiki supports 100+ languages via TextMate grammars. Common choices:</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#B392F0">languages</span><span style="color:#E1E4E8">: [</span></span>
<span class="line"><span style="color:#9ECBFF">  "typescript"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#9ECBFF">  "javascript"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#9ECBFF">  "html"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#9ECBFF">  "css"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#9ECBFF">  "json"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#9ECBFF">  "bash"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#9ECBFF">  "yaml"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#9ECBFF">  "markdown"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#9ECBFF">  "jsx"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#9ECBFF">  "tsx"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#9ECBFF">  "python"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#9ECBFF">  "rust"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#9ECBFF">  "go"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#9ECBFF">  "java"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#9ECBFF">  "c"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#9ECBFF">  "cpp"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#E1E4E8">];</span></span>
<span class="line"></span></code></pre>
<div role="alert" class="alert alert-info">
<div>
<p class="font-semibold">TIP</p>
<p>Only listed languages are loaded. If a code block uses an unlisted language, it renders as plain text with the <code>text</code> grammar.</p>
</div>
</div>
<h2 id="usage-in-markdown" class="scroll-mt-20">Usage in Markdown <a class="link link-hover text-base-content/30 no-underline" href="#usage-in-markdown" aria-hidden="true">#</a></h2>
<p>Specify the language after the opening triple backticks:</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#E1E4E8">\`\`\`typescript</span></span>
<span class="line"><span style="color:#F97583">const</span><span style="color:#79B8FF"> x</span><span style="color:#F97583">:</span><span style="color:#79B8FF"> number</span><span style="color:#F97583"> =</span><span style="color:#79B8FF"> 42</span><span style="color:#E1E4E8">;</span></span>
<span class="line"><span style="color:#E1E4E8">\`\`\`</span></span>
<span class="line"></span></code></pre>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span></span></span>
<span class="line"><span>This produces syntax-highlighted output:</span></span>
<span class="line"><span></span></span>
<span class="line"><span>\`\`\`typescript</span></span>
<span class="line"><span>const greeting: string = "Hello, World!";</span></span>
<span class="line"><span></span></span>
<span class="line"><span>function add(a: number, b: number): number {</span></span>
<span class="line"><span>  return a + b;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span></code></pre>
<h2 id="how-it-works" class="scroll-mt-20">How It Works <a class="link link-hover text-base-content/30 no-underline" href="#how-it-works" aria-hidden="true">#</a></h2>
<p>Shiki is initialized lazily as a singleton:</p>
<ol>
<li><strong>First code block</strong> triggers async initialization (loads WASM + grammars, ~200-800ms)</li>
<li><strong>Subsequent code blocks</strong> use the cached highlighter (instant)</li>
<li><strong>Output</strong> is HTML with inline <code>style</code> attributes — zero runtime CSS dependency</li>
</ol>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#E1E4E8">&#x3C;</span><span style="color:#85E89D">pre</span><span style="color:#B392F0"> class</span><span style="color:#E1E4E8">=</span><span style="color:#9ECBFF">"shiki github-dark"</span><span style="color:#B392F0"> style</span><span style="color:#E1E4E8">=</span><span style="color:#9ECBFF">"background-color:#24292e"</span><span style="color:#E1E4E8">></span></span>
<span class="line"><span style="color:#E1E4E8">  &#x3C;</span><span style="color:#85E89D">code</span><span style="color:#E1E4E8">></span></span>
<span class="line"><span style="color:#E1E4E8">    &#x3C;</span><span style="color:#85E89D">span</span><span style="color:#B392F0"> class</span><span style="color:#E1E4E8">=</span><span style="color:#9ECBFF">"line"</span><span style="color:#E1E4E8">></span></span>
<span class="line"><span style="color:#E1E4E8">      &#x3C;</span><span style="color:#85E89D">span</span><span style="color:#B392F0"> style</span><span style="color:#E1E4E8">=</span><span style="color:#9ECBFF">"color:#F97583"</span><span style="color:#E1E4E8">>const&#x3C;/</span><span style="color:#85E89D">span</span><span style="color:#E1E4E8">></span></span>
<span class="line"><span style="color:#E1E4E8">      &#x3C;</span><span style="color:#85E89D">span</span><span style="color:#B392F0"> style</span><span style="color:#E1E4E8">=</span><span style="color:#9ECBFF">"color:#79B8FF"</span><span style="color:#E1E4E8">> x&#x3C;/</span><span style="color:#85E89D">span</span><span style="color:#E1E4E8">></span></span>
<span class="line"><span style="color:#E1E4E8">      &#x3C;</span><span style="color:#85E89D">span</span><span style="color:#B392F0"> style</span><span style="color:#E1E4E8">=</span><span style="color:#9ECBFF">"color:#F97583"</span><span style="color:#E1E4E8">>:&#x3C;/</span><span style="color:#85E89D">span</span><span style="color:#E1E4E8">></span></span>
<span class="line"><span style="color:#E1E4E8">      &#x3C;</span><span style="color:#85E89D">span</span><span style="color:#B392F0"> style</span><span style="color:#E1E4E8">=</span><span style="color:#9ECBFF">"color:#79B8FF"</span><span style="color:#E1E4E8">> number&#x3C;/</span><span style="color:#85E89D">span</span><span style="color:#E1E4E8">></span></span>
<span class="line"><span style="color:#E1E4E8">      &#x3C;</span><span style="color:#85E89D">span</span><span style="color:#B392F0"> style</span><span style="color:#E1E4E8">=</span><span style="color:#9ECBFF">"color:#F97583"</span><span style="color:#E1E4E8">> =&#x3C;/</span><span style="color:#85E89D">span</span><span style="color:#E1E4E8">></span></span>
<span class="line"><span style="color:#E1E4E8">      &#x3C;</span><span style="color:#85E89D">span</span><span style="color:#B392F0"> style</span><span style="color:#E1E4E8">=</span><span style="color:#9ECBFF">"color:#79B8FF"</span><span style="color:#E1E4E8">> 42&#x3C;/</span><span style="color:#85E89D">span</span><span style="color:#E1E4E8">></span></span>
<span class="line"><span style="color:#E1E4E8">      &#x3C;</span><span style="color:#85E89D">span</span><span style="color:#B392F0"> style</span><span style="color:#E1E4E8">=</span><span style="color:#9ECBFF">"color:#E1E4E8"</span><span style="color:#E1E4E8">>;&#x3C;/</span><span style="color:#85E89D">span</span><span style="color:#E1E4E8">></span></span>
<span class="line"><span style="color:#E1E4E8">    &#x3C;/</span><span style="color:#85E89D">span</span><span style="color:#E1E4E8">></span></span>
<span class="line"><span style="color:#E1E4E8">  &#x3C;/</span><span style="color:#85E89D">code</span><span style="color:#E1E4E8">></span></span>
<span class="line"><span style="color:#E1E4E8">&#x3C;/</span><span style="color:#85E89D">pre</span><span style="color:#E1E4E8">></span></span>
<span class="line"></span></code></pre>
<h2 id="fallback-behavior" class="scroll-mt-20">Fallback Behavior <a class="link link-hover text-base-content/30 no-underline" href="#fallback-behavior" aria-hidden="true">#</a></h2>
<p>If Shiki fails to highlight a code block (unsupported language, initialization error), it falls back to escaped plain text:</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#E1E4E8">&#x3C;</span><span style="color:#85E89D">pre</span><span style="color:#B392F0"> class</span><span style="color:#E1E4E8">=</span><span style="color:#9ECBFF">"shiki"</span><span style="color:#E1E4E8">></span></span>
<span class="line"><span style="color:#E1E4E8">  &#x3C;</span><span style="color:#85E89D">code</span><span style="color:#E1E4E8">>const x = 42;&#x3C;/</span><span style="color:#85E89D">code</span><span style="color:#E1E4E8">></span></span>
<span class="line"><span style="color:#E1E4E8">&#x3C;/</span><span style="color:#85E89D">pre</span><span style="color:#E1E4E8">></span></span>
<span class="line"></span></code></pre>
<p>This ensures documentation is always readable, even without syntax highlighting.</p>
`}},_n={title:"Containers",description:"Admonition containers: tip, warning, danger, details",sidebarPosition:3,headings:[{level:2,text:"Syntax",slug:"syntax"},{level:2,text:"Available Types",slug:"available-types"},{level:3,text:"Tip",slug:"tip"},{level:3,text:"Warning",slug:"warning"},{level:3,text:"Danger",slug:"danger"},{level:3,text:"Details",slug:"details"},{level:2,text:"Custom Labels",slug:"custom-labels"},{level:2,text:"Rendering",slug:"rendering"},{level:2,text:"Nesting",slug:"nesting"}],relativePath:"/Users/hangtiancheng/github/lark/packages/lark-docs/docs/markdown/containers.md"},Rn={pageData:_n,template:function(e,s,t){return`<h1 id="containers" class="scroll-mt-20">Containers <a class="link link-hover text-base-content/30 no-underline" href="#containers" aria-hidden="true">#</a></h1>
<p><code>@lark.js/docs</code> supports custom admonition containers using the <code>::: type</code> syntax. These render as visually distinct callout blocks for tips, warnings, dangers, and collapsible details.</p>
<h2 id="syntax" class="scroll-mt-20">Syntax <a class="link link-hover text-base-content/30 no-underline" href="#syntax" aria-hidden="true">#</a></h2>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#E1E4E8">::: type Optional Title</span></span>
<span class="line"><span style="color:#E1E4E8">Content goes here.</span></span>
<span class="line"><span style="color:#E1E4E8">:::</span></span>
<span class="line"></span></code></pre>
<p>The <code>type</code> determines the visual style. An optional custom title overrides the default label.</p>
<h2 id="available-types" class="scroll-mt-20">Available Types <a class="link link-hover text-base-content/30 no-underline" href="#available-types" aria-hidden="true">#</a></h2>
<h3 id="tip" class="scroll-mt-20">Tip <a class="link link-hover text-base-content/30 no-underline" href="#tip" aria-hidden="true">#</a></h3>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#E1E4E8">::: tip</span></span>
<span class="line"><span style="color:#E1E4E8">This is a helpful tip.</span></span>
<span class="line"><span style="color:#E1E4E8">:::</span></span>
<span class="line"></span></code></pre>
<div role="alert" class="alert alert-info">
<div>
<p class="font-semibold">TIP</p>
<p>This is a helpful tip.</p>
</div>
</div>
<p>With a custom title:</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#E1E4E8">::: tip Pro Tip</span></span>
<span class="line"><span style="color:#E1E4E8">Use </span><span style="color:#79B8FF">\`sidebar_position\`</span><span style="color:#E1E4E8"> to control the order of pages in the sidebar.</span></span>
<span class="line"><span style="color:#E1E4E8">:::</span></span>
<span class="line"></span></code></pre>
<div role="alert" class="alert alert-info">
<div>
<p class="font-semibold">Pro Tip</p>
<p>Use <code>sidebar_position</code> to control the order of pages in the sidebar.</p>
</div>
</div>
<h3 id="warning" class="scroll-mt-20">Warning <a class="link link-hover text-base-content/30 no-underline" href="#warning" aria-hidden="true">#</a></h3>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#E1E4E8">::: warning</span></span>
<span class="line"><span style="color:#E1E4E8">Be careful with this operation.</span></span>
<span class="line"><span style="color:#E1E4E8">:::</span></span>
<span class="line"></span></code></pre>
<div role="alert" class="alert alert-warning">
<div>
<p class="font-semibold">WARNING</p>
<p>Be careful with this operation.</p>
</div>
</div>
<h3 id="danger" class="scroll-mt-20">Danger <a class="link link-hover text-base-content/30 no-underline" href="#danger" aria-hidden="true">#</a></h3>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#E1E4E8">::: danger</span></span>
<span class="line"><span style="color:#E1E4E8">This action is irreversible.</span></span>
<span class="line"><span style="color:#E1E4E8">:::</span></span>
<span class="line"></span></code></pre>
<div role="alert" class="alert alert-error">
<div>
<p class="font-semibold">DANGER</p>
<p>This action is irreversible.</p>
</div>
</div>
<h3 id="details" class="scroll-mt-20">Details <a class="link link-hover text-base-content/30 no-underline" href="#details" aria-hidden="true">#</a></h3>
<p>The <code>details</code> type renders as a collapsible <code>&lt;details&gt;</code> element:</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#E1E4E8">::: details Click to expand</span></span>
<span class="line"><span style="color:#E1E4E8">This content is hidden by default.</span></span>
<span class="line"><span style="color:#E1E4E8">:::</span></span>
<span class="line"></span></code></pre>
<details role="alert" class="alert ">
<summary class="font-semibold">Click to expand</summary>
<p>This content is hidden by default.</p>
</details>
<h2 id="custom-labels" class="scroll-mt-20">Custom Labels <a class="link link-hover text-base-content/30 no-underline" href="#custom-labels" aria-hidden="true">#</a></h2>
<p>Default labels can be overridden in the configuration:</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#6A737D">// lark-docs.config.ts</span></span>
<span class="line"><span style="color:#F97583">export</span><span style="color:#F97583"> default</span><span style="color:#B392F0"> defineConfig</span><span style="color:#E1E4E8">({</span></span>
<span class="line"><span style="color:#E1E4E8">  markdown: {</span></span>
<span class="line"><span style="color:#E1E4E8">    containers: {</span></span>
<span class="line"><span style="color:#E1E4E8">      tip: { label: </span><span style="color:#9ECBFF">"HINT"</span><span style="color:#E1E4E8"> },</span></span>
<span class="line"><span style="color:#E1E4E8">      warning: { label: </span><span style="color:#9ECBFF">"CAUTION"</span><span style="color:#E1E4E8"> },</span></span>
<span class="line"><span style="color:#E1E4E8">      danger: { label: </span><span style="color:#9ECBFF">"STOP"</span><span style="color:#E1E4E8"> },</span></span>
<span class="line"><span style="color:#E1E4E8">    },</span></span>
<span class="line"><span style="color:#E1E4E8">  },</span></span>
<span class="line"><span style="color:#E1E4E8">});</span></span>
<span class="line"></span></code></pre>
<h2 id="rendering" class="scroll-mt-20">Rendering <a class="link link-hover text-base-content/30 no-underline" href="#rendering" aria-hidden="true">#</a></h2>
<p>Containers are rendered using DaisyUI's <code>alert</code> component classes:</p>
<table>
<thead>
<tr>
<th>Type</th>
<th>DaisyUI Class</th>
<th>Color</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>tip</code></td>
<td><code>alert alert-info</code></td>
<td>Blue</td>
</tr>
<tr>
<td><code>warning</code></td>
<td><code>alert alert-warning</code></td>
<td>Yellow</td>
</tr>
<tr>
<td><code>danger</code></td>
<td><code>alert alert-error</code></td>
<td>Red</td>
</tr>
<tr>
<td><code>details</code></td>
<td><code>alert</code></td>
<td>Neutral</td>
</tr>
</tbody>
</table>
<h2 id="nesting" class="scroll-mt-20">Nesting <a class="link link-hover text-base-content/30 no-underline" href="#nesting" aria-hidden="true">#</a></h2>
<p>Containers can contain any markdown content, including code blocks, lists, and links:</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#E1E4E8">::: tip Installation</span></span>
<span class="line"><span style="color:#E1E4E8">Install the package:</span></span>
<span class="line"></span>
<span class="line"><span style="color:#E1E4E8">\`\`\`bash</span></span>
<span class="line"><span style="color:#B392F0">pnpm</span><span style="color:#9ECBFF"> add</span><span style="color:#9ECBFF"> @lark.js/docs</span></span>
<span class="line"><span style="color:#E1E4E8">\`\`\`</span></span>
<span class="line"></span></code></pre>
<p>Then configure your <a href="/docs/get-started/" data-lark-nav="true">bundler</a>.
:::</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span></span></span>
<span class="line"><span>::: tip Installation</span></span>
<span class="line"><span>Install the package with your preferred package manager, then configure your bundler as described in [Get Started](/docs/get-started/).</span></span>
<span class="line"><span>:::</span></span>
<span class="line"><span></span></span></code></pre>
`}},An={title:"Frontmatter",description:"YAML frontmatter fields and usage",sidebarPosition:2,headings:[{level:2,text:"Syntax",slug:"syntax"},{level:2,text:"Fields Reference",slug:"fields-reference"},{level:3,text:"`title`",slug:"title"},{level:3,text:"`description`",slug:"description"},{level:3,text:"`sidebar_position`",slug:"sidebar_position"},{level:3,text:"`sidebar_label`",slug:"sidebar_label"},{level:3,text:"`sidebar_group`",slug:"sidebar_group"},{level:3,text:"`draft`",slug:"draft"},{level:2,text:"Complete Example",slug:"complete-example"},{level:2,text:"Fallback Behavior",slug:"fallback-behavior"}],relativePath:"/Users/hangtiancheng/github/lark/packages/lark-docs/docs/markdown/frontmatter.md"},Dn={pageData:An,template:function(e,s,t){return`<h1 id="frontmatter" class="scroll-mt-20">Frontmatter <a class="link link-hover text-base-content/30 no-underline" href="#frontmatter" aria-hidden="true">#</a></h1>
<p>Each <code>.md</code> file can include YAML frontmatter delimited by <code>---</code> at the top of the file. Frontmatter provides per-page metadata that controls titles, descriptions, sidebar ordering, and more.</p>
<h2 id="syntax" class="scroll-mt-20">Syntax <a class="link link-hover text-base-content/30 no-underline" href="#syntax" aria-hidden="true">#</a></h2>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#E1E4E8">---</span></span>
<span class="line"><span style="color:#85E89D">title</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"My Page"</span></span>
<span class="line"><span style="color:#85E89D">description</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"A description for SEO and search"</span></span>
<span class="line"><span style="color:#85E89D">sidebar_position</span><span style="color:#E1E4E8">: </span><span style="color:#79B8FF">1</span></span>
<span class="line"><span style="color:#85E89D">sidebar_label</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"Custom Label"</span></span>
<span class="line"><span style="color:#E1E4E8">---</span></span>
<span class="line"></span>
<span class="line"><span style="color:#79B8FF;font-weight:bold"># Content starts here</span></span>
<span class="line"></span></code></pre>
<p>The frontmatter block must be the very first thing in the file. It is parsed using <code>js-yaml</code> and stripped from the markdown content before rendering.</p>
<h2 id="fields-reference" class="scroll-mt-20">Fields Reference <a class="link link-hover text-base-content/30 no-underline" href="#fields-reference" aria-hidden="true">#</a></h2>
<h3 id="title" class="scroll-mt-20"><code>title</code> <a class="link link-hover text-base-content/30 no-underline" href="#title" aria-hidden="true">#</a></h3>
<p>Type: <code>string</code></p>
<p>Page title displayed in the sidebar, navigation, and search results. If omitted, falls back to the first <code># heading</code> in the content, then to the filename.</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#85E89D">title</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"Getting Started"</span></span>
<span class="line"></span></code></pre>
<h3 id="description" class="scroll-mt-20"><code>description</code> <a class="link link-hover text-base-content/30 no-underline" href="#description" aria-hidden="true">#</a></h3>
<p>Type: <code>string</code></p>
<p>Page description used for search indexing and meta tags. Appears as the excerpt in search results.</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#85E89D">description</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"Learn how to install and configure the framework"</span></span>
<span class="line"></span></code></pre>
<h3 id="sidebar_position" class="scroll-mt-20"><code>sidebar_position</code> <a class="link link-hover text-base-content/30 no-underline" href="#sidebar_position" aria-hidden="true">#</a></h3>
<p>Type: <code>number</code></p>
<p>Controls the sort order in auto-generated sidebars. Lower numbers appear first. Pages without this field sort after all pages with it (default: 999).</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#85E89D">sidebar_position</span><span style="color:#E1E4E8">: </span><span style="color:#79B8FF">1</span><span style="color:#6A737D">    # appears first</span></span>
<span class="line"><span style="color:#85E89D">sidebar_position</span><span style="color:#E1E4E8">: </span><span style="color:#79B8FF">2</span><span style="color:#6A737D">    # appears second</span></span>
<span class="line"><span style="color:#85E89D">sidebar_position</span><span style="color:#E1E4E8">: </span><span style="color:#79B8FF">10</span><span style="color:#6A737D">   # appears after 1 and 2</span></span>
<span class="line"></span></code></pre>
<p>When two pages have the same position, they sort alphabetically by title.</p>
<h3 id="sidebar_label" class="scroll-mt-20"><code>sidebar_label</code> <a class="link link-hover text-base-content/30 no-underline" href="#sidebar_label" aria-hidden="true">#</a></h3>
<p>Type: <code>string</code></p>
<p>Overrides the display text in the sidebar. If omitted, the <code>title</code> field is used.</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#85E89D">title</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"Framework.boot() API Reference"</span></span>
<span class="line"><span style="color:#85E89D">sidebar_label</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"boot()"</span><span style="color:#6A737D"> # sidebar shows "boot()" instead</span></span>
<span class="line"></span></code></pre>
<h3 id="sidebar_group" class="scroll-mt-20"><code>sidebar_group</code> <a class="link link-hover text-base-content/30 no-underline" href="#sidebar_group" aria-hidden="true">#</a></h3>
<p>Type: <code>string</code></p>
<p>Assigns the page to a named sidebar group. Useful for organizing pages within a section.</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#85E89D">sidebar_group</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"Advanced"</span></span>
<span class="line"></span></code></pre>
<h3 id="draft" class="scroll-mt-20"><code>draft</code> <a class="link link-hover text-base-content/30 no-underline" href="#draft" aria-hidden="true">#</a></h3>
<p>Type: <code>boolean</code></p>
<p>When set to <code>true</code>, the page is excluded from production builds. Draft pages are still visible during development.</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#85E89D">draft</span><span style="color:#E1E4E8">: </span><span style="color:#79B8FF">true</span></span>
<span class="line"></span></code></pre>
<div role="alert" class="alert alert-warning">
<div>
<p class="font-semibold">WARNING</p>
<p>Draft exclusion is controlled by the <code>excludeDrafts</code> option passed to <code>scanDocsDir()</code>. By default, drafts are included.</p>
</div>
</div>
<h2 id="complete-example" class="scroll-mt-20">Complete Example <a class="link link-hover text-base-content/30 no-underline" href="#complete-example" aria-hidden="true">#</a></h2>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#B392F0">---</span></span>
<span class="line"><span style="color:#85E89D">title</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"Configuration Reference"</span></span>
<span class="line"><span style="color:#85E89D">description</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"Complete reference for all configuration options"</span></span>
<span class="line"><span style="color:#85E89D">sidebar_position</span><span style="color:#E1E4E8">: </span><span style="color:#79B8FF">2</span></span>
<span class="line"><span style="color:#85E89D">sidebar_label</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"Config"</span></span>
<span class="line"><span style="color:#85E89D">sidebar_group</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"Guide"</span></span>
<span class="line"><span style="color:#85E89D">draft</span><span style="color:#E1E4E8">: </span><span style="color:#79B8FF">false</span></span>
<span class="line"><span style="color:#B392F0">---</span></span>
<span class="line"></span></code></pre>
<h2 id="fallback-behavior" class="scroll-mt-20">Fallback Behavior <a class="link link-hover text-base-content/30 no-underline" href="#fallback-behavior" aria-hidden="true">#</a></h2>
<p>When frontmatter fields are missing, the system uses these fallbacks:</p>
<table>
<thead>
<tr>
<th>Field</th>
<th>Fallback Chain</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>title</code></td>
<td>frontmatter → first <code># heading</code> → filename-derived</td>
</tr>
<tr>
<td><code>description</code></td>
<td>frontmatter → empty string</td>
</tr>
<tr>
<td><code>sidebar_position</code></td>
<td>frontmatter → 999 (sorts last)</td>
</tr>
<tr>
<td><code>sidebar_label</code></td>
<td>frontmatter → <code>title</code> value</td>
</tr>
</tbody>
</table>
<p>For example, a file <code>docs/api/router.md</code> with no frontmatter and no <code># heading</code> would get the title &quot;Router&quot; (derived from the filename).</p>
`}},Pn={title:"Markdown",description:"Overview of markdown features supported by @lark.js/docs",sidebarPosition:1,headings:[{level:2,text:"Standard Features",slug:"standard-features"},{level:2,text:"Enhanced Features",slug:"enhanced-features"},{level:2,text:"Internal Links",slug:"internal-links"},{level:2,text:"Heading Anchors",slug:"heading-anchors"},{level:2,text:"Table of Contents",slug:"table-of-contents"}],relativePath:"/Users/hangtiancheng/github/lark/packages/lark-docs/docs/markdown/index.md"},In={pageData:Pn,template:function(e,s,t){return`<h1 id="markdown" class="scroll-mt-20">Markdown <a class="link link-hover text-base-content/30 no-underline" href="#markdown" aria-hidden="true">#</a></h1>
<p><code>@lark.js/docs</code> uses <a href="https://github.com/markdown-it/markdown-it" target="_blank" rel="noopener noreferrer">markdown-it</a> as its markdown parser, enhanced with custom plugins for documentation-specific features.</p>
<h2 id="standard-features" class="scroll-mt-20">Standard Features <a class="link link-hover text-base-content/30 no-underline" href="#standard-features" aria-hidden="true">#</a></h2>
<p>All standard CommonMark syntax is supported:</p>
<ul>
<li><strong>Headings</strong> (h1 through h6)</li>
<li><strong>Paragraphs</strong>, <strong>bold</strong>, <em>italic</em>, <code>inline code</code></li>
<li><strong>Lists</strong> (ordered and unordered)</li>
<li><strong>Blockquotes</strong></li>
<li><strong>Links</strong> and <strong>images</strong></li>
<li><strong>Tables</strong></li>
<li><strong>Horizontal rules</strong></li>
<li><strong>HTML passthrough</strong> (raw HTML in markdown is preserved)</li>
<li><strong>Linkify</strong> (bare URLs are auto-detected and converted to links)</li>
</ul>
<h2 id="enhanced-features" class="scroll-mt-20">Enhanced Features <a class="link link-hover text-base-content/30 no-underline" href="#enhanced-features" aria-hidden="true">#</a></h2>
<table>
<thead>
<tr>
<th>Feature</th>
<th>Description</th>
<th>Reference</th>
</tr>
</thead>
<tbody>
<tr>
<td>YAML Frontmatter</td>
<td>Per-page metadata (title, description, sidebar position)</td>
<td><a href="/docs/markdown/frontmatter/" data-lark-nav="true">Frontmatter</a></td>
</tr>
<tr>
<td>Admonition Containers</td>
<td><code>::: tip</code>, <code>::: warning</code>, <code>::: danger</code>, <code>::: details</code></td>
<td><a href="/docs/markdown/containers/" data-lark-nav="true">Containers</a></td>
</tr>
<tr>
<td>Code Highlighting</td>
<td>Shiki-powered syntax highlighting with 100+ languages</td>
<td><a href="/docs/markdown/code-highlighting/" data-lark-nav="true">Code Highlighting</a></td>
</tr>
<tr>
<td>Heading Anchors</td>
<td>Auto-generated <code>id</code> attributes and <code>#</code> permalink links</td>
<td>Automatic</td>
</tr>
<tr>
<td>Table of Contents</td>
<td><code>[[toc]]</code> directive renders a page outline</td>
<td>Automatic</td>
</tr>
<tr>
<td>Internal Links</td>
<td>Links starting with <code>/</code> or <code>#</code> use SPA navigation</td>
<td>Automatic</td>
</tr>
</tbody>
</table>
<h2 id="internal-links" class="scroll-mt-20">Internal Links <a class="link link-hover text-base-content/30 no-underline" href="#internal-links" aria-hidden="true">#</a></h2>
<p>Links starting with <code>/</code> or <code>#</code> are automatically intercepted for SPA navigation via the lark-mvc Router. External links open in a new tab.</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#E1E4E8">[</span><span style="color:#DBEDFF;text-decoration:underline">Guide</span><span style="color:#E1E4E8">](</span><span style="color:#E1E4E8;text-decoration:underline">/docs/guide/</span><span style="color:#E1E4E8">) → SPA navigation</span></span>
<span class="line"><span style="color:#E1E4E8">[</span><span style="color:#DBEDFF;text-decoration:underline">Router API</span><span style="color:#E1E4E8">](</span><span style="color:#E1E4E8;text-decoration:underline">/docs/api/router</span><span style="color:#E1E4E8">) → SPA navigation</span></span>
<span class="line"><span style="color:#E1E4E8">[</span><span style="color:#DBEDFF;text-decoration:underline">GitHub</span><span style="color:#E1E4E8">](</span><span style="color:#E1E4E8;text-decoration:underline">https://github.com</span><span style="color:#E1E4E8">) → opens in new tab</span></span>
<span class="line"><span style="color:#E1E4E8">[</span><span style="color:#DBEDFF;text-decoration:underline">#installation</span><span style="color:#E1E4E8">](</span><span style="color:#E1E4E8;text-decoration:underline">#installation</span><span style="color:#E1E4E8">) → scroll to anchor</span></span>
<span class="line"></span></code></pre>
<h2 id="heading-anchors" class="scroll-mt-20">Heading Anchors <a class="link link-hover text-base-content/30 no-underline" href="#heading-anchors" aria-hidden="true">#</a></h2>
<p>All headings automatically get <code>id</code> attributes for anchor linking. Headings h1 through h3 also get a <code>#</code> permalink symbol on hover.</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#79B8FF;font-weight:bold">## Installation → id="installation" + # permalink</span></span>
<span class="line"></span>
<span class="line"><span style="color:#79B8FF;font-weight:bold">### Prerequisites → id="prerequisites" + # permalink</span></span>
<span class="line"></span>
<span class="line"><span style="color:#79B8FF;font-weight:bold">#### Details → id="details" (no permalink)</span></span>
<span class="line"></span></code></pre>
<p>Duplicate heading texts get deduplicated slugs:</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#79B8FF;font-weight:bold">## Setup → id="setup"</span></span>
<span class="line"></span>
<span class="line"><span style="color:#79B8FF;font-weight:bold">## Setup → id="setup-1"</span></span>
<span class="line"></span></code></pre>
<h2 id="table-of-contents" class="scroll-mt-20">Table of Contents <a class="link link-hover text-base-content/30 no-underline" href="#table-of-contents" aria-hidden="true">#</a></h2>
<p>Insert <code>[[toc]]</code> anywhere in your markdown to render a table of contents. The TOC includes h2 and h3 headings by default (configurable via <code>markdown.toc.level</code>).</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#79B8FF;font-weight:bold"># Page Title</span></span>
<span class="line"></span>
<span class="line"><span style="color:#E1E4E8">[[</span><span style="color:#DBEDFF;text-decoration:underline">toc</span><span style="color:#E1E4E8">]]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#79B8FF;font-weight:bold">## Section One</span></span>
<span class="line"></span>
<span class="line"><span style="color:#79B8FF;font-weight:bold">### Subsection</span></span>
<span class="line"></span>
<span class="line"><span style="color:#79B8FF;font-weight:bold">## Section Two</span></span>
<span class="line"></span></code></pre>
`}},Mn={title:"Router",description:"File-based routing with history and hash modes",sidebarPosition:1,headings:[{level:2,text:"Route Generation Rules",slug:"route-generation-rules"},{level:2,text:"Route Modes",slug:"route-modes"},{level:3,text:"History Mode (Default)",slug:"history-mode-default"},{level:3,text:"Hash Mode",slug:"hash-mode"},{level:2,text:"Base URL",slug:"base-url"},{level:2,text:"Route Map",slug:"route-map"},{level:2,text:"Navigation",slug:"navigation"},{level:3,text:"In Markdown",slug:"in-markdown"},{level:3,text:"Programmatic",slug:"programmatic"},{level:2,text:"Unmatched Routes",slug:"unmatched-routes"}],relativePath:"/Users/hangtiancheng/github/lark/packages/lark-docs/docs/router/index.md"},Ln={pageData:Mn,template:function(e,s,t){return`<h1 id="router" class="scroll-mt-20">Router <a class="link link-hover text-base-content/30 no-underline" href="#router" aria-hidden="true">#</a></h1>
<p><code>@lark.js/docs</code> generates file-based routes from your <code>docs/</code> directory and maps them to <code>@lark.js/mvc</code> Router routes. The Router supports both <code>history</code> mode (clean URLs) and <code>hash</code> mode (fragment URLs).</p>
<h2 id="route-generation-rules" class="scroll-mt-20">Route Generation Rules <a class="link link-hover text-base-content/30 no-underline" href="#route-generation-rules" aria-hidden="true">#</a></h2>
<p>Each <code>.md</code> file in the docs directory becomes one route:</p>
<table>
<thead>
<tr>
<th>File Path</th>
<th>Generated Route</th>
<th>View ID</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>docs/index.md</code></td>
<td><code>/docs/</code></td>
<td><code>index</code></td>
</tr>
<tr>
<td><code>docs/getting-started.md</code></td>
<td><code>/docs/getting-started</code></td>
<td><code>getting-started</code></td>
</tr>
<tr>
<td><code>docs/guide/index.md</code></td>
<td><code>/docs/guide/</code></td>
<td><code>guide-index</code></td>
</tr>
<tr>
<td><code>docs/guide/config.md</code></td>
<td><code>/docs/guide/config</code></td>
<td><code>guide-config</code></td>
</tr>
<tr>
<td><code>docs/api/router.md</code></td>
<td><code>/docs/api/router</code></td>
<td><code>api-router</code></td>
</tr>
</tbody>
</table>
<p>Rules:</p>
<ul>
<li><code>index.md</code> maps to the directory root (with trailing <code>/</code>)</li>
<li>Other files map to their stem without <code>.md</code> extension</li>
<li>All paths are prefixed with <code>baseUrl</code></li>
<li>Files/directories starting with <code>_</code> or <code>.</code> are ignored</li>
<li><code>node_modules</code>, <code>__tests__</code>, <code>.git</code>, <code>dist</code> directories are skipped</li>
</ul>
<h2 id="route-modes" class="scroll-mt-20">Route Modes <a class="link link-hover text-base-content/30 no-underline" href="#route-modes" aria-hidden="true">#</a></h2>
<h3 id="history-mode-default" class="scroll-mt-20">History Mode (Default) <a class="link link-hover text-base-content/30 no-underline" href="#history-mode-default" aria-hidden="true">#</a></h3>
<p>Uses <code>history.pushState</code> and <code>popstate</code> events for clean URLs:</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span>https://example.com/docs/guide/</span></span>
<span class="line"><span>https://example.com/docs/guide/config</span></span>
<span class="line"><span>https://example.com/docs/api/router</span></span>
<span class="line"><span></span></span></code></pre>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#B392F0">routeMode</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"history"</span><span style="color:#E1E4E8">;</span></span>
<span class="line"></span></code></pre>
<div role="alert" class="alert alert-info">
<div>
<p class="font-semibold">TIP</p>
<p>History mode requires server-side configuration to serve the same HTML file for all routes (a &quot;catch-all&quot; or &quot;SPA fallback&quot;). Most static hosting services support this out of the box.</p>
</div>
</div>
<h3 id="hash-mode" class="scroll-mt-20">Hash Mode <a class="link link-hover text-base-content/30 no-underline" href="#hash-mode" aria-hidden="true">#</a></h3>
<p>Uses URL hash fragments with the <code>#!</code> prefix:</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span>https://example.com/#!/docs/guide/</span></span>
<span class="line"><span>https://example.com/#!/docs/guide/config</span></span>
<span class="line"><span>https://example.com/#!/docs/api/router</span></span>
<span class="line"><span></span></span></code></pre>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#B392F0">routeMode</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"hash"</span><span style="color:#E1E4E8">;</span></span>
<span class="line"></span></code></pre>
<div role="alert" class="alert alert-warning">
<div>
<p class="font-semibold">WARNING</p>
<p>Hash mode does not work with server-side rendering. It is best suited for static hosting where server configuration is not available.</p>
</div>
</div>
<h2 id="base-url" class="scroll-mt-20">Base URL <a class="link link-hover text-base-content/30 no-underline" href="#base-url" aria-hidden="true">#</a></h2>
<p>The <code>baseUrl</code> config option adds a common prefix to all routes:</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#B392F0">baseUrl</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"/docs/"</span><span style="color:#E1E4E8">; </span><span style="color:#6A737D">// /docs/, /docs/guide/, /docs/api/router</span></span>
<span class="line"><span style="color:#B392F0">baseUrl</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"/v2/docs/"</span><span style="color:#E1E4E8">; </span><span style="color:#6A737D">// /v2/docs/, /v2/docs/guide/</span></span>
<span class="line"><span style="color:#B392F0">baseUrl</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"/"</span><span style="color:#E1E4E8">; </span><span style="color:#6A737D">// /, /guide/, /api/router</span></span>
<span class="line"></span></code></pre>
<h2 id="route-map" class="scroll-mt-20">Route Map <a class="link link-hover text-base-content/30 no-underline" href="#route-map" aria-hidden="true">#</a></h2>
<p>The generated route map is a plain object that feeds directly into <code>@lark.js/mvc</code>'s <code>FrameworkConfig.routes</code>:</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#6A737D">// Generated by vite.config.ts</span></span>
<span class="line"><span style="color:#F97583">export</span><span style="color:#F97583"> const</span><span style="color:#79B8FF"> routes</span><span style="color:#F97583"> =</span><span style="color:#E1E4E8"> {</span></span>
<span class="line"><span style="color:#9ECBFF">  "/docs/"</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"index"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#9ECBFF">  "/docs/get-started/"</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"get-started-index"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#9ECBFF">  "/docs/get-started/configuration"</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"get-started-configuration"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#9ECBFF">  "/docs/markdown/"</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"markdown-index"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#9ECBFF">  "/docs/markdown/frontmatter"</span><span style="color:#E1E4E8">: </span><span style="color:#9ECBFF">"markdown-frontmatter"</span><span style="color:#E1E4E8">,</span></span>
<span class="line"><span style="color:#E1E4E8">};</span></span>
<span class="line"></span></code></pre>
<h2 id="navigation" class="scroll-mt-20">Navigation <a class="link link-hover text-base-content/30 no-underline" href="#navigation" aria-hidden="true">#</a></h2>
<h3 id="in-markdown" class="scroll-mt-20">In Markdown <a class="link link-hover text-base-content/30 no-underline" href="#in-markdown" aria-hidden="true">#</a></h3>
<p>Links starting with <code>/</code> or <code>#</code> are automatically intercepted for SPA navigation:</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#E1E4E8">[</span><span style="color:#DBEDFF;text-decoration:underline">Guide</span><span style="color:#E1E4E8">](</span><span style="color:#E1E4E8;text-decoration:underline">/docs/guide/</span><span style="color:#E1E4E8">) → Router.to("/docs/guide/")</span></span>
<span class="line"><span style="color:#E1E4E8">[</span><span style="color:#DBEDFF;text-decoration:underline">#installation</span><span style="color:#E1E4E8">](</span><span style="color:#E1E4E8;text-decoration:underline">#installation</span><span style="color:#E1E4E8">) → scroll to anchor</span></span>
<span class="line"><span style="color:#E1E4E8">[</span><span style="color:#DBEDFF;text-decoration:underline">GitHub</span><span style="color:#E1E4E8">](</span><span style="color:#E1E4E8;text-decoration:underline">https://github.com</span><span style="color:#E1E4E8">) → opens in new tab (not intercepted)</span></span>
<span class="line"></span></code></pre>
<h3 id="programmatic" class="scroll-mt-20">Programmatic <a class="link link-hover text-base-content/30 no-underline" href="#programmatic" aria-hidden="true">#</a></h3>
<p>In theme views, navigation is delegated to the lark-mvc Router:</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#E1E4E8">Router.</span><span style="color:#B392F0">to</span><span style="color:#E1E4E8">(</span><span style="color:#9ECBFF">"/docs/guide/config"</span><span style="color:#E1E4E8">); </span><span style="color:#6A737D">// navigate</span></span>
<span class="line"><span style="color:#E1E4E8">Router.</span><span style="color:#B392F0">to</span><span style="color:#E1E4E8">(</span><span style="color:#9ECBFF">"/docs/guide/"</span><span style="color:#E1E4E8">, { page: </span><span style="color:#9ECBFF">"2"</span><span style="color:#E1E4E8"> }); </span><span style="color:#6A737D">// navigate with params</span></span>
<span class="line"><span style="color:#E1E4E8">Router.</span><span style="color:#B392F0">to</span><span style="color:#E1E4E8">({ page: </span><span style="color:#9ECBFF">"3"</span><span style="color:#E1E4E8"> }); </span><span style="color:#6A737D">// update params only</span></span>
<span class="line"></span></code></pre>
<h2 id="unmatched-routes" class="scroll-mt-20">Unmatched Routes <a class="link link-hover text-base-content/30 no-underline" href="#unmatched-routes" aria-hidden="true">#</a></h2>
<p>When a URL does not match any generated route, the <code>unmatchedView</code> is mounted. Configure this in the boot file:</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#E1E4E8">Framework.</span><span style="color:#B392F0">boot</span><span style="color:#E1E4E8">({</span></span>
<span class="line"><span style="color:#E1E4E8">  routes,</span></span>
<span class="line"><span style="color:#E1E4E8">  unmatchedView: </span><span style="color:#9ECBFF">"index"</span><span style="color:#E1E4E8">, </span><span style="color:#6A737D">// fallback to home page</span></span>
<span class="line"><span style="color:#E1E4E8">});</span></span>
<span class="line"></span></code></pre>
`}},On={title:"Styling",description:"Tailwind CSS and DaisyUI integration",sidebarPosition:1,headings:[{level:2,text:"Setup",slug:"setup"},{level:2,text:"Theme Structure",slug:"theme-structure"},{level:2,text:"Layout",slug:"layout"},{level:2,text:"Color System",slug:"color-system"},{level:2,text:"Code Block Styling",slug:"code-block-styling"},{level:2,text:"Icons",slug:"icons"},{level:2,text:"Custom Themes",slug:"custom-themes"}],relativePath:"/Users/hangtiancheng/github/lark/packages/lark-docs/docs/style/index.md"},Un={pageData:On,template:function(e,s,t){return`<h1 id="styling" class="scroll-mt-20">Styling <a class="link link-hover text-base-content/30 no-underline" href="#styling" aria-hidden="true">#</a></h1>
<p><code>@lark.js/docs</code> uses <strong>Tailwind CSS</strong> and <strong>DaisyUI</strong> for all theme styling. The theme templates use only Tailwind utility classes and DaisyUI component classes — no custom CSS is written or needed.</p>
<h2 id="setup" class="scroll-mt-20">Setup <a class="link link-hover text-base-content/30 no-underline" href="#setup" aria-hidden="true">#</a></h2>
<p>Install the peer dependencies:</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#B392F0">pnpm</span><span style="color:#9ECBFF"> add</span><span style="color:#9ECBFF"> tailwindcss</span><span style="color:#9ECBFF"> daisyui</span><span style="color:#9ECBFF"> @tailwindcss/typography</span></span>
<span class="line"></span></code></pre>
<p>Create a CSS entry file:</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#6A737D">/* main.css */</span></span>
<span class="line"><span style="color:#F97583">@import</span><span style="color:#9ECBFF"> "tailwindcss"</span><span style="color:#E1E4E8">;</span></span>
<span class="line"><span style="color:#F97583">@plugin</span><span style="color:#E1E4E8"> "daisyui";</span></span>
<span class="line"></span></code></pre>
<p>Import it in your boot file:</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#6A737D">// boot.ts</span></span>
<span class="line"><span style="color:#F97583">import</span><span style="color:#9ECBFF"> "./main.css"</span><span style="color:#E1E4E8">;</span></span>
<span class="line"></span></code></pre>
<div role="alert" class="alert alert-info">
<div>
<p class="font-semibold">TIP</p>
<p><code>@tailwindcss/typography</code> is a peer dependency that provides the <code>prose</code> class used for rendered markdown content. It adds proper typographic styles to headings, paragraphs, lists, tables, and code blocks.</p>
</div>
</div>
<h2 id="theme-structure" class="scroll-mt-20">Theme Structure <a class="link link-hover text-base-content/30 no-underline" href="#theme-structure" aria-hidden="true">#</a></h2>
<p>The documentation site is composed of five theme views:</p>
<table>
<thead>
<tr>
<th>View</th>
<th>Role</th>
<th>Key DaisyUI Components</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>DocLayout</strong></td>
<td>Root layout: navbar + sidebar + content + TOC</td>
<td><code>navbar</code>, <code>btn-ghost</code>, <code>menu</code></td>
</tr>
<tr>
<td><strong>Sidebar</strong></td>
<td>Navigation tree</td>
<td><code>menu</code>, <code>menu-sm</code>, <code>menu-active</code></td>
</tr>
<tr>
<td><strong>Content</strong></td>
<td>Rendered markdown body</td>
<td><code>prose</code>, <code>max-w-none</code></td>
</tr>
<tr>
<td><strong>TOC</strong></td>
<td>Right-side heading outline</td>
<td><code>menu</code>, <code>menu-sm</code>, <code>menu-active</code></td>
</tr>
<tr>
<td><strong>Search</strong></td>
<td>Full-text search dialog</td>
<td><code>modal</code>, <code>input</code>, <code>input-bordered</code></td>
</tr>
</tbody>
</table>
<h2 id="layout" class="scroll-mt-20">Layout <a class="link link-hover text-base-content/30 no-underline" href="#layout" aria-hidden="true">#</a></h2>
<p>The DocLayout provides a three-column responsive structure:</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  Navbar (sticky top)                                │</span></span>
<span class="line"><span>├────────┬──────────────────────────┬─────────────────┤</span></span>
<span class="line"><span>│        │                          │                 │</span></span>
<span class="line"><span>│Sidebar │      Main Content       │      TOC        │</span></span>
<span class="line"><span>│  64w   │      (flex-1)           │      56w        │</span></span>
<span class="line"><span>│        │      prose prose-lg     │                 │</span></span>
<span class="line"><span>│        │                          │                 │</span></span>
<span class="line"><span>│        │                          │                 │</span></span>
<span class="line"><span>│        ├──────────────────────────┤                 │</span></span>
<span class="line"><span>│        │  Prev / Next Navigation  │                 │</span></span>
<span class="line"><span>│        │                          │                 │</span></span>
<span class="line"><span>└────────┴──────────────────────────┴─────────────────┘</span></span>
<span class="line"><span></span></span></code></pre>
<ul>
<li>Sidebar is visible on <code>lg:</code> (1024px+) screens</li>
<li>TOC is visible on <code>xl:</code> (1280px+) screens</li>
<li>On smaller screens, only the main content is shown</li>
</ul>
<h2 id="color-system" class="scroll-mt-20">Color System <a class="link link-hover text-base-content/30 no-underline" href="#color-system" aria-hidden="true">#</a></h2>
<p>All colors use DaisyUI semantic color names, which automatically adapt to the active theme:</p>
<table>
<thead>
<tr>
<th>Usage</th>
<th>Color Class</th>
</tr>
</thead>
<tbody>
<tr>
<td>Page background</td>
<td><code>bg-base-100</code></td>
</tr>
<tr>
<td>Navbar background</td>
<td><code>bg-base-200</code></td>
</tr>
<tr>
<td>Borders</td>
<td><code>border-base-300</code></td>
</tr>
<tr>
<td>Primary text</td>
<td><code>text-base-content</code></td>
</tr>
<tr>
<td>Muted text</td>
<td><code>text-base-content/70</code></td>
</tr>
<tr>
<td>Active links</td>
<td><code>text-primary</code></td>
</tr>
<tr>
<td>Tip containers</td>
<td><code>alert-info</code></td>
</tr>
<tr>
<td>Warning containers</td>
<td><code>alert-warning</code></td>
</tr>
<tr>
<td>Danger containers</td>
<td><code>alert-error</code></td>
</tr>
</tbody>
</table>
<div role="alert" class="alert alert-info">
<div>
<p class="font-semibold">TIP</p>
<p>Because DaisyUI colors are semantic (not fixed hex values), switching themes automatically updates all colors throughout the site.</p>
</div>
</div>
<h2 id="code-block-styling" class="scroll-mt-20">Code Block Styling <a class="link link-hover text-base-content/30 no-underline" href="#code-block-styling" aria-hidden="true">#</a></h2>
<p>Code blocks are styled by Shiki at build time. Shiki produces HTML with <strong>inline styles</strong> — no CSS classes are needed for syntax highlighting. The output includes:</p>
<ul>
<li>Background color via <code>style=&quot;background-color:#...&quot;</code> on <code>&lt;pre&gt;</code></li>
<li>Per-token colors via <code>style=&quot;color:#...&quot;</code> on <code>&lt;span&gt;</code> elements</li>
<li>Theme name as a class for identification: <code>class=&quot;shiki github-dark&quot;</code></li>
</ul>
<p>When Shiki is not configured, code blocks fall back to DaisyUI styling:</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#E1E4E8">&#x3C;</span><span style="color:#85E89D">pre</span></span>
<span class="line"><span style="color:#B392F0">  class</span><span style="color:#E1E4E8">=</span><span style="color:#9ECBFF">"bg-neutral text-neutral-content rounded-box overflow-x-auto p-4"</span></span>
<span class="line"><span style="color:#E1E4E8">>&#x3C;/</span><span style="color:#85E89D">pre</span><span style="color:#E1E4E8">></span></span>
<span class="line"></span></code></pre>
<h2 id="icons" class="scroll-mt-20">Icons <a class="link link-hover text-base-content/30 no-underline" href="#icons" aria-hidden="true">#</a></h2>
<p>Theme icons use <a href="https://lucide.dev" target="_blank" rel="noopener noreferrer">lucide-static</a> imported as raw SVG strings via Vite's <code>?raw</code> suffix. Icons are rendered with <code>{{!icons.name}}</code> and inherit <code>currentColor</code> from their parent:</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#E1E4E8">&#x3C;</span><span style="color:#85E89D">span</span><span style="color:#B392F0"> class</span><span style="color:#E1E4E8">=</span><span style="color:#9ECBFF">"h-5 w-5 [&#x26;>svg]:h-full [&#x26;>svg]:w-full"</span><span style="color:#E1E4E8">> {{!icons.search}} &#x3C;/</span><span style="color:#85E89D">span</span><span style="color:#E1E4E8">></span></span>
<span class="line"></span></code></pre>
<h2 id="custom-themes" class="scroll-mt-20">Custom Themes <a class="link link-hover text-base-content/30 no-underline" href="#custom-themes" aria-hidden="true">#</a></h2>
<p>DaisyUI supports 30+ built-in themes. Switch themes in your Tailwind config:</p>
<pre class="shiki github-dark" style="background-color:#24292e;color:#e1e4e8" tabindex="0"><code><span class="line"><span style="color:#F97583">@import</span><span style="color:#9ECBFF"> "tailwindcss"</span><span style="color:#E1E4E8">;</span></span>
<span class="line"><span style="color:#F97583">@plugin</span><span style="color:#E1E4E8"> "daisyui" {</span></span>
<span class="line"><span style="color:#E1E4E8">  themes:</span></span>
<span class="line"><span style="color:#E1E4E8">    light --default,</span></span>
<span class="line"><span style="color:#E1E4E8">    dark --prefersdark,</span></span>
<span class="line"><span style="color:#E1E4E8">    wireframe,</span></span>
<span class="line"><span style="color:#E1E4E8">    cyberpunk;</span></span>
<span class="line"><span style="color:#E1E4E8">}</span></span>
<span class="line"></span></code></pre>
`}};I("get-started-configuration",Fn);I("get-started-index",wn);I("index",Bn);I("markdown-code-highlighting",Tn);I("markdown-containers",Rn);I("markdown-frontmatter",Dn);I("markdown-index",In);I("router-index",Ln);I("style-index",Un);const jn={"/docs/get-started/configuration":"get-started-configuration","/docs/get-started/":"get-started-index","/docs/":"index","/docs/markdown/code-highlighting":"markdown-code-highlighting","/docs/markdown/containers":"markdown-containers","/docs/markdown/frontmatter":"markdown-frontmatter","/docs/markdown/":"markdown-index","/docs/router/":"router-index","/docs/style/":"style-index"},$n={title:"@lark.js/docs",description:"Documentation site generator for @lark.js/mvc",lang:"en-US",nav:[{text:"Get Started",link:"/docs/get-started/"},{text:"Markdown",link:"/docs/markdown/"},{text:"Router",link:"/docs/router/"},{text:"Styling",link:"/docs/style/"}],sidebar:{"/docs/get-started/":[],"/docs/markdown/":[],"/docs/router/":[],"/docs/style/":[]},searchIndex:[{title:"Configuration",link:"/docs/get-started/configuration",headings:["defineConfig","Options Reference","`docs`","`baseUrl`","`routeMode`","`title`","`description`","`lang`","`nav`","`sidebar`","`markdown`","`highlight`","`search`","Complete Example"],excerpt:"Full reference for lark-docs.config.ts defineConfig options"},{title:"Get Started",link:"/docs/get-started/",headings:["Installation","Bundler Configuration","Vite (Recommended)","Webpack","Rspack","Entry HTML","Boot File","CSS Entry","Your First Page","Next Steps"],excerpt:"Install, configure, and build your first documentation site"},{title:"@lark.js/docs",link:"/docs/",headings:["Features","Quick Start","How It Works","Navigation"],excerpt:"Documentation site generator for @lark.js/mvc"},{title:"Code Highlighting",link:"/docs/markdown/code-highlighting",headings:["Configuration","Options","`theme`","`languages`","Usage in Markdown","Fallback Behavior"],excerpt:"Shiki-powered syntax highlighting for code blocks"},{title:"Containers",link:"/docs/markdown/containers",headings:["Syntax","Available Types","Tip","Warning","Danger","Details","Custom Labels","Rendering","Nesting"],excerpt:"Admonition containers: tip, warning, danger, details"},{title:"Frontmatter",link:"/docs/markdown/frontmatter",headings:["Syntax","Fields Reference","`title`","`description`","`sidebar_position`","`sidebar_label`","`sidebar_group`","`draft`","Complete Example","Fallback Behavior"],excerpt:"YAML frontmatter fields and usage"},{title:"Markdown",link:"/docs/markdown/",headings:["Standard Features","Enhanced Features","Internal Links","Heading Anchors","Table of Contents"],excerpt:"Overview of markdown features supported by @lark.js/docs"},{title:"Router",link:"/docs/router/",headings:["Route Generation Rules","Route Modes","History Mode (Default)","Hash Mode","Base URL","Route Map","Navigation","In Markdown","Programmatic","Unmatched Routes"],excerpt:"File-based routing with history and hash modes"},{title:"Styling",link:"/docs/style/",headings:["Setup","Theme Structure","Layout","Color System","Code Block Styling","Icons","Custom Themes"],excerpt:"Tailwind CSS and DaisyUI integration"}]},Kn=`<!-- @license lucide-static v1.21.0 - ISC -->
<svg
  class="lucide lucide-search"
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="m21 21-4.34-4.34" />
  <circle cx="11" cy="11" r="8" />
</svg>
`,Gn={search:Kn};function Nn(e,s){return e.extend({template:s,init(){this.updater.set({icons:Gn}),this.observeLocation([],!0),this.assign()},assign(){this.updater.snapshot();const n=this.owner?.constructor?.State?.get?.("siteData")||{};return this.updater.set({siteTitle:n.title||"Documentation",navItems:n.nav||[],prevPage:null,nextPage:null}),this.updater.altered()},render(){this.updater.digest()},"navigateTo<click>"(t){const a=t.target.dataset.href;a&&this.owner?.constructor?.Router?.to?.(a)},"navigateHome<click>"(){this.owner?.constructor?.Router?.to?.("/")},"openSearch<click>"(){this.owner?.constructor?.State?.set?.({searchOpen:!0})?.digest?.()}})}function Hn(e,s){return e.extend({template:s,init(){this.observeLocation([],!0),this.assign()},assign(){this.updater.snapshot();const a=(this.owner?.constructor?.State?.get?.("siteData")||{}).sidebar||{},o=[];for(const[l,r]of Object.entries(a))Array.isArray(r)&&o.push({text:Vn(l),items:r.map(i=>({text:i.text||"",link:i.link||"#",isActive:!1}))});return this.updater.set({sidebarGroups:o}),this.updater.altered()},render(){this.updater.digest()},"navigateTo<click>"(t){const a=t.target.dataset.href;a&&this.owner?.constructor?.Router?.to?.(a)}})}function Vn(e){return e.replace(/^\//,"").replace(/\/$/,"").replace(/-/g," ").replace(/\b\w/g,s=>s.toUpperCase())}function qn(e,s){return e.extend({template:s,init(){this.assign()},assign(){this.updater.snapshot();const t=this._initParams||{};return this.updater.set({contentHtml:t.contentHtml||""}),this.updater.altered()},render(){this.updater.digest()}})}function Wn(e,s){return e.extend({template:s,init(){this.assign()},assign(){this.updater.snapshot();const t=this._initParams||{};return this.updater.set({headings:t.headings||[]}),this.updater.altered()},render(){this.updater.digest()},"scrollToHeading<click>"(t){const a=t.target.dataset.slug;if(a){const o=document.getElementById(a);o&&o.scrollIntoView({behavior:"smooth",block:"start"})}}})}function zn(e,s){return e.extend({template:s,init(){this.searchIndex=null,this.assign()},assign(){return this.updater.snapshot(),this.updater.set({isOpen:!1,results:[],hasSearched:!1}),this.updater.altered()},render(){this.updater.digest()},"openSearch<click>"(){this.updater.set({isOpen:!0,results:[],hasSearched:!1}).digest(),setTimeout(()=>{document.getElementById("docs-search-input")?.focus()},100)},"closeSearch<click>"(){this.updater.set({isOpen:!1,results:[],hasSearched:!1}).digest()},"noop<click>"(){},"onSearchInput<input>"(t){const a=t.target?.value||"";if(!a.trim()){this.updater.set({results:[],hasSearched:!1}).digest();return}if(!this.searchIndex){const l=this.owner?.constructor?.State;this.searchIndex=l?.get?.("searchIndex")||[]}const o=Qn(this.searchIndex,a);this.updater.set({results:o,hasSearched:!0}).digest()},"goToResult<click>"(t){const a=t.target.dataset.href;a&&(this.owner?.constructor?.Router?.to?.(a),this.updater.set({isOpen:!1,results:[],hasSearched:!1}).digest())}})}function Qn(e,s){const t=s.toLowerCase().split(/\s+/).filter(n=>n.length>0);return t.length===0?[]:e.filter(n=>{const a=[n.title,...n.headings,n.excerpt].join(" ").toLowerCase();return t.every(o=>a.includes(o))}).slice(0,20)}var Xn={"&":"amp","<":"lt",">":"gt",'"':"#34","'":"#39","`":"#96"},Yn=/[&<>"'`]/g;function Zn(e){return String(e??"")}function Jn(e){return String(e??"").replace(Yn,s=>"&"+Xn[s]+";")}var zs=Zn,de=Jn;function ea(e,s,t){return((o,l,r,i,c,d,h,g)=>{let p="",k=o.siteTitle,u=o.navItems,E=o.icons,y=o.prevPage,m=o.nextPage,f,b,v;try{p+=`<div class="bg-base-100 min-h-screen">
  <!-- Top navigation bar -->
  <nav class="navbar bg-base-200 border-base-300 sticky top-0 z-50 border-b">
    <div class="flex-1">
      <a class="btn btn-ghost text-xl font-bold" @click="`+l+`navigateHome()"
        >`,v=1,b="=siteTitle",p+=(f="<%=siteTitle%>",i(k)+`</a
      >
    </div>
    <div class="flex-none">
      <ul class="menu menu-horizontal px-1">
        `),v=2,b="forOf navItems as item idx",f="<%for(let idx=0,_l=navItems.length;idx<_l;idx++){let item=navItems[idx]%>";for(let T=0,L=u.length;T<L;T++){let D=u[T];p+=`
        <li>
          <a data-href="`,v=3,b="=item.link",p+=(f="<%=item.link%>",i(D.link)+'" @click="'+l+'navigateTo()">'),v=4,b="=item.text",p+=(f="<%=item.text%>",i(D.text)+`</a>
        </li>
        `),v=5,b="/forOf",f="<%}%>"}p+=`
      </ul>
      <!-- Search button -->
      <label class="btn btn-ghost btn-circle" @click="`+l+`openSearch()">
        <span class="h-5 w-5 [&>svg]:h-full [&>svg]:w-full">
          `,v=6,b="!icons.search",p+=(f="<%!icons.search%>",c(E.search)+`
        </span>
      </label>
    </div>
  </nav>

  <div class="mx-auto flex max-w-7xl">
    <!-- Sidebar -->
    <aside
      class="border-base-200 sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r p-4 lg:block"
    >
      <div v-lark="theme/sidebar"></div>
    </aside>

    <!-- Main content -->
    <main class="min-w-0 flex-1 px-8 py-6">
      <article class="prose prose-lg max-w-none">
        <div v-lark="theme/content"></div>
      </article>

      <!-- Prev / Next navigation -->
      `),v=7,b="if prevPage || nextPage",f="<%if(prevPage || nextPage){%>",(y||m)&&(p+=`
      <div class="border-base-300 mt-12 flex justify-between border-t pt-6">
        `,v=8,b="if prevPage",f="<%if(prevPage){%>",y?(p+=`
        <a
          class="btn btn-outline btn-sm"
          data-href="`,v=9,b="=prevPage.link",p+=(f="<%=prevPage.link%>",i(y.link)+`"
          @click="`+l+`navigateTo()"
        >
          &larr; `),v=10,b="=prevPage.text",p+=(f="<%=prevPage.text%>",i(y.text)+`
        </a>
        `),v=11,b="else",f="<%}else{%>"):(p+=`
        <span></span>
        `,v=12,b="/if",f="<%}%>"),p+=" ",v=13,b="if nextPage",f="<%if(nextPage){%>",m&&(p+=`
        <a
          class="btn btn-outline btn-sm"
          data-href="`,v=14,b="=nextPage.link",p+=(f="<%=nextPage.link%>",i(m.link)+`"
          @click="`+l+`navigateTo()"
        >
          `),v=15,b="=nextPage.text",p+=(f="<%=nextPage.text%>",i(m.text)+` &rarr;
        </a>
        `),v=16,b="/if",f="<%}%>"),p+=`
      </div>
      `,v=17,b="/if",f="<%}%>"),p+=`
    </main>

    <!-- Table of contents (right) -->
    <aside
      class="sticky top-16 hidden h-[calc(100vh-4rem)] w-56 shrink-0 overflow-y-auto p-4 xl:block"
    >
      <div v-lark="theme/toc"></div>
    </aside>
  </div>

  <!-- Search modal -->
  <div v-lark="theme/search"></div>
</div>
`}catch(T){let L="render view error:"+(T.message||T);throw b&&(L+=`\r
	src art:{{`+b+`}}\r
	at line:`+v),L+=`\r
	`+(b?"translate to:":"expr:"),L+=f+"",L}return p})(e||{},s||"",t,de,zs)}function sa(e,s,t){return((o,l,r,i,c,d,h,g)=>{let p="",k=o.sidebarGroups,u,E,y;try{p+=`<nav>
  `,y=1,E="forOf sidebarGroups as group",u="<%for(let _i=0,_l=sidebarGroups.length;_i<_l;_i++){let group=sidebarGroups[_i]%>";for(let m=0,f=k.length;m<f;m++){let b=k[m];p+=`
  <div class="mb-4">
    `,y=2,E="if group.text",u="<%if(group.text){%>",b.text&&(p+=`
    <p
      class="text-base-content/70 mb-2 text-sm font-semibold tracking-wider uppercase"
    >
      `,y=3,E="=group.text",p+=(u="<%=group.text%>",i(b.text)+`
    </p>
    `),y=4,E="/if",u="<%}%>"),p+=`
    <ul class="menu menu-sm p-0">
      `,y=5,E="forOf group.items as item",u="<%for(let _i=0,_art_obj_group_items=group.items,_l=_art_obj_group_items.length;_i<_l;_i++){let item=_art_obj_group_items[_i]%>";for(let v=0,T=b.items,L=T.length;v<L;v++){let D=T[v];p+=`
      <li>
        <a
          class="`,y=6,E="if item.isActive",u="<%if(item.isActive){%>",D.isActive&&(p+="menu-active font-medium",y=7,E="/if",u="<%}%>"),p+=`"
          data-href="`,y=8,E="=item.link",p+=(u="<%=item.link%>",i(D.link)+`"
          @click="`+l+`navigateTo()"
        >
          `),y=9,E="=item.text",p+=(u="<%=item.text%>",i(D.text)+`
        </a>
      </li>
      `),y=10,E="/forOf",u="<%}%>"}p+=`
    </ul>
  </div>
  `,y=11,E="/forOf",u="<%}%>"}p+=`
</nav>
`}catch(m){let f="render view error:"+(m.message||m);throw E&&(f+=`\r
	src art:{{`+E+`}}\r
	at line:`+y),f+=`\r
	`+(E?"translate to:":"expr:"),f+=u+"",f}return p})(e||{},s||"",t,de)}function ta(e,s,t){return((o,l,r,i,c,d,h,g)=>{let p="",k=o.contentHtml,u,E,y;try{p+='<div class="prose max-w-none">',y=1,E="!contentHtml",p+=(u="<%!contentHtml%>",c(k)+`</div>
`)}catch(m){let f="render view error:"+(m.message||m);throw E&&(f+=`\r
	src art:{{`+E+`}}\r
	at line:`+y),f+=`\r
	`+(E?"translate to:":"expr:"),f+=u+"",f}return p})(e||{},s||"",t,de,zs)}function na(e,s,t){return((o,l,r,i,c,d,h,g)=>{let p="",k=o.headings,u,E,y;try{if(p+=`<div>
  <p
    class="text-base-content/70 mb-2 text-sm font-semibold tracking-wider uppercase"
  >
    On this page
  </p>
  `,y=1,E="if headings.length > 0",u="<%if(headings.length > 0){%>",k.length>0){p+=`
  <ul class="menu menu-sm p-0">
    `,y=2,E="forOf headings as heading",u="<%for(let _i=0,_l=headings.length;_i<_l;_i++){let heading=headings[_i]%>";for(let m=0,f=k.length;m<f;m++){let b=k[m];p+=`
    <li class="`,y=3,E="if heading.level === 3",u="<%if(heading.level === 3){%>",b.level===3&&(p+="ml-4",y=4,E="/if",u="<%}%>"),p+=`">
      <a
        class="`,y=5,E="if heading.isActive",u="<%if(heading.isActive){%>",b.isActive&&(p+="menu-active text-primary font-medium",y=6,E="/if",u="<%}%>"),p+=`"
        href="#`,y=7,E="=heading.slug",p+=(u="<%=heading.slug%>",i(b.slug)+`"
        data-slug="`),y=8,E="=heading.slug",p+=(u="<%=heading.slug%>",i(b.slug)+`"
        @click="`+l+`scrollToHeading()"
      >
        `),y=9,E="=heading.text",p+=(u="<%=heading.text%>",i(b.text)+`
      </a>
    </li>
    `),y=10,E="/forOf",u="<%}%>"}p+=`
  </ul>
  `,y=11,E="else",u="<%}else{%>"}else p+=`
  <p class="text-base-content/40 text-sm">No headings</p>
  `,y=12,E="/if",u="<%}%>";p+=`
</div>
`}catch(m){let f="render view error:"+(m.message||m);throw E&&(f+=`\r
	src art:{{`+E+`}}\r
	at line:`+y),f+=`\r
	`+(E?"translate to:":"expr:"),f+=u+"",f}return p})(e||{},s||"",t,de)}function aa(e,s,t){return((o,l,r,i,c,d,h,g)=>{let p="",k=o.isOpen,u=o.results,E=o.hasSearched,y,m,f;try{if(f=1,m="if isOpen",y="<%if(isOpen){%>",k){if(p+=`
<div class="modal modal-open" @click="`+l+`closeSearch()">
  <div class="modal-box max-w-2xl" @click.stop="noop()">
    <input
      type="text"
      class="input input-bordered mb-4 w-full"
      placeholder="Search documentation..."
      @input="`+l+`onSearchInput()"
      id="docs-search-input"
    />
    <div class="max-h-96 overflow-y-auto">
      `,f=2,m="if results.length > 0",y="<%if(results.length > 0){%>",u.length>0){p+=" ",f=3,m="forOf results as result",y="<%for(let _i=0,_l=results.length;_i<_l;_i++){let result=results[_i]%>";for(let b=0,v=u.length;b<v;b++){let T=u[b];p+=`
      <a
        class="hover:bg-base-200 border-base-200 block cursor-pointer rounded-lg border-b p-3 last:border-0"
        data-href="`,f=4,m="=result.link",p+=(y="<%=result.link%>",i(T.link)+`"
        @click="`+l+`goToResult()"
      >
        <p class="text-sm font-medium">`),f=5,m="=result.title",p+=(y="<%=result.title%>",i(T.title)+`</p>
        `),f=6,m="if result.excerpt",y="<%if(result.excerpt){%>",T.excerpt&&(p+=`
        <p class="text-base-content/60 mt-1 text-xs">`,f=7,m="=result.excerpt",p+=(y="<%=result.excerpt%>",i(T.excerpt)+`</p>
        `),f=8,m="/if",y="<%}%>"),p+=`
      </a>
      `,f=9,m="/forOf",y="<%}%>"}p+=" ",f=10,m="else",y="<%}else{%>"}else p+=" ",f=11,m="if hasSearched",y="<%if(hasSearched){%>",E&&(p+=`
      <p class="text-base-content/50 py-8 text-center">No results found</p>
      `,f=12,m="/if",y="<%}%>"),p+=" ",f=13,m="/if",y="<%}%>";p+=`
    </div>
    <div class="modal-action">
      <button class="btn btn-sm" @click="`+l+`closeSearch()">Close</button>
    </div>
  </div>
</div>
`,f=14,m="/if",y="<%}%>"}p+=`
`}catch(b){let v="render view error:"+(b.message||b);throw m&&(v+=`\r
	src art:{{`+m+`}}\r
	at line:`+f),v+=`\r
	`+(m?"translate to:":"expr:"),v+=y+"",v}return p})(e||{},s||"",t,de)}I("theme/docs-layout",Nn(N,ea));I("theme/sidebar",Hn(N,sa));I("theme/content",qn(N,ta));I("theme/toc",Wn(N,na));I("theme/search",zn(N,aa));V.set({siteData:$n});const oa={rootId:"app",routeMode:"history",defaultPath:"/docs/",defaultView:"index",routes:jn,unmatchedView:"index",error(e){console.error("[@lark.js/docs]",e)}};Ws.boot(oa);
