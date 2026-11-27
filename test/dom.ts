// A browser DOM for the card tests. Imported first by every test that renders.
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/" });
const g = globalThis as any;
for (const key of Object.getOwnPropertyNames(dom.window)) {
  if (!(key in g)) g[key] = (dom.window as any)[key];
}
g.window = dom.window;
g.document = dom.window.document;
g.customElements = dom.window.customElements;
g.HTMLElement = dom.window.HTMLElement;
// Node ships its own Event; jsdom elements need jsdom's.
g.Event = dom.window.Event;
g.CustomEvent = dom.window.CustomEvent;
