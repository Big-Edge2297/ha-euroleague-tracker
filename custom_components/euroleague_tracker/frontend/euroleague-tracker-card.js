var q=globalThis,Z=q.ShadowRoot&&(q.ShadyCSS===void 0||q.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,et=Symbol(),bt=new WeakMap,j=class{constructor(s,e,t){if(this._$cssResult$=!0,t!==et)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=s,this.t=e}get styleSheet(){let s=this.o,e=this.t;if(Z&&s===void 0){let t=e!==void 0&&e.length===1;t&&(s=bt.get(e)),s===void 0&&((this.o=s=new CSSStyleSheet).replaceSync(this.cssText),t&&bt.set(e,s))}return s}toString(){return this.cssText}},$t=c=>new j(typeof c=="string"?c:c+"",void 0,et),st=(c,...s)=>{let e=c.length===1?c[0]:s.reduce((t,a,n)=>t+(i=>{if(i._$cssResult$===!0)return i.cssText;if(typeof i=="number")return i;throw Error("Value passed to 'css' function must be a 'css' function result: "+i+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(a)+c[n+1],c[0]);return new j(e,c,et)},vt=(c,s)=>{if(Z)c.adoptedStyleSheets=s.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of s){let t=document.createElement("style"),a=q.litNonce;a!==void 0&&t.setAttribute("nonce",a),t.textContent=e.cssText,c.appendChild(t)}},at=Z?c=>c:c=>c instanceof CSSStyleSheet?(s=>{let e="";for(let t of s.cssRules)e+=t.cssText;return $t(e)})(c):c;var{is:Ut,defineProperty:Ht,getOwnPropertyDescriptor:Bt,getOwnPropertyNames:Wt,getOwnPropertySymbols:Vt,getPrototypeOf:Gt}=Object,K=globalThis,_t=K.trustedTypes,qt=_t?_t.emptyScript:"",Zt=K.reactiveElementPolyfillSupport,U=(c,s)=>c,nt={toAttribute(c,s){switch(s){case Boolean:c=c?qt:null;break;case Object:case Array:c=c==null?c:JSON.stringify(c)}return c},fromAttribute(c,s){let e=c;switch(s){case Boolean:e=c!==null;break;case Number:e=c===null?null:Number(c);break;case Object:case Array:try{e=JSON.parse(c)}catch{e=null}}return e}},yt=(c,s)=>!Ut(c,s),xt={attribute:!0,type:String,converter:nt,reflect:!1,useDefault:!1,hasChanged:yt};Symbol.metadata??=Symbol("metadata"),K.litPropertyMetadata??=new WeakMap;var z=class extends HTMLElement{static addInitializer(s){this._$Ei(),(this.l??=[]).push(s)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(s,e=xt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(s)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(s,e),!e.noAccessor){let t=Symbol(),a=this.getPropertyDescriptor(s,t,e);a!==void 0&&Ht(this.prototype,s,a)}}static getPropertyDescriptor(s,e,t){let{get:a,set:n}=Bt(this.prototype,s)??{get(){return this[e]},set(i){this[e]=i}};return{get:a,set(i){let o=a?.call(this);n?.call(this,i),this.requestUpdate(s,o,t)},configurable:!0,enumerable:!0}}static getPropertyOptions(s){return this.elementProperties.get(s)??xt}static _$Ei(){if(this.hasOwnProperty(U("elementProperties")))return;let s=Gt(this);s.finalize(),s.l!==void 0&&(this.l=[...s.l]),this.elementProperties=new Map(s.elementProperties)}static finalize(){if(this.hasOwnProperty(U("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(U("properties"))){let e=this.properties,t=[...Wt(e),...Vt(e)];for(let a of t)this.createProperty(a,e[a])}let s=this[Symbol.metadata];if(s!==null){let e=litPropertyMetadata.get(s);if(e!==void 0)for(let[t,a]of e)this.elementProperties.set(t,a)}this._$Eh=new Map;for(let[e,t]of this.elementProperties){let a=this._$Eu(e,t);a!==void 0&&this._$Eh.set(a,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(s){let e=[];if(Array.isArray(s)){let t=new Set(s.flat(1/0).reverse());for(let a of t)e.unshift(at(a))}else s!==void 0&&e.push(at(s));return e}static _$Eu(s,e){let t=e.attribute;return t===!1?void 0:typeof t=="string"?t:typeof s=="string"?s.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(s=>this.enableUpdating=s),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(s=>s(this))}addController(s){(this._$EO??=new Set).add(s),this.renderRoot!==void 0&&this.isConnected&&s.hostConnected?.()}removeController(s){this._$EO?.delete(s)}_$E_(){let s=new Map,e=this.constructor.elementProperties;for(let t of e.keys())this.hasOwnProperty(t)&&(s.set(t,this[t]),delete this[t]);s.size>0&&(this._$Ep=s)}createRenderRoot(){let s=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return vt(s,this.constructor.elementStyles),s}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(s=>s.hostConnected?.())}enableUpdating(s){}disconnectedCallback(){this._$EO?.forEach(s=>s.hostDisconnected?.())}attributeChangedCallback(s,e,t){this._$AK(s,t)}_$ET(s,e){let t=this.constructor.elementProperties.get(s),a=this.constructor._$Eu(s,t);if(a!==void 0&&t.reflect===!0){let n=(t.converter?.toAttribute!==void 0?t.converter:nt).toAttribute(e,t.type);this._$Em=s,n==null?this.removeAttribute(a):this.setAttribute(a,n),this._$Em=null}}_$AK(s,e){let t=this.constructor,a=t._$Eh.get(s);if(a!==void 0&&this._$Em!==a){let n=t.getPropertyOptions(a),i=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:nt;this._$Em=a;let o=i.fromAttribute(e,n.type);this[a]=o??this._$Ej?.get(a)??o,this._$Em=null}}requestUpdate(s,e,t,a=!1,n){if(s!==void 0){let i=this.constructor;if(a===!1&&(n=this[s]),t??=i.getPropertyOptions(s),!((t.hasChanged??yt)(n,e)||t.useDefault&&t.reflect&&n===this._$Ej?.get(s)&&!this.hasAttribute(i._$Eu(s,t))))return;this.C(s,e,t)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(s,e,{useDefault:t,reflect:a,wrapped:n},i){t&&!(this._$Ej??=new Map).has(s)&&(this._$Ej.set(s,i??e??this[s]),n!==!0||i!==void 0)||(this._$AL.has(s)||(this.hasUpdated||t||(e=void 0),this._$AL.set(s,e)),a===!0&&this._$Em!==s&&(this._$Eq??=new Set).add(s))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let s=this.scheduleUpdate();return s!=null&&await s,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[a,n]of this._$Ep)this[a]=n;this._$Ep=void 0}let t=this.constructor.elementProperties;if(t.size>0)for(let[a,n]of t){let{wrapped:i}=n,o=this[a];i!==!0||this._$AL.has(a)||o===void 0||this.C(a,void 0,n,o)}}let s=!1,e=this._$AL;try{s=this.shouldUpdate(e),s?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(t){throw s=!1,this._$EM(),t}s&&this._$AE(e)}willUpdate(s){}_$AE(s){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(s)),this.updated(s)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(s){return!0}update(s){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(s){}firstUpdated(s){}};z.elementStyles=[],z.shadowRootOptions={mode:"open"},z[U("elementProperties")]=new Map,z[U("finalized")]=new Map,Zt?.({ReactiveElement:z}),(K.reactiveElementVersions??=[]).push("2.1.2");var dt=globalThis,wt=c=>c,Q=dt.trustedTypes,At=Q?Q.createPolicy("lit-html",{createHTML:c=>c}):void 0,Pt="$lit$",C=`lit$${Math.random().toFixed(9).slice(2)}$`,Tt="?"+C,Kt=`<${Tt}>`,L=document,B=()=>L.createComment(""),W=c=>c===null||typeof c!="object"&&typeof c!="function",ht=Array.isArray,Qt=c=>ht(c)||typeof c?.[Symbol.iterator]=="function",rt=`[ 	
\f\r]`,H=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,kt=/-->/g,St=/>/g,R=RegExp(`>|${rt}(?:([^\\s"'>=/]+)(${rt}*=${rt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),zt=/'/g,Et=/"/g,Ft=/^(?:script|style|textarea|title)$/i,mt=c=>(s,...e)=>({_$litType$:c,strings:s,values:e}),h=mt(1),E=mt(2),ce=mt(3),N=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),Ct=new WeakMap,M=L.createTreeWalker(L,129);function Rt(c,s){if(!ht(c)||!c.hasOwnProperty("raw"))throw Error("invalid template strings array");return At!==void 0?At.createHTML(s):s}var Jt=(c,s)=>{let e=c.length-1,t=[],a,n=s===2?"<svg>":s===3?"<math>":"",i=H;for(let o=0;o<e;o++){let l=c[o],r,p,d=-1,m=0;for(;m<l.length&&(i.lastIndex=m,p=i.exec(l),p!==null);)m=i.lastIndex,i===H?p[1]==="!--"?i=kt:p[1]!==void 0?i=St:p[2]!==void 0?(Ft.test(p[2])&&(a=RegExp("</"+p[2],"g")),i=R):p[3]!==void 0&&(i=R):i===R?p[0]===">"?(i=a??H,d=-1):p[1]===void 0?d=-2:(d=i.lastIndex-p[2].length,r=p[1],i=p[3]===void 0?R:p[3]==='"'?Et:zt):i===Et||i===zt?i=R:i===kt||i===St?i=H:(i=R,a=void 0);let g=i===R&&c[o+1].startsWith("/>")?" ":"";n+=i===H?l+Kt:d>=0?(t.push(r),l.slice(0,d)+Pt+l.slice(d)+C+g):l+C+(d===-2?o:g)}return[Rt(c,n+(c[e]||"<?>")+(s===2?"</svg>":s===3?"</math>":"")),t]},V=class c{constructor({strings:s,_$litType$:e},t){let a;this.parts=[];let n=0,i=0,o=s.length-1,l=this.parts,[r,p]=Jt(s,e);if(this.el=c.createElement(r,t),M.currentNode=this.el.content,e===2||e===3){let d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(a=M.nextNode())!==null&&l.length<o;){if(a.nodeType===1){if(a.hasAttributes())for(let d of a.getAttributeNames())if(d.endsWith(Pt)){let m=p[i++],g=a.getAttribute(d).split(C),y=/([.?@])?(.*)/.exec(m);l.push({type:1,index:n,name:y[2],strings:g,ctor:y[1]==="."?ot:y[1]==="?"?lt:y[1]==="@"?ct:D}),a.removeAttribute(d)}else d.startsWith(C)&&(l.push({type:6,index:n}),a.removeAttribute(d));if(Ft.test(a.tagName)){let d=a.textContent.split(C),m=d.length-1;if(m>0){a.textContent=Q?Q.emptyScript:"";for(let g=0;g<m;g++)a.append(d[g],B()),M.nextNode(),l.push({type:2,index:++n});a.append(d[m],B())}}}else if(a.nodeType===8)if(a.data===Tt)l.push({type:2,index:n});else{let d=-1;for(;(d=a.data.indexOf(C,d+1))!==-1;)l.push({type:7,index:n}),d+=C.length-1}n++}}static createElement(s,e){let t=L.createElement("template");return t.innerHTML=s,t}};function O(c,s,e=c,t){if(s===N)return s;let a=t!==void 0?e._$Co?.[t]:e._$Cl,n=W(s)?void 0:s._$litDirective$;return a?.constructor!==n&&(a?._$AO?.(!1),n===void 0?a=void 0:(a=new n(c),a._$AT(c,e,t)),t!==void 0?(e._$Co??=[])[t]=a:e._$Cl=a),a!==void 0&&(s=O(c,a._$AS(c,s.values),a,t)),s}var it=class{constructor(s,e){this._$AV=[],this._$AN=void 0,this._$AD=s,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(s){let{el:{content:e},parts:t}=this._$AD,a=(s?.creationScope??L).importNode(e,!0);M.currentNode=a;let n=M.nextNode(),i=0,o=0,l=t[0];for(;l!==void 0;){if(i===l.index){let r;l.type===2?r=new G(n,n.nextSibling,this,s):l.type===1?r=new l.ctor(n,l.name,l.strings,this,s):l.type===6&&(r=new pt(n,this,s)),this._$AV.push(r),l=t[++o]}i!==l?.index&&(n=M.nextNode(),i++)}return M.currentNode=L,a}p(s){let e=0;for(let t of this._$AV)t!==void 0&&(t.strings!==void 0?(t._$AI(s,t,e),e+=t.strings.length-2):t._$AI(s[e])),e++}},G=class c{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(s,e,t,a){this.type=2,this._$AH=u,this._$AN=void 0,this._$AA=s,this._$AB=e,this._$AM=t,this.options=a,this._$Cv=a?.isConnected??!0}get parentNode(){let s=this._$AA.parentNode,e=this._$AM;return e!==void 0&&s?.nodeType===11&&(s=e.parentNode),s}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(s,e=this){s=O(this,s,e),W(s)?s===u||s==null||s===""?(this._$AH!==u&&this._$AR(),this._$AH=u):s!==this._$AH&&s!==N&&this._(s):s._$litType$!==void 0?this.$(s):s.nodeType!==void 0?this.T(s):Qt(s)?this.k(s):this._(s)}O(s){return this._$AA.parentNode.insertBefore(s,this._$AB)}T(s){this._$AH!==s&&(this._$AR(),this._$AH=this.O(s))}_(s){this._$AH!==u&&W(this._$AH)?this._$AA.nextSibling.data=s:this.T(L.createTextNode(s)),this._$AH=s}$(s){let{values:e,_$litType$:t}=s,a=typeof t=="number"?this._$AC(s):(t.el===void 0&&(t.el=V.createElement(Rt(t.h,t.h[0]),this.options)),t);if(this._$AH?._$AD===a)this._$AH.p(e);else{let n=new it(a,this),i=n.u(this.options);n.p(e),this.T(i),this._$AH=n}}_$AC(s){let e=Ct.get(s.strings);return e===void 0&&Ct.set(s.strings,e=new V(s)),e}k(s){ht(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,t,a=0;for(let n of s)a===e.length?e.push(t=new c(this.O(B()),this.O(B()),this,this.options)):t=e[a],t._$AI(n),a++;a<e.length&&(this._$AR(t&&t._$AB.nextSibling,a),e.length=a)}_$AR(s=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);s!==this._$AB;){let t=wt(s).nextSibling;wt(s).remove(),s=t}}setConnected(s){this._$AM===void 0&&(this._$Cv=s,this._$AP?.(s))}},D=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(s,e,t,a,n){this.type=1,this._$AH=u,this._$AN=void 0,this.element=s,this.name=e,this._$AM=a,this.options=n,t.length>2||t[0]!==""||t[1]!==""?(this._$AH=Array(t.length-1).fill(new String),this.strings=t):this._$AH=u}_$AI(s,e=this,t,a){let n=this.strings,i=!1;if(n===void 0)s=O(this,s,e,0),i=!W(s)||s!==this._$AH&&s!==N,i&&(this._$AH=s);else{let o=s,l,r;for(s=n[0],l=0;l<n.length-1;l++)r=O(this,o[t+l],e,l),r===N&&(r=this._$AH[l]),i||=!W(r)||r!==this._$AH[l],r===u?s=u:s!==u&&(s+=(r??"")+n[l+1]),this._$AH[l]=r}i&&!a&&this.j(s)}j(s){s===u?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,s??"")}},ot=class extends D{constructor(){super(...arguments),this.type=3}j(s){this.element[this.name]=s===u?void 0:s}},lt=class extends D{constructor(){super(...arguments),this.type=4}j(s){this.element.toggleAttribute(this.name,!!s&&s!==u)}},ct=class extends D{constructor(s,e,t,a,n){super(s,e,t,a,n),this.type=5}_$AI(s,e=this){if((s=O(this,s,e,0)??u)===N)return;let t=this._$AH,a=s===u&&t!==u||s.capture!==t.capture||s.once!==t.once||s.passive!==t.passive,n=s!==u&&(t===u||a);a&&this.element.removeEventListener(this.name,this,t),n&&this.element.addEventListener(this.name,this,s),this._$AH=s}handleEvent(s){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,s):this._$AH.handleEvent(s)}},pt=class{constructor(s,e,t){this.element=s,this.type=6,this._$AN=void 0,this._$AM=e,this.options=t}get _$AU(){return this._$AM._$AU}_$AI(s){O(this,s)}};var Xt=dt.litHtmlPolyfillSupport;Xt?.(V,G),(dt.litHtmlVersions??=[]).push("3.3.3");var Mt=(c,s,e)=>{let t=e?.renderBefore??s,a=t._$litPart$;if(a===void 0){let n=e?.renderBefore??null;t._$litPart$=a=new G(s.insertBefore(B(),n),n,void 0,e??{})}return a._$AI(c),a};var gt=globalThis,P=class extends z{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let s=super.createRenderRoot();return this.renderOptions.renderBefore??=s.firstChild,s}update(s){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(s),this._$Do=Mt(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return N}};P._$litElement$=!0,P.finalized=!0,gt.litElementHydrateSupport?.({LitElement:P});var Yt=gt.litElementPolyfillSupport;Yt?.({LitElement:P});(gt.litElementVersions??=[]).push("4.2.2");function k(c){return c%100>=11&&c%100<=13?"th":{1:"st",2:"nd",3:"rd"}[c%10]??"th"}function ut(c){let s=/^[A-Z](\d{4})$/.exec(c??"");if(!s)return c??"";let e=Number(s[1]);return`${e}-${String((e+1)%100).padStart(2,"0")}`}function J(c){return c!==c.toUpperCase()?c:c.toLowerCase().replace(/(^|[\s\-/(])(\p{L})/gu,(s,e,t)=>e+t.toUpperCase())}function S(c){return typeof c!="number"?"\u2013":c>0?`+${c}`:`${c}`.replace("-","\u2212")}var Lt=st`
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
  .pill.live,
  .pill.countdown {
    background: var(--elt-accent);
    color: var(--elt-accent-fg);
  }
  .compare .lead {
    font-weight: 700;
    color: var(--elt-fg);
  }
  .compare .trail {
    color: var(--elt-fg2);
  }
  .compare .lead .chip,
  .compare .trail .chip {
    font-weight: 700;
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
    box-shadow: inset 3px 0 0 var(--elt-accent);
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
  .day {
    font-size: 12px;
    color: var(--elt-fg2);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin: 4px 0 2px;
  }
  .bgame.timed {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 2px 8px;
  }
  .bgame.timed .side {
    grid-column: 1;
  }
  .bgame .t {
    grid-column: 2;
    grid-row: 1 / span 2;
    font-size: 13px;
    color: var(--elt-fg2);
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
  .bgame .t.live {
    color: var(--elt-accent);
    font-weight: 700;
  }
  @container (max-width: 340px) {
    .board {
      grid-template-columns: minmax(0, 1fr);
    }
  }
  .cutline {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: var(--elt-fg2);
    margin: 2px 0;
  }
  .cutline span {
    flex: 1;
    border-top: 1px dashed var(--elt-muted);
  }
  .tile.race.clinched .v {
    color: var(--elt-accent);
  }
  .tile.race.eliminated .v {
    color: var(--elt-fg2);
  }
  .tile .note:empty {
    display: none;
  }
  .series {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .series-status {
    font-size: 15px;
  }
  .series-games {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 6px;
  }
  .sg {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 6px 0;
    border-radius: 6px;
    background: var(--elt-surface);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }
  .series .sg {
    background: var(--elt-bg);
  }
  .sg.current {
    box-shadow: inset 0 0 0 2px var(--elt-accent);
  }
  .sg .n {
    color: var(--elt-fg2);
  }
  .sg .r {
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }
  .sg.none {
    background: transparent !important;
    border: 1px dashed var(--elt-divider);
  }
  .sg.none .r {
    font-weight: 400;
    font-size: 11px;
    color: var(--elt-muted);
  }
  .bgrid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
  }
  .bgrid.three {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .bbox {
    background: var(--elt-surface);
    border-radius: 8px;
    padding: 7px 9px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }
  .bbox.me {
    box-shadow: inset 3px 0 0 var(--elt-accent);
  }
  .bbox .bl {
    font-size: 11px;
    color: var(--elt-fg2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .bside {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-variant-numeric: tabular-nums;
  }
  .bside.w {
    font-weight: 700;
  }
  .bside.dim {
    color: var(--elt-fg2);
  }
  .bside .seed {
    width: 14px;
    font-size: 11px;
    font-weight: 400;
    color: var(--elt-fg2);
    text-align: right;
  }
  .bside .c {
    flex: 1;
  }
  .bgrid.three .mini-crest {
    display: none;
  }
  ha-card.compact-card {
    padding: 10px 14px;
    cursor: pointer;
    justify-content: center;
    min-height: 56px;
    box-sizing: border-box;
  }
  ha-card.compact-card:focus-visible {
    outline: 2px solid var(--elt-accent);
  }
  .compact {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }
  .compact .crests {
    display: flex;
    gap: 4px;
    flex: none;
  }
  .c-crest {
    width: 32px;
    height: 32px;
    object-fit: contain;
    border-radius: 50%;
    background: var(--elt-crest-plate);
    padding: 3px;
    box-sizing: border-box;
  }
  .c-crest.fallback {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    background: var(--elt-surface);
  }
  .compact .cm {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  .compact .cmain {
    font-size: 15px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-variant-numeric: tabular-nums;
  }
  .compact .score-line {
    font-size: 17px;
  }
  .compact .score-line b {
    font-weight: 700;
  }
  .compact .score-line b.trailing {
    color: var(--elt-fg2);
  }
  .compact .cs {
    font-size: 12px;
    color: var(--elt-fg2);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
`;function Y(c){let s=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c.trim());if(!s)return null;let e=s[1];e.length===3&&(e=e.split("").map(a=>a+a).join(""));let t=parseInt(e,16);return[t>>16&255,t>>8&255,t&255]}function Ot(c){let s=Y(c);if(!s)return .2;let[e,t,a]=s.map(n=>{let i=n/255;return i<=.03928?i/12.92:((i+.055)/1.055)**2.4});return .2126*e+.7152*t+.0722*a}function X(c){let s=Ot(c),e=1.05/(s+.05),t=(s+.05)/.0625;return e>=t?"#FFFFFF":"#111111"}function I(c,s){let e=Y(c)??[128,128,128];return`rgba(${e[0]}, ${e[1]}, ${e[2]}, ${s})`}function te(c,s,e){let t=Y(c)??[128,128,128],a=Y(s)??[128,128,128];return`#${t.map((i,o)=>Math.round(i+(a[o]-i)*e)).map(i=>i.toString(16).padStart(2,"0")).join("")}`}function Nt(c,s){let e=Ot(c);return s<.1&&e<.03?"#8C8C8C":s>.8&&e>.85?"#5C5C5C":c}function Dt(c,s){let e={"--elt-crest-plate":"rgba(255, 255, 255, 0.92)","--elt-win-bg":"#2E7D32","--elt-win-fg":"#FFFFFF","--elt-zone-playoffs":"#3F63A8","--elt-zone-playin":"#93681C","--elt-zone-fg":"#FFFFFF"};switch(c){case"dark":{let t=Nt(s,.012);return{...e,"--elt-bg":"#1C1C1C","--elt-fg":"#E8E8E8","--elt-fg2":"#A8A8A8","--elt-muted":"#6E6E6E","--elt-surface":"#262626","--elt-divider":"#333333","--elt-loss-bg":"#424242","--elt-loss-fg":"#E0E0E0","--elt-bar-other":"#5A5A5A","--elt-other":"#5B8DEF","--elt-surface-solid":"#262626","--elt-accent":t,"--elt-accent-fg":X(t)}}case"light":{let t=Nt(s,1);return{...e,"--elt-crest-plate":"transparent","--elt-bg":"#FFFFFF","--elt-fg":"#1F1F1F","--elt-fg2":"#5C5C5C","--elt-muted":"#8A8A8A","--elt-surface":"#F2F2F2","--elt-divider":"#E3E3E3","--elt-loss-bg":"#DDDDDD","--elt-loss-fg":"#333333","--elt-bar-other":"#C7C7C7","--elt-other":"#2F6BD9","--elt-surface-solid":"#F2F2F2","--elt-accent":t,"--elt-accent-fg":X(t)}}case"team":{let t=X(s);return{...e,"--elt-bg":s,"--elt-fg":t,"--elt-fg2":I(t,.8),"--elt-muted":I(t,.55),"--elt-surface":I(t,.12),"--elt-divider":I(t,.22),"--elt-loss-bg":I(t,.22),"--elt-loss-fg":t,"--elt-win-bg":t,"--elt-win-fg":s,"--elt-bar-other":I(t,.3),"--elt-other":t==="#FFFFFF"?"rgba(0, 0, 0, 0.38)":"rgba(255, 255, 255, 0.55)","--elt-surface-solid":te(s,t,.12),"--elt-accent":t,"--elt-accent-fg":s}}default:return{...e,"--elt-bg":"var(--ha-card-background, var(--card-background-color, #fff))","--elt-fg":"var(--primary-text-color, #212121)","--elt-fg2":"var(--secondary-text-color, #727272)","--elt-muted":"var(--disabled-text-color, #9e9e9e)","--elt-surface":"color-mix(in srgb, var(--primary-text-color, #212121) 7%, transparent)","--elt-divider":"var(--divider-color, rgba(0,0,0,.12))","--elt-loss-bg":"color-mix(in srgb, var(--primary-text-color, #212121) 20%, transparent)","--elt-loss-fg":"var(--primary-text-color, #212121)","--elt-bar-other":"color-mix(in srgb, var(--primary-text-color, #212121) 30%, transparent)","--elt-other":"var(--info-color, #2F6BD9)","--elt-surface-solid":"color-mix(in srgb, var(--primary-text-color, #212121) 7%, var(--ha-card-background, var(--card-background-color, #fff)))","--elt-accent":s,"--elt-accent-fg":X(s)}}}var ee=(()=>{try{return new URL(import.meta.url).searchParams.get("v")??"dev"}catch{return"dev"}})(),se="Data provided by the EuroLeague API",It=["PI","PO","FF"],ae={entity:"Game sensor",view:"What to show",theme:"Theme",team_color:"Team colour (hex, optional)",play_by_play_rows:"Play-by-play rows",standings_rows:"Standings rows",standings_entity:"Standings sensor (optional, found automatically)",stats_entity:"Stats sensor (optional, found automatically)",show_shot_chart:"Show the shot chart after a game",show_round_tab:"Show the Round tab"},tt={points:"Points",rebounds:"Rebounds",assists:"Assists",steals:"Steals",turnovers:"Turnovers",blocks:"Blocks",pir:"PIR",fg2_pct:"2P%",fg3_pct:"3P%",ft_pct:"FT%"},jt=[["rim","At the rim"],["paint","Paint"],["mid_range","Mid-range"],["corner_three","Corner three"],["above_break_three","Above-break three"]],ne=c=>c.split(/\s+/).filter(Boolean).map(s=>s[0]).slice(0,2).join("").toUpperCase(),T=class extends P{constructor(){super(...arguments);this._tab="game";this._statsTab="team";this._standingsTab="bracket";this._round=null;this._broken=new Set;this._moreInfo=()=>{this.dispatchEvent(new CustomEvent("hass-more-info",{detail:{entityId:this._config.entity},bubbles:!0,composed:!0}))}}setConfig(e){if(!e||!e.entity)throw new Error("Choose the game sensor created by EuroLeague Tracker (entity).");this._config={view:"tabs",theme:"auto",play_by_play_rows:4,show_shot_chart:!0,show_round_tab:!0,...e},this._config.view&&this._config.view!=="tabs"&&(this._tab=this._config.view)}getCardSize(){return this._tab==="standings"||this._tab==="stats"?12:this._tab==="round"?9:8}getGridOptions(){return{columns:12,min_columns:6,rows:"auto"}}static getConfigForm(){let e=t=>({select:{mode:"dropdown",options:t.map(([a,n])=>({value:a,label:n}))}});return{schema:[{name:"entity",required:!0,selector:{entity:{domain:"sensor",integration:"euroleague_tracker"}}},{type:"grid",name:"",schema:[{name:"view",selector:e([["tabs","Tabs: game, standings, stats, round"],["game","Game only"],["standings","Standings only"],["stats","Stats only"],["round","Round scoreboard only"]])},{name:"theme",selector:e([["auto","Follow Home Assistant theme"],["dark","Dark"],["light","Light"],["team","Team colours"]])}]},{name:"team_color",selector:{text:{}}},{type:"grid",name:"",schema:[{name:"play_by_play_rows",selector:{number:{min:0,max:10,mode:"box"}}},{name:"standings_rows",selector:{number:{min:4,max:20,mode:"box"}}}]},{type:"grid",name:"",schema:[{name:"show_shot_chart",selector:{boolean:{}}},{name:"show_round_tab",selector:{boolean:{}}}]},{name:"standings_entity",selector:{entity:{domain:"sensor",integration:"euroleague_tracker"}}},{name:"stats_entity",selector:{entity:{domain:"sensor",integration:"euroleague_tracker"}}}],computeLabel:t=>ae[t.name]??t.name}}static getStubConfig(e){return{entity:Object.keys(e?.states??{}).find(a=>{let n=e.states[a].attributes??{};return a.startsWith("sensor.")&&String(n.attribution??"").startsWith(se)&&"game_code"in n})??"",view:"tabs",theme:"auto"}}shouldUpdate(e){if(!e.has("hass")||e.size>1)return!0;let t=e.get("hass");return t?[this._config.entity,this._standingsId(),this._statsId()].some(a=>a&&t.states[a]!==this.hass.states[a]):!0}_state(e){return e?this.hass?.states?.[e]:void 0}_findSibling(e,t){let n=`${this._config.entity.replace(/_game$/,"")}${e}`;if(this._state(n))return n;let i=this._state(this._config.entity)?.attributes?.team_abbr;return Object.keys(this.hass?.states??{}).find(o=>{let l=this.hass.states[o].attributes??{};return o.startsWith("sensor.")&&t in l&&l.team_abbr===i&&l.competition!==void 0})}_standingsId(){return this._config.standings_entity||this._findSibling("_standings_position","table")}_statsId(){return this._config.stats_entity||this._findSibling("_season_stats","per_game")}_teamColor(e){let t=this._config.team_color||e.team_color||e.team_colors?.[0];return/^#[0-9a-f]{3,8}$/i.test(String(t??""))?t:"#C62828"}_locale(){let e=this.hass?.locale?.language||this.hass?.language||"en",t=this.hass?.locale?.time_zone==="local"?void 0:this.hass?.config?.time_zone,a=this.hass?.locale?.time_format;return{lang:e,tz:t,hour12:a==="12"?!0:a==="24"?!1:void 0}}_fmtDay(e){let{lang:t,tz:a}=this._locale();return new Intl.DateTimeFormat(t,{weekday:"short",day:"numeric",month:"short",timeZone:a}).format(new Date(e))}_fmtTime(e){let{lang:t,tz:a,hour12:n}=this._locale();return new Intl.DateTimeFormat(t,{hour:"numeric",minute:"2-digit",timeZone:a,hour12:n}).format(new Date(e))}_crest(e,t,a="crest"){return!e||this._broken.has(e)?h`<div class="crest-fallback" role="img" aria-label=${t}>${t}</div>`:h`<span class="plate ${a?"":"small"}"
      ><img
        class=${a}
        src=${e}
        alt=""
        loading="lazy"
        referrerpolicy="no-referrer"
        @error=${()=>{this._broken=new Set([...this._broken,e])}}
    /></span>`}_form(e,t=!1){return e?.length?h`<span class="form" aria-label=${`Last ${e.length}, oldest first: ${e.join(" ")}`}>
      ${e.map(a=>h`<span class="chip ${a} ${t?"small":""}">${a}</span>`)}
    </span>`:u}render(){if(!this._config||!this.hass)return u;let e=this._state(this._config.entity);if(!e)return h`<ha-card><div class="warning">Entity not found: ${this._config.entity}</div></ha-card>`;let t=e.attributes??{},a=this._config.theme??"auto",n=Dt(a,this._teamColor(t)),i=Object.entries(n).map(([l,r])=>`${l}:${r}`).join(";"),o=this._config.view==="tabs"?this._tab:this._config.view??"game";return this._config.view==="compact"?h`<ha-card style=${i} class="compact-card" @click=${this._moreInfo} tabindex="0" role="button"
        aria-label=${`${t.team_name??"Game"}: more details`} @keydown=${l=>(l.key==="Enter"||l.key===" ")&&this._moreInfo()}
        >${this._renderCompact(e.state,t)}</ha-card
      >`:h`<ha-card style=${i}>
      ${a==="team"&&t.team_logo&&!this._broken.has(t.team_logo)?h`<img
            class="watermark"
            src=${t.team_logo}
            alt=""
            referrerpolicy="no-referrer"
            @error=${()=>this._broken=new Set([...this._broken,t.team_logo])}
          />`:u}
      <div class="content">
        ${this._config.view==="tabs"?this._renderTabs():u}
        ${o==="standings"?this._renderStandings(t):o==="stats"?this._renderStats(t):o==="round"?this._renderRound(t):this._renderGame(e.state,t)}
      </div>
    </ha-card>`}_renderTabs(){let e=[["game","Game"],["standings","Standings"],["stats","Stats"]];return this._config.show_round_tab!==!1&&e.push(["round","Round"]),h`<div class="tabs" role="tablist">
      ${e.map(([t,a])=>h`<button role="tab" aria-selected=${this._tab===t?"true":"false"} @click=${()=>this._tab=t}>
            ${a}
          </button>`)}
    </div>`}_renderGame(e,t){if(e==="NOT_FOUND"||!t.team_abbr)return h`<div class="empty-state">${t.api_message??"No game found for this team."}</div>`;let a=t.competition??"EuroLeague",n=t.round_name??(t.round?`Round ${t.round}`:""),i;if(e==="IN")i=h`<span class="pill live"><span class="dot"></span>LIVE${t.clock?` \xB7 ${t.clock}`:""}</span>`;else if(e==="POST"){let o=t.team_winner===!0;i=h`<span class="pill ${o?"win":"loss"}">${t.clock??"Final"} · ${o?"W":"L"}</span>`}else i=h`<span class="pill countdown">${t.kickoff_in??""}</span>`;return h`
      <div class="head">
        <span class="eyebrow"
          >${It.includes(t.phase_code)&&n?n:`${a}${n?` \xB7 ${n}`:""}`}</span
        >
        ${i}
      </div>
      ${this._renderMatchup(e,t)} ${this._renderSeries(e,t)}
      ${e==="PRE"?t.phase_code==="FF"?this._renderRoad(t):this._renderPreCompare(t):this._renderQuarters(e,t)}
      ${e==="PRE"?this._renderH2H(t):this._renderFlow(e,t)}
      ${e==="IN"?this._renderPlays(t):u}
      ${e!=="PRE"?this._renderPlayers(e,t):u}
      ${e==="POST"?this._renderBars(t):u}
      ${e==="POST"&&this._config.show_shot_chart!==!1?this._renderShots(t):u}
      ${this._renderFoot(e,t)}
    `}_side(e,t){return{code:e[`${t}_abbr`],name:e[`${t}_name`],logo:e[`${t}_logo`],record:e[`${t}_record`],position:e[`${t}_position`],homeaway:e[`${t}_homeaway`],score:e[`${t}_score`],seed:e[`${t}_seed`]}}_renderMatchup(e,t){let a=this._side(t,"team"),n=this._side(t,"opponent"),[i,o]=a.homeaway==="away"?[n,a]:[a,n],l=d=>{if(d.seed&&It.includes(t.phase_code)){let m=`${d.seed}${k(d.seed)} seed`;return t.neutral_site?m:[m,d.homeaway==="home"?"Home":"Away"].join(" \xB7 ")}return e==="PRE"?[d.position?`${d.position}${k(d.position)}`:null,d.record].filter(Boolean).join(" \xB7 "):[d.record,d.homeaway==="home"?"Home":"Away"].filter(Boolean).join(" \xB7 ")},r=d=>h`<div class="team">
      ${this._crest(d.logo,d.code)}
      <div class="team-name" title=${d.name}>${d.name}</div>
      <div class="team-sub">${l(d)}</div>
    </div>`,p;if(e==="PRE"&&t.date)p=h`<div class="when">
        <span class="day">${this._fmtDay(t.date)}</span>
        <span class="time">${this._fmtTime(t.date)}</span>
      </div>`;else{let d=i.score??0,m=o.score??0;p=h`<div class="score" aria-label=${`${i.name} ${d}, ${o.name} ${m}`}>
        <span class=${d<m?"trailing":""}>${d}</span><span class="sep">–</span><span class=${m<d?"trailing":""}
          >${m}</span
        >
      </div>`}return h`<div class="matchup">${r(i)}${p}${r(o)}</div>`}_renderQuarters(e,t){let a=t.quarter_scores;if(!a?.team?.length&&!a?.opponent?.length)return u;let n=Math.max(4,a.team?.length??0,a.opponent?.length??0),i=Array.from({length:n},(m,g)=>g<4?`Q${g+1}`:n>5?`OT${g-3}`:"OT"),o=e==="IN"?(t.quarter??0)-1:-1,l=this._side(t,"team"),r=this._side(t,"opponent"),p=l.homeaway==="away"?[[r,a.opponent],[l,a.team]]:[[l,a.team],[r,a.opponent]],d=`grid-template-columns: 1.3fr repeat(${n}, minmax(0, 1fr))`;return h`<div class="panel quarters" style=${d}>
      <span></span>
      ${i.map((m,g)=>h`<span class="label ${g===o?"current":""}">${m}</span>`)}
      ${p.map(([m,g])=>h`<span class="name">${m.code}</span>
          ${i.map((y,$)=>g?.[$]===void 0||g?.[$]===null?h`<span class="empty">–</span>`:h`<span class=${$===o?"current":""}>${g[$]}</span>`)}`)}
    </div>`}_renderPreCompare(e){let t=this._state(this._standingsId())?.attributes?.table??[],a=v=>t.find(w=>w.code===v)??{},n=this._side(e,"team"),i=this._side(e,"opponent"),[o,l]=n.homeaway==="away"?[i,n]:[n,i],r=a(o.code),p=a(l.code),d=r.last5??(o===n?e.team_form:e.opponent_form),m=p.last5??(l===n?e.team_form:e.opponent_form);if(!d&&!t.length)return u;let g=(v,w)=>v==null||w==null||v===w?["",""]:v>w?["lead","trail"]:["trail","lead"],y=v=>{let w=/^(\d+)-(\d+)$/.exec(v??"");if(!w)return null;let x=Number(w[1])+Number(w[2]);return x?Number(w[1])/x:null},$=v=>(Array.isArray(v)?v:String(v??"").split("")).filter(w=>w==="W").length,f=g(d?$(d):null,m?$(m):null),b=g(y(r.home_record),y(p.away_record)),_=g(y(r.last10),y(p.last10)),A=g(r.point_diff??null,p.point_diff??null);return h`<div class="panel compare">
      <span class=${f[0]}>${this._form(d)}</span><span class="mid">Last 5</span
      ><span class="r ${f[1]}">${this._form(m)}</span>
      ${t.length?h`<span class=${b[0]}>${r.home_record??"\u2013"}</span><span class="mid">Home / Away</span
            ><span class="r ${b[1]}">${p.away_record??"\u2013"}</span> <span class=${_[0]}>${r.last10??"\u2013"}</span
            ><span class="mid">Last 10</span><span class="r ${_[1]}">${p.last10??"\u2013"}</span>
            <span class=${A[0]}>${S(r.point_diff)}</span><span class="mid">Point diff</span
            ><span class="r ${A[1]}">${S(p.point_diff)}</span>`:u}
    </div>`}_renderPlays(e){let t=this._config.play_by_play_rows??4,a=(e.play_by_play??[]).slice(0,t);return!t||!a.length?u:h`<div>
      <div class="section-title">Play-by-play</div>
      <div class="plays">
        ${a.map(n=>h`<div class="play ${n.scoring?"scoring":""}">
            <span class="t">${n.clock??""}</span><span class="text">${n.text}</span
            ><span class="sc">${n.scoring&&n.score?n.score:""}</span>
          </div>`)}
      </div>
    </div>`}_renderPlayers(e,t){let a=t.top_players?.team??[];if(!a.length)return u;let n=a.slice(0,e==="IN"?3:4);return h`<div>
      <div class="section-title">${e==="IN"?"Leaders":"Top performers"} (PIR)</div>
      <div class="players">
        <span class="h">Player</span><span class="h">PTS</span><span class="h">REB</span><span class="h">AST</span
        ><span class="h">PIR</span>
        ${n.map(i=>h`<span class="pname"><b>${i.name}</b> <span class="num">#${i.number}</span></span>
            <span class="n">${i.points??"\u2013"}</span><span class="n">${i.rebounds??"\u2013"}</span
            ><span class="n">${i.assists??"\u2013"}</span><span class="n">${i.pir??"\u2013"}</span>`)}
      </div>
    </div>`}_renderBars(e){let t=e.game_stats?.team,a=e.game_stats?.opponent;if(!t||!a)return u;let i=[["2P%",t.fg2_pct,a.fg2_pct,`${t.fg2} vs ${a.fg2}`,1],["3P%",t.fg3_pct,a.fg3_pct,`${t.fg3} vs ${a.fg3}`,1],["FT%",t.ft_pct,a.ft_pct,`${t.ft} vs ${a.ft}`,1],["Rebounds",t.rebounds,a.rebounds,"",0],["Assists",t.assists,a.assists,"",0],["Turnovers",t.turnovers,a.turnovers,"",0]].filter(([,o,l])=>typeof o=="number"&&typeof l=="number");return i.length?h`<div>
      <div class="section-title">${e.team_abbr} vs ${e.opponent_abbr}</div>
      <div class="bars">
        ${i.map(([o,l,r,p,d])=>{let m=l+r>0?100*l/(l+r):50;return h`<span class="l">${l.toFixed(d)}</span>
            <div title=${p}>
              <div class="bar-label">${o}</div>
              <div class="bar"><span class="us" style=${`width:${m.toFixed(1)}%`}></span><span class="them"></span></div>
            </div>
            <span>${r.toFixed(d)}</span>`})}
      </div>
    </div>`:u}_renderFoot(e,t){let a=[];return t.neutral_site&&a.push("Neutral venue"),t.venue&&a.push(J(t.venue)),e!=="PRE"&&t.attendance&&a.push(`${Number(t.attendance).toLocaleString(this._locale().lang)} fans`),e==="PRE"&&t.capacity&&a.push(`${Number(t.capacity).toLocaleString(this._locale().lang)} seats`),e==="IN"&&(t.team_fouls??null)!==null&&a.push(`Fouls ${t.team_fouls}\u2013${t.opponent_fouls}`),e==="POST"&&t.next_game?.date&&a.push(`Next: ${t.next_game.homeaway==="home"?"vs":"@"} ${t.next_game.opponent_abbr}, ${this._fmtDay(t.next_game.date)}`),a.length?h`<div class="foot">${a.join(" \xB7 ")}</div>`:u}_renderCompact(e,t){if(e==="NOT_FOUND"||!t.team_abbr)return h`<div class="compact"><div class="cm"><span class="cs">${t.api_message??"No game found."}</span></div></div>`;let a=this._side(t,"team"),n=this._side(t,"opponent"),[i,o]=a.homeaway==="away"?[n,a]:[a,n],l=g=>g.logo&&!this._broken.has(g.logo)?h`<img
            class="c-crest"
            src=${g.logo}
            alt=""
            referrerpolicy="no-referrer"
            @error=${()=>this._broken=new Set([...this._broken,g.logo])}
          />`:h`<span class="c-crest fallback">${g.code}</span>`,r,p,d,m=t.round_name??(t.round?`Round ${t.round}`:"");if(e==="PRE")r=h`<span class="cmain">${i.code} vs ${o.code}</span>`,p=[t.date?`${this._fmtDay(t.date)} \xB7 ${this._fmtTime(t.date)}`:"",m].filter(Boolean).join(" \xB7 "),d=h`<span class="pill countdown">${t.kickoff_in??""}</span>`;else{let g=i.score??0,y=o.score??0;if(r=h`<span class="cmain score-line"
        >${i.code} <b class=${g<y?"trailing":""}>${g}</b> – <b class=${y<g?"trailing":""}>${y}</b> ${o.code}</span
      >`,e==="IN")p=t.last_play??m,d=h`<span class="pill live"><span class="dot"></span>${t.clock??"LIVE"}</span>`;else{let $=t.team_winner===!0;p=t.series?.status??(t.next_game?.date?`Next: ${t.next_game.homeaway==="home"?"vs":"@"} ${t.next_game.opponent_abbr}, ${this._fmtDay(t.next_game.date)}`:m),t.series?.status&&(p=`${m} \xB7 ${p}`),d=h`<span class="pill ${$?"win":"loss"}">Final · ${$?"W":"L"}</span>`}}return h`<div class="compact">
      <div class="crests">${l(i)}${l(o)}</div>
      <div class="cm">${r}<span class="cs">${p}</span></div>
      ${d}
    </div>`}_renderSeries(e,t){let a=t.series;if(!a?.games?.length)return u;let n=a.best_of??5,i=Array.from({length:n},(o,l)=>a.games[l]);return h`<div class="panel series">
      <div class="head">
        <b class="series-status">${a.status}</b>
        <span class="eyebrow">Best of ${n}</span>
      </div>
      <div class="series-games">
        ${i.map((o,l)=>{if(!o)return h`<div class="sg none"><span class="n">G${l+1}</span><span class="r">${a.decided?"not needed":"if needed"}</span></div>`;if(!o.played){let r=o.game_number===a.game_number&&e!=="POST";return h`<div class="sg ${r?"current":""}">
              <span class="n">G${l+1}</span><span class="r">${o.date?this._fmtDay(o.date):""}</span>
            </div>`}return h`<div class="sg ${o.game_number===a.game_number?"current":""}">
            <span class="n">G${l+1}</span
            ><span class="r"><span class="chip small ${o.won?"W":"L"}">${o.won?"W":"L"}</span>${o.team_score}-${o.opponent_score}</span>
          </div>`})}
      </div>
    </div>`}_renderRoad(e){let t=this._state(this._standingsId())?.attributes??{},a=t.bracket??null,n=t.table??[];if(!a)return u;let i=this._side(e,"team"),o=this._side(e,"opponent"),[l,r]=i.homeaway==="away"?[o,i]:[i,o],p=(f,b)=>{if(!b?.played)return"\u2013";let _=b.home===f,A=_?b.away:b.home,[v,w]=_?[b.home_score,b.away_score]:[b.away_score,b.home_score];return`${v>w?"W":"L"} ${v}-${w} ${A}`},d=f=>a.final_four?.semifinals?.find(b=>b.home===f||b.away===f),m=f=>{let b=(a.playoffs??[]).find(v=>v.top?.code===f||v.bottom?.code===f);if(!b)return"\u2013";let[_,A]=b.top.code===f?[b.top,b.bottom]:[b.bottom,b.top];return`${_.wins}-${A?.wins??0} ${A?.code??""}`},g=f=>{let b=n.find(_=>_.code===f);return b?`${b.wins}-${b.losses}`:"\u2013"},$=[.../Championship/.test(e.round_name??"")?[["Semifinal",p(l.code,d(l.code)),p(r.code,d(r.code))]]:[],["Playoffs",m(l.code),m(r.code)],["Regular season",g(l.code),g(r.code)]];return h`<div class="panel compare">
      ${$.map(([f,b,_])=>h`<span>${b}</span><span class="mid">${f}</span><span class="r">${_}</span>`)}
    </div>`}_renderBracket(e){let t=e.bracket,a=e.team_abbr,n=t.seeds??{},i=(r,p,d,m)=>h`<div class="bside ${d?"w":"dim"}">
        <span class="seed">${m??n[r]??""}</span>${this._mini(r,e)}<span class="c">${r}</span
        ><span class="s">${p??""}</span>
      </div>`,o=(r,p)=>h`<div class="bbox ${r.home===a||r.away===a?"me":""}">
        <div class="bl">${p}</div>
        ${i(r.home,r.played?r.home_score:null,r.winner===r.home)}
        ${i(r.away,r.played?r.away_score:null,r.winner===r.away)}
      </div>`,l=t.final_four??{};return h`
      ${t.play_in?.length?h`<div>
            <div class="section-title">Play-in</div>
            <div class="bgrid three">${t.play_in.map(r=>o(r,r.label??"Play-in"))}</div>
          </div>`:u}
      ${t.playoffs?.length?h`<div>
            <div class="section-title">Playoffs · best of ${t.playoffs[0].best_of??5}</div>
            <div class="bgrid">
              ${t.playoffs.map(r=>{let p=r.top?.code===a||r.bottom?.code===a,d=r.winner?`${r.winner} win ${Math.max(r.top.wins,r.bottom?.wins??0)}-${Math.min(r.top.wins,r.bottom?.wins??0)}`:r.top.wins===(r.bottom?.wins??0)?`Tied ${r.top.wins}-${r.top.wins}`:`${r.top.wins>(r.bottom?.wins??0)?r.top.code:r.bottom.code} lead ${Math.max(r.top.wins,r.bottom?.wins??0)}-${Math.min(r.top.wins,r.bottom?.wins??0)}`;return h`<div class="bbox ${p?"me":""}">
                  <div class="bl">Playoff ${r.group} · ${d}</div>
                  ${i(r.top.code,r.top.wins,r.winner===r.top.code,r.top.seed)}
                  ${r.bottom?i(r.bottom.code,r.bottom.wins,r.winner===r.bottom.code,r.bottom.seed):u}
                </div>`})}
            </div>
          </div>`:u}
      ${l.semifinals?.length||l.final?h`<div>
            <div class="head" style="margin-bottom:6px">
              <span class="section-title" style="margin:0">Final Four</span>
              <span class="foot">${l.venue?J(l.venue):""}</span>
            </div>
            <div class="bgrid">${(l.semifinals??[]).map(r=>o(r,`Semifinal${r.date?` \xB7 ${this._fmtShort(r.date)}`:""}`))}</div>
            ${l.final?h`<div style="margin-top:6px">${o(l.final,`Championship game${l.final.date?` \xB7 ${this._fmtShort(l.final.date)}`:""}`)}</div>`:u}
            ${l.third_place?h`<div style="margin-top:6px">${o(l.third_place,"Third place")}</div>`:u}
          </div>`:u}
    `}_roundDays(e){let{lang:t,tz:a}=this._locale(),n=new Intl.DateTimeFormat(t,{weekday:"long",day:"numeric",month:"short",timeZone:a}),i=[];for(let o of e){let l=o.date?n.format(new Date(o.date)):"",r=i.at(-1);r&&r[0]===l?r[1].push(o):i.push([l,[o]])}return i}_fmtRange(e){if(!e.length)return"";let t=[...e].sort(),{lang:a,tz:n}=this._locale(),i=new Intl.DateTimeFormat(a,{day:"numeric",month:"short",timeZone:n}),o=new Date(t.at(0)),l=new Date(t.at(-1));return i.format(o)===i.format(l)?i.format(o):typeof i.formatRange=="function"?i.formatRange(o,l):`${i.format(o)} \u2013 ${i.format(l)}`}_fmtShort(e){let{lang:t,tz:a}=this._locale();return new Intl.DateTimeFormat(t,{day:"numeric",month:"short",timeZone:a}).format(new Date(e))}_mini(e,t){let a=(t.table??[]).find(n=>n.code===e)?.crest??t.scoreboard?.crests?.[e];return a&&!this._broken.has(a)?h`<img
          class="mini-crest"
          src=${a}
          alt=""
          loading="lazy"
          referrerpolicy="no-referrer"
          @error=${()=>this._broken=new Set([...this._broken,a])}
        />`:h`<span class="mini-crest fallback" aria-hidden="true"></span>`}_renderRace(e){let t=e.playoff_race??null;if(!t?.playoffs)return u;let a=(n,i)=>{if(!i)return u;let o=i.games,l=`${Number.isInteger(o)?o:o.toFixed(1)} game${o===1?"":"s"}`,r=i.status==="clinched"?"Clinched":i.status==="eliminated"?"Out of reach":i.inside?o===0?"On the line":`${l} clear`:`${l} behind`,p=i.status==="clinched"||i.status==="eliminated"?"":`${i.inside?"of":""} ${i.line+(i.inside?1:0)}${k(i.line+(i.inside?1:0))} (${i.rival})`;return h`<div class="tile small race ${i.status}">
        <div class="k">${n}</div>
        <div class="v">${r}</div>
        <div class="note">${p.trim()}</div>
      </div>`};return h`<div class="facts" style="margin-top:0">
      ${a("Playoff line",t.playoffs)} ${a("Play-in line",t.play_in)}
      <div class="tile small">
        <div class="k">Games left</div>
        <div class="v">${t.games_remaining}</div>
        <div class="note">${t.last_game_date?`until ${this._fmtShort(t.last_game_date)}`:""}</div>
      </div>
    </div>`}_renderStandings(e){let a=this._state(this._standingsId())?.attributes??{},n=a.table??[],i=a.bracket?.playoffs?.length||a.bracket?.play_in?.length?a.bracket:null;if(!n.length&&!i)return h`<div class="empty-state">Standings aren't available yet.</div>`;let o=i&&this._standingsTab==="bracket",l=i?.champion;return h`
      <div class="head">
        <span class="eyebrow"
          >${a.competition??"EuroLeague"} ${i?`${ut(a.season)} \xB7 postseason`:"standings"}</span
        >
        ${l?h`<span class="pill live">Champion ${l}</span>`:h`<span class="pill">${a.round?`After round ${a.round}`:""}</span>`}
      </div>
      ${i?h`<div class="subtabs" role="tablist">
            ${["bracket","table"].map(r=>h`<button
                  role="tab"
                  aria-selected=${this._standingsTab===r?"true":"false"}
                  @click=${()=>this._standingsTab=r}
                >
                  ${r==="bracket"?"Bracket":"Table"}
                </button>`)}
          </div>`:this._renderRace(a)}
      ${o?this._renderBracket({...a,team_abbr:e.team_abbr??a.team_abbr}):this._renderTable(e,a,n)}
    `}_renderTable(e,t,a){let n=e.team_abbr??t.team_abbr,i=a,o=this._config.standings_rows;if(o&&o<a.length){let r=Math.max(0,a.findIndex(d=>d.code===n)),p=Math.min(Math.max(0,r-Math.floor(o/2)),a.length-o);i=a.slice(p,p+o)}let l=(r,p)=>!i[p+1]||![6,10].includes(r.position)?u:h`<div class="cutline" role="presentation">
        <span></span>${r.position===6?"Playoff line":"Play-in line"}<span></span>
      </div>`;return h`
      <div class="standings" role="table">
        <div class="srow header" role="row">
          <span>#</span><span>Team</span><span class="num">W-L</span><span class="num">+/−</span
          ><span class="num">Last 5</span>
        </div>
        ${i.map((r,p)=>h`<div class="srow ${r.code===n?"me":""}" role="row">
              <span class="pos ${r.zone??""}">${r.position}</span>
              <span class="tn">${r.crest&&!this._broken.has(r.crest)?this._crest(r.crest,r.code,""):u}<span
                  >${r.name}</span
                ></span>
              <span class="num">${r.wins}-${r.losses}</span>
              <span class="num">${S(r.point_diff)}</span>
              ${this._form(r.last5,!0)}
            </div>
            ${l(r,p)}`)}
      </div>
      <div class="legend">
        <span><i style="background:var(--elt-zone-playoffs)"></i>Playoffs (1–6)</span>
        <span><i style="background:var(--elt-zone-playin)"></i>Play-in (7–10)</span>
      </div>
    `}_renderH2H(e){let t=e.head_to_head;if(!t?.meetings?.length)return u;let a=t.wins===t.losses?`Level ${t.wins}-${t.losses}`:`${t.wins>t.losses?e.team_abbr:t.opponent_abbr} leads ${Math.max(t.wins,t.losses)}-${Math.min(t.wins,t.losses)}`;return h`<div>
      <div class="head" style="margin-bottom:4px">
        <span class="section-title" style="margin:0">Head to head · last ${t.meetings.length}</span>
        <span style="font-size:13px">${a}</span>
      </div>
      <div class="h2h">
        ${t.meetings.map(n=>{let[i,o,l,r]=n.homeaway==="home"?[e.team_abbr,n.team_score,t.opponent_abbr,n.opponent_score]:[t.opponent_abbr,n.opponent_score,e.team_abbr,n.team_score];return h`<div class="h2h-row">
            <span class="d">${n.date?this._fmtDate(n.date):""}</span>
            <span
              ><span class=${o>r?"w":"dim"}>${i} ${o}</span> – <span class=${r>o?"w":"dim"}
                >${r} ${l}</span
              ></span
            >
            <span class="chip ${n.won?"W":"L"}">${n.won?"W":"L"}</span>
          </div>`})}
      </div>
      <div class="foot" style="margin-top:6px">Average margin ${S(t.average_margin)}</div>
    </div>`}_fmtDate(e){let{lang:t,tz:a}=this._locale();return new Intl.DateTimeFormat(t,{day:"numeric",month:"short",year:"numeric",timeZone:a}).format(new Date(e))}_renderFlow(e,t){let a=t.score_flow,n=a?.team??[],i=a?.opponent??[];if(n.length<2)return u;let o=n.map((x,F)=>x-(i[F]??0)),l=Math.max(40,o.length-1),r=400,p=140,d=Math.max(5,...o),m=Math.max(5,...o.map(x=>-x)),g=8+(p-16)*d/(d+m),y=(p-16)/(d+m),$=x=>(x/l*r).toFixed(1),f=x=>(g-x*y).toFixed(1),b=o.map((x,F)=>`${$(F)},${f(x)}`).join(" "),_=`M 0,${g.toFixed(1)} L ${o.map((x,F)=>`${$(F)},${f(x)}`).join(" L ")} L ${$(o.length-1)},${g.toFixed(1)} Z`,A=[10,20,30,...l>40?[40]:[]],v=`flow-${t.game_code??"x"}`,w=`Score flow: largest ${t.team_abbr} lead ${a.largest_lead??0}, largest ${t.opponent_abbr} lead ${a.largest_deficit??0}`;return h`<div>
      <div class="head" style="margin-bottom:6px">
        <span class="section-title" style="margin:0">Score flow</span>
        <span class="legend">
          <span><i style="background:var(--elt-accent)"></i>${t.team_abbr} ahead</span>
          <span><i style="background:var(--elt-other)"></i>${t.opponent_abbr} ahead</span>
        </span>
      </div>
      <svg class="chart" viewBox="0 0 ${r} ${p+14}" role="img" aria-label=${w}>
        <defs>
          <clipPath id="${v}-up"><rect x="0" y="0" width=${r} height=${g}></rect></clipPath>
          <clipPath id="${v}-dn"><rect x="0" y=${g} width=${r} height=${p}></rect></clipPath>
        </defs>
        ${A.map(x=>E`<line class="grid" x1=${$(x)} y1="4" x2=${$(x)} y2=${p-4}></line>`)}
        <path d=${_} class="area-up" clip-path="url(#${v}-up)"></path>
        <path d=${_} class="area-down" clip-path="url(#${v}-dn)"></path>
        <line class="zero" x1="0" y1=${g} x2=${r} y2=${g}></line>
        <polyline class="flow" points=${b}></polyline>
        ${[1,2,3,4].map(x=>E`<text class="axis" x=${$(x*10-5)} y=${p+12} text-anchor="middle">Q${x}</text>`)}
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
          <div class="v">${S(o[o.length-1])}</div>
        </div>
      </div>
    </div>`}_renderStats(e){let a=this._state(this._statsId())?.attributes??{},n=a.per_game??{},o=((this._state(this._standingsId())?.attributes??{}).table??[]).find(p=>p.code===(e.team_abbr??a.team_abbr)),l=this._statsTab==="shots"&&a.shot_zones?a.shot_zones.total_games>a.shot_zones.games?`${a.shot_zones.games} of ${a.shot_zones.total_games} games \xB7 ${a.shot_zones.attempts} shots`:`${a.shot_zones.games} games \xB7 ${a.shot_zones.attempts} shots`:this._statsTab==="players"&&o?`${o.wins}-${o.losses} \xB7 ${o.position}${k(o.position)}`:n.games_played?`Per game \xB7 ${n.games_played} GP`:"",r=[["team","Team"],["players","Players"],["shots","Shots"]];return h`
      <div class="head">
        <span class="eyebrow">${e.team_name??""} · ${ut(a.season)}</span>
        <span class="pill">${l}</span>
      </div>
      <div class="subtabs" role="tablist">
        ${r.map(([p,d])=>h`<button
              role="tab"
              aria-selected=${this._statsTab===p?"true":"false"}
              @click=${()=>this._statsTab=p}
            >
              ${d}
            </button>`)}
      </div>
      ${this._statsTab==="players"?this._statsPlayers(a):this._statsTab==="shots"?this._statsShots(a):this._statsTeam(a)}
    `}_statsTeam(e){let t=e.per_game??{},a=e.league_ranks??{},n=e.attack_defence??null;if(!Object.keys(t).length&&!Object.keys(a).length)return h`<div class="empty-state">Season stats aren't available yet.</div>`;let i=[];if(n){let l=m=>`${S(Math.round((m-n.league_average)*10)/10)} vs avg`,r=Math.min(n.allowed,n.scored,n.league_average)-4,p=Math.max(n.allowed,n.scored,n.league_average)+4,d=m=>((m-r)/(p-r)*380+10).toFixed(1);i.push(h`<div class="facts two">
          <div class="tile">
            <div class="k">Attack</div>
            <div class="v">${n.scored.toFixed(1)} <span class="unit">scored</span></div>
            <div class="note">${n.scored_rank}${k(n.scored_rank)} · ${l(n.scored)}</div>
          </div>
          <div class="tile">
            <div class="k">Defence</div>
            <div class="v">${n.allowed.toFixed(1)} <span class="unit">allowed</span></div>
            <div class="note">${n.allowed_rank}${k(n.allowed_rank)} · ${l(n.allowed)}</div>
          </div>
        </div>
        <div>
          <div class="head" style="margin-bottom:2px">
            <span class="section-title" style="margin:0">Attack vs defence</span>
            <span style="font-size:13px">Net <b>${S(n.net)}</b></span>
          </div>
          <svg
            class="chart"
            viewBox="0 0 400 60"
            role="img"
            aria-label=${`Points per game: ${n.scored} scored, ${n.allowed} allowed, league average ${n.league_average}`}
          >
            <line class="track" x1="10" y1="32" x2="390" y2="32"></line>
            <line class="avg" x1=${d(n.league_average)} y1="20" x2=${d(n.league_average)} y2="44"></line>
            <text class="axis" x=${d(n.league_average)} y="58" text-anchor="middle">avg ${n.league_average}</text>
            <line class="span" x1=${d(n.allowed)} y1="32" x2=${d(n.scored)} y2="32"></line>
            <circle class="ring" cx=${d(n.allowed)} cy="32" r="6"></circle>
            <circle class="dot" cx=${d(n.scored)} cy="32" r="6"></circle>
            <text class="label" x=${d(n.allowed)} y="16" text-anchor="middle">${n.allowed} allowed</text>
            <text class="label" x=${d(n.scored)} y="16" text-anchor="middle">${n.scored} scored</text>
          </svg>
        </div>`)}let o=Object.keys(tt).filter(l=>a[l]);if(o.length)i.push(h`<div>
        <div class="head" style="margin-bottom:6px">
          <span class="section-title" style="margin:0">League rank</span>
          <span class="legend">
            <span><i class="round" style="background:var(--elt-accent)"></i>${e.team_abbr??"Team"}</span>
            <span><i class="tick"></i>League avg</span>
          </span>
        </div>
        <div class="rankbars">
          ${o.map(l=>{let r=a[l],p=r.best-r.worst||1,d=Math.max(0,Math.min(100,(r.value-r.worst)/p*100)),m=Math.max(0,Math.min(100,(r.average-r.worst)/p*100)),g=r.rank<=3?"top":r.rank<=Math.ceil(r.teams/2)?"":"low",y=l==="pir"?0:1;return h`<span class="k">${tt[l]}</span>
              <span class="v">${Number(r.value).toFixed(y)}</span>
              <span
                class="rb"
                role="img"
                aria-label=${`${tt[l]} ${r.value}, ${r.rank}${k(r.rank)} of ${r.teams}`}
                ><span class="t"></span><span class="a" style=${`left:${m.toFixed(1)}%`}></span
                ><span class="p" style=${`left:${d.toFixed(1)}%`}></span
              ></span>
              <span class="r ${g}">${r.rank}${k(r.rank)}</span>`})}
        </div>
        <div class="foot" style="margin-top:6px">
          Each bar runs from the league's worst to best; turnovers are flipped so right is always better.
        </div>
      </div>`);else if(Object.keys(t).length){let l=(r,p,d=1)=>h`<div class="tile">
          <div class="k">${r}</div>
          <div class="v">${typeof p=="number"?p.toFixed(d):"\u2013"}</div>
        </div>`;i.push(h`<div class="tiles">
        ${l("Points",t.points)} ${l("Rebounds",t.rebounds)} ${l("Assists",t.assists)}
        ${l("2P%",t.fg2_pct)} ${l("3P%",t.fg3_pct)} ${l("PIR",t.pir,0)}
      </div>`)}return i}_statsPlayers(e){let t=e.form??[],a=e.team_leader_ranks??[],n=e.league_leaders??{},i=[];if(t.length){let l=Math.max(5,...t.map(f=>f.margin)),r=Math.max(5,...t.map(f=>-f.margin)),p=110/(l+r),d=16+l*p,m=d+r*p+16,g=400/t.length,y=t.reduce((f,b)=>f+b.margin,0)/t.length,$=t.length<=20;i.push(h`<div>
        <div class="head" style="margin-bottom:6px">
          <span class="section-title" style="margin:0">Season form · point margin</span>
          <span style="font-size:13px">Avg <b>${S(Math.round(y*10)/10)}</b></span>
        </div>
        <svg
          class="chart"
          viewBox="0 0 ${400} ${m+($?14:0)}"
          role="img"
          aria-label=${`Point margin in ${t.length} games: ${t.filter(f=>f.margin>0).length} wins, ${t.filter(f=>f.margin<0).length} losses`}
        >
          <line class="zero" x1="0" y1=${d} x2=${400} y2=${d}></line>
          ${t.map((f,b)=>{let _=Math.max(1.5,Math.abs(f.margin)*p),A=b*g+g*.15,v=g*.7,w=f.margin>0?d-_:d,x=A+v/2;return E`<rect class=${f.margin>0?"win":"loss"} x=${A.toFixed(1)} y=${w.toFixed(1)} width=${v.toFixed(1)} height=${_.toFixed(1)} rx="2"><title>${`R${f.round} ${f.homeaway==="home"?"vs":"@"} ${f.opponent_abbr} ${f.team_score}-${f.opponent_score}`}</title></rect>
              ${t.length<=24?E`<text class="val" x=${x.toFixed(1)} y=${(f.margin>0?w-4:w+_+11).toFixed(1)} text-anchor="middle">${S(f.margin)}</text>`:u}
              ${$?E`<text class="axis" x=${x.toFixed(1)} y=${m+12} text-anchor="middle">${f.opponent_abbr}</text>`:u}`})}
        </svg>
      </div>`)}return a.length&&i.push(h`<div>
        <div class="section-title">Your players in the league leaders</div>
        <div class="leaders">
          ${a.slice(0,6).map(o=>{let l=n[o.category]?.[0],r=o.rank===1||!l?"League leader":`Leader: ${l.name} (${l.team}) ${l.value}`;return h`<div class="leader">
              ${o.image&&!this._broken.has(o.image)?h`<img
                    class="head-shot"
                    src=${o.image}
                    alt=""
                    loading="lazy"
                    referrerpolicy="no-referrer"
                    @error=${()=>this._broken=new Set([...this._broken,o.image])}
                  />`:h`<span class="head-shot fallback" aria-hidden="true">${ne(o.name)}</span>`}
              <span class="who"
                ><b>${o.name}</b><span>${tt[o.category]??J(o.category)} · ${r}</span></span
              >
              <span class="num"
                ><b>${o.value}</b><span class="rank ${o.rank<=3?"top":""}"
                  >${o.rank}${k(o.rank)}</span
                ></span
              >
            </div>`})}
        </div>
      </div>`),i.length?i:h`<div class="empty-state">No games played yet.</div>`}_statsShots(e){let t=e.shot_zones??null;if(!t?.zones)return h`<div class="empty-state">Shot locations aren't available yet.</div>`;let a=p=>t.zones[p]?.points_per_shot??0,n=p=>(.15+.75*Math.max(0,Math.min(1,(a(p)-.8)/.85))).toFixed(2),i=p=>t.zones[p]?.pct==null?"\u2013":`${Math.round(t.zones[p].pct)}%`,o=(p,d,m,g)=>E`<g>
        <rect class="tag" x=${p-120} y=${d-58} width="240" height="96" rx="18"></rect>
        <text class="tag-v" x=${p} y=${d-12} text-anchor="middle">${i(m)}</text>
        <text class="tag-k" x=${p} y=${d+26} text-anchor="middle">${t.zones[m]?.made??0}/${t.zones[m]?.attempts??0} · ${g}</text>
      </g>`,l="M -660 -157 L -660 141.5 A 675 675 0 0 0 660 141.5 L 660 -157 Z",r=jt.map(([p,d])=>`${d} ${i(p)}`).join(", ");return h`<div>
        <div class="head" style="margin-bottom:6px">
          <span class="section-title" style="margin:0">Season shooting by zone</span>
          <span style="font-size:13px">${t.made}/${t.attempts} FG · ${t.pct}%</span>
        </div>
        <svg class="court zones" viewBox="-760 -170 1520 1150" role="img" aria-label=${`Season shooting by zone: ${r}`}>
          <defs><clipPath id="elt-court"><rect x="-750" y="-157" width="1500" height="1130"></rect></clipPath></defs>
          <g clip-path="url(#elt-court)">
            <rect class="z" x="-750" y="-157" width="1500" height="1130" style=${`fill-opacity:${n("above_break_three")}`}></rect>
            <path class="bg" d=${l}></path>
            <path class="z" d=${l} style=${`fill-opacity:${n("mid_range")}`}></path>
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
          ${o(0,60,"rim","rim")} ${o(0,330,"paint","paint")} ${o(-450,330,"mid_range","mid")}
          ${o(0,820,"above_break_three","above break")}
        </svg>
        <div class="shot-legend">
          <span>Darker = more points per shot</span>
          <span class="sum">Corners: ${t.zones.corner_three?.made??0}/${t.zones.corner_three?.attempts??0} · ${i("corner_three")}</span>
        </div>
      </div>
      <div class="zone-table">
        <span></span><span class="h">Zone</span><span class="h r">FG</span><span class="h r">%</span
        ><span class="h r">Pts/shot</span>
        ${jt.map(([p,d])=>h`<span class="sw" style=${`opacity:${n(p)}`}></span><span>${d}</span
            ><span class="r dim">${t.zones[p]?.made??0}/${t.zones[p]?.attempts??0}</span
            ><b class="r">${t.zones[p]?.pct==null?"\u2013":`${t.zones[p].pct.toFixed(1)}%`}</b
            ><span class="r dim">${t.zones[p]?.points_per_shot?.toFixed(2)??"\u2013"}</span>`)}
      </div>`}_renderRound(e){let t=this._state(this._standingsId())?.attributes??{},a=t.scoreboard??{},n=a.rounds??[];if(!n.length)return h`<div class="empty-state">The round's games aren't available yet.</div>`;let i=e.team_abbr??t.team_abbr,o=n.find($=>$.round===e.round)??n[Math.floor(n.length/2)],l=n.find($=>$.round===this._round)??o,r=n.indexOf(l),p=l.games.filter($=>$.played).length,d=p===l.games.length?"results":p?"in progress":"fixtures",m=$=>{let f=a.crests?.[$];return f&&!this._broken.has(f)?h`<img
            class="mini-crest"
            src=${f}
            alt=""
            loading="lazy"
            referrerpolicy="no-referrer"
            @error=${()=>this._broken=new Set([...this._broken,f])}
          />`:h`<span class="mini-crest fallback" aria-hidden="true"></span>`},g=($,f,b,_)=>h`<div class="side ${_.played&&!b?"dim":""} ${_.played&&b?"w":""}">
        ${m($)}<span class="c">${$}</span><span class="s">${_.played?f:""}</span>
      </div>`,y=$=>{let f=n[r+$];return h`<button
        class="nav"
        aria-label=${$<0?"Previous round":"Next round"}
        ?disabled=${!f}
        @click=${()=>f&&(this._round=f.round)}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d=${$<0?"M10 3 L5 8 L10 13":"M6 3 L11 8 L6 13"}></path>
        </svg>
      </button>`};return h`
      <div class="head">
        <div class="round-nav">
          ${y(-1)}<span class="round-title">Round ${l.round} · ${d}</span>${y(1)}
        </div>
        <span class="pill">${this._fmtRange(l.games.map($=>$.date).filter(Boolean))}</span>
      </div>
      ${this._roundDays(l.games).map(([$,f])=>h`${$?h`<div class="day">${$}</div>`:u}
          <div class="board">
            ${f.map(b=>{let _=b.home===i||b.away===i,A=_&&b.game_code===e.game_code&&this._state(this._config.entity)?.state==="IN",v=A?{...b,played:!0,home_score:b.home===i?e.team_score:e.opponent_score,away_score:b.home===i?e.opponent_score:e.team_score}:b,w=(v.home_score??0)>(v.away_score??0),x=b.date&&Date.parse(b.date)<=Date.now(),F=b.played?u:A?h`<span class="t live">${e.clock??"Live"}</span>`:x?h`<span class="t live">Live</span>`:b.date?h`<span class="t">${this._fmtTime(b.date)}</span>`:u;return h`<div class="bgame timed ${_?"me":""}">
                ${g(b.home,v.home_score,w,v)} ${g(b.away,v.away_score,!w,v)} ${F}
              </div>`})}
          </div>`)}
    `}_renderShots(e){let t=e.shots?.team??[];if(!t.length)return u;let a=t.filter(r=>r[2]).length,n=t.filter(r=>r[3]===2),i=t.filter(r=>r[3]===3),o=r=>`${r.filter(p=>p[2]).length}/${r.length}`,l=`${e.team_name} shot chart vs ${e.opponent_name}: ${a} of ${t.length} field goals, ${o(n)} twos, ${o(i)} threes`;return h`<div>
      <div class="head" style="margin-bottom:6px">
        <span class="section-title" style="margin:0">Shot chart · ${e.team_homeaway==="away"?"@":"vs"} ${e.opponent_abbr}</span>
        <span style="font-size:13px">${a}/${t.length} FG</span>
      </div>
      <svg class="court" viewBox="-760 -170 1520 1420" role="img" aria-label=${l}>
        <g class="lines">
          <rect x="-750" y="-157" width="1500" height="1400"></rect>
          <rect x="-245" y="-157" width="490" height="580"></rect>
          <circle cx="0" cy="423" r="180"></circle>
          <path d="M -660 -157 L -660 141.5 A 675 675 0 0 0 660 141.5 L 660 -157"></path>
          <line x1="-90" y1="-37" x2="90" y2="-37"></line>
          <circle cx="0" cy="0" r="23"></circle>
          <path d="M -180 1243 A 180 180 0 0 1 180 1243"></path>
        </g>
        ${t.map(([r,p,d])=>d?E`<circle class="made" cx=${r} cy=${p} r="26"></circle>`:E`<circle class="miss" cx=${r} cy=${p} r="22"></circle>`)}
      </svg>
      <div class="shot-legend">
        <span><span class="m"></span>Made</span><span><span class="x"></span>Missed</span>
        <span class="sum">2P ${o(n)} · 3P ${o(i)}</span>
      </div>
    </div>`}};T.styles=Lt,T.properties={hass:{attribute:!1},_config:{state:!0},_tab:{state:!0},_statsTab:{state:!0},_standingsTab:{state:!0},_round:{state:!0},_broken:{state:!0}};customElements.get("euroleague-tracker-card")||customElements.define("euroleague-tracker-card",T);var ft=class extends T{setConfig(s){super.setConfig({...s,view:"compact"})}getCardSize(){return 1}getGridOptions(){return{columns:12,min_columns:6,rows:1,min_rows:1}}static getConfigForm(){let s=T.getConfigForm(),e=new Set(["entity","theme","team_color"]),t=[],a=n=>n.forEach(i=>i.schema?a(i.schema):e.has(i.name)&&t.push(i));return a(s.schema),{schema:t,computeLabel:s.computeLabel}}static getStubConfig(s){let{entity:e,theme:t}=T.getStubConfig(s);return{entity:e,theme:t}}};customElements.get("euroleague-tracker-compact-card")||customElements.define("euroleague-tracker-compact-card",ft);window.customCards=window.customCards||[];window.customCards.some(c=>c.type==="euroleague-tracker-card")||window.customCards.push({type:"euroleague-tracker-card",name:"EuroLeague Tracker",description:"Live score, next game, standings and stats for your EuroLeague team.",preview:!0,documentationURL:"https://github.com/Big-Edge2297/ha-euroleague-tracker"});window.customCards.some(c=>c.type==="euroleague-tracker-compact-card")||window.customCards.push({type:"euroleague-tracker-compact-card",name:"EuroLeague Tracker (compact)",description:"Next game, live score or result on one line. Tap for the details.",preview:!0,documentationURL:"https://github.com/Big-Edge2297/ha-euroleague-tracker"});console.info(`%c EUROLEAGUE-TRACKER-CARD %c ${ee} `,"background:#C62828;color:#fff","");export{T as EuroLeagueTrackerCard,ft as EuroLeagueTrackerCompactCard};
