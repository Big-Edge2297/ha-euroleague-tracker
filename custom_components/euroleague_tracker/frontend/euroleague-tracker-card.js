var G=globalThis,Z=G.ShadowRoot&&(G.ShadyCSS===void 0||G.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,tt=Symbol(),mt=new WeakMap,U=class{constructor(s,e,t){if(this._$cssResult$=!0,t!==tt)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=s,this.t=e}get styleSheet(){let s=this.o,e=this.t;if(Z&&s===void 0){let t=e!==void 0&&e.length===1;t&&(s=mt.get(e)),s===void 0&&((this.o=s=new CSSStyleSheet).replaceSync(this.cssText),t&&mt.set(e,s))}return s}toString(){return this.cssText}},ft=i=>new U(typeof i=="string"?i:i+"",void 0,tt),et=(i,...s)=>{let e=i.length===1?i[0]:s.reduce((t,a,n)=>t+(r=>{if(r._$cssResult$===!0)return r.cssText;if(typeof r=="number")return r;throw Error("Value passed to 'css' function must be a 'css' function result: "+r+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(a)+i[n+1],i[0]);return new U(e,i,tt)},$t=(i,s)=>{if(Z)i.adoptedStyleSheets=s.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of s){let t=document.createElement("style"),a=G.litNonce;a!==void 0&&t.setAttribute("nonce",a),t.textContent=e.cssText,i.appendChild(t)}},st=Z?i=>i:i=>i instanceof CSSStyleSheet?(s=>{let e="";for(let t of s.cssRules)e+=t.cssText;return ft(e)})(i):i;var{is:jt,defineProperty:Dt,getOwnPropertyDescriptor:Ht,getOwnPropertyNames:It,getOwnPropertySymbols:Bt,getPrototypeOf:Wt}=Object,K=globalThis,bt=K.trustedTypes,Vt=bt?bt.emptyScript:"",qt=K.reactiveElementPolyfillSupport,j=(i,s)=>i,at={toAttribute(i,s){switch(s){case Boolean:i=i?Vt:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,s){let e=i;switch(s){case Boolean:e=i!==null;break;case Number:e=i===null?null:Number(i);break;case Object:case Array:try{e=JSON.parse(i)}catch{e=null}}return e}},xt=(i,s)=>!jt(i,s),vt={attribute:!0,type:String,converter:at,reflect:!1,useDefault:!1,hasChanged:xt};Symbol.metadata??=Symbol("metadata"),K.litPropertyMetadata??=new WeakMap;var w=class extends HTMLElement{static addInitializer(s){this._$Ei(),(this.l??=[]).push(s)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(s,e=vt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(s)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(s,e),!e.noAccessor){let t=Symbol(),a=this.getPropertyDescriptor(s,t,e);a!==void 0&&Dt(this.prototype,s,a)}}static getPropertyDescriptor(s,e,t){let{get:a,set:n}=Ht(this.prototype,s)??{get(){return this[e]},set(r){this[e]=r}};return{get:a,set(r){let l=a?.call(this);n?.call(this,r),this.requestUpdate(s,l,t)},configurable:!0,enumerable:!0}}static getPropertyOptions(s){return this.elementProperties.get(s)??vt}static _$Ei(){if(this.hasOwnProperty(j("elementProperties")))return;let s=Wt(this);s.finalize(),s.l!==void 0&&(this.l=[...s.l]),this.elementProperties=new Map(s.elementProperties)}static finalize(){if(this.hasOwnProperty(j("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(j("properties"))){let e=this.properties,t=[...It(e),...Bt(e)];for(let a of t)this.createProperty(a,e[a])}let s=this[Symbol.metadata];if(s!==null){let e=litPropertyMetadata.get(s);if(e!==void 0)for(let[t,a]of e)this.elementProperties.set(t,a)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let a=this._$Eu(e,t);a!==void 0&&this._$Eh.set(a,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(s){let e=[];if(Array.isArray(s)){let t=new Set(s.flat(1/0).reverse());for(let a of t)e.unshift(st(a))}else s!==void 0&&e.push(st(s));return e}static _$Eu(s,e){let t=e.attribute;return t===!1?void 0:typeof t=="string"?t:typeof s=="string"?s.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(s=>this.enableUpdating=s),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(s=>s(this))}addController(s){(this._$EO??=new Set).add(s),this.renderRoot!==void 0&&this.isConnected&&s.hostConnected?.()}removeController(s){this._$EO?.delete(s)}_$E_(){let s=new Map,e=this.constructor.elementProperties;for(let t of e.keys())this.hasOwnProperty(t)&&(s.set(t,this[t]),delete this[t]);s.size>0&&(this._$Ep=s)}createRenderRoot(){let s=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return $t(s,this.constructor.elementStyles),s}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(s=>s.hostConnected?.())}enableUpdating(s){}disconnectedCallback(){this._$EO?.forEach(s=>s.hostDisconnected?.())}attributeChangedCallback(s,e,t){this._$AK(s,t)}_$ET(s,e){let t=this.constructor.elementProperties.get(s),a=this.constructor._$Eu(s,t);if(a!==void 0&&t.reflect===!0){let n=(t.converter?.toAttribute!==void 0?t.converter:at).toAttribute(e,t.type);this._$Em=s,n==null?this.removeAttribute(a):this.setAttribute(a,n),this._$Em=null}}_$AK(s,e){let t=this.constructor,a=t._$Eh.get(s);if(a!==void 0&&this._$Em!==a){let n=t.getPropertyOptions(a),r=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:at;this._$Em=a;let l=r.fromAttribute(e,n.type);this[a]=l??this._$Ej?.get(a)??l,this._$Em=null}}requestUpdate(s,e,t,a=!1,n){if(s!==void 0){let r=this.constructor;if(a===!1&&(n=this[s]),t??=r.getPropertyOptions(s),!((t.hasChanged??xt)(n,e)||t.useDefault&&t.reflect&&n===this._$Ej?.get(s)&&!this.hasAttribute(r._$Eu(s,t))))return;this.C(s,e,t)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(s,e,{useDefault:t,reflect:a,wrapped:n},r){t&&!(this._$Ej??=new Map).has(s)&&(this._$Ej.set(s,r??e??this[s]),n!==!0||r!==void 0)||(this._$AL.has(s)||(this.hasUpdated||t||(e=void 0),this._$AL.set(s,e)),a===!0&&this._$Em!==s&&(this._$Eq??=new Set).add(s))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let s=this.scheduleUpdate();return s!=null&&await s,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[a,n]of this._$Ep)this[a]=n;this._$Ep=void 0}let t=this.constructor.elementProperties;if(t.size>0)for(let[a,n]of t){let{wrapped:r}=n,l=this[a];r!==!0||this._$AL.has(a)||l===void 0||this.C(a,void 0,n,l)}}let s=!1,e=this._$AL;try{s=this.shouldUpdate(e),s?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(t){throw s=!1,this._$EM(),t}s&&this._$AE(e)}willUpdate(s){}_$AE(s){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(s)),this.updated(s)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(s){return!0}update(s){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(s){}firstUpdated(s){}};w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[j("elementProperties")]=new Map,w[j("finalized")]=new Map,qt?.({ReactiveElement:w}),(K.reactiveElementVersions??=[]).push("2.1.2");var pt=globalThis,_t=i=>i,Q=pt.trustedTypes,yt=Q?Q.createPolicy("lit-html",{createHTML:i=>i}):void 0,Et="$lit$",k=`lit$${Math.random().toFixed(9).slice(2)}$`,Pt="?"+k,Gt=`<${Pt}>`,T=document,H=()=>T.createComment(""),I=i=>i===null||typeof i!="object"&&typeof i!="function",dt=Array.isArray,Zt=i=>dt(i)||typeof i?.[Symbol.iterator]=="function",nt=`[ 	
\f\r]`,D=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,wt=/-->/g,At=/>/g,P=RegExp(`>|${nt}(?:([^\\s"'>=/]+)(${nt}*=${nt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),kt=/'/g,St=/"/g,Ct=/^(?:script|style|textarea|title)$/i,ht=i=>(s,...e)=>({_$litType$:i,strings:s,values:e}),h=ht(1),A=ht(2),oe=ht(3),F=Symbol.for("lit-noChange"),m=Symbol.for("lit-nothing"),zt=new WeakMap,C=T.createTreeWalker(T,129);function Tt(i,s){if(!dt(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return yt!==void 0?yt.createHTML(s):s}var Kt=(i,s)=>{let e=i.length-1,t=[],a,n=s===2?"<svg>":s===3?"<math>":"",r=D;for(let l=0;l<e;l++){let o=i[l],c,d,p=-1,u=0;for(;u<o.length&&(r.lastIndex=u,d=r.exec(o),d!==null);)u=r.lastIndex,r===D?d[1]==="!--"?r=wt:d[1]!==void 0?r=At:d[2]!==void 0?(Ct.test(d[2])&&(a=RegExp("</"+d[2],"g")),r=P):d[3]!==void 0&&(r=P):r===P?d[0]===">"?(r=a??D,p=-1):d[1]===void 0?p=-2:(p=r.lastIndex-d[2].length,c=d[1],r=d[3]===void 0?P:d[3]==='"'?St:kt):r===St||r===kt?r=P:r===wt||r===At?r=D:(r=P,a=void 0);let f=r===P&&i[l+1].startsWith("/>")?" ":"";n+=r===D?o+Gt:p>=0?(t.push(c),o.slice(0,p)+Et+o.slice(p)+k+f):o+k+(p===-2?l:f)}return[Tt(i,n+(i[e]||"<?>")+(s===2?"</svg>":s===3?"</math>":"")),t]},B=class i{constructor({strings:s,_$litType$:e},t){let a;this.parts=[];let n=0,r=0,l=s.length-1,o=this.parts,[c,d]=Kt(s,e);if(this.el=i.createElement(c,t),C.currentNode=this.el.content,e===2||e===3){let p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(a=C.nextNode())!==null&&o.length<l;){if(a.nodeType===1){if(a.hasAttributes())for(let p of a.getAttributeNames())if(p.endsWith(Et)){let u=d[r++],f=a.getAttribute(p).split(k),v=/([.?@])?(.*)/.exec(u);o.push({type:1,index:n,name:v[2],strings:f,ctor:v[1]==="."?it:v[1]==="?"?ot:v[1]==="@"?lt:M}),a.removeAttribute(p)}else p.startsWith(k)&&(o.push({type:6,index:n}),a.removeAttribute(p));if(Ct.test(a.tagName)){let p=a.textContent.split(k),u=p.length-1;if(u>0){a.textContent=Q?Q.emptyScript:"";for(let f=0;f<u;f++)a.append(p[f],H()),C.nextNode(),o.push({type:2,index:++n});a.append(p[u],H())}}}else if(a.nodeType===8)if(a.data===Pt)o.push({type:2,index:n});else{let p=-1;for(;(p=a.data.indexOf(k,p+1))!==-1;)o.push({type:7,index:n}),p+=k.length-1}n++}}static createElement(s,e){let t=T.createElement("template");return t.innerHTML=s,t}};function R(i,s,e=i,t){if(s===F)return s;let a=t!==void 0?e._$Co?.[t]:e._$Cl,n=I(s)?void 0:s._$litDirective$;return a?.constructor!==n&&(a?._$AO?.(!1),n===void 0?a=void 0:(a=new n(i),a._$AT(i,e,t)),t!==void 0?(e._$Co??=[])[t]=a:e._$Cl=a),a!==void 0&&(s=R(i,a._$AS(i,s.values),a,t)),s}var rt=class{constructor(s,e){this._$AV=[],this._$AN=void 0,this._$AD=s,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(s){let{el:{content:e},parts:t}=this._$AD,a=(s?.creationScope??T).importNode(e,!0);C.currentNode=a;let n=C.nextNode(),r=0,l=0,o=t[0];for(;o!==void 0;){if(r===o.index){let c;o.type===2?c=new W(n,n.nextSibling,this,s):o.type===1?c=new o.ctor(n,o.name,o.strings,this,s):o.type===6&&(c=new ct(n,this,s)),this._$AV.push(c),o=t[++l]}r!==o?.index&&(n=C.nextNode(),r++)}return C.currentNode=T,a}p(s){let e=0;for(let t of this._$AV)t!==void 0&&(t.strings!==void 0?(t._$AI(s,t,e),e+=t.strings.length-2):t._$AI(s[e])),e++}},W=class i{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(s,e,t,a){this.type=2,this._$AH=m,this._$AN=void 0,this._$AA=s,this._$AB=e,this._$AM=t,this.options=a,this._$Cv=a?.isConnected??!0}get parentNode(){let s=this._$AA.parentNode,e=this._$AM;return e!==void 0&&s?.nodeType===11&&(s=e.parentNode),s}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(s,e=this){s=R(this,s,e),I(s)?s===m||s==null||s===""?(this._$AH!==m&&this._$AR(),this._$AH=m):s!==this._$AH&&s!==F&&this._(s):s._$litType$!==void 0?this.$(s):s.nodeType!==void 0?this.T(s):Zt(s)?this.k(s):this._(s)}O(s){return this._$AA.parentNode.insertBefore(s,this._$AB)}T(s){this._$AH!==s&&(this._$AR(),this._$AH=this.O(s))}_(s){this._$AH!==m&&I(this._$AH)?this._$AA.nextSibling.data=s:this.T(T.createTextNode(s)),this._$AH=s}$(s){let{values:e,_$litType$:t}=s,a=typeof t=="number"?this._$AC(s):(t.el===void 0&&(t.el=B.createElement(Tt(t.h,t.h[0]),this.options)),t);if(this._$AH?._$AD===a)this._$AH.p(e);else{let n=new rt(a,this),r=n.u(this.options);n.p(e),this.T(r),this._$AH=n}}_$AC(s){let e=zt.get(s.strings);return e===void 0&&zt.set(s.strings,e=new B(s)),e}k(s){dt(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,t,a=0;for(let n of s)a===e.length?e.push(t=new i(this.O(H()),this.O(H()),this,this.options)):t=e[a],t._$AI(n),a++;a<e.length&&(this._$AR(t&&t._$AB.nextSibling,a),e.length=a)}_$AR(s=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);s!==this._$AB;){let t=_t(s).nextSibling;_t(s).remove(),s=t}}setConnected(s){this._$AM===void 0&&(this._$Cv=s,this._$AP?.(s))}},M=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(s,e,t,a,n){this.type=1,this._$AH=m,this._$AN=void 0,this.element=s,this.name=e,this._$AM=a,this.options=n,t.length>2||t[0]!==""||t[1]!==""?(this._$AH=Array(t.length-1).fill(new String),this.strings=t):this._$AH=m}_$AI(s,e=this,t,a){let n=this.strings,r=!1;if(n===void 0)s=R(this,s,e,0),r=!I(s)||s!==this._$AH&&s!==F,r&&(this._$AH=s);else{let l=s,o,c;for(s=n[0],o=0;o<n.length-1;o++)c=R(this,l[t+o],e,o),c===F&&(c=this._$AH[o]),r||=!I(c)||c!==this._$AH[o],c===m?s=m:s!==m&&(s+=(c??"")+n[o+1]),this._$AH[o]=c}r&&!a&&this.j(s)}j(s){s===m?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,s??"")}},it=class extends M{constructor(){super(...arguments),this.type=3}j(s){this.element[this.name]=s===m?void 0:s}},ot=class extends M{constructor(){super(...arguments),this.type=4}j(s){this.element.toggleAttribute(this.name,!!s&&s!==m)}},lt=class extends M{constructor(s,e,t,a,n){super(s,e,t,a,n),this.type=5}_$AI(s,e=this){if((s=R(this,s,e,0)??m)===F)return;let t=this._$AH,a=s===m&&t!==m||s.capture!==t.capture||s.once!==t.once||s.passive!==t.passive,n=s!==m&&(t===m||a);a&&this.element.removeEventListener(this.name,this,t),n&&this.element.addEventListener(this.name,this,s),this._$AH=s}handleEvent(s){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,s):this._$AH.handleEvent(s)}},ct=class{constructor(s,e,t){this.element=s,this.type=6,this._$AN=void 0,this._$AM=e,this.options=t}get _$AU(){return this._$AM._$AU}_$AI(s){R(this,s)}};var Qt=pt.litHtmlPolyfillSupport;Qt?.(B,W),(pt.litHtmlVersions??=[]).push("3.3.3");var Ft=(i,s,e)=>{let t=e?.renderBefore??s,a=t._$litPart$;if(a===void 0){let n=e?.renderBefore??null;t._$litPart$=a=new W(s.insertBefore(H(),n),n,void 0,e??{})}return a._$AI(i),a};var gt=globalThis,S=class extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let s=super.createRenderRoot();return this.renderOptions.renderBefore??=s.firstChild,s}update(s){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(s),this._$Do=Ft(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return F}};S._$litElement$=!0,S.finalized=!0,gt.litElementHydrateSupport?.({LitElement:S});var Jt=gt.litElementPolyfillSupport;Jt?.({LitElement:S});(gt.litElementVersions??=[]).push("4.2.2");function z(i){return i%100>=11&&i%100<=13?"th":{1:"st",2:"nd",3:"rd"}[i%10]??"th"}function Rt(i){let s=/^[A-Z](\d{4})$/.exec(i??"");if(!s)return i??"";let e=Number(s[1]);return`${e}-${String((e+1)%100).padStart(2,"0")}`}function ut(i){return i!==i.toUpperCase()?i:i.toLowerCase().replace(/(^|[\s\-/(])(\p{L})/gu,(s,e,t)=>e+t.toUpperCase())}function y(i){return typeof i!="number"?"\u2013":i>0?`+${i}`:`${i}`.replace("-","\u2212")}var Mt=et`
  :host {
    display: block;
    container-type: inline-size;
  }
  ha-card,
  .card {
    position: relative;
    overflow: hidden;
    background: var(--elt-bg);
    color: var(--elt-fg);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    font-family: var(--ha-font-family-body, Roboto, system-ui, sans-serif);
  }
  .watermark {
    position: absolute;
    right: -40px;
    bottom: -40px;
    width: 220px;
    height: 220px;
    object-fit: contain;
    opacity: 0.1;
    pointer-events: none;
  }
  .content {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .tabs {
    display: flex;
    gap: 4px;
    background: var(--elt-surface);
    border-radius: 10px;
    padding: 3px;
  }
  .tabs button {
    flex: 1;
    border: 0;
    background: transparent;
    color: var(--elt-fg2);
    font: inherit;
    font-size: 13px;
    font-weight: 500;
    min-height: 34px;
    border-radius: 8px;
    cursor: pointer;
  }
  .tabs button[aria-selected="true"] {
    background: var(--elt-bg);
    color: var(--elt-fg);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
  }
  .tabs button:focus-visible {
    outline: 2px solid var(--elt-accent);
  }
  .head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }
  .eyebrow {
    font-size: 12px;
    color: var(--elt-fg2);
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 999px;
    background: var(--elt-surface);
    color: var(--elt-fg);
    white-space: nowrap;
  }
  .pill.live {
    background: var(--elt-accent);
    color: var(--elt-accent-fg);
  }
  .pill.live .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: currentColor;
    animation: pulse 1.6s ease-in-out infinite;
  }
  .pill.win {
    background: var(--elt-win-bg);
    color: var(--elt-win-fg);
  }
  .pill.loss {
    background: var(--elt-loss-bg);
    color: var(--elt-loss-fg);
  }
  @keyframes pulse {
    50% {
      opacity: 0.35;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .pill.live .dot {
      animation: none;
    }
  }
  .matchup {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: center;
    gap: 8px;
  }
  .team {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    text-align: center;
    min-width: 0;
  }
  .plate {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    border-radius: 50%;
    background: var(--elt-crest-plate);
    width: 72px;
    height: 72px;
  }
  .plate.small {
    width: 22px;
    height: 22px;
  }
  .crest {
    width: 56px;
    height: 56px;
    object-fit: contain;
  }
  .crest-fallback {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 15px;
    background: var(--elt-surface);
    color: var(--elt-fg);
  }
  .team-name {
    font-size: 15px;
    font-weight: 500;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .team-sub {
    font-size: 12px;
    color: var(--elt-fg2);
  }
  .score {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 40px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .score .sep {
    color: var(--elt-muted);
    font-weight: 400;
  }
  .score .trailing {
    color: var(--elt-fg2);
  }
  .when {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  .when .day {
    font-size: 14px;
    color: var(--elt-fg2);
  }
  .when .time {
    font-size: 30px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .panel {
    background: var(--elt-surface);
    border-radius: 10px;
    padding: 10px 12px;
  }
  .quarters {
    display: grid;
    gap: 4px 6px;
    font-size: 14px;
    text-align: center;
    font-variant-numeric: tabular-nums;
  }
  .quarters .label {
    color: var(--elt-fg2);
    font-size: 12px;
  }
  .quarters .name {
    text-align: left;
  }
  .quarters .current {
    font-weight: 700;
  }
  .quarters .empty {
    color: var(--elt-muted);
  }
  .section-title {
    font-size: 12px;
    color: var(--elt-fg2);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 6px;
  }
  .plays {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 14px;
  }
  .play {
    display: grid;
    grid-template-columns: 52px minmax(0, 1fr) auto;
    gap: 8px;
    align-items: baseline;
  }
  .play .t {
    color: var(--elt-fg2);
    font-variant-numeric: tabular-nums;
  }
  .play.scoring .text {
    font-weight: 500;
  }
  .play .sc {
    color: var(--elt-fg2);
    font-variant-numeric: tabular-nums;
  }
  .compare {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 8px 12px;
    align-items: center;
    font-size: 14px;
  }
  .compare .mid {
    color: var(--elt-fg2);
    font-size: 12px;
    text-align: center;
  }
  .compare .r {
    text-align: right;
    justify-self: end;
  }
  .form {
    display: flex;
    gap: 3px;
  }
  .chip {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .chip.small {
    width: 16px;
    height: 16px;
    font-size: 10px;
  }
  .chip.W {
    background: var(--elt-win-bg);
    color: var(--elt-win-fg);
  }
  .chip.L {
    background: var(--elt-loss-bg);
    color: var(--elt-loss-fg);
  }
  .players {
    display: grid;
    grid-template-columns: minmax(0, 1fr) repeat(4, auto);
    gap: 5px 12px;
    font-size: 14px;
    align-items: baseline;
    font-variant-numeric: tabular-nums;
  }
  .players .h {
    color: var(--elt-fg2);
    font-size: 12px;
    text-align: right;
  }
  .players .h:first-child {
    text-align: left;
  }
  .players .n {
    text-align: right;
  }
  .players .pname {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .players .num {
    color: var(--elt-fg2);
  }
  .bars {
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr) 44px;
    gap: 6px 10px;
    font-size: 13px;
    align-items: center;
    font-variant-numeric: tabular-nums;
  }
  .bars .l {
    text-align: right;
  }
  .bar-label {
    font-size: 11px;
    color: var(--elt-fg2);
    text-align: center;
    margin-bottom: 2px;
  }
  .bar {
    display: flex;
    height: 6px;
    gap: 2px;
    border-radius: 3px;
    overflow: hidden;
  }
  .bar .us {
    background: var(--elt-accent);
  }
  .bar .them {
    flex: 1;
    background: var(--elt-bar-other);
  }
  .foot {
    font-size: 12px;
    color: var(--elt-fg2);
  }
  .standings {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .srow {
    display: grid;
    grid-template-columns: 26px minmax(0, 1fr) 44px 48px 92px;
    gap: 0 8px;
    align-items: center;
    min-height: 28px;
    padding: 0 6px;
    border-radius: 6px;
    font-size: 14px;
    font-variant-numeric: tabular-nums;
  }
  .srow.header {
    font-size: 12px;
    color: var(--elt-fg2);
    min-height: 20px;
  }
  .srow.me {
    background: var(--elt-surface);
    font-weight: 700;
  }
  .srow .tn {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }
  .srow .tn span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .srow .tn img {
    width: 16px;
    height: 16px;
    object-fit: contain;
    flex: none;
  }
  .srow .num {
    text-align: right;
  }
  .srow .form {
    justify-content: flex-end;
  }
  .pos {
    width: 22px;
    height: 22px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
  }
  .pos.playoffs {
    background: var(--elt-zone-playoffs);
    color: var(--elt-zone-fg);
  }
  .pos.play_in {
    background: var(--elt-zone-playin);
    color: var(--elt-zone-fg);
  }
  .legend {
    display: flex;
    gap: 14px;
    font-size: 12px;
    color: var(--elt-fg2);
    align-items: center;
    flex-wrap: wrap;
  }
  .legend i {
    display: inline-block;
    width: 11px;
    height: 11px;
    border-radius: 3px;
    margin-right: 5px;
    vertical-align: -1px;
  }
  .tiles {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }
  .tile {
    background: var(--elt-surface);
    border-radius: 10px;
    padding: 8px 10px;
  }
  .tile .k {
    font-size: 12px;
    color: var(--elt-fg2);
  }
  .tile .v {
    font-size: 22px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .ranks {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    gap: 6px 12px;
    font-size: 14px;
    align-items: baseline;
  }
  .ranks .cat {
    color: var(--elt-fg2);
    font-size: 13px;
  }
  .ranks .rank {
    font-weight: 700;
  }
  .court {
    width: 100%;
    height: auto;
    display: block;
    background: var(--elt-surface);
    border-radius: 10px;
  }
  .court .lines {
    fill: none;
    stroke: var(--elt-fg2);
    stroke-opacity: 0.4;
    stroke-width: 8;
  }
  .court .made {
    fill: var(--elt-accent);
  }
  .court .miss {
    fill: none;
    stroke: var(--elt-muted);
    stroke-width: 7;
  }
  .shot-legend {
    display: flex;
    gap: 14px;
    font-size: 12px;
    color: var(--elt-fg2);
    align-items: center;
    margin-top: 6px;
  }
  .shot-legend .m {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--elt-accent);
    display: inline-block;
    margin-right: 5px;
  }
  .shot-legend .x {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    border: 2px solid var(--elt-muted);
    display: inline-block;
    margin-right: 5px;
  }
  .shot-legend .sum {
    margin-left: auto;
  }
  .subtabs {
    display: flex;
    gap: 20px;
    border-bottom: 1px solid var(--elt-divider);
  }
  .subtabs button {
    background: none;
    border: 0;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    font: inherit;
    font-size: 14px;
    color: var(--elt-fg2);
    padding: 6px 2px;
    min-height: 36px;
    cursor: pointer;
  }
  .subtabs button[aria-selected="true"] {
    color: var(--elt-fg);
    font-weight: 700;
    border-bottom-color: var(--elt-accent);
  }
  .subtabs button:focus-visible,
  .nav:focus-visible {
    outline: 2px solid var(--elt-accent);
  }
  .chart {
    width: 100%;
    height: auto;
    display: block;
    overflow: visible;
    font-family: inherit;
  }
  .chart .grid {
    stroke: var(--elt-divider);
    stroke-dasharray: 3 4;
  }
  .chart .zero,
  .chart .track {
    stroke: var(--elt-muted);
    stroke-width: 1;
  }
  .chart .track {
    stroke: var(--elt-divider);
    stroke-width: 2;
  }
  .chart .area-up {
    fill: var(--elt-accent);
    fill-opacity: 0.35;
  }
  .chart .area-down {
    fill: var(--elt-other);
    fill-opacity: 0.35;
  }
  .chart .flow {
    fill: none;
    stroke: var(--elt-fg);
    stroke-width: 2;
    stroke-linejoin: round;
  }
  .chart .axis {
    fill: var(--elt-fg2);
    font-size: 11px;
  }
  .chart .val,
  .chart .label {
    fill: var(--elt-fg);
    font-size: 11px;
  }
  .chart .label {
    font-size: 12px;
  }
  .chart .win {
    fill: var(--elt-accent);
  }
  .chart .loss {
    fill: var(--elt-other);
  }
  .chart .avg {
    stroke: var(--elt-muted);
    stroke-width: 2;
  }
  .chart .span {
    stroke: var(--elt-accent);
    stroke-width: 4;
  }
  .chart .dot {
    fill: var(--elt-accent);
  }
  .chart .ring {
    fill: var(--elt-bg);
    stroke: var(--elt-accent);
    stroke-width: 3;
  }
  .legend i.round {
    border-radius: 50%;
  }
  .legend i.tick {
    width: 2px;
    background: var(--elt-muted);
  }
  .head .legend {
    gap: 10px;
  }
  .facts {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin-top: 8px;
  }
  .facts.two {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-top: 0;
  }
  .tile.small .v {
    font-size: 15px;
  }
  .tile .unit {
    font-size: 13px;
    font-weight: 400;
    color: var(--elt-fg2);
  }
  .tile .note {
    font-size: 12px;
    font-weight: 500;
    color: var(--elt-fg);
  }
  .rankbars {
    display: grid;
    grid-template-columns: 74px 42px minmax(0, 1fr) 36px;
    gap: 8px 10px;
    align-items: center;
    font-size: 14px;
    font-variant-numeric: tabular-nums;
  }
  .rankbars .k {
    color: var(--elt-fg2);
  }
  .rankbars .v {
    font-weight: 700;
    text-align: right;
  }
  .rankbars .r {
    text-align: right;
    font-weight: 700;
  }
  .rankbars .r.top {
    color: var(--elt-accent);
  }
  .rankbars .r.low {
    color: var(--elt-fg2);
    font-weight: 500;
  }
  .rb {
    position: relative;
    height: 16px;
  }
  .rb .t {
    position: absolute;
    left: 0;
    right: 0;
    top: 7px;
    height: 2px;
    border-radius: 1px;
    background: var(--elt-divider);
  }
  .rb .a {
    position: absolute;
    top: 2px;
    width: 2px;
    height: 12px;
    margin-left: -1px;
    background: var(--elt-muted);
  }
  .rb .p {
    position: absolute;
    top: 2px;
    width: 12px;
    height: 12px;
    margin-left: -6px;
    border-radius: 50%;
    background: var(--elt-accent);
    box-shadow: 0 0 0 2px var(--elt-bg);
  }
  .leaders {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .leader {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--elt-surface);
    border-radius: 10px;
    padding: 6px 12px;
  }
  .head-shot {
    width: 40px;
    height: 40px;
    flex: none;
    border-radius: 50%;
    object-fit: cover;
    object-position: top;
    background: var(--elt-divider);
  }
  .head-shot.fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: var(--elt-fg2);
  }
  .leader .who {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    font-size: 14px;
  }
  .leader .who b {
    font-weight: 500;
  }
  .leader .who span,
  .leader .who b {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .leader .who span {
    font-size: 12px;
    color: var(--elt-fg2);
  }
  .leader .num {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    font-variant-numeric: tabular-nums;
  }
  .leader .num b {
    font-size: 16px;
  }
  .leader .rank {
    font-size: 12px;
    font-weight: 700;
  }
  .leader .rank.top {
    color: var(--elt-accent);
  }
  .court.zones .z {
    fill: var(--elt-accent);
  }
  .court.zones .bg {
    fill: var(--elt-surface-solid);
  }
  .court .zone-lines {
    fill: none;
    stroke: var(--elt-bg);
    stroke-width: 8;
  }
  .court .tag {
    fill: var(--elt-bg);
    fill-opacity: 0.85;
  }
  .court .tag-v {
    fill: var(--elt-fg);
    font-size: 46px;
    font-weight: 700;
  }
  .court .tag-k {
    fill: var(--elt-fg2);
    font-size: 30px;
  }
  .zone-table {
    display: grid;
    grid-template-columns: 12px minmax(0, 1fr) auto 52px 60px;
    gap: 6px 10px;
    align-items: center;
    font-size: 14px;
    font-variant-numeric: tabular-nums;
  }
  .zone-table .h {
    font-size: 12px;
    color: var(--elt-fg2);
  }
  .zone-table .r {
    text-align: right;
  }
  .zone-table .dim {
    color: var(--elt-fg2);
  }
  .zone-table .sw {
    width: 12px;
    height: 12px;
    border-radius: 3px;
    background: var(--elt-accent);
  }
  .h2h-row {
    display: grid;
    grid-template-columns: 100px minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
    font-size: 14px;
    padding: 7px 0;
    border-top: 1px solid var(--elt-divider);
    font-variant-numeric: tabular-nums;
  }
  .h2h-row .d {
    font-size: 13px;
    color: var(--elt-fg2);
  }
  .h2h-row .w {
    font-weight: 700;
  }
  .h2h-row .dim {
    color: var(--elt-fg2);
  }
  .round-nav {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .round-title {
    font-size: 15px;
    font-weight: 500;
    white-space: nowrap;
  }
  .nav {
    width: 36px;
    height: 36px;
    flex: none;
    border: 0;
    border-radius: 8px;
    background: var(--elt-surface);
    color: var(--elt-fg);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .nav:disabled {
    opacity: 0.35;
    cursor: default;
  }
  .nav svg {
    width: 16px;
    height: 16px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .board {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px 10px;
  }
  .bgame {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 7px 10px;
    border-radius: 8px;
  }
  .bgame.me {
    background: var(--elt-surface);
    box-shadow: inset 3px 0 0 var(--elt-accent);
  }
  .bgame .side {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-variant-numeric: tabular-nums;
  }
  .bgame .side .c {
    flex: 1;
  }
  .bgame .side.w {
    font-weight: 700;
  }
  .bgame .side.dim {
    color: var(--elt-fg2);
  }
  .mini-crest {
    width: 22px;
    height: 22px;
    object-fit: contain;
    flex: none;
    border-radius: 50%;
    background: var(--elt-crest-plate);
    padding: 2px;
    box-sizing: border-box;
  }
  .mini-crest.fallback {
    background: var(--elt-divider);
  }
  .when-s {
    font-size: 12px;
    color: var(--elt-fg2);
  }
  @container (max-width: 340px) {
    .board {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  .empty-state {
    font-size: 14px;
    color: var(--elt-fg2);
    padding: 12px 0;
    text-align: center;
  }
  .warning {
    padding: 12px;
    font-size: 14px;
  }
`;function X(i){let s=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(i.trim());if(!s)return null;let e=s[1];e.length===3&&(e=e.split("").map(a=>a+a).join(""));let t=parseInt(e,16);return[t>>16&255,t>>8&255,t&255]}function Nt(i){let s=X(i);if(!s)return .2;let[e,t,a]=s.map(n=>{let r=n/255;return r<=.03928?r/12.92:((r+.055)/1.055)**2.4});return .2126*e+.7152*t+.0722*a}function J(i){let s=Nt(i),e=1.05/(s+.05),t=(s+.05)/.0625;return e>=t?"#FFFFFF":"#111111"}function L(i,s){let e=X(i)??[128,128,128];return`rgba(${e[0]}, ${e[1]}, ${e[2]}, ${s})`}function Xt(i,s,e){let t=X(i)??[128,128,128],a=X(s)??[128,128,128];return`#${t.map((r,l)=>Math.round(r+(a[l]-r)*e)).map(r=>r.toString(16).padStart(2,"0")).join("")}`}function Lt(i,s){let e=Nt(i);return s<.1&&e<.03?"#8C8C8C":s>.8&&e>.85?"#5C5C5C":i}function Ot(i,s){let e={"--elt-crest-plate":"rgba(255, 255, 255, 0.92)","--elt-win-bg":"#2E7D32","--elt-win-fg":"#FFFFFF","--elt-zone-playoffs":"#1F4FA8","--elt-zone-playin":"#B26A00","--elt-zone-fg":"#FFFFFF"};switch(i){case"dark":{let t=Lt(s,.012);return{...e,"--elt-bg":"#1C1C1C","--elt-fg":"#E8E8E8","--elt-fg2":"#A8A8A8","--elt-muted":"#6E6E6E","--elt-surface":"#262626","--elt-divider":"#333333","--elt-loss-bg":"#424242","--elt-loss-fg":"#E0E0E0","--elt-bar-other":"#5A5A5A","--elt-other":"#5B8DEF","--elt-surface-solid":"#262626","--elt-accent":t,"--elt-accent-fg":J(t)}}case"light":{let t=Lt(s,1);return{...e,"--elt-crest-plate":"transparent","--elt-bg":"#FFFFFF","--elt-fg":"#1F1F1F","--elt-fg2":"#5C5C5C","--elt-muted":"#8A8A8A","--elt-surface":"#F2F2F2","--elt-divider":"#E3E3E3","--elt-loss-bg":"#DDDDDD","--elt-loss-fg":"#333333","--elt-bar-other":"#C7C7C7","--elt-other":"#2F6BD9","--elt-surface-solid":"#F2F2F2","--elt-accent":t,"--elt-accent-fg":J(t)}}case"team":{let t=J(s);return{...e,"--elt-bg":s,"--elt-fg":t,"--elt-fg2":L(t,.8),"--elt-muted":L(t,.55),"--elt-surface":L(t,.12),"--elt-divider":L(t,.22),"--elt-loss-bg":L(t,.22),"--elt-loss-fg":t,"--elt-win-bg":t,"--elt-win-fg":s,"--elt-bar-other":L(t,.3),"--elt-other":t==="#FFFFFF"?"rgba(0, 0, 0, 0.38)":"rgba(255, 255, 255, 0.55)","--elt-surface-solid":Xt(s,t,.12),"--elt-accent":t,"--elt-accent-fg":s}}default:return{...e,"--elt-bg":"var(--ha-card-background, var(--card-background-color, #fff))","--elt-fg":"var(--primary-text-color, #212121)","--elt-fg2":"var(--secondary-text-color, #727272)","--elt-muted":"var(--disabled-text-color, #9e9e9e)","--elt-surface":"color-mix(in srgb, var(--primary-text-color, #212121) 7%, transparent)","--elt-divider":"var(--divider-color, rgba(0,0,0,.12))","--elt-loss-bg":"color-mix(in srgb, var(--primary-text-color, #212121) 20%, transparent)","--elt-loss-fg":"var(--primary-text-color, #212121)","--elt-bar-other":"color-mix(in srgb, var(--primary-text-color, #212121) 30%, transparent)","--elt-other":"var(--info-color, #2F6BD9)","--elt-surface-solid":"color-mix(in srgb, var(--primary-text-color, #212121) 7%, var(--ha-card-background, var(--card-background-color, #fff)))","--elt-accent":s,"--elt-accent-fg":J(s)}}}var Yt=(()=>{try{return new URL(import.meta.url).searchParams.get("v")??"dev"}catch{return"dev"}})(),te="Data provided by the EuroLeague API",ee={entity:"Game sensor",view:"What to show",theme:"Theme",team_color:"Team colour (hex, optional)",play_by_play_rows:"Play-by-play rows",standings_rows:"Standings rows",standings_entity:"Standings sensor (optional, found automatically)",stats_entity:"Stats sensor (optional, found automatically)",show_shot_chart:"Show the shot chart after a game",show_round_tab:"Show the Round tab"},Y={points:"Points",rebounds:"Rebounds",assists:"Assists",steals:"Steals",turnovers:"Turnovers",blocks:"Blocks",pir:"PIR",fg2_pct:"2P%",fg3_pct:"3P%",ft_pct:"FT%"},Ut=[["rim","At the rim"],["paint","Paint"],["mid_range","Mid-range"],["corner_three","Corner three"],["above_break_three","Above-break three"]],se=i=>i.split(/\s+/).filter(Boolean).map(s=>s[0]).slice(0,2).join("").toUpperCase(),V=class extends S{constructor(){super(...arguments);this._tab="game";this._statsTab="team";this._round=null;this._broken=new Set}setConfig(e){if(!e||!e.entity)throw new Error("Choose the game sensor created by EuroLeague Tracker (entity).");this._config={view:"tabs",theme:"auto",play_by_play_rows:4,show_shot_chart:!0,show_round_tab:!0,...e},this._config.view&&this._config.view!=="tabs"&&(this._tab=this._config.view)}getCardSize(){return this._tab==="standings"||this._tab==="stats"?12:this._tab==="round"?9:8}getGridOptions(){return{columns:12,min_columns:6,rows:"auto"}}static getConfigForm(){let e=t=>({select:{mode:"dropdown",options:t.map(([a,n])=>({value:a,label:n}))}});return{schema:[{name:"entity",required:!0,selector:{entity:{domain:"sensor",integration:"euroleague_tracker"}}},{type:"grid",name:"",schema:[{name:"view",selector:e([["tabs","Tabs: game, standings, stats, round"],["game","Game only"],["standings","Standings only"],["stats","Stats only"],["round","Round scoreboard only"]])},{name:"theme",selector:e([["auto","Follow Home Assistant theme"],["dark","Dark"],["light","Light"],["team","Team colours"]])}]},{name:"team_color",selector:{text:{}}},{type:"grid",name:"",schema:[{name:"play_by_play_rows",selector:{number:{min:0,max:10,mode:"box"}}},{name:"standings_rows",selector:{number:{min:4,max:20,mode:"box"}}}]},{type:"grid",name:"",schema:[{name:"show_shot_chart",selector:{boolean:{}}},{name:"show_round_tab",selector:{boolean:{}}}]},{name:"standings_entity",selector:{entity:{domain:"sensor",integration:"euroleague_tracker"}}},{name:"stats_entity",selector:{entity:{domain:"sensor",integration:"euroleague_tracker"}}}],computeLabel:t=>ee[t.name]??t.name}}static getStubConfig(e){return{entity:Object.keys(e?.states??{}).find(a=>{let n=e.states[a].attributes??{};return a.startsWith("sensor.")&&String(n.attribution??"").startsWith(te)&&"game_code"in n})??"",view:"tabs",theme:"auto"}}shouldUpdate(e){if(!e.has("hass")||e.size>1)return!0;let t=e.get("hass");return t?[this._config.entity,this._standingsId(),this._statsId()].some(a=>a&&t.states[a]!==this.hass.states[a]):!0}_state(e){return e?this.hass?.states?.[e]:void 0}_findSibling(e,t){let n=`${this._config.entity.replace(/_game$/,"")}${e}`;if(this._state(n))return n;let r=this._state(this._config.entity)?.attributes?.team_abbr;return Object.keys(this.hass?.states??{}).find(l=>{let o=this.hass.states[l].attributes??{};return l.startsWith("sensor.")&&t in o&&o.team_abbr===r&&o.competition!==void 0})}_standingsId(){return this._config.standings_entity||this._findSibling("_standings_position","table")}_statsId(){return this._config.stats_entity||this._findSibling("_season_stats","per_game")}_teamColor(e){let t=this._config.team_color||e.team_color||e.team_colors?.[0];return/^#[0-9a-f]{3,8}$/i.test(String(t??""))?t:"#C62828"}_locale(){let e=this.hass?.locale?.language||this.hass?.language||"en",t=this.hass?.locale?.time_zone==="local"?void 0:this.hass?.config?.time_zone,a=this.hass?.locale?.time_format;return{lang:e,tz:t,hour12:a==="12"?!0:a==="24"?!1:void 0}}_fmtDay(e){let{lang:t,tz:a}=this._locale();return new Intl.DateTimeFormat(t,{weekday:"short",day:"numeric",month:"short",timeZone:a}).format(new Date(e))}_fmtTime(e){let{lang:t,tz:a,hour12:n}=this._locale();return new Intl.DateTimeFormat(t,{hour:"2-digit",minute:"2-digit",timeZone:a,hour12:n}).format(new Date(e))}_crest(e,t,a="crest"){return!e||this._broken.has(e)?h`<div class="crest-fallback" role="img" aria-label=${t}>${t}</div>`:h`<span class="plate ${a?"":"small"}"
      ><img
        class=${a}
        src=${e}
        alt=""
        loading="lazy"
        referrerpolicy="no-referrer"
        @error=${()=>{this._broken=new Set([...this._broken,e])}}
    /></span>`}_form(e,t=!1){return e?.length?h`<span class="form" aria-label=${`Last ${e.length}, oldest first: ${e.join(" ")}`}>
      ${e.map(a=>h`<span class="chip ${a} ${t?"small":""}">${a}</span>`)}
    </span>`:m}render(){if(!this._config||!this.hass)return m;let e=this._state(this._config.entity);if(!e)return h`<ha-card><div class="warning">Entity not found: ${this._config.entity}</div></ha-card>`;let t=e.attributes??{},a=this._config.theme??"auto",n=Ot(a,this._teamColor(t)),r=Object.entries(n).map(([o,c])=>`${o}:${c}`).join(";"),l=this._config.view==="tabs"?this._tab:this._config.view??"game";return h`<ha-card style=${r}>
      ${a==="team"&&t.team_logo&&!this._broken.has(t.team_logo)?h`<img
            class="watermark"
            src=${t.team_logo}
            alt=""
            referrerpolicy="no-referrer"
            @error=${()=>this._broken=new Set([...this._broken,t.team_logo])}
          />`:m}
      <div class="content">
        ${this._config.view==="tabs"?this._renderTabs():m}
        ${l==="standings"?this._renderStandings(t):l==="stats"?this._renderStats(t):l==="round"?this._renderRound(t):this._renderGame(e.state,t)}
      </div>
    </ha-card>`}_renderTabs(){let e=[["game","Game"],["standings","Standings"],["stats","Stats"]];return this._config.show_round_tab!==!1&&e.push(["round","Round"]),h`<div class="tabs" role="tablist">
      ${e.map(([t,a])=>h`<button role="tab" aria-selected=${this._tab===t?"true":"false"} @click=${()=>this._tab=t}>
            ${a}
          </button>`)}
    </div>`}_renderGame(e,t){if(e==="NOT_FOUND"||!t.team_abbr)return h`<div class="empty-state">${t.api_message??"No game found for this team."}</div>`;let a=t.competition??"EuroLeague",n=t.round_name??(t.round?`Round ${t.round}`:""),r;if(e==="IN")r=h`<span class="pill live"><span class="dot"></span>LIVE${t.clock?` \xB7 ${t.clock}`:""}</span>`;else if(e==="POST"){let l=t.team_winner===!0;r=h`<span class="pill ${l?"win":"loss"}">${t.clock??"Final"} · ${l?"W":"L"}</span>`}else r=h`<span class="pill">${t.kickoff_in??""}</span>`;return h`
      <div class="head">
        <span class="eyebrow">${a}${n?` \xB7 ${n}`:""}</span>
        ${r}
      </div>
      ${this._renderMatchup(e,t)}
      ${e==="PRE"?this._renderPreCompare(t):this._renderQuarters(e,t)}
      ${e==="PRE"?this._renderH2H(t):this._renderFlow(e,t)}
      ${e==="IN"?this._renderPlays(t):m}
      ${e!=="PRE"?this._renderPlayers(e,t):m}
      ${e==="POST"?this._renderBars(t):m}
      ${e==="POST"&&this._config.show_shot_chart!==!1?this._renderShots(t):m}
      ${this._renderFoot(e,t)}
    `}_side(e,t){return{code:e[`${t}_abbr`],name:e[`${t}_name`],logo:e[`${t}_logo`],record:e[`${t}_record`],position:e[`${t}_position`],homeaway:e[`${t}_homeaway`],score:e[`${t}_score`]}}_renderMatchup(e,t){let a=this._side(t,"team"),n=this._side(t,"opponent"),[r,l]=a.homeaway==="away"?[n,a]:[a,n],o=p=>e==="PRE"?[p.position?`${p.position}${z(p.position)}`:null,p.record].filter(Boolean).join(" \xB7 "):[p.record,p.homeaway==="home"?"Home":"Away"].filter(Boolean).join(" \xB7 "),c=p=>h`<div class="team">
      ${this._crest(p.logo,p.code)}
      <div class="team-name" title=${p.name}>${p.name}</div>
      <div class="team-sub">${o(p)}</div>
    </div>`,d;if(e==="PRE"&&t.date)d=h`<div class="when">
        <span class="day">${this._fmtDay(t.date)}</span>
        <span class="time">${this._fmtTime(t.date)}</span>
      </div>`;else{let p=r.score??0,u=l.score??0;d=h`<div class="score" aria-label=${`${r.name} ${p}, ${l.name} ${u}`}>
        <span class=${p<u?"trailing":""}>${p}</span><span class="sep">–</span><span class=${u<p?"trailing":""}
          >${u}</span
        >
      </div>`}return h`<div class="matchup">${c(r)}${d}${c(l)}</div>`}_renderQuarters(e,t){let a=t.quarter_scores;if(!a?.team?.length&&!a?.opponent?.length)return m;let n=Math.max(4,a.team?.length??0,a.opponent?.length??0),r=Array.from({length:n},(u,f)=>f<4?`Q${f+1}`:n>5?`OT${f-3}`:"OT"),l=e==="IN"?(t.quarter??0)-1:-1,o=this._side(t,"team"),c=this._side(t,"opponent"),d=o.homeaway==="away"?[[c,a.opponent],[o,a.team]]:[[o,a.team],[c,a.opponent]],p=`grid-template-columns: 1.3fr repeat(${n}, minmax(0, 1fr))`;return h`<div class="panel quarters" style=${p}>
      <span></span>
      ${r.map((u,f)=>h`<span class="label ${f===l?"current":""}">${u}</span>`)}
      ${d.map(([u,f])=>h`<span class="name">${u.code}</span>
          ${r.map((v,g)=>f?.[g]===void 0||f?.[g]===null?h`<span class="empty">–</span>`:h`<span class=${g===l?"current":""}>${f[g]}</span>`)}`)}
    </div>`}_renderPreCompare(e){let t=this._state(this._standingsId())?.attributes?.table??[],a=f=>t.find(v=>v.code===f)??{},n=this._side(e,"team"),r=this._side(e,"opponent"),[l,o]=n.homeaway==="away"?[r,n]:[n,r],c=a(l.code),d=a(o.code),p=c.last5??(l===n?e.team_form:e.opponent_form),u=d.last5??(o===n?e.team_form:e.opponent_form);return!p&&!t.length?m:h`<div class="panel compare">
      ${this._form(p)}<span class="mid">Last 5</span><span class="r">${this._form(u)}</span>
      ${t.length?h`<span>${c.home_record??"\u2013"}</span><span class="mid">Home / Away</span
            ><span class="r">${d.away_record??"\u2013"}</span> <span>${c.last10??"\u2013"}</span><span class="mid">Last 10</span
            ><span class="r">${d.last10??"\u2013"}</span> <span>${y(c.point_diff)}</span><span class="mid">Point diff</span
            ><span class="r">${y(d.point_diff)}</span>`:m}
    </div>`}_renderPlays(e){let t=this._config.play_by_play_rows??4,a=(e.play_by_play??[]).slice(0,t);return!t||!a.length?m:h`<div>
      <div class="section-title">Play-by-play</div>
      <div class="plays">
        ${a.map(n=>h`<div class="play ${n.scoring?"scoring":""}">
            <span class="t">${n.clock??""}</span><span class="text">${n.text}</span
            ><span class="sc">${n.scoring&&n.score?n.score:""}</span>
          </div>`)}
      </div>
    </div>`}_renderPlayers(e,t){let a=t.top_players?.team??[];if(!a.length)return m;let n=a.slice(0,e==="IN"?3:4);return h`<div>
      <div class="section-title">${e==="IN"?"Leaders":"Top performers"} (PIR)</div>
      <div class="players">
        <span class="h">Player</span><span class="h">PTS</span><span class="h">REB</span><span class="h">AST</span
        ><span class="h">PIR</span>
        ${n.map(r=>h`<span class="pname"><b>${r.name}</b> <span class="num">#${r.number}</span></span>
            <span class="n">${r.points??"\u2013"}</span><span class="n">${r.rebounds??"\u2013"}</span
            ><span class="n">${r.assists??"\u2013"}</span><span class="n">${r.pir??"\u2013"}</span>`)}
      </div>
    </div>`}_renderBars(e){let t=e.game_stats?.team,a=e.game_stats?.opponent;if(!t||!a)return m;let r=[["2P%",t.fg2_pct,a.fg2_pct,`${t.fg2} vs ${a.fg2}`,1],["3P%",t.fg3_pct,a.fg3_pct,`${t.fg3} vs ${a.fg3}`,1],["FT%",t.ft_pct,a.ft_pct,`${t.ft} vs ${a.ft}`,1],["Rebounds",t.rebounds,a.rebounds,"",0],["Assists",t.assists,a.assists,"",0],["Turnovers",t.turnovers,a.turnovers,"",0]].filter(([,l,o])=>typeof l=="number"&&typeof o=="number");return r.length?h`<div>
      <div class="section-title">${e.team_abbr} vs ${e.opponent_abbr}</div>
      <div class="bars">
        ${r.map(([l,o,c,d,p])=>{let u=o+c>0?100*o/(o+c):50;return h`<span class="l">${o.toFixed(p)}</span>
            <div title=${d}>
              <div class="bar-label">${l}</div>
              <div class="bar"><span class="us" style=${`width:${u.toFixed(1)}%`}></span><span class="them"></span></div>
            </div>
            <span>${c.toFixed(p)}</span>`})}
      </div>
    </div>`:m}_renderFoot(e,t){let a=[];return t.venue&&a.push(ut(t.venue)),e!=="PRE"&&t.attendance&&a.push(`${Number(t.attendance).toLocaleString(this._locale().lang)} fans`),e==="PRE"&&t.capacity&&a.push(`cap. ${Number(t.capacity).toLocaleString(this._locale().lang)}`),e==="IN"&&(t.team_fouls??null)!==null&&a.push(`Fouls ${t.team_fouls}\u2013${t.opponent_fouls}`),e==="POST"&&t.next_game?.date&&a.push(`Next: ${t.next_game.homeaway==="home"?"vs":"@"} ${t.next_game.opponent_abbr}, ${this._fmtDay(t.next_game.date)}`),a.length?h`<div class="foot">${a.join(" \xB7 ")}</div>`:m}_renderStandings(e){let t=this._state(this._standingsId()),a=t?.attributes?.table??[];if(!a.length)return h`<div class="empty-state">Standings aren't available yet.</div>`;let n=e.team_abbr??t?.attributes?.team_abbr,r=a,l=this._config.standings_rows;if(l&&l<a.length){let o=Math.max(0,a.findIndex(d=>d.code===n)),c=Math.min(Math.max(0,o-Math.floor(l/2)),a.length-l);r=a.slice(c,c+l)}return h`
      <div class="head">
        <span class="eyebrow">${t?.attributes?.competition??"EuroLeague"} standings</span>
        <span class="pill">${t?.attributes?.round?`After round ${t.attributes.round}`:""}</span>
      </div>
      <div class="standings" role="table">
        <div class="srow header" role="row">
          <span>#</span><span>Team</span><span class="num">W-L</span><span class="num">+/−</span
          ><span class="num">Last 5</span>
        </div>
        ${r.map(o=>h`<div class="srow ${o.code===n?"me":""}" role="row">
            <span class="pos ${o.zone??""}">${o.position}</span>
            <span class="tn">${o.crest&&!this._broken.has(o.crest)?this._crest(o.crest,o.code,""):m}<span
                >${o.name}</span
              ></span>
            <span class="num">${o.wins}-${o.losses}</span>
            <span class="num">${y(o.point_diff)}</span>
            ${this._form(o.last5,!0)}
          </div>`)}
      </div>
      <div class="legend">
        <span><i style="background:var(--elt-zone-playoffs)"></i>Playoffs (1–6)</span>
        <span><i style="background:var(--elt-zone-playin)"></i>Play-in (7–10)</span>
      </div>
    `}_renderH2H(e){let t=e.head_to_head;if(!t?.meetings?.length)return m;let a=t.wins===t.losses?`Level ${t.wins}-${t.losses}`:`${t.wins>t.losses?e.team_abbr:t.opponent_abbr} leads ${Math.max(t.wins,t.losses)}-${Math.min(t.wins,t.losses)}`;return h`<div>
      <div class="head" style="margin-bottom:4px">
        <span class="section-title" style="margin:0">Head to head · last ${t.meetings.length}</span>
        <span style="font-size:13px">${a}</span>
      </div>
      <div class="h2h">
        ${t.meetings.map(n=>{let[r,l,o,c]=n.homeaway==="home"?[e.team_abbr,n.team_score,t.opponent_abbr,n.opponent_score]:[t.opponent_abbr,n.opponent_score,e.team_abbr,n.team_score];return h`<div class="h2h-row">
            <span class="d">${n.date?this._fmtDate(n.date):""}</span>
            <span
              ><span class=${l>c?"w":"dim"}>${r} ${l}</span> – <span class=${c>l?"w":"dim"}
                >${c} ${o}</span
              ></span
            >
            <span class="chip ${n.won?"W":"L"}">${n.won?"W":"L"}</span>
          </div>`})}
      </div>
      <div class="foot" style="margin-top:6px">Average margin ${y(t.average_margin)}</div>
    </div>`}_fmtDate(e){let{lang:t,tz:a}=this._locale();return new Intl.DateTimeFormat(t,{day:"numeric",month:"short",year:"numeric",timeZone:a}).format(new Date(e))}_renderFlow(e,t){let a=t.score_flow,n=a?.team??[],r=a?.opponent??[];if(n.length<2)return m;let l=n.map((b,O)=>b-(r[O]??0)),o=Math.max(40,l.length-1),c=400,d=140,p=Math.max(5,...l),u=Math.max(5,...l.map(b=>-b)),f=8+(d-16)*p/(p+u),v=(d-16)/(p+u),g=b=>(b/o*c).toFixed(1),$=b=>(f-b*v).toFixed(1),x=l.map((b,O)=>`${g(O)},${$(b)}`).join(" "),_=`M 0,${f.toFixed(1)} L ${l.map((b,O)=>`${g(O)},${$(b)}`).join(" L ")} L ${g(l.length-1)},${f.toFixed(1)} Z`,q=[10,20,30,...o>40?[40]:[]],E=`flow-${t.game_code??"x"}`,N=`Score flow: largest ${t.team_abbr} lead ${a.largest_lead??0}, largest ${t.opponent_abbr} lead ${a.largest_deficit??0}`;return h`<div>
      <div class="head" style="margin-bottom:6px">
        <span class="section-title" style="margin:0">Score flow</span>
        <span class="legend">
          <span><i style="background:var(--elt-accent)"></i>${t.team_abbr} ahead</span>
          <span><i style="background:var(--elt-other)"></i>${t.opponent_abbr} ahead</span>
        </span>
      </div>
      <svg class="chart" viewBox="0 0 ${c} ${d+14}" role="img" aria-label=${N}>
        <defs>
          <clipPath id="${E}-up"><rect x="0" y="0" width=${c} height=${f}></rect></clipPath>
          <clipPath id="${E}-dn"><rect x="0" y=${f} width=${c} height=${d}></rect></clipPath>
        </defs>
        ${q.map(b=>A`<line class="grid" x1=${g(b)} y1="4" x2=${g(b)} y2=${d-4}></line>`)}
        <path d=${_} class="area-up" clip-path="url(#${E}-up)"></path>
        <path d=${_} class="area-down" clip-path="url(#${E}-dn)"></path>
        <line class="zero" x1="0" y1=${f} x2=${c} y2=${f}></line>
        <polyline class="flow" points=${x}></polyline>
        ${[1,2,3,4].map(b=>A`<text class="axis" x=${g(b*10-5)} y=${d+12} text-anchor="middle">Q${b}</text>`)}
      </svg>
      <div class="facts">
        <div class="tile small">
          <div class="k">Biggest lead</div>
          <div class="v">${a.largest_lead?`+${a.largest_lead} \xB7 ${a.largest_lead_minute}'`:"\u2013"}</div>
        </div>
        <div class="tile small">
          <div class="k">${t.opponent_abbr} biggest</div>
          <div class="v">${a.largest_deficit?`+${a.largest_deficit} \xB7 ${a.largest_deficit_minute}'`:"\u2013"}</div>
        </div>
        <div class="tile small">
          <div class="k">${e==="IN"?"Now":"Final margin"}</div>
          <div class="v">${y(l[l.length-1])}</div>
        </div>
      </div>
    </div>`}_renderStats(e){let a=this._state(this._statsId())?.attributes??{},n=a.per_game??{},l=((this._state(this._standingsId())?.attributes??{}).table??[]).find(d=>d.code===(e.team_abbr??a.team_abbr)),o=this._statsTab==="shots"&&a.shot_zones?`${a.shot_zones.games} games \xB7 ${a.shot_zones.attempts} shots`:this._statsTab==="players"&&l?`${l.wins}-${l.losses} \xB7 ${l.position}${z(l.position)}`:n.games_played?`Per game \xB7 ${n.games_played} GP`:"",c=[["team","Team"],["players","Players"],["shots","Shots"]];return h`
      <div class="head">
        <span class="eyebrow">${e.team_name??""} · ${Rt(a.season)}</span>
        <span class="pill">${o}</span>
      </div>
      <div class="subtabs" role="tablist">
        ${c.map(([d,p])=>h`<button
              role="tab"
              aria-selected=${this._statsTab===d?"true":"false"}
              @click=${()=>this._statsTab=d}
            >
              ${p}
            </button>`)}
      </div>
      ${this._statsTab==="players"?this._statsPlayers(a):this._statsTab==="shots"?this._statsShots(a):this._statsTeam(a)}
    `}_statsTeam(e){let t=e.per_game??{},a=e.league_ranks??{},n=e.attack_defence??null;if(!Object.keys(t).length&&!Object.keys(a).length)return h`<div class="empty-state">Season stats aren't available yet.</div>`;let r=[];if(n){let o=u=>`${y(Math.round((u-n.league_average)*10)/10)} vs avg`,c=Math.min(n.allowed,n.scored,n.league_average)-4,d=Math.max(n.allowed,n.scored,n.league_average)+4,p=u=>((u-c)/(d-c)*380+10).toFixed(1);r.push(h`<div class="facts two">
          <div class="tile">
            <div class="k">Attack</div>
            <div class="v">${n.scored.toFixed(1)} <span class="unit">scored</span></div>
            <div class="note">${n.scored_rank}${z(n.scored_rank)} · ${o(n.scored)}</div>
          </div>
          <div class="tile">
            <div class="k">Defence</div>
            <div class="v">${n.allowed.toFixed(1)} <span class="unit">allowed</span></div>
            <div class="note">${n.allowed_rank}${z(n.allowed_rank)} · ${o(n.allowed)}</div>
          </div>
        </div>
        <div>
          <div class="head" style="margin-bottom:2px">
            <span class="section-title" style="margin:0">Attack vs defence</span>
            <span style="font-size:13px">Net <b>${y(n.net)}</b></span>
          </div>
          <svg
            class="chart"
            viewBox="0 0 400 60"
            role="img"
            aria-label=${`Points per game: ${n.scored} scored, ${n.allowed} allowed, league average ${n.league_average}`}
          >
            <line class="track" x1="10" y1="32" x2="390" y2="32"></line>
            <line class="avg" x1=${p(n.league_average)} y1="20" x2=${p(n.league_average)} y2="44"></line>
            <text class="axis" x=${p(n.league_average)} y="58" text-anchor="middle">avg ${n.league_average}</text>
            <line class="span" x1=${p(n.allowed)} y1="32" x2=${p(n.scored)} y2="32"></line>
            <circle class="ring" cx=${p(n.allowed)} cy="32" r="6"></circle>
            <circle class="dot" cx=${p(n.scored)} cy="32" r="6"></circle>
            <text class="label" x=${p(n.allowed)} y="16" text-anchor="middle">${n.allowed} allowed</text>
            <text class="label" x=${p(n.scored)} y="16" text-anchor="middle">${n.scored} scored</text>
          </svg>
        </div>`)}let l=Object.keys(Y).filter(o=>a[o]);if(l.length)r.push(h`<div>
        <div class="head" style="margin-bottom:6px">
          <span class="section-title" style="margin:0">League rank</span>
          <span class="legend">
            <span><i class="round" style="background:var(--elt-accent)"></i>${e.team_abbr??"Team"}</span>
            <span><i class="tick"></i>League avg</span>
          </span>
        </div>
        <div class="rankbars">
          ${l.map(o=>{let c=a[o],d=c.best-c.worst||1,p=Math.max(0,Math.min(100,(c.value-c.worst)/d*100)),u=Math.max(0,Math.min(100,(c.average-c.worst)/d*100)),f=c.rank<=3?"top":c.rank<=Math.ceil(c.teams/2)?"":"low",v=o==="pir"?0:1;return h`<span class="k">${Y[o]}</span>
              <span class="v">${Number(c.value).toFixed(v)}</span>
              <span
                class="rb"
                role="img"
                aria-label=${`${Y[o]} ${c.value}, ${c.rank}${z(c.rank)} of ${c.teams}`}
                ><span class="t"></span><span class="a" style=${`left:${u.toFixed(1)}%`}></span
                ><span class="p" style=${`left:${p.toFixed(1)}%`}></span
              ></span>
              <span class="r ${f}">${c.rank}${z(c.rank)}</span>`})}
        </div>
        <div class="foot" style="margin-top:6px">
          Each bar runs from the league's worst to best; turnovers are flipped so right is always better.
        </div>
      </div>`);else if(Object.keys(t).length){let o=(c,d,p=1)=>h`<div class="tile">
          <div class="k">${c}</div>
          <div class="v">${typeof d=="number"?d.toFixed(p):"\u2013"}</div>
        </div>`;r.push(h`<div class="tiles">
        ${o("Points",t.points)} ${o("Rebounds",t.rebounds)} ${o("Assists",t.assists)}
        ${o("2P%",t.fg2_pct)} ${o("3P%",t.fg3_pct)} ${o("PIR",t.pir,0)}
      </div>`)}return r}_statsPlayers(e){let t=e.form??[],a=e.team_leader_ranks??[],n=e.league_leaders??{},r=[];if(t.length){let o=Math.max(5,...t.map($=>$.margin)),c=Math.max(5,...t.map($=>-$.margin)),d=110/(o+c),p=16+o*d,u=p+c*d+16,f=400/t.length,v=t.reduce(($,x)=>$+x.margin,0)/t.length,g=t.length<=20;r.push(h`<div>
        <div class="head" style="margin-bottom:6px">
          <span class="section-title" style="margin:0">Season form · point margin</span>
          <span style="font-size:13px">Avg <b>${y(Math.round(v*10)/10)}</b></span>
        </div>
        <svg
          class="chart"
          viewBox="0 0 ${400} ${u+(g?14:0)}"
          role="img"
          aria-label=${`Point margin in ${t.length} games: ${t.filter($=>$.margin>0).length} wins, ${t.filter($=>$.margin<0).length} losses`}
        >
          <line class="zero" x1="0" y1=${p} x2=${400} y2=${p}></line>
          ${t.map(($,x)=>{let _=Math.max(1.5,Math.abs($.margin)*d),q=x*f+f*.15,E=f*.7,N=$.margin>0?p-_:p,b=q+E/2;return A`<rect class=${$.margin>0?"win":"loss"} x=${q.toFixed(1)} y=${N.toFixed(1)} width=${E.toFixed(1)} height=${_.toFixed(1)} rx="2"><title>${`R${$.round} ${$.homeaway==="home"?"vs":"@"} ${$.opponent_abbr} ${$.team_score}-${$.opponent_score}`}</title></rect>
              ${t.length<=24?A`<text class="val" x=${b.toFixed(1)} y=${($.margin>0?N-4:N+_+11).toFixed(1)} text-anchor="middle">${y($.margin)}</text>`:m}
              ${g?A`<text class="axis" x=${b.toFixed(1)} y=${u+12} text-anchor="middle">${$.opponent_abbr}</text>`:m}`})}
        </svg>
      </div>`)}return a.length&&r.push(h`<div>
        <div class="section-title">Your players in the league leaders</div>
        <div class="leaders">
          ${a.slice(0,6).map(l=>{let o=n[l.category]?.[0],c=l.rank===1||!o?"League leader":`Leader: ${o.name} (${o.team}) ${o.value}`;return h`<div class="leader">
              ${l.image&&!this._broken.has(l.image)?h`<img
                    class="head-shot"
                    src=${l.image}
                    alt=""
                    loading="lazy"
                    referrerpolicy="no-referrer"
                    @error=${()=>this._broken=new Set([...this._broken,l.image])}
                  />`:h`<span class="head-shot fallback" aria-hidden="true">${se(l.name)}</span>`}
              <span class="who"
                ><b>${l.name}</b><span>${Y[l.category]??ut(l.category)} · ${c}</span></span
              >
              <span class="num"
                ><b>${l.value}</b><span class="rank ${l.rank<=3?"top":""}"
                  >${l.rank}${z(l.rank)}</span
                ></span
              >
            </div>`})}
        </div>
      </div>`),r.length?r:h`<div class="empty-state">No games played yet.</div>`}_statsShots(e){let t=e.shot_zones??null;if(!t?.zones)return h`<div class="empty-state">Shot locations aren't available yet.</div>`;let a=d=>t.zones[d]?.points_per_shot??0,n=d=>(.15+.75*Math.max(0,Math.min(1,(a(d)-.8)/.85))).toFixed(2),r=d=>t.zones[d]?.pct==null?"\u2013":`${Math.round(t.zones[d].pct)}%`,l=(d,p,u,f)=>A`<g>
        <rect class="tag" x=${d-120} y=${p-58} width="240" height="96" rx="18"></rect>
        <text class="tag-v" x=${d} y=${p-12} text-anchor="middle">${r(u)}</text>
        <text class="tag-k" x=${d} y=${p+26} text-anchor="middle">${t.zones[u]?.made??0}/${t.zones[u]?.attempts??0} · ${f}</text>
      </g>`,o="M -660 -157 L -660 141.5 A 675 675 0 0 0 660 141.5 L 660 -157 Z",c=Ut.map(([d,p])=>`${p} ${r(d)}`).join(", ");return h`<div>
        <div class="head" style="margin-bottom:6px">
          <span class="section-title" style="margin:0">Season shooting by zone</span>
          <span style="font-size:13px">${t.made}/${t.attempts} FG · ${t.pct}%</span>
        </div>
        <svg class="court zones" viewBox="-760 -170 1520 1150" role="img" aria-label=${`Season shooting by zone: ${c}`}>
          <defs><clipPath id="elt-court"><rect x="-750" y="-157" width="1500" height="1130"></rect></clipPath></defs>
          <g clip-path="url(#elt-court)">
            <rect class="z" x="-750" y="-157" width="1500" height="1130" style=${`fill-opacity:${n("above_break_three")}`}></rect>
            <path class="bg" d=${o}></path>
            <path class="z" d=${o} style=${`fill-opacity:${n("mid_range")}`}></path>
            <rect class="bg" x="-750" y="-157" width="90" height="298.5"></rect>
            <rect class="bg" x="660" y="-157" width="90" height="298.5"></rect>
            <rect class="z" x="-750" y="-157" width="90" height="298.5" style=${`fill-opacity:${n("corner_three")}`}></rect>
            <rect class="z" x="660" y="-157" width="90" height="298.5" style=${`fill-opacity:${n("corner_three")}`}></rect>
            <rect class="bg" x="-245" y="-157" width="490" height="580"></rect>
            <rect class="z" x="-245" y="-157" width="490" height="580" style=${`fill-opacity:${n("paint")}`}></rect>
            <circle class="bg" cx="0" cy="0" r="125"></circle>
            <circle class="z" cx="0" cy="0" r="125" style=${`fill-opacity:${n("rim")}`}></circle>
            <g class="zone-lines">
              <rect x="-245" y="-157" width="490" height="580"></rect>
              <path d="M -660 -157 L -660 141.5 A 675 675 0 0 0 660 141.5 L 660 -157"></path>
              <circle cx="0" cy="0" r="125"></circle>
              <circle cx="0" cy="423" r="180"></circle>
              <line x1="-90" y1="-37" x2="90" y2="-37"></line>
              <circle cx="0" cy="0" r="23"></circle>
            </g>
          </g>
          ${l(0,60,"rim","rim")} ${l(0,330,"paint","paint")} ${l(-450,330,"mid_range","mid")}
          ${l(0,820,"above_break_three","above break")}
        </svg>
        <div class="shot-legend">
          <span>Darker = more points per shot</span>
          <span class="sum">Corners: ${t.zones.corner_three?.made??0}/${t.zones.corner_three?.attempts??0} · ${r("corner_three")}</span>
        </div>
      </div>
      <div class="zone-table">
        <span></span><span class="h">Zone</span><span class="h r">FG</span><span class="h r">%</span
        ><span class="h r">Pts/shot</span>
        ${Ut.map(([d,p])=>h`<span class="sw" style=${`opacity:${n(d)}`}></span><span>${p}</span
            ><span class="r dim">${t.zones[d]?.made??0}/${t.zones[d]?.attempts??0}</span
            ><b class="r">${t.zones[d]?.pct==null?"\u2013":`${t.zones[d].pct.toFixed(1)}%`}</b
            ><span class="r dim">${t.zones[d]?.points_per_shot?.toFixed(2)??"\u2013"}</span>`)}
      </div>`}_renderRound(e){let t=this._state(this._standingsId())?.attributes??{},a=t.scoreboard??{},n=a.rounds??[];if(!n.length)return h`<div class="empty-state">The round's games aren't available yet.</div>`;let r=e.team_abbr??t.team_abbr,l=n.find(g=>g.round===e.round)??n[Math.floor(n.length/2)],o=n.find(g=>g.round===this._round)??l,c=n.indexOf(o),d=o.games.filter(g=>g.played).length,p=d===o.games.length?"results":d?"in progress":"fixtures",u=g=>{let $=a.crests?.[g];return $&&!this._broken.has($)?h`<img
            class="mini-crest"
            src=${$}
            alt=""
            loading="lazy"
            referrerpolicy="no-referrer"
            @error=${()=>this._broken=new Set([...this._broken,$])}
          />`:h`<span class="mini-crest fallback" aria-hidden="true"></span>`},f=(g,$,x,_)=>h`<div class="side ${_.played&&!x?"dim":""} ${_.played&&x?"w":""}">
        ${u(g)}<span class="c">${g}</span><span class="s">${_.played?$:""}</span>
      </div>`,v=g=>{let $=n[c+g];return h`<button
        class="nav"
        aria-label=${g<0?"Previous round":"Next round"}
        ?disabled=${!$}
        @click=${()=>$&&(this._round=$.round)}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d=${g<0?"M10 3 L5 8 L10 13":"M6 3 L11 8 L6 13"}></path>
        </svg>
      </button>`};return h`
      <div class="head">
        <div class="round-nav">
          ${v(-1)}<span class="round-title">Round ${o.round} · ${p}</span>${v(1)}
        </div>
        <span class="pill">${o.games.length} games</span>
      </div>
      <div class="board">
        ${o.games.map(g=>{let $=g.home===r||g.away===r,x=(g.home_score??0)>(g.away_score??0);return h`<div class="bgame ${$?"me":""}">
            ${f(g.home,g.home_score,x,g)} ${f(g.away,g.away_score,!x,g)}
            ${g.played||!g.date?m:h`<div class="when-s">${this._fmtDay(g.date)} · ${this._fmtTime(g.date)}</div>`}
          </div>`})}
      </div>
    `}_renderShots(e){let t=e.shots?.team??[];if(!t.length)return m;let a=t.filter(c=>c[2]).length,n=t.filter(c=>c[3]===2),r=t.filter(c=>c[3]===3),l=c=>`${c.filter(d=>d[2]).length}/${c.length}`,o=`${e.team_name} shot chart vs ${e.opponent_name}: ${a} of ${t.length} field goals, ${l(n)} twos, ${l(r)} threes`;return h`<div>
      <div class="head" style="margin-bottom:6px">
        <span class="section-title" style="margin:0">Shot chart · ${e.team_homeaway==="away"?"@":"vs"} ${e.opponent_abbr}</span>
        <span style="font-size:13px">${a}/${t.length} FG</span>
      </div>
      <svg class="court" viewBox="-760 -170 1520 1420" role="img" aria-label=${o}>
        <g class="lines">
          <rect x="-750" y="-157" width="1500" height="1400"></rect>
          <rect x="-245" y="-157" width="490" height="580"></rect>
          <circle cx="0" cy="423" r="180"></circle>
          <path d="M -660 -157 L -660 141.5 A 675 675 0 0 0 660 141.5 L 660 -157"></path>
          <line x1="-90" y1="-37" x2="90" y2="-37"></line>
          <circle cx="0" cy="0" r="23"></circle>
          <path d="M -180 1243 A 180 180 0 0 1 180 1243"></path>
        </g>
        ${t.map(([c,d,p])=>p?A`<circle class="made" cx=${c} cy=${d} r="26"></circle>`:A`<circle class="miss" cx=${c} cy=${d} r="22"></circle>`)}
      </svg>
      <div class="shot-legend">
        <span><span class="m"></span>Made</span><span><span class="x"></span>Missed</span>
        <span class="sum">2P ${l(n)} · 3P ${l(r)}</span>
      </div>
    </div>`}};V.styles=Mt,V.properties={hass:{attribute:!1},_config:{state:!0},_tab:{state:!0},_statsTab:{state:!0},_round:{state:!0},_broken:{state:!0}};customElements.get("euroleague-tracker-card")||customElements.define("euroleague-tracker-card",V);window.customCards=window.customCards||[];window.customCards.some(i=>i.type==="euroleague-tracker-card")||window.customCards.push({type:"euroleague-tracker-card",name:"EuroLeague Tracker",description:"Live score, next game, standings and stats for your EuroLeague team.",preview:!0,documentationURL:"https://github.com/Big-Edge2297/ha-euroleague-tracker"});console.info(`%c EUROLEAGUE-TRACKER-CARD %c ${Yt} `,"background:#C62828;color:#fff","");export{V as EuroLeagueTrackerCard};
