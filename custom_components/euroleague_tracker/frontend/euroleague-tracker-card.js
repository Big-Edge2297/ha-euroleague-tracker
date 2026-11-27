var U=globalThis,L=U.ShadowRoot&&(U.ShadyCSS===void 0||U.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,j=Symbol(),it=new WeakMap,k=class{constructor(e,s,t){if(this._$cssResult$=!0,t!==j)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=s}get styleSheet(){let e=this.o,s=this.t;if(L&&e===void 0){let t=s!==void 0&&s.length===1;t&&(e=it.get(s)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&it.set(s,e))}return e}toString(){return this.cssText}},rt=i=>new k(typeof i=="string"?i:i+"",void 0,j),B=(i,...e)=>{let s=i.length===1?i[0]:e.reduce((t,n,r)=>t+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+i[r+1],i[0]);return new k(s,i,j)},at=(i,e)=>{if(L)i.adoptedStyleSheets=e.map(s=>s instanceof CSSStyleSheet?s:s.styleSheet);else for(let s of e){let t=document.createElement("style"),n=U.litNonce;n!==void 0&&t.setAttribute("nonce",n),t.textContent=s.cssText,i.appendChild(t)}},q=L?i=>i:i=>i instanceof CSSStyleSheet?(e=>{let s="";for(let t of e.cssRules)s+=t.cssText;return rt(s)})(i):i;var{is:Pt,defineProperty:Tt,getOwnPropertyDescriptor:Rt,getOwnPropertyNames:zt,getOwnPropertySymbols:Nt,getPrototypeOf:Ft}=Object,M=globalThis,ot=M.trustedTypes,Ot=ot?ot.emptyScript:"",Ut=M.reactiveElementPolyfillSupport,C=(i,e)=>i,V={toAttribute(i,e){switch(e){case Boolean:i=i?Ot:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,e){let s=i;switch(e){case Boolean:s=i!==null;break;case Number:s=i===null?null:Number(i);break;case Object:case Array:try{s=JSON.parse(i)}catch{s=null}}return s}},ct=(i,e)=>!Pt(i,e),lt={attribute:!0,type:String,converter:V,reflect:!1,useDefault:!1,hasChanged:ct};Symbol.metadata??=Symbol("metadata"),M.litPropertyMetadata??=new WeakMap;var f=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,s=lt){if(s.state&&(s.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((s=Object.create(s)).wrapped=!0),this.elementProperties.set(e,s),!s.noAccessor){let t=Symbol(),n=this.getPropertyDescriptor(e,t,s);n!==void 0&&Tt(this.prototype,e,n)}}static getPropertyDescriptor(e,s,t){let{get:n,set:r}=Rt(this.prototype,e)??{get(){return this[s]},set(a){this[s]=a}};return{get:n,set(a){let l=n?.call(this);r?.call(this,a),this.requestUpdate(e,l,t)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??lt}static _$Ei(){if(this.hasOwnProperty(C("elementProperties")))return;let e=Ft(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(C("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(C("properties"))){let s=this.properties,t=[...zt(s),...Nt(s)];for(let n of t)this.createProperty(n,s[n])}let e=this[Symbol.metadata];if(e!==null){let s=litPropertyMetadata.get(e);if(s!==void 0)for(let[t,n]of s)this.elementProperties.set(t,n)}this._$Eh=new Map;for(let[s,t]of this.elementProperties){let n=this._$Eu(s,t);n!==void 0&&this._$Eh.set(n,s)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let s=[];if(Array.isArray(e)){let t=new Set(e.flat(1/0).reverse());for(let n of t)s.unshift(q(n))}else e!==void 0&&s.push(q(e));return s}static _$Eu(e,s){let t=s.attribute;return t===!1?void 0:typeof t=="string"?t:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,s=this.constructor.elementProperties;for(let t of s.keys())this.hasOwnProperty(t)&&(e.set(t,this[t]),delete this[t]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return at(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,s,t){this._$AK(e,t)}_$ET(e,s){let t=this.constructor.elementProperties.get(e),n=this.constructor._$Eu(e,t);if(n!==void 0&&t.reflect===!0){let r=(t.converter?.toAttribute!==void 0?t.converter:V).toAttribute(s,t.type);this._$Em=e,r==null?this.removeAttribute(n):this.setAttribute(n,r),this._$Em=null}}_$AK(e,s){let t=this.constructor,n=t._$Eh.get(e);if(n!==void 0&&this._$Em!==n){let r=t.getPropertyOptions(n),a=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:V;this._$Em=n;let l=a.fromAttribute(s,r.type);this[n]=l??this._$Ej?.get(n)??l,this._$Em=null}}requestUpdate(e,s,t,n=!1,r){if(e!==void 0){let a=this.constructor;if(n===!1&&(r=this[e]),t??=a.getPropertyOptions(e),!((t.hasChanged??ct)(r,s)||t.useDefault&&t.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,t))))return;this.C(e,s,t)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,s,{useDefault:t,reflect:n,wrapped:r},a){t&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??s??this[e]),r!==!0||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||t||(s=void 0),this._$AL.set(e,s)),n===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(s){Promise.reject(s)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[n,r]of this._$Ep)this[n]=r;this._$Ep=void 0}let t=this.constructor.elementProperties;if(t.size>0)for(let[n,r]of t){let{wrapped:a}=r,l=this[n];a!==!0||this._$AL.has(n)||l===void 0||this.C(n,void 0,r,l)}}let e=!1,s=this._$AL;try{e=this.shouldUpdate(s),e?(this.willUpdate(s),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(s)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(s)}willUpdate(e){}_$AE(e){this._$EO?.forEach(s=>s.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(s=>this._$ET(s,this[s])),this._$EM()}updated(e){}firstUpdated(e){}};f.elementStyles=[],f.shadowRootOptions={mode:"open"},f[C("elementProperties")]=new Map,f[C("finalized")]=new Map,Ut?.({ReactiveElement:f}),(M.reactiveElementVersions??=[]).push("2.1.2");var X=globalThis,pt=i=>i,I=X.trustedTypes,dt=I?I.createPolicy("lit-html",{createHTML:i=>i}):void 0,_t="$lit$",_=`lit$${Math.random().toFixed(9).slice(2)}$`,$t="?"+_,Lt=`<${$t}>`,x=document,T=()=>x.createComment(""),R=i=>i===null||typeof i!="object"&&typeof i!="function",Y=Array.isArray,Mt=i=>Y(i)||typeof i?.[Symbol.iterator]=="function",W=`[ 	
\f\r]`,P=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ht=/-->/g,ut=/>/g,v=RegExp(`>|${W}(?:([^\\s"'>=/]+)(${W}*=${W}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),gt=/'/g,mt=/"/g,bt=/^(?:script|style|textarea|title)$/i,tt=i=>(e,...s)=>({_$litType$:i,strings:e,values:s}),h=tt(1),et=tt(2),Zt=tt(3),w=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),ft=new WeakMap,y=x.createTreeWalker(x,129);function vt(i,e){if(!Y(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return dt!==void 0?dt.createHTML(e):e}var It=(i,e)=>{let s=i.length-1,t=[],n,r=e===2?"<svg>":e===3?"<math>":"",a=P;for(let l=0;l<s;l++){let o=i[l],p,d,c=-1,g=0;for(;g<o.length&&(a.lastIndex=g,d=a.exec(o),d!==null);)g=a.lastIndex,a===P?d[1]==="!--"?a=ht:d[1]!==void 0?a=ut:d[2]!==void 0?(bt.test(d[2])&&(n=RegExp("</"+d[2],"g")),a=v):d[3]!==void 0&&(a=v):a===v?d[0]===">"?(a=n??P,c=-1):d[1]===void 0?c=-2:(c=a.lastIndex-d[2].length,p=d[1],a=d[3]===void 0?v:d[3]==='"'?mt:gt):a===mt||a===gt?a=v:a===ht||a===ut?a=P:(a=v,n=void 0);let m=a===v&&i[l+1].startsWith("/>")?" ":"";r+=a===P?o+Lt:c>=0?(t.push(p),o.slice(0,c)+_t+o.slice(c)+_+m):o+_+(c===-2?l:m)}return[vt(i,r+(i[s]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),t]},z=class i{constructor({strings:e,_$litType$:s},t){let n;this.parts=[];let r=0,a=0,l=e.length-1,o=this.parts,[p,d]=It(e,s);if(this.el=i.createElement(p,t),y.currentNode=this.el.content,s===2||s===3){let c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}for(;(n=y.nextNode())!==null&&o.length<l;){if(n.nodeType===1){if(n.hasAttributes())for(let c of n.getAttributeNames())if(c.endsWith(_t)){let g=d[a++],m=n.getAttribute(c).split(_),b=/([.?@])?(.*)/.exec(g);o.push({type:1,index:r,name:b[2],strings:m,ctor:b[1]==="."?K:b[1]==="?"?Z:b[1]==="@"?Q:S}),n.removeAttribute(c)}else c.startsWith(_)&&(o.push({type:6,index:r}),n.removeAttribute(c));if(bt.test(n.tagName)){let c=n.textContent.split(_),g=c.length-1;if(g>0){n.textContent=I?I.emptyScript:"";for(let m=0;m<g;m++)n.append(c[m],T()),y.nextNode(),o.push({type:2,index:++r});n.append(c[g],T())}}}else if(n.nodeType===8)if(n.data===$t)o.push({type:2,index:r});else{let c=-1;for(;(c=n.data.indexOf(_,c+1))!==-1;)o.push({type:7,index:r}),c+=_.length-1}r++}}static createElement(e,s){let t=x.createElement("template");return t.innerHTML=e,t}};function A(i,e,s=i,t){if(e===w)return e;let n=t!==void 0?s._$Co?.[t]:s._$Cl,r=R(e)?void 0:e._$litDirective$;return n?.constructor!==r&&(n?._$AO?.(!1),r===void 0?n=void 0:(n=new r(i),n._$AT(i,s,t)),t!==void 0?(s._$Co??=[])[t]=n:s._$Cl=n),n!==void 0&&(e=A(i,n._$AS(i,e.values),n,t)),e}var G=class{constructor(e,s){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=s}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:s},parts:t}=this._$AD,n=(e?.creationScope??x).importNode(s,!0);y.currentNode=n;let r=y.nextNode(),a=0,l=0,o=t[0];for(;o!==void 0;){if(a===o.index){let p;o.type===2?p=new N(r,r.nextSibling,this,e):o.type===1?p=new o.ctor(r,o.name,o.strings,this,e):o.type===6&&(p=new J(r,this,e)),this._$AV.push(p),o=t[++l]}a!==o?.index&&(r=y.nextNode(),a++)}return y.currentNode=x,n}p(e){let s=0;for(let t of this._$AV)t!==void 0&&(t.strings!==void 0?(t._$AI(e,t,s),s+=t.strings.length-2):t._$AI(e[s])),s++}},N=class i{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,s,t,n){this.type=2,this._$AH=u,this._$AN=void 0,this._$AA=e,this._$AB=s,this._$AM=t,this.options=n,this._$Cv=n?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,s=this._$AM;return s!==void 0&&e?.nodeType===11&&(e=s.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,s=this){e=A(this,e,s),R(e)?e===u||e==null||e===""?(this._$AH!==u&&this._$AR(),this._$AH=u):e!==this._$AH&&e!==w&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):Mt(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==u&&R(this._$AH)?this._$AA.nextSibling.data=e:this.T(x.createTextNode(e)),this._$AH=e}$(e){let{values:s,_$litType$:t}=e,n=typeof t=="number"?this._$AC(e):(t.el===void 0&&(t.el=z.createElement(vt(t.h,t.h[0]),this.options)),t);if(this._$AH?._$AD===n)this._$AH.p(s);else{let r=new G(n,this),a=r.u(this.options);r.p(s),this.T(a),this._$AH=r}}_$AC(e){let s=ft.get(e.strings);return s===void 0&&ft.set(e.strings,s=new z(e)),s}k(e){Y(this._$AH)||(this._$AH=[],this._$AR());let s=this._$AH,t,n=0;for(let r of e)n===s.length?s.push(t=new i(this.O(T()),this.O(T()),this,this.options)):t=s[n],t._$AI(r),n++;n<s.length&&(this._$AR(t&&t._$AB.nextSibling,n),s.length=n)}_$AR(e=this._$AA.nextSibling,s){for(this._$AP?.(!1,!0,s);e!==this._$AB;){let t=pt(e).nextSibling;pt(e).remove(),e=t}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},S=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,s,t,n,r){this.type=1,this._$AH=u,this._$AN=void 0,this.element=e,this.name=s,this._$AM=n,this.options=r,t.length>2||t[0]!==""||t[1]!==""?(this._$AH=Array(t.length-1).fill(new String),this.strings=t):this._$AH=u}_$AI(e,s=this,t,n){let r=this.strings,a=!1;if(r===void 0)e=A(this,e,s,0),a=!R(e)||e!==this._$AH&&e!==w,a&&(this._$AH=e);else{let l=e,o,p;for(e=r[0],o=0;o<r.length-1;o++)p=A(this,l[t+o],s,o),p===w&&(p=this._$AH[o]),a||=!R(p)||p!==this._$AH[o],p===u?e=u:e!==u&&(e+=(p??"")+r[o+1]),this._$AH[o]=p}a&&!n&&this.j(e)}j(e){e===u?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},K=class extends S{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===u?void 0:e}},Z=class extends S{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==u)}},Q=class extends S{constructor(e,s,t,n,r){super(e,s,t,n,r),this.type=5}_$AI(e,s=this){if((e=A(this,e,s,0)??u)===w)return;let t=this._$AH,n=e===u&&t!==u||e.capture!==t.capture||e.once!==t.once||e.passive!==t.passive,r=e!==u&&(t===u||n);n&&this.element.removeEventListener(this.name,this,t),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},J=class{constructor(e,s,t){this.element=e,this.type=6,this._$AN=void 0,this._$AM=s,this.options=t}get _$AU(){return this._$AM._$AU}_$AI(e){A(this,e)}};var Ht=X.litHtmlPolyfillSupport;Ht?.(z,N),(X.litHtmlVersions??=[]).push("3.3.3");var yt=(i,e,s)=>{let t=s?.renderBefore??e,n=t._$litPart$;if(n===void 0){let r=s?.renderBefore??null;t._$litPart$=n=new N(e.insertBefore(T(),r),r,void 0,s??{})}return n._$AI(i),n};var st=globalThis,$=class extends f{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let s=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=yt(s,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return w}};$._$litElement$=!0,$.finalized=!0,st.litElementHydrateSupport?.({LitElement:$});var Dt=st.litElementPolyfillSupport;Dt?.({LitElement:$});(st.litElementVersions??=[]).push("4.2.2");function nt(i){return i%100>=11&&i%100<=13?"th":{1:"st",2:"nd",3:"rd"}[i%10]??"th"}function xt(i){let e=/^[A-Z](\d{4})$/.exec(i??"");if(!e)return i??"";let s=Number(e[1]);return`${s}-${String((s+1)%100).padStart(2,"0")}`}function wt(i){return i!==i.toUpperCase()?i:i.toLowerCase().replace(/(^|[\s\-/(])(\p{L})/gu,(e,s,t)=>s+t.toUpperCase())}function H(i){return typeof i!="number"?"\u2013":i>0?`+${i}`:`${i}`.replace("-","\u2212")}var At=B`
  :host {
    display: block;
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
`;function Et(i){let e=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(i.trim());if(!e)return null;let s=e[1];s.length===3&&(s=s.split("").map(n=>n+n).join(""));let t=parseInt(s,16);return[t>>16&255,t>>8&255,t&255]}function kt(i){let e=Et(i);if(!e)return .2;let[s,t,n]=e.map(r=>{let a=r/255;return a<=.03928?a/12.92:((a+.055)/1.055)**2.4});return .2126*s+.7152*t+.0722*n}function D(i){let e=kt(i),s=1.05/(e+.05),t=(e+.05)/.0625;return s>=t?"#FFFFFF":"#111111"}function E(i,e){let s=Et(i)??[128,128,128];return`rgba(${s[0]}, ${s[1]}, ${s[2]}, ${e})`}function St(i,e){let s=kt(i);return e<.1&&s<.03?"#8C8C8C":e>.8&&s>.85?"#5C5C5C":i}function Ct(i,e){let s={"--elt-crest-plate":"rgba(255, 255, 255, 0.92)","--elt-win-bg":"#2E7D32","--elt-win-fg":"#FFFFFF","--elt-zone-playoffs":"#1F4FA8","--elt-zone-playin":"#B26A00","--elt-zone-fg":"#FFFFFF"};switch(i){case"dark":{let t=St(e,.012);return{...s,"--elt-bg":"#1C1C1C","--elt-fg":"#E8E8E8","--elt-fg2":"#A8A8A8","--elt-muted":"#6E6E6E","--elt-surface":"#262626","--elt-divider":"#333333","--elt-loss-bg":"#424242","--elt-loss-fg":"#E0E0E0","--elt-bar-other":"#5A5A5A","--elt-accent":t,"--elt-accent-fg":D(t)}}case"light":{let t=St(e,1);return{...s,"--elt-crest-plate":"transparent","--elt-bg":"#FFFFFF","--elt-fg":"#1F1F1F","--elt-fg2":"#5C5C5C","--elt-muted":"#8A8A8A","--elt-surface":"#F2F2F2","--elt-divider":"#E3E3E3","--elt-loss-bg":"#DDDDDD","--elt-loss-fg":"#333333","--elt-bar-other":"#C7C7C7","--elt-accent":t,"--elt-accent-fg":D(t)}}case"team":{let t=D(e);return{...s,"--elt-bg":e,"--elt-fg":t,"--elt-fg2":E(t,.8),"--elt-muted":E(t,.55),"--elt-surface":E(t,.12),"--elt-divider":E(t,.22),"--elt-loss-bg":E(t,.22),"--elt-loss-fg":t,"--elt-win-bg":t,"--elt-win-fg":e,"--elt-bar-other":E(t,.3),"--elt-accent":t,"--elt-accent-fg":e}}default:return{...s,"--elt-bg":"var(--ha-card-background, var(--card-background-color, #fff))","--elt-fg":"var(--primary-text-color, #212121)","--elt-fg2":"var(--secondary-text-color, #727272)","--elt-muted":"var(--disabled-text-color, #9e9e9e)","--elt-surface":"color-mix(in srgb, var(--primary-text-color, #212121) 7%, transparent)","--elt-divider":"var(--divider-color, rgba(0,0,0,.12))","--elt-loss-bg":"color-mix(in srgb, var(--primary-text-color, #212121) 20%, transparent)","--elt-loss-fg":"var(--primary-text-color, #212121)","--elt-bar-other":"color-mix(in srgb, var(--primary-text-color, #212121) 30%, transparent)","--elt-accent":e,"--elt-accent-fg":D(e)}}}var jt=(()=>{try{return new URL(import.meta.url).searchParams.get("v")??"dev"}catch{return"dev"}})(),Bt="Data provided by the EuroLeague API",qt={entity:"Game sensor",view:"What to show",theme:"Theme",team_color:"Team colour (hex, optional)",play_by_play_rows:"Play-by-play rows",standings_rows:"Standings rows",standings_entity:"Standings sensor (optional, found automatically)",stats_entity:"Stats sensor (optional, found automatically)",show_shot_chart:"Show shot chart"},F=class extends ${constructor(){super(...arguments);this._tab="game";this._broken=new Set}setConfig(s){if(!s||!s.entity)throw new Error("Choose the game sensor created by EuroLeague Tracker (entity).");this._config={view:"tabs",theme:"auto",play_by_play_rows:4,show_shot_chart:!0,...s},this._config.view&&this._config.view!=="tabs"&&(this._tab=this._config.view)}getCardSize(){return this._tab==="standings"?12:7}getGridOptions(){return{columns:12,min_columns:6,rows:"auto"}}static getConfigForm(){let s=t=>({select:{mode:"dropdown",options:t.map(([n,r])=>({value:n,label:r}))}});return{schema:[{name:"entity",required:!0,selector:{entity:{domain:"sensor",integration:"euroleague_tracker"}}},{type:"grid",name:"",schema:[{name:"view",selector:s([["tabs","Tabs: game, standings, stats"],["game","Game only"],["standings","Standings only"],["stats","Stats only"]])},{name:"theme",selector:s([["auto","Follow Home Assistant theme"],["dark","Dark"],["light","Light"],["team","Team colours"]])}]},{name:"team_color",selector:{text:{}}},{type:"grid",name:"",schema:[{name:"play_by_play_rows",selector:{number:{min:0,max:10,mode:"box"}}},{name:"standings_rows",selector:{number:{min:4,max:20,mode:"box"}}}]},{name:"show_shot_chart",selector:{boolean:{}}},{name:"standings_entity",selector:{entity:{domain:"sensor",integration:"euroleague_tracker"}}},{name:"stats_entity",selector:{entity:{domain:"sensor",integration:"euroleague_tracker"}}}],computeLabel:t=>qt[t.name]??t.name}}static getStubConfig(s){return{entity:Object.keys(s?.states??{}).find(n=>{let r=s.states[n].attributes??{};return n.startsWith("sensor.")&&String(r.attribution??"").startsWith(Bt)&&"game_code"in r})??"",view:"tabs",theme:"auto"}}shouldUpdate(s){if(!s.has("hass")||s.size>1)return!0;let t=s.get("hass");return t?[this._config.entity,this._standingsId(),this._statsId()].some(n=>n&&t.states[n]!==this.hass.states[n]):!0}_state(s){return s?this.hass?.states?.[s]:void 0}_findSibling(s,t){let r=`${this._config.entity.replace(/_game$/,"")}${s}`;if(this._state(r))return r;let a=this._state(this._config.entity)?.attributes?.team_abbr;return Object.keys(this.hass?.states??{}).find(l=>{let o=this.hass.states[l].attributes??{};return l.startsWith("sensor.")&&t in o&&o.team_abbr===a&&o.competition!==void 0})}_standingsId(){return this._config.standings_entity||this._findSibling("_standings_position","table")}_statsId(){return this._config.stats_entity||this._findSibling("_season_stats","per_game")}_teamColor(s){let t=this._config.team_color||s.team_color||s.team_colors?.[0];return/^#[0-9a-f]{3,8}$/i.test(String(t??""))?t:"#C62828"}_locale(){let s=this.hass?.locale?.language||this.hass?.language||"en",t=this.hass?.locale?.time_zone==="local"?void 0:this.hass?.config?.time_zone,n=this.hass?.locale?.time_format;return{lang:s,tz:t,hour12:n==="12"?!0:n==="24"?!1:void 0}}_fmtDay(s){let{lang:t,tz:n}=this._locale();return new Intl.DateTimeFormat(t,{weekday:"short",day:"numeric",month:"short",timeZone:n}).format(new Date(s))}_fmtTime(s){let{lang:t,tz:n,hour12:r}=this._locale();return new Intl.DateTimeFormat(t,{hour:"2-digit",minute:"2-digit",timeZone:n,hour12:r}).format(new Date(s))}_crest(s,t,n="crest"){return!s||this._broken.has(s)?h`<div class="crest-fallback" role="img" aria-label=${t}>${t}</div>`:h`<span class="plate ${n?"":"small"}"
      ><img
        class=${n}
        src=${s}
        alt=""
        loading="lazy"
        referrerpolicy="no-referrer"
        @error=${()=>{this._broken=new Set([...this._broken,s])}}
    /></span>`}_form(s,t=!1){return s?.length?h`<span class="form" aria-label=${`Last ${s.length}, oldest first: ${s.join(" ")}`}>
      ${s.map(n=>h`<span class="chip ${n} ${t?"small":""}">${n}</span>`)}
    </span>`:u}render(){if(!this._config||!this.hass)return u;let s=this._state(this._config.entity);if(!s)return h`<ha-card><div class="warning">Entity not found: ${this._config.entity}</div></ha-card>`;let t=s.attributes??{},n=this._config.theme??"auto",r=Ct(n,this._teamColor(t)),a=Object.entries(r).map(([o,p])=>`${o}:${p}`).join(";"),l=this._config.view==="tabs"?this._tab:this._config.view??"game";return h`<ha-card style=${a}>
      ${n==="team"&&t.team_logo&&!this._broken.has(t.team_logo)?h`<img
            class="watermark"
            src=${t.team_logo}
            alt=""
            referrerpolicy="no-referrer"
            @error=${()=>this._broken=new Set([...this._broken,t.team_logo])}
          />`:u}
      <div class="content">
        ${this._config.view==="tabs"?this._renderTabs():u}
        ${l==="standings"?this._renderStandings(t):l==="stats"?this._renderStats(t):this._renderGame(s.state,t)}
      </div>
    </ha-card>`}_renderTabs(){return h`<div class="tabs" role="tablist">
      ${[["game","Game"],["standings","Standings"],["stats","Stats"]].map(([t,n])=>h`<button role="tab" aria-selected=${this._tab===t?"true":"false"} @click=${()=>this._tab=t}>
            ${n}
          </button>`)}
    </div>`}_renderGame(s,t){if(s==="NOT_FOUND"||!t.team_abbr)return h`<div class="empty-state">${t.api_message??"No game found for this team."}</div>`;let n=t.competition??"EuroLeague",r=t.round_name??(t.round?`Round ${t.round}`:""),a;if(s==="IN")a=h`<span class="pill live"><span class="dot"></span>LIVE${t.clock?` \xB7 ${t.clock}`:""}</span>`;else if(s==="POST"){let l=t.team_winner===!0;a=h`<span class="pill ${l?"win":"loss"}">${t.clock??"Final"} · ${l?"W":"L"}</span>`}else a=h`<span class="pill">${t.kickoff_in??""}</span>`;return h`
      <div class="head">
        <span class="eyebrow">${n}${r?` \xB7 ${r}`:""}</span>
        ${a}
      </div>
      ${this._renderMatchup(s,t)}
      ${s==="PRE"?this._renderPreCompare(t):this._renderQuarters(s,t)}
      ${s==="IN"?this._renderPlays(t):u}
      ${s!=="PRE"?this._renderPlayers(s,t):u}
      ${s==="POST"?this._renderBars(t):u}
      ${this._renderFoot(s,t)}
    `}_side(s,t){return{code:s[`${t}_abbr`],name:s[`${t}_name`],logo:s[`${t}_logo`],record:s[`${t}_record`],position:s[`${t}_position`],homeaway:s[`${t}_homeaway`],score:s[`${t}_score`]}}_renderMatchup(s,t){let n=this._side(t,"team"),r=this._side(t,"opponent"),[a,l]=n.homeaway==="away"?[r,n]:[n,r],o=c=>s==="PRE"?[c.position?`${c.position}${nt(c.position)}`:null,c.record].filter(Boolean).join(" \xB7 "):[c.record,c.homeaway==="home"?"Home":"Away"].filter(Boolean).join(" \xB7 "),p=c=>h`<div class="team">
      ${this._crest(c.logo,c.code)}
      <div class="team-name" title=${c.name}>${c.name}</div>
      <div class="team-sub">${o(c)}</div>
    </div>`,d;if(s==="PRE"&&t.date)d=h`<div class="when">
        <span class="day">${this._fmtDay(t.date)}</span>
        <span class="time">${this._fmtTime(t.date)}</span>
      </div>`;else{let c=a.score??0,g=l.score??0;d=h`<div class="score" aria-label=${`${a.name} ${c}, ${l.name} ${g}`}>
        <span class=${c<g?"trailing":""}>${c}</span><span class="sep">–</span><span class=${g<c?"trailing":""}
          >${g}</span
        >
      </div>`}return h`<div class="matchup">${p(a)}${d}${p(l)}</div>`}_renderQuarters(s,t){let n=t.quarter_scores;if(!n?.team?.length&&!n?.opponent?.length)return u;let r=Math.max(4,n.team?.length??0,n.opponent?.length??0),a=Array.from({length:r},(g,m)=>m<4?`Q${m+1}`:r>5?`OT${m-3}`:"OT"),l=s==="IN"?(t.quarter??0)-1:-1,o=this._side(t,"team"),p=this._side(t,"opponent"),d=o.homeaway==="away"?[[p,n.opponent],[o,n.team]]:[[o,n.team],[p,n.opponent]],c=`grid-template-columns: 1.3fr repeat(${r}, minmax(0, 1fr))`;return h`<div class="panel quarters" style=${c}>
      <span></span>
      ${a.map((g,m)=>h`<span class="label ${m===l?"current":""}">${g}</span>`)}
      ${d.map(([g,m])=>h`<span class="name">${g.code}</span>
          ${a.map((b,O)=>m?.[O]===void 0||m?.[O]===null?h`<span class="empty">–</span>`:h`<span class=${O===l?"current":""}>${m[O]}</span>`)}`)}
    </div>`}_renderPreCompare(s){let t=this._state(this._standingsId())?.attributes?.table??[],n=m=>t.find(b=>b.code===m)??{},r=this._side(s,"team"),a=this._side(s,"opponent"),[l,o]=r.homeaway==="away"?[a,r]:[r,a],p=n(l.code),d=n(o.code),c=p.last5??(l===r?s.team_form:s.opponent_form),g=d.last5??(o===r?s.team_form:s.opponent_form);return!c&&!t.length?u:h`<div class="panel compare">
      ${this._form(c)}<span class="mid">Last 5</span><span class="r">${this._form(g)}</span>
      ${t.length?h`<span>${p.home_record??"\u2013"}</span><span class="mid">Home / Away</span
            ><span class="r">${d.away_record??"\u2013"}</span> <span>${p.last10??"\u2013"}</span><span class="mid">Last 10</span
            ><span class="r">${d.last10??"\u2013"}</span> <span>${H(p.point_diff)}</span><span class="mid">Point diff</span
            ><span class="r">${H(d.point_diff)}</span>`:u}
    </div>`}_renderPlays(s){let t=this._config.play_by_play_rows??4,n=(s.play_by_play??[]).slice(0,t);return!t||!n.length?u:h`<div>
      <div class="section-title">Play-by-play</div>
      <div class="plays">
        ${n.map(r=>h`<div class="play ${r.scoring?"scoring":""}">
            <span class="t">${r.clock??""}</span><span class="text">${r.text}</span
            ><span class="sc">${r.scoring&&r.score?r.score:""}</span>
          </div>`)}
      </div>
    </div>`}_renderPlayers(s,t){let n=t.top_players?.team??[];if(!n.length)return u;let r=n.slice(0,s==="IN"?3:4);return h`<div>
      <div class="section-title">${s==="IN"?"Leaders":"Top performers"} (PIR)</div>
      <div class="players">
        <span class="h">Player</span><span class="h">PTS</span><span class="h">REB</span><span class="h">AST</span
        ><span class="h">PIR</span>
        ${r.map(a=>h`<span class="pname"><b>${a.name}</b> <span class="num">#${a.number}</span></span>
            <span class="n">${a.points??"\u2013"}</span><span class="n">${a.rebounds??"\u2013"}</span
            ><span class="n">${a.assists??"\u2013"}</span><span class="n">${a.pir??"\u2013"}</span>`)}
      </div>
    </div>`}_renderBars(s){let t=s.game_stats?.team,n=s.game_stats?.opponent;if(!t||!n)return u;let a=[["2P%",t.fg2_pct,n.fg2_pct,`${t.fg2} vs ${n.fg2}`,1],["3P%",t.fg3_pct,n.fg3_pct,`${t.fg3} vs ${n.fg3}`,1],["FT%",t.ft_pct,n.ft_pct,`${t.ft} vs ${n.ft}`,1],["Rebounds",t.rebounds,n.rebounds,"",0],["Assists",t.assists,n.assists,"",0],["Turnovers",t.turnovers,n.turnovers,"",0]].filter(([,l,o])=>typeof l=="number"&&typeof o=="number");return a.length?h`<div>
      <div class="section-title">${s.team_abbr} vs ${s.opponent_abbr}</div>
      <div class="bars">
        ${a.map(([l,o,p,d,c])=>{let g=o+p>0?100*o/(o+p):50;return h`<span class="l">${o.toFixed(c)}</span>
            <div title=${d}>
              <div class="bar-label">${l}</div>
              <div class="bar"><span class="us" style=${`width:${g.toFixed(1)}%`}></span><span class="them"></span></div>
            </div>
            <span>${p.toFixed(c)}</span>`})}
      </div>
    </div>`:u}_renderFoot(s,t){let n=[];return t.venue&&n.push(wt(t.venue)),s!=="PRE"&&t.attendance&&n.push(`${Number(t.attendance).toLocaleString(this._locale().lang)} fans`),s==="PRE"&&t.capacity&&n.push(`cap. ${Number(t.capacity).toLocaleString(this._locale().lang)}`),s==="IN"&&(t.team_fouls??null)!==null&&n.push(`Fouls ${t.team_fouls}\u2013${t.opponent_fouls}`),s==="POST"&&t.next_game?.date&&n.push(`Next: ${t.next_game.homeaway==="home"?"vs":"@"} ${t.next_game.opponent_abbr}, ${this._fmtDay(t.next_game.date)}`),n.length?h`<div class="foot">${n.join(" \xB7 ")}</div>`:u}_renderStandings(s){let t=this._state(this._standingsId()),n=t?.attributes?.table??[];if(!n.length)return h`<div class="empty-state">Standings aren't available yet.</div>`;let r=s.team_abbr??t?.attributes?.team_abbr,a=n,l=this._config.standings_rows;if(l&&l<n.length){let o=Math.max(0,n.findIndex(d=>d.code===r)),p=Math.min(Math.max(0,o-Math.floor(l/2)),n.length-l);a=n.slice(p,p+l)}return h`
      <div class="head">
        <span class="eyebrow">${t?.attributes?.competition??"EuroLeague"} standings</span>
        <span class="pill">${t?.attributes?.round?`After round ${t.attributes.round}`:""}</span>
      </div>
      <div class="standings" role="table">
        <div class="srow header" role="row">
          <span>#</span><span>Team</span><span class="num">W-L</span><span class="num">+/−</span
          ><span class="num">Last 5</span>
        </div>
        ${a.map(o=>h`<div class="srow ${o.code===r?"me":""}" role="row">
            <span class="pos ${o.zone??""}">${o.position}</span>
            <span class="tn">${o.crest&&!this._broken.has(o.crest)?this._crest(o.crest,o.code,""):u}<span
                >${o.name}</span
              ></span>
            <span class="num">${o.wins}-${o.losses}</span>
            <span class="num">${H(o.point_diff)}</span>
            ${this._form(o.last5,!0)}
          </div>`)}
      </div>
      <div class="legend">
        <span><i style="background:var(--elt-zone-playoffs)"></i>Playoffs (1–6)</span>
        <span><i style="background:var(--elt-zone-playin)"></i>Play-in (7–10)</span>
      </div>
    `}_renderStats(s){let t=this._state(this._statsId()),n=t?.attributes?.per_game??{},r=t?.attributes?.team_leader_ranks??[],a=t?.attributes?.league_leaders??{},l=(d,c,g=1)=>h`<div class="tile">
        <div class="k">${d}</div>
        <div class="v">${typeof c=="number"?c.toFixed(g):"\u2013"}</div>
      </div>`,o={points:"Points",rebounds:"Rebounds",assists:"Assists",pir:"PIR",steals:"Steals",blocks:"Blocks"},p=["points","rebounds","assists"].map(d=>a[d]?.[0]&&`${o[d]}: ${a[d][0].name} (${a[d][0].team}) ${a[d][0].value}`).filter(Boolean).join(" \xB7 ");return h`
      <div class="head">
        <span class="eyebrow">${s.team_name??""} · ${xt(t?.attributes?.season)}</span>
        <span class="pill">${n.games_played?`${n.games_played} games`:""}</span>
      </div>
      ${Object.keys(n).length?h`<div class="tiles">
            ${l("Points",n.points)} ${l("Rebounds",n.rebounds)} ${l("Assists",n.assists)}
            ${l("2P%",n.fg2_pct)} ${l("3P%",n.fg3_pct)} ${l("PIR",n.pir,0)}
            ${l("Steals",n.steals)} ${l("Turnovers",n.turnovers)} ${l("FT%",n.ft_pct)}
          </div>`:h`<div class="empty-state">Season stats aren't available yet.</div>`}
      ${r.length?h`<div>
            <div class="section-title">League leaders · your players</div>
            <div class="ranks">
              ${r.slice(0,5).map(d=>h`<span><b>${d.name}</b></span><span class="cat">${o[d.category]??d.category}</span
                  ><span><span class="rank">${d.rank}${nt(d.rank)}</span> · ${d.value}</span>`)}
            </div>
            ${p?h`<div class="foot" style="margin-top:6px">${p}</div>`:u}
          </div>`:u}
      ${this._config.show_shot_chart!==!1?this._renderShots(s):u}
    `}_renderShots(s){let t=s.shots?.team??[];if(!t.length)return u;let n=t.filter(p=>p[2]).length,r=t.filter(p=>p[3]===2),a=t.filter(p=>p[3]===3),l=p=>`${p.filter(d=>d[2]).length}/${p.length}`,o=`${s.team_name} shot chart vs ${s.opponent_name}: ${n} of ${t.length} field goals, ${l(r)} twos, ${l(a)} threes`;return h`<div>
      <div class="head" style="margin-bottom:6px">
        <span class="section-title" style="margin:0">Shot chart · ${s.team_homeaway==="away"?"@":"vs"} ${s.opponent_abbr}</span>
        <span style="font-size:13px">${n}/${t.length} FG</span>
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
        ${t.map(([p,d,c])=>c?et`<circle class="made" cx=${p} cy=${d} r="26"></circle>`:et`<circle class="miss" cx=${p} cy=${d} r="22"></circle>`)}
      </svg>
      <div class="shot-legend">
        <span><span class="m"></span>Made</span><span><span class="x"></span>Missed</span>
        <span class="sum">2P ${l(r)} · 3P ${l(a)}</span>
      </div>
    </div>`}};F.styles=At,F.properties={hass:{attribute:!1},_config:{state:!0},_tab:{state:!0},_broken:{state:!0}};customElements.get("euroleague-tracker-card")||customElements.define("euroleague-tracker-card",F);window.customCards=window.customCards||[];window.customCards.some(i=>i.type==="euroleague-tracker-card")||window.customCards.push({type:"euroleague-tracker-card",name:"EuroLeague Tracker",description:"Live score, next game, standings and stats for your EuroLeague team.",preview:!0,documentationURL:"https://github.com/Big-Edge2297/ha-euroleague-tracker"});console.info(`%c EUROLEAGUE-TRACKER-CARD %c ${jt} `,"background:#C62828;color:#fff","");export{F as EuroLeagueTrackerCard};
