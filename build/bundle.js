
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
'use strict';

function noop() { }
function assign(tar, src) {
    // @ts-ignore
    for (const k in src)
        tar[k] = src[k];
    return tar;
}
function add_location(element, file, line, column, char) {
    element.__svelte_meta = {
        loc: { file, line, column, char }
    };
}
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function is_empty(obj) {
    return Object.keys(obj).length === 0;
}
function validate_store(store, name) {
    if (store != null && typeof store.subscribe !== 'function') {
        throw new Error(`'${name}' is not a store with a 'subscribe' method`);
    }
}
function subscribe(store, ...callbacks) {
    if (store == null) {
        return noop;
    }
    const unsub = store.subscribe(...callbacks);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function component_subscribe(component, store, callback) {
    component.$$.on_destroy.push(subscribe(store, callback));
}
function create_slot(definition, ctx, $$scope, fn) {
    if (definition) {
        const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
        return definition[0](slot_ctx);
    }
}
function get_slot_context(definition, ctx, $$scope, fn) {
    return definition[1] && fn
        ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
        : $$scope.ctx;
}
function get_slot_changes(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
        const lets = definition[2](fn(dirty));
        if ($$scope.dirty === undefined) {
            return lets;
        }
        if (typeof lets === 'object') {
            const merged = [];
            const len = Math.max($$scope.dirty.length, lets.length);
            for (let i = 0; i < len; i += 1) {
                merged[i] = $$scope.dirty[i] | lets[i];
            }
            return merged;
        }
        return $$scope.dirty | lets;
    }
    return $$scope.dirty;
}
function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
    const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
    if (slot_changes) {
        const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
        slot.p(slot_context, slot_changes);
    }
}
function exclude_internal_props(props) {
    const result = {};
    for (const k in props)
        if (k[0] !== '$')
            result[k] = props[k];
    return result;
}
function compute_rest_props(props, keys) {
    const rest = {};
    keys = new Set(keys);
    for (const k in props)
        if (!keys.has(k) && k[0] !== '$')
            rest[k] = props[k];
    return rest;
}

function append(target, node) {
    target.appendChild(node);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function element(name) {
    return document.createElement(name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function empty() {
    return text('');
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function set_attributes(node, attributes) {
    // @ts-ignore
    const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
    for (const key in attributes) {
        if (attributes[key] == null) {
            node.removeAttribute(key);
        }
        else if (key === 'style') {
            node.style.cssText = attributes[key];
        }
        else if (key === '__value') {
            node.value = node[key] = attributes[key];
        }
        else if (descriptors[key] && descriptors[key].set) {
            node[key] = attributes[key];
        }
        else {
            attr(node, key, attributes[key]);
        }
    }
}
function children(element) {
    return Array.from(element.childNodes);
}
function custom_event(type, detail) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, false, false, detail);
    return e;
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error('Function called outside component initialization');
    return current_component;
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}
function onDestroy(fn) {
    get_current_component().$$.on_destroy.push(fn);
}
function createEventDispatcher() {
    const component = get_current_component();
    return (type, detail) => {
        const callbacks = component.$$.callbacks[type];
        if (callbacks) {
            // TODO are there situations where events could be dispatched
            // in a server (non-DOM) environment?
            const event = custom_event(type, detail);
            callbacks.slice().forEach(fn => {
                fn.call(component, event);
            });
        }
    };
}
function setContext(key, context) {
    get_current_component().$$.context.set(key, context);
}
function getContext(key) {
    return get_current_component().$$.context.get(key);
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
let flushing = false;
const seen_callbacks = new Set();
function flush() {
    if (flushing)
        return;
    flushing = true;
    do {
        // first, call beforeUpdate functions
        // and update components
        for (let i = 0; i < dirty_components.length; i += 1) {
            const component = dirty_components[i];
            set_current_component(component);
            update(component.$$);
        }
        set_current_component(null);
        dirty_components.length = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    flushing = false;
    seen_callbacks.clear();
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}
const outroing = new Set();
let outros;
function group_outros() {
    outros = {
        r: 0,
        c: [],
        p: outros // parent group
    };
}
function check_outros() {
    if (!outros.r) {
        run_all(outros.c);
    }
    outros = outros.p;
}
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
    }
}

function get_spread_update(levels, updates) {
    const update = {};
    const to_null_out = {};
    const accounted_for = { $$scope: 1 };
    let i = levels.length;
    while (i--) {
        const o = levels[i];
        const n = updates[i];
        if (n) {
            for (const key in o) {
                if (!(key in n))
                    to_null_out[key] = 1;
            }
            for (const key in n) {
                if (!accounted_for[key]) {
                    update[key] = n[key];
                    accounted_for[key] = 1;
                }
            }
            levels[i] = n;
        }
        else {
            for (const key in o) {
                accounted_for[key] = 1;
            }
        }
    }
    for (const key in to_null_out) {
        if (!(key in update))
            update[key] = undefined;
    }
    return update;
}
function get_spread_object(spread_props) {
    return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
}
function create_component(block) {
    block && block.c();
}
function mount_component(component, target, anchor, customElement) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
    }
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        on_disconnect: [],
        before_update: [],
        after_update: [],
        context: new Map(parent_component ? parent_component.$$.context : options.context || []),
        // everything else
        callbacks: blank_object(),
        dirty,
        skip_bound: false
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, options.props || {}, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if (!$$.skip_bound && $$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            const nodes = children(options.target);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(nodes);
            nodes.forEach(detach);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor, options.customElement);
        flush();
    }
    set_current_component(parent_component);
}
/**
 * Base class for Svelte components. Used when dev=false.
 */
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set($$props) {
        if (this.$$set && !is_empty($$props)) {
            this.$$.skip_bound = true;
            this.$$set($$props);
            this.$$.skip_bound = false;
        }
    }
}

function dispatch_dev(type, detail) {
    document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
}
function append_dev(target, node) {
    dispatch_dev('SvelteDOMInsert', { target, node });
    append(target, node);
}
function insert_dev(target, node, anchor) {
    dispatch_dev('SvelteDOMInsert', { target, node, anchor });
    insert(target, node, anchor);
}
function detach_dev(node) {
    dispatch_dev('SvelteDOMRemove', { node });
    detach(node);
}
function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
    const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
    if (has_prevent_default)
        modifiers.push('preventDefault');
    if (has_stop_propagation)
        modifiers.push('stopPropagation');
    dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
    const dispose = listen(node, event, handler, options);
    return () => {
        dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
        dispose();
    };
}
function attr_dev(node, attribute, value) {
    attr(node, attribute, value);
    if (value == null)
        dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
    else
        dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
}
function set_data_dev(text, data) {
    data = '' + data;
    if (text.wholeText === data)
        return;
    dispatch_dev('SvelteDOMSetData', { node: text, data });
    text.data = data;
}
function validate_slots(name, slot, keys) {
    for (const slot_key of Object.keys(slot)) {
        if (!~keys.indexOf(slot_key)) {
            console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
        }
    }
}
/**
 * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
 */
class SvelteComponentDev extends SvelteComponent {
    constructor(options) {
        if (!options || (!options.target && !options.$$inline)) {
            throw new Error("'target' is a required option");
        }
        super();
    }
    $destroy() {
        super.$destroy();
        this.$destroy = () => {
            console.warn('Component was already destroyed'); // eslint-disable-line no-console
        };
    }
    $capture_state() { }
    $inject_state() { }
}

const subscriber_queue = [];
/**
 * Creates a `Readable` store that allows reading by subscription.
 * @param value initial value
 * @param {StartStopNotifier}start start and stop notifications for subscriptions
 */
function readable(value, start) {
    return {
        subscribe: writable(value, start).subscribe
    };
}
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
function writable(value, start = noop) {
    let stop;
    const subscribers = [];
    function set(new_value) {
        if (safe_not_equal(value, new_value)) {
            value = new_value;
            if (stop) { // store is ready
                const run_queue = !subscriber_queue.length;
                for (let i = 0; i < subscribers.length; i += 1) {
                    const s = subscribers[i];
                    s[1]();
                    subscriber_queue.push(s, value);
                }
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 2) {
                        subscriber_queue[i][0](subscriber_queue[i + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    function update(fn) {
        set(fn(value));
    }
    function subscribe(run, invalidate = noop) {
        const subscriber = [run, invalidate];
        subscribers.push(subscriber);
        if (subscribers.length === 1) {
            stop = start(set) || noop;
        }
        run(value);
        return () => {
            const index = subscribers.indexOf(subscriber);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
            if (subscribers.length === 0) {
                stop();
                stop = null;
            }
        };
    }
    return { set, update, subscribe };
}
function derived(stores, fn, initial_value) {
    const single = !Array.isArray(stores);
    const stores_array = single
        ? [stores]
        : stores;
    const auto = fn.length < 2;
    return readable(initial_value, (set) => {
        let inited = false;
        const values = [];
        let pending = 0;
        let cleanup = noop;
        const sync = () => {
            if (pending) {
                return;
            }
            cleanup();
            const result = fn(single ? values[0] : values, set);
            if (auto) {
                set(result);
            }
            else {
                cleanup = is_function(result) ? result : noop;
            }
        };
        const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
            values[i] = value;
            pending &= ~(1 << i);
            if (inited) {
                sync();
            }
        }, () => {
            pending |= (1 << i);
        }));
        inited = true;
        sync();
        return function stop() {
            run_all(unsubscribers);
            cleanup();
        };
    });
}

const LOCATION = {};
const ROUTER = {};

/**
 * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
 *
 * https://github.com/reach/router/blob/master/LICENSE
 * */

function getLocation(source) {
  return {
    ...source.location,
    state: source.history.state,
    key: (source.history.state && source.history.state.key) || "initial"
  };
}

function createHistory(source, options) {
  const listeners = [];
  let location = getLocation(source);

  return {
    get location() {
      return location;
    },

    listen(listener) {
      listeners.push(listener);

      const popstateListener = () => {
        location = getLocation(source);
        listener({ location, action: "POP" });
      };

      source.addEventListener("popstate", popstateListener);

      return () => {
        source.removeEventListener("popstate", popstateListener);

        const index = listeners.indexOf(listener);
        listeners.splice(index, 1);
      };
    },

    navigate(to, { state, replace = false } = {}) {
      state = { ...state, key: Date.now() + "" };
      // try...catch iOS Safari limits to 100 pushState calls
      try {
        if (replace) {
          source.history.replaceState(state, null, to);
        } else {
          source.history.pushState(state, null, to);
        }
      } catch (e) {
        source.location[replace ? "replace" : "assign"](to);
      }

      location = getLocation(source);
      listeners.forEach(listener => listener({ location, action: "PUSH" }));
    }
  };
}

// Stores history entries in memory for testing or other platforms like Native
function createMemorySource(initialPathname = "/") {
  let index = 0;
  const stack = [{ pathname: initialPathname, search: "" }];
  const states = [];

  return {
    get location() {
      return stack[index];
    },
    addEventListener(name, fn) {},
    removeEventListener(name, fn) {},
    history: {
      get entries() {
        return stack;
      },
      get index() {
        return index;
      },
      get state() {
        return states[index];
      },
      pushState(state, _, uri) {
        const [pathname, search = ""] = uri.split("?");
        index++;
        stack.push({ pathname, search });
        states.push(state);
      },
      replaceState(state, _, uri) {
        const [pathname, search = ""] = uri.split("?");
        stack[index] = { pathname, search };
        states[index] = state;
      }
    }
  };
}

// Global history uses window.history as the source if available,
// otherwise a memory history
const canUseDOM = Boolean(
  typeof window !== "undefined" &&
    window.document &&
    window.document.createElement
);
const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
const { navigate } = globalHistory;

/**
 * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
 *
 * https://github.com/reach/router/blob/master/LICENSE
 * */

const paramRe = /^:(.+)/;

const SEGMENT_POINTS = 4;
const STATIC_POINTS = 3;
const DYNAMIC_POINTS = 2;
const SPLAT_PENALTY = 1;
const ROOT_POINTS = 1;

/**
 * Check if `string` starts with `search`
 * @param {string} string
 * @param {string} search
 * @return {boolean}
 */
function startsWith(string, search) {
  return string.substr(0, search.length) === search;
}

/**
 * Check if `segment` is a root segment
 * @param {string} segment
 * @return {boolean}
 */
function isRootSegment(segment) {
  return segment === "";
}

/**
 * Check if `segment` is a dynamic segment
 * @param {string} segment
 * @return {boolean}
 */
function isDynamic(segment) {
  return paramRe.test(segment);
}

/**
 * Check if `segment` is a splat
 * @param {string} segment
 * @return {boolean}
 */
function isSplat(segment) {
  return segment[0] === "*";
}

/**
 * Split up the URI into segments delimited by `/`
 * @param {string} uri
 * @return {string[]}
 */
function segmentize(uri) {
  return (
    uri
      // Strip starting/ending `/`
      .replace(/(^\/+|\/+$)/g, "")
      .split("/")
  );
}

/**
 * Strip `str` of potential start and end `/`
 * @param {string} str
 * @return {string}
 */
function stripSlashes(str) {
  return str.replace(/(^\/+|\/+$)/g, "");
}

/**
 * Score a route depending on how its individual segments look
 * @param {object} route
 * @param {number} index
 * @return {object}
 */
function rankRoute(route, index) {
  const score = route.default
    ? 0
    : segmentize(route.path).reduce((score, segment) => {
        score += SEGMENT_POINTS;

        if (isRootSegment(segment)) {
          score += ROOT_POINTS;
        } else if (isDynamic(segment)) {
          score += DYNAMIC_POINTS;
        } else if (isSplat(segment)) {
          score -= SEGMENT_POINTS + SPLAT_PENALTY;
        } else {
          score += STATIC_POINTS;
        }

        return score;
      }, 0);

  return { route, score, index };
}

/**
 * Give a score to all routes and sort them on that
 * @param {object[]} routes
 * @return {object[]}
 */
function rankRoutes(routes) {
  return (
    routes
      .map(rankRoute)
      // If two routes have the exact same score, we go by index instead
      .sort((a, b) =>
        a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
      )
  );
}

/**
 * Ranks and picks the best route to match. Each segment gets the highest
 * amount of points, then the type of segment gets an additional amount of
 * points where
 *
 *  static > dynamic > splat > root
 *
 * This way we don't have to worry about the order of our routes, let the
 * computers do it.
 *
 * A route looks like this
 *
 *  { path, default, value }
 *
 * And a returned match looks like:
 *
 *  { route, params, uri }
 *
 * @param {object[]} routes
 * @param {string} uri
 * @return {?object}
 */
function pick(routes, uri) {
  let match;
  let default_;

  const [uriPathname] = uri.split("?");
  const uriSegments = segmentize(uriPathname);
  const isRootUri = uriSegments[0] === "";
  const ranked = rankRoutes(routes);

  for (let i = 0, l = ranked.length; i < l; i++) {
    const route = ranked[i].route;
    let missed = false;

    if (route.default) {
      default_ = {
        route,
        params: {},
        uri
      };
      continue;
    }

    const routeSegments = segmentize(route.path);
    const params = {};
    const max = Math.max(uriSegments.length, routeSegments.length);
    let index = 0;

    for (; index < max; index++) {
      const routeSegment = routeSegments[index];
      const uriSegment = uriSegments[index];

      if (routeSegment !== undefined && isSplat(routeSegment)) {
        // Hit a splat, just grab the rest, and return a match
        // uri:   /files/documents/work
        // route: /files/* or /files/*splatname
        const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

        params[splatName] = uriSegments
          .slice(index)
          .map(decodeURIComponent)
          .join("/");
        break;
      }

      if (uriSegment === undefined) {
        // URI is shorter than the route, no match
        // uri:   /users
        // route: /users/:userId
        missed = true;
        break;
      }

      let dynamicMatch = paramRe.exec(routeSegment);

      if (dynamicMatch && !isRootUri) {
        const value = decodeURIComponent(uriSegment);
        params[dynamicMatch[1]] = value;
      } else if (routeSegment !== uriSegment) {
        // Current segments don't match, not dynamic, not splat, so no match
        // uri:   /users/123/settings
        // route: /users/:id/profile
        missed = true;
        break;
      }
    }

    if (!missed) {
      match = {
        route,
        params,
        uri: "/" + uriSegments.slice(0, index).join("/")
      };
      break;
    }
  }

  return match || default_ || null;
}

/**
 * Check if the `path` matches the `uri`.
 * @param {string} path
 * @param {string} uri
 * @return {?object}
 */
function match(route, uri) {
  return pick([route], uri);
}

/**
 * Add the query to the pathname if a query is given
 * @param {string} pathname
 * @param {string} [query]
 * @return {string}
 */
function addQuery(pathname, query) {
  return pathname + (query ? `?${query}` : "");
}

/**
 * Resolve URIs as though every path is a directory, no files. Relative URIs
 * in the browser can feel awkward because not only can you be "in a directory",
 * you can be "at a file", too. For example:
 *
 *  browserSpecResolve('foo', '/bar/') => /bar/foo
 *  browserSpecResolve('foo', '/bar') => /foo
 *
 * But on the command line of a file system, it's not as complicated. You can't
 * `cd` from a file, only directories. This way, links have to know less about
 * their current path. To go deeper you can do this:
 *
 *  <Link to="deeper"/>
 *  // instead of
 *  <Link to=`{${props.uri}/deeper}`/>
 *
 * Just like `cd`, if you want to go deeper from the command line, you do this:
 *
 *  cd deeper
 *  # not
 *  cd $(pwd)/deeper
 *
 * By treating every path as a directory, linking to relative paths should
 * require less contextual information and (fingers crossed) be more intuitive.
 * @param {string} to
 * @param {string} base
 * @return {string}
 */
function resolve(to, base) {
  // /foo/bar, /baz/qux => /foo/bar
  if (startsWith(to, "/")) {
    return to;
  }

  const [toPathname, toQuery] = to.split("?");
  const [basePathname] = base.split("?");
  const toSegments = segmentize(toPathname);
  const baseSegments = segmentize(basePathname);

  // ?a=b, /users?b=c => /users?a=b
  if (toSegments[0] === "") {
    return addQuery(basePathname, toQuery);
  }

  // profile, /users/789 => /users/789/profile
  if (!startsWith(toSegments[0], ".")) {
    const pathname = baseSegments.concat(toSegments).join("/");

    return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
  }

  // ./       , /users/123 => /users/123
  // ../      , /users/123 => /users
  // ../..    , /users/123 => /
  // ../../one, /a/b/c/d   => /a/b/one
  // .././one , /a/b/c/d   => /a/b/c/one
  const allSegments = baseSegments.concat(toSegments);
  const segments = [];

  allSegments.forEach(segment => {
    if (segment === "..") {
      segments.pop();
    } else if (segment !== ".") {
      segments.push(segment);
    }
  });

  return addQuery("/" + segments.join("/"), toQuery);
}

/**
 * Combines the `basepath` and the `path` into one path.
 * @param {string} basepath
 * @param {string} path
 */
function combinePaths(basepath, path) {
  return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
}

/**
 * Decides whether a given `event` should result in a navigation or not.
 * @param {object} event
 */
function shouldNavigate(event) {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
  );
}

/* node_modules/svelte-routing/src/Router.svelte generated by Svelte v3.38.2 */

function create_fragment$d(ctx) {
	let current;
	const default_slot_template = /*#slots*/ ctx[9].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], null);

	const block = {
		c: function create() {
			if (default_slot) default_slot.c();
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			if (default_slot) {
				default_slot.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 256)) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[8], dirty, null, null);
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (default_slot) default_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$d.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$d($$self, $$props, $$invalidate) {
	let $base;
	let $location;
	let $routes;
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Router", slots, ['default']);
	let { basepath = "/" } = $$props;
	let { url = null } = $$props;
	const locationContext = getContext(LOCATION);
	const routerContext = getContext(ROUTER);
	const routes = writable([]);
	validate_store(routes, "routes");
	component_subscribe($$self, routes, value => $$invalidate(7, $routes = value));
	const activeRoute = writable(null);
	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

	// If locationContext is not set, this is the topmost Router in the tree.
	// If the `url` prop is given we force the location to it.
	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

	validate_store(location, "location");
	component_subscribe($$self, location, value => $$invalidate(6, $location = value));

	// If routerContext is set, the routerBase of the parent Router
	// will be the base for this Router's descendants.
	// If routerContext is not set, the path and resolved uri will both
	// have the value of the basepath prop.
	const base = routerContext
	? routerContext.routerBase
	: writable({ path: basepath, uri: basepath });

	validate_store(base, "base");
	component_subscribe($$self, base, value => $$invalidate(5, $base = value));

	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
		// If there is no activeRoute, the routerBase will be identical to the base.
		if (activeRoute === null) {
			return base;
		}

		const { path: basepath } = base;
		const { route, uri } = activeRoute;

		// Remove the potential /* or /*splatname from
		// the end of the child Routes relative paths.
		const path = route.default
		? basepath
		: route.path.replace(/\*.*$/, "");

		return { path, uri };
	});

	function registerRoute(route) {
		const { path: basepath } = $base;
		let { path } = route;

		// We store the original path in the _path property so we can reuse
		// it when the basepath changes. The only thing that matters is that
		// the route reference is intact, so mutation is fine.
		route._path = path;

		route.path = combinePaths(basepath, path);

		if (typeof window === "undefined") {
			// In SSR we should set the activeRoute immediately if it is a match.
			// If there are more Routes being registered after a match is found,
			// we just skip them.
			if (hasActiveRoute) {
				return;
			}

			const matchingRoute = match(route, $location.pathname);

			if (matchingRoute) {
				activeRoute.set(matchingRoute);
				hasActiveRoute = true;
			}
		} else {
			routes.update(rs => {
				rs.push(route);
				return rs;
			});
		}
	}

	function unregisterRoute(route) {
		routes.update(rs => {
			const index = rs.indexOf(route);
			rs.splice(index, 1);
			return rs;
		});
	}

	if (!locationContext) {
		// The topmost Router in the tree is responsible for updating
		// the location store and supplying it through context.
		onMount(() => {
			const unlisten = globalHistory.listen(history => {
				location.set(history.location);
			});

			return unlisten;
		});

		setContext(LOCATION, location);
	}

	setContext(ROUTER, {
		activeRoute,
		base,
		routerBase,
		registerRoute,
		unregisterRoute
	});

	const writable_props = ["basepath", "url"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
	});

	$$self.$$set = $$props => {
		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
		if ("url" in $$props) $$invalidate(4, url = $$props.url);
		if ("$$scope" in $$props) $$invalidate(8, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => ({
		getContext,
		setContext,
		onMount,
		writable,
		derived,
		LOCATION,
		ROUTER,
		globalHistory,
		pick,
		match,
		stripSlashes,
		combinePaths,
		basepath,
		url,
		locationContext,
		routerContext,
		routes,
		activeRoute,
		hasActiveRoute,
		location,
		base,
		routerBase,
		registerRoute,
		unregisterRoute,
		$base,
		$location,
		$routes
	});

	$$self.$inject_state = $$props => {
		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
		if ("url" in $$props) $$invalidate(4, url = $$props.url);
		if ("hasActiveRoute" in $$props) hasActiveRoute = $$props.hasActiveRoute;
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*$base*/ 32) {
			// This reactive statement will update all the Routes' path when
			// the basepath changes.
			{
				const { path: basepath } = $base;

				routes.update(rs => {
					rs.forEach(r => r.path = combinePaths(basepath, r._path));
					return rs;
				});
			}
		}

		if ($$self.$$.dirty & /*$routes, $location*/ 192) {
			// This reactive statement will be run when the Router is created
			// when there are no Routes and then again the following tick, so it
			// will not find an active Route in SSR and in the browser it will only
			// pick an active Route after all Routes have been registered.
			{
				const bestMatch = pick($routes, $location.pathname);
				activeRoute.set(bestMatch);
			}
		}
	};

	return [
		routes,
		location,
		base,
		basepath,
		url,
		$base,
		$location,
		$routes,
		$$scope,
		slots
	];
}

class Router extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$d, create_fragment$d, safe_not_equal, { basepath: 3, url: 4 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Router",
			options,
			id: create_fragment$d.name
		});
	}

	get basepath() {
		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set basepath(value) {
		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get url() {
		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set url(value) {
		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.38.2 */

const get_default_slot_changes$1 = dirty => ({
	params: dirty & /*routeParams*/ 4,
	location: dirty & /*$location*/ 16
});

const get_default_slot_context$1 = ctx => ({
	params: /*routeParams*/ ctx[2],
	location: /*$location*/ ctx[4]
});

// (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
function create_if_block$3(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block_1$2, create_else_block];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*component*/ ctx[0] !== null) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	const block = {
		c: function create() {
			if_block.c();
			if_block_anchor = empty();
		},
		m: function mount(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				} else {
					if_block.p(ctx, dirty);
				}

				transition_in(if_block, 1);
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$3.name,
		type: "if",
		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
		ctx
	});

	return block;
}

// (43:2) {:else}
function create_else_block(ctx) {
	let current;
	const default_slot_template = /*#slots*/ ctx[10].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context$1);

	const block = {
		c: function create() {
			if (default_slot) default_slot.c();
		},
		m: function mount(target, anchor) {
			if (default_slot) {
				default_slot.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope, routeParams, $location*/ 532)) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, get_default_slot_changes$1, get_default_slot_context$1);
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (default_slot) default_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block.name,
		type: "else",
		source: "(43:2) {:else}",
		ctx
	});

	return block;
}

// (41:2) {#if component !== null}
function create_if_block_1$2(ctx) {
	let switch_instance;
	let switch_instance_anchor;
	let current;

	const switch_instance_spread_levels = [
		{ location: /*$location*/ ctx[4] },
		/*routeParams*/ ctx[2],
		/*routeProps*/ ctx[3]
	];

	var switch_value = /*component*/ ctx[0];

	function switch_props(ctx) {
		let switch_instance_props = {};

		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
		}

		return {
			props: switch_instance_props,
			$$inline: true
		};
	}

	if (switch_value) {
		switch_instance = new switch_value(switch_props());
	}

	const block = {
		c: function create() {
			if (switch_instance) create_component(switch_instance.$$.fragment);
			switch_instance_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (switch_instance) {
				mount_component(switch_instance, target, anchor);
			}

			insert_dev(target, switch_instance_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const switch_instance_changes = (dirty & /*$location, routeParams, routeProps*/ 28)
			? get_spread_update(switch_instance_spread_levels, [
					dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
					dirty & /*routeParams*/ 4 && get_spread_object(/*routeParams*/ ctx[2]),
					dirty & /*routeProps*/ 8 && get_spread_object(/*routeProps*/ ctx[3])
				])
			: {};

			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props());
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i: function intro(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(switch_instance_anchor);
			if (switch_instance) destroy_component(switch_instance, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$2.name,
		type: "if",
		source: "(41:2) {#if component !== null}",
		ctx
	});

	return block;
}

function create_fragment$c(ctx) {
	let if_block_anchor;
	let current;
	let if_block = /*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7] && create_if_block$3(ctx);

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (/*$activeRoute*/ ctx[1] !== null && /*$activeRoute*/ ctx[1].route === /*route*/ ctx[7]) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*$activeRoute*/ 2) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block$3(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$c.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$c($$self, $$props, $$invalidate) {
	let $activeRoute;
	let $location;
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Route", slots, ['default']);
	let { path = "" } = $$props;
	let { component = null } = $$props;
	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
	validate_store(activeRoute, "activeRoute");
	component_subscribe($$self, activeRoute, value => $$invalidate(1, $activeRoute = value));
	const location = getContext(LOCATION);
	validate_store(location, "location");
	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

	const route = {
		path,
		// If no path prop is given, this Route will act as the default Route
		// that is rendered if no other Route in the Router is a match.
		default: path === ""
	};

	let routeParams = {};
	let routeProps = {};
	registerRoute(route);

	// There is no need to unregister Routes in SSR since it will all be
	// thrown away anyway.
	if (typeof window !== "undefined") {
		onDestroy(() => {
			unregisterRoute(route);
		});
	}

	$$self.$$set = $$new_props => {
		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
		if ("path" in $$new_props) $$invalidate(8, path = $$new_props.path);
		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
		if ("$$scope" in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
	};

	$$self.$capture_state = () => ({
		getContext,
		onDestroy,
		ROUTER,
		LOCATION,
		path,
		component,
		registerRoute,
		unregisterRoute,
		activeRoute,
		location,
		route,
		routeParams,
		routeProps,
		$activeRoute,
		$location
	});

	$$self.$inject_state = $$new_props => {
		$$invalidate(13, $$props = assign(assign({}, $$props), $$new_props));
		if ("path" in $$props) $$invalidate(8, path = $$new_props.path);
		if ("component" in $$props) $$invalidate(0, component = $$new_props.component);
		if ("routeParams" in $$props) $$invalidate(2, routeParams = $$new_props.routeParams);
		if ("routeProps" in $$props) $$invalidate(3, routeProps = $$new_props.routeProps);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*$activeRoute*/ 2) {
			if ($activeRoute && $activeRoute.route === route) {
				$$invalidate(2, routeParams = $activeRoute.params);
			}
		}

		{
			const { path, component, ...rest } = $$props;
			$$invalidate(3, routeProps = rest);
		}
	};

	$$props = exclude_internal_props($$props);

	return [
		component,
		$activeRoute,
		routeParams,
		routeProps,
		$location,
		activeRoute,
		location,
		route,
		path,
		$$scope,
		slots
	];
}

class Route extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$c, create_fragment$c, safe_not_equal, { path: 8, component: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Route",
			options,
			id: create_fragment$c.name
		});
	}

	get path() {
		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set path(value) {
		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get component() {
		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set component(value) {
		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* node_modules/svelte-routing/src/Link.svelte generated by Svelte v3.38.2 */
const file$a = "node_modules/svelte-routing/src/Link.svelte";

function create_fragment$b(ctx) {
	let a;
	let current;
	let mounted;
	let dispose;
	const default_slot_template = /*#slots*/ ctx[16].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);

	let a_levels = [
		{ href: /*href*/ ctx[0] },
		{ "aria-current": /*ariaCurrent*/ ctx[2] },
		/*props*/ ctx[1],
		/*$$restProps*/ ctx[6]
	];

	let a_data = {};

	for (let i = 0; i < a_levels.length; i += 1) {
		a_data = assign(a_data, a_levels[i]);
	}

	const block = {
		c: function create() {
			a = element("a");
			if (default_slot) default_slot.c();
			set_attributes(a, a_data);
			add_location(a, file$a, 40, 0, 1249);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, a, anchor);

			if (default_slot) {
				default_slot.m(a, null);
			}

			current = true;

			if (!mounted) {
				dispose = listen_dev(a, "click", /*onClick*/ ctx[5], false, false, false);
				mounted = true;
			}
		},
		p: function update(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 32768)) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[15], dirty, null, null);
				}
			}

			set_attributes(a, a_data = get_spread_update(a_levels, [
				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
				(!current || dirty & /*ariaCurrent*/ 4) && { "aria-current": /*ariaCurrent*/ ctx[2] },
				dirty & /*props*/ 2 && /*props*/ ctx[1],
				dirty & /*$$restProps*/ 64 && /*$$restProps*/ ctx[6]
			]));
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(a);
			if (default_slot) default_slot.d(detaching);
			mounted = false;
			dispose();
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$b.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$b($$self, $$props, $$invalidate) {
	let ariaCurrent;
	const omit_props_names = ["to","replace","state","getProps"];
	let $$restProps = compute_rest_props($$props, omit_props_names);
	let $base;
	let $location;
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Link", slots, ['default']);
	let { to = "#" } = $$props;
	let { replace = false } = $$props;
	let { state = {} } = $$props;
	let { getProps = () => ({}) } = $$props;
	const { base } = getContext(ROUTER);
	validate_store(base, "base");
	component_subscribe($$self, base, value => $$invalidate(13, $base = value));
	const location = getContext(LOCATION);
	validate_store(location, "location");
	component_subscribe($$self, location, value => $$invalidate(14, $location = value));
	const dispatch = createEventDispatcher();
	let href, isPartiallyCurrent, isCurrent, props;

	function onClick(event) {
		dispatch("click", event);

		if (shouldNavigate(event)) {
			event.preventDefault();

			// Don't push another entry to the history stack when the user
			// clicks on a Link to the page they are currently on.
			const shouldReplace = $location.pathname === href || replace;

			navigate(href, { state, replace: shouldReplace });
		}
	}

	$$self.$$set = $$new_props => {
		$$props = assign(assign({}, $$props), exclude_internal_props($$new_props));
		$$invalidate(6, $$restProps = compute_rest_props($$props, omit_props_names));
		if ("to" in $$new_props) $$invalidate(7, to = $$new_props.to);
		if ("replace" in $$new_props) $$invalidate(8, replace = $$new_props.replace);
		if ("state" in $$new_props) $$invalidate(9, state = $$new_props.state);
		if ("getProps" in $$new_props) $$invalidate(10, getProps = $$new_props.getProps);
		if ("$$scope" in $$new_props) $$invalidate(15, $$scope = $$new_props.$$scope);
	};

	$$self.$capture_state = () => ({
		getContext,
		createEventDispatcher,
		ROUTER,
		LOCATION,
		navigate,
		startsWith,
		resolve,
		shouldNavigate,
		to,
		replace,
		state,
		getProps,
		base,
		location,
		dispatch,
		href,
		isPartiallyCurrent,
		isCurrent,
		props,
		onClick,
		$base,
		$location,
		ariaCurrent
	});

	$$self.$inject_state = $$new_props => {
		if ("to" in $$props) $$invalidate(7, to = $$new_props.to);
		if ("replace" in $$props) $$invalidate(8, replace = $$new_props.replace);
		if ("state" in $$props) $$invalidate(9, state = $$new_props.state);
		if ("getProps" in $$props) $$invalidate(10, getProps = $$new_props.getProps);
		if ("href" in $$props) $$invalidate(0, href = $$new_props.href);
		if ("isPartiallyCurrent" in $$props) $$invalidate(11, isPartiallyCurrent = $$new_props.isPartiallyCurrent);
		if ("isCurrent" in $$props) $$invalidate(12, isCurrent = $$new_props.isCurrent);
		if ("props" in $$props) $$invalidate(1, props = $$new_props.props);
		if ("ariaCurrent" in $$props) $$invalidate(2, ariaCurrent = $$new_props.ariaCurrent);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*to, $base*/ 8320) {
			$$invalidate(0, href = to === "/" ? $base.uri : resolve(to, $base.uri));
		}

		if ($$self.$$.dirty & /*$location, href*/ 16385) {
			$$invalidate(11, isPartiallyCurrent = startsWith($location.pathname, href));
		}

		if ($$self.$$.dirty & /*href, $location*/ 16385) {
			$$invalidate(12, isCurrent = href === $location.pathname);
		}

		if ($$self.$$.dirty & /*isCurrent*/ 4096) {
			$$invalidate(2, ariaCurrent = isCurrent ? "page" : undefined);
		}

		if ($$self.$$.dirty & /*getProps, $location, href, isPartiallyCurrent, isCurrent*/ 23553) {
			$$invalidate(1, props = getProps({
				location: $location,
				href,
				isPartiallyCurrent,
				isCurrent
			}));
		}
	};

	return [
		href,
		props,
		ariaCurrent,
		base,
		location,
		onClick,
		$$restProps,
		to,
		replace,
		state,
		getProps,
		isPartiallyCurrent,
		isCurrent,
		$base,
		$location,
		$$scope,
		slots
	];
}

class Link extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
			to: 7,
			replace: 8,
			state: 9,
			getProps: 10
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Link",
			options,
			id: create_fragment$b.name
		});
	}

	get to() {
		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set to(value) {
		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get replace() {
		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set replace(value) {
		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get state() {
		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set state(value) {
		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get getProps() {
		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set getProps(value) {
		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/components/Title.svelte generated by Svelte v3.38.2 */
const file$9 = "src/components/Title.svelte";

// (11:4) <Link to="/">
function create_default_slot_1$4(ctx) {
	let span;

	const block = {
		c: function create() {
			span = element("span");
			span.textContent = "Etusivu";
			attr_dev(span, "class", "navigate-button svelte-19frd7v");
			add_location(span, file$9, 10, 17, 229);
		},
		m: function mount(target, anchor) {
			insert_dev(target, span, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(span);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_1$4.name,
		type: "slot",
		source: "(11:4) <Link to=\\\"/\\\">",
		ctx
	});

	return block;
}

// (12:4) <Link to="register">
function create_default_slot$5(ctx) {
	let span;

	const block = {
		c: function create() {
			span = element("span");
			span.textContent = "Ilmoittaudu";
			attr_dev(span, "class", "navigate-button svelte-19frd7v");
			add_location(span, file$9, 11, 24, 305);
		},
		m: function mount(target, anchor) {
			insert_dev(target, span, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(span);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot$5.name,
		type: "slot",
		source: "(12:4) <Link to=\\\"register\\\">",
		ctx
	});

	return block;
}

function create_fragment$a(ctx) {
	let div0;
	let img;
	let img_src_value;
	let t0;
	let div1;
	let nav;
	let link0;
	let t1;
	let link1;
	let current;

	link0 = new Link({
			props: {
				to: "/",
				$$slots: { default: [create_default_slot_1$4] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	link1 = new Link({
			props: {
				to: "register",
				$$slots: { default: [create_default_slot$5] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			div0 = element("div");
			img = element("img");
			t0 = space();
			div1 = element("div");
			nav = element("nav");
			create_component(link0.$$.fragment);
			t1 = space();
			create_component(link1.$$.fragment);
			if (img.src !== (img_src_value = "./images/kuva-kranssi.png")) attr_dev(img, "src", img_src_value);
			attr_dev(img, "alt", "Joan title");
			attr_dev(img, "class", "top-image svelte-19frd7v");
			add_location(img, file$9, 5, 4, 97);
			attr_dev(div0, "class", "image-container svelte-19frd7v");
			add_location(div0, file$9, 4, 0, 63);
			attr_dev(nav, "class", "svelte-19frd7v");
			add_location(nav, file$9, 9, 2, 206);
			attr_dev(div1, "class", "menu-row");
			add_location(div1, file$9, 8, 0, 181);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div0, anchor);
			append_dev(div0, img);
			insert_dev(target, t0, anchor);
			insert_dev(target, div1, anchor);
			append_dev(div1, nav);
			mount_component(link0, nav, null);
			append_dev(nav, t1);
			mount_component(link1, nav, null);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const link0_changes = {};

			if (dirty & /*$$scope*/ 1) {
				link0_changes.$$scope = { dirty, ctx };
			}

			link0.$set(link0_changes);
			const link1_changes = {};

			if (dirty & /*$$scope*/ 1) {
				link1_changes.$$scope = { dirty, ctx };
			}

			link1.$set(link1_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(link0.$$.fragment, local);
			transition_in(link1.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(link0.$$.fragment, local);
			transition_out(link1.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div0);
			if (detaching) detach_dev(t0);
			if (detaching) detach_dev(div1);
			destroy_component(link0);
			destroy_component(link1);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$a.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$a($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("Title", slots, []);
	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Title> was created with unknown prop '${key}'`);
	});

	$$self.$capture_state = () => ({ Link });
	return [];
}

class Title extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Title",
			options,
			id: create_fragment$a.name
		});
	}
}

/* src/components/MediaQuery.svelte generated by Svelte v3.38.2 */
const get_default_slot_changes = dirty => ({ matches: dirty & /*matches*/ 1 });
const get_default_slot_context = ctx => ({ matches: /*matches*/ ctx[0] });

function create_fragment$9(ctx) {
	let current;
	const default_slot_template = /*#slots*/ ctx[4].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], get_default_slot_context);

	const block = {
		c: function create() {
			if (default_slot) default_slot.c();
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			if (default_slot) {
				default_slot.m(target, anchor);
			}

			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope, matches*/ 9)) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, get_default_slot_changes, get_default_slot_context);
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (default_slot) default_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$9.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$9($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("MediaQuery", slots, ['default']);
	let { query } = $$props;
	let mql;
	let mqlListener;
	let wasMounted = false;
	let matches = false;

	onMount(() => {
		$$invalidate(2, wasMounted = true);

		return () => {
			removeActiveListener();
		};
	});

	function addNewListener(query) {
		mql = window.matchMedia(query);
		mqlListener = v => $$invalidate(0, matches = v.matches);
		mql.addListener(mqlListener);
		$$invalidate(0, matches = mql.matches);
	}

	function removeActiveListener() {
		if (mql && mqlListener) {
			mql.removeListener(mqlListener);
		}
	}

	const writable_props = ["query"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MediaQuery> was created with unknown prop '${key}'`);
	});

	$$self.$$set = $$props => {
		if ("query" in $$props) $$invalidate(1, query = $$props.query);
		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => ({
		onMount,
		query,
		mql,
		mqlListener,
		wasMounted,
		matches,
		addNewListener,
		removeActiveListener
	});

	$$self.$inject_state = $$props => {
		if ("query" in $$props) $$invalidate(1, query = $$props.query);
		if ("mql" in $$props) mql = $$props.mql;
		if ("mqlListener" in $$props) mqlListener = $$props.mqlListener;
		if ("wasMounted" in $$props) $$invalidate(2, wasMounted = $$props.wasMounted);
		if ("matches" in $$props) $$invalidate(0, matches = $$props.matches);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*wasMounted, query*/ 6) {
			{
				if (wasMounted) {
					removeActiveListener();
					addNewListener(query);
				}
			}
		}
	};

	return [matches, query, wasMounted, $$scope, slots];
}

class MediaQuery extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$9, create_fragment$9, safe_not_equal, { query: 1 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "MediaQuery",
			options,
			id: create_fragment$9.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*query*/ ctx[1] === undefined && !("query" in props)) {
			console.warn("<MediaQuery> was created without expected prop 'query'");
		}
	}

	get query() {
		throw new Error("<MediaQuery>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set query(value) {
		throw new Error("<MediaQuery>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/components/LeftContentBox.svelte generated by Svelte v3.38.2 */
const file$8 = "src/components/LeftContentBox.svelte";

// (18:1) {#if matches}
function create_if_block_1$1(ctx) {
	let div2;
	let div0;
	let img;
	let img_src_value;
	let t0;
	let div1;
	let h2;
	let t1_value = /*$$props*/ ctx[0].title + "";
	let t1;
	let t2;
	let current;
	const default_slot_template = /*#slots*/ ctx[1].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

	const block = {
		c: function create() {
			div2 = element("div");
			div0 = element("div");
			img = element("img");
			t0 = space();
			div1 = element("div");
			h2 = element("h2");
			t1 = text(t1_value);
			t2 = space();
			if (default_slot) default_slot.c();
			if (img.src !== (img_src_value = /*$$props*/ ctx[0].src)) attr_dev(img, "src", img_src_value);
			attr_dev(img, "alt", "image");
			attr_dev(img, "class", "image svelte-1km8vz3");
			add_location(img, file$8, 20, 12, 453);
			attr_dev(div0, "class", "image-container svelte-1km8vz3");
			add_location(div0, file$8, 19, 8, 411);
			add_location(h2, file$8, 23, 12, 565);
			attr_dev(div1, "class", "text-area svelte-1km8vz3");
			add_location(div1, file$8, 22, 8, 528);
			attr_dev(div2, "class", "container svelte-1km8vz3");
			add_location(div2, file$8, 18, 4, 379);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div2, anchor);
			append_dev(div2, div0);
			append_dev(div0, img);
			append_dev(div2, t0);
			append_dev(div2, div1);
			append_dev(div1, h2);
			append_dev(h2, t1);
			append_dev(div1, t2);

			if (default_slot) {
				default_slot.m(div1, null);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			if (!current || dirty & /*$$props*/ 1 && img.src !== (img_src_value = /*$$props*/ ctx[0].src)) {
				attr_dev(img, "src", img_src_value);
			}

			if ((!current || dirty & /*$$props*/ 1) && t1_value !== (t1_value = /*$$props*/ ctx[0].title + "")) set_data_dev(t1, t1_value);

			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div2);
			if (default_slot) default_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1$1.name,
		type: "if",
		source: "(18:1) {#if matches}",
		ctx
	});

	return block;
}

// (17:0) <MediaQuery query="(min-width: 601px)" let:matches>
function create_default_slot_1$3(ctx) {
	let if_block_anchor;
	let current;
	let if_block = /*matches*/ ctx[3] && create_if_block_1$1(ctx);

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			if (/*matches*/ ctx[3]) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*matches*/ 8) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block_1$1(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_1$3.name,
		type: "slot",
		source: "(17:0) <MediaQuery query=\\\"(min-width: 601px)\\\" let:matches>",
		ctx
	});

	return block;
}

// (32:1) {#if matches}
function create_if_block$2(ctx) {
	let div0;
	let h2;
	let t0_value = /*$$props*/ ctx[0].title + "";
	let t0;
	let h2_style_value;
	let t1;
	let img;
	let img_src_value;
	let t2;
	let div1;
	let current;
	const default_slot_template = /*#slots*/ ctx[1].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

	const block = {
		c: function create() {
			div0 = element("div");
			h2 = element("h2");
			t0 = text(t0_value);
			t1 = space();
			img = element("img");
			t2 = space();
			div1 = element("div");
			if (default_slot) default_slot.c();
			attr_dev(h2, "class", "small-title svelte-1km8vz3");
			attr_dev(h2, "style", h2_style_value = /*$$props*/ ctx[0].titleStyle);
			add_location(h2, file$8, 34, 12, 787);
			if (img.src !== (img_src_value = /*$$props*/ ctx[0].src)) attr_dev(img, "src", img_src_value);
			attr_dev(img, "alt", "image");
			attr_dev(img, "class", "image-small svelte-1km8vz3");
			add_location(img, file$8, 35, 12, 873);
			attr_dev(div0, "class", "text-area-small svelte-1km8vz3");
			add_location(div0, file$8, 33, 8, 744);
			add_location(div1, file$8, 37, 8, 954);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div0, anchor);
			append_dev(div0, h2);
			append_dev(h2, t0);
			append_dev(div0, t1);
			append_dev(div0, img);
			insert_dev(target, t2, anchor);
			insert_dev(target, div1, anchor);

			if (default_slot) {
				default_slot.m(div1, null);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			if ((!current || dirty & /*$$props*/ 1) && t0_value !== (t0_value = /*$$props*/ ctx[0].title + "")) set_data_dev(t0, t0_value);

			if (!current || dirty & /*$$props*/ 1 && h2_style_value !== (h2_style_value = /*$$props*/ ctx[0].titleStyle)) {
				attr_dev(h2, "style", h2_style_value);
			}

			if (!current || dirty & /*$$props*/ 1 && img.src !== (img_src_value = /*$$props*/ ctx[0].src)) {
				attr_dev(img, "src", img_src_value);
			}

			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div0);
			if (detaching) detach_dev(t2);
			if (detaching) detach_dev(div1);
			if (default_slot) default_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$2.name,
		type: "if",
		source: "(32:1) {#if matches}",
		ctx
	});

	return block;
}

// (31:0) <MediaQuery query="(max-width: 600px)" let:matches>
function create_default_slot$4(ctx) {
	let if_block_anchor;
	let current;
	let if_block = /*matches*/ ctx[3] && create_if_block$2(ctx);

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			if (/*matches*/ ctx[3]) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*matches*/ 8) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block$2(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot$4.name,
		type: "slot",
		source: "(31:0) <MediaQuery query=\\\"(max-width: 600px)\\\" let:matches>",
		ctx
	});

	return block;
}

function create_fragment$8(ctx) {
	let mediaquery0;
	let t;
	let mediaquery1;
	let current;

	mediaquery0 = new MediaQuery({
			props: {
				query: "(min-width: 601px)",
				$$slots: {
					default: [
						create_default_slot_1$3,
						({ matches }) => ({ 3: matches }),
						({ matches }) => matches ? 8 : 0
					]
				},
				$$scope: { ctx }
			},
			$$inline: true
		});

	mediaquery1 = new MediaQuery({
			props: {
				query: "(max-width: 600px)",
				$$slots: {
					default: [
						create_default_slot$4,
						({ matches }) => ({ 3: matches }),
						({ matches }) => matches ? 8 : 0
					]
				},
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(mediaquery0.$$.fragment);
			t = space();
			create_component(mediaquery1.$$.fragment);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			mount_component(mediaquery0, target, anchor);
			insert_dev(target, t, anchor);
			mount_component(mediaquery1, target, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const mediaquery0_changes = {};

			if (dirty & /*$$scope, $$props, matches*/ 13) {
				mediaquery0_changes.$$scope = { dirty, ctx };
			}

			mediaquery0.$set(mediaquery0_changes);
			const mediaquery1_changes = {};

			if (dirty & /*$$scope, $$props, matches*/ 13) {
				mediaquery1_changes.$$scope = { dirty, ctx };
			}

			mediaquery1.$set(mediaquery1_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(mediaquery0.$$.fragment, local);
			transition_in(mediaquery1.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(mediaquery0.$$.fragment, local);
			transition_out(mediaquery1.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(mediaquery0, detaching);
			if (detaching) detach_dev(t);
			destroy_component(mediaquery1, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$8.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$8($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("LeftContentBox", slots, ['default']);

	$$self.$$set = $$new_props => {
		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
		if ("$$scope" in $$new_props) $$invalidate(2, $$scope = $$new_props.$$scope);
	};

	$$self.$capture_state = () => ({ MediaQuery });

	$$self.$inject_state = $$new_props => {
		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$props = exclude_internal_props($$props);
	return [$$props, slots, $$scope];
}

class LeftContentBox extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "LeftContentBox",
			options,
			id: create_fragment$8.name
		});
	}
}

/* src/components/RightContentBox.svelte generated by Svelte v3.38.2 */
const file$7 = "src/components/RightContentBox.svelte";

// (6:1) {#if matches}
function create_if_block_1(ctx) {
	let div2;
	let div0;
	let h2;
	let t0_value = /*$$props*/ ctx[0].title + "";
	let t0;
	let t1;
	let t2;
	let div1;
	let img;
	let img_src_value;
	let current;
	const default_slot_template = /*#slots*/ ctx[1].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

	const block = {
		c: function create() {
			div2 = element("div");
			div0 = element("div");
			h2 = element("h2");
			t0 = text(t0_value);
			t1 = space();
			if (default_slot) default_slot.c();
			t2 = space();
			div1 = element("div");
			img = element("img");
			add_location(h2, file$7, 8, 12, 207);
			attr_dev(div0, "class", "text-area svelte-18r4fng");
			add_location(div0, file$7, 7, 8, 170);
			if (img.src !== (img_src_value = /*$$props*/ ctx[0].src)) attr_dev(img, "src", img_src_value);
			attr_dev(img, "alt", "image");
			attr_dev(img, "class", "image svelte-18r4fng");
			add_location(img, file$7, 12, 12, 323);
			attr_dev(div1, "class", "image-container svelte-18r4fng");
			add_location(div1, file$7, 11, 8, 281);
			attr_dev(div2, "class", "container svelte-18r4fng");
			add_location(div2, file$7, 6, 4, 138);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div2, anchor);
			append_dev(div2, div0);
			append_dev(div0, h2);
			append_dev(h2, t0);
			append_dev(div0, t1);

			if (default_slot) {
				default_slot.m(div0, null);
			}

			append_dev(div2, t2);
			append_dev(div2, div1);
			append_dev(div1, img);
			current = true;
		},
		p: function update(ctx, dirty) {
			if ((!current || dirty & /*$$props*/ 1) && t0_value !== (t0_value = /*$$props*/ ctx[0].title + "")) set_data_dev(t0, t0_value);

			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
				}
			}

			if (!current || dirty & /*$$props*/ 1 && img.src !== (img_src_value = /*$$props*/ ctx[0].src)) {
				attr_dev(img, "src", img_src_value);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div2);
			if (default_slot) default_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block_1.name,
		type: "if",
		source: "(6:1) {#if matches}",
		ctx
	});

	return block;
}

// (5:0) <MediaQuery query="(min-width: 601px)" let:matches>
function create_default_slot_1$2(ctx) {
	let if_block_anchor;
	let current;
	let if_block = /*matches*/ ctx[3] && create_if_block_1(ctx);

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			if (/*matches*/ ctx[3]) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*matches*/ 8) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block_1(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_1$2.name,
		type: "slot",
		source: "(5:0) <MediaQuery query=\\\"(min-width: 601px)\\\" let:matches>",
		ctx
	});

	return block;
}

// (20:1) {#if matches}
function create_if_block$1(ctx) {
	let div0;
	let h2;
	let t0_value = /*$$props*/ ctx[0].title + "";
	let t0;
	let h2_style_value;
	let t1;
	let img;
	let img_src_value;
	let t2;
	let div1;
	let current;
	const default_slot_template = /*#slots*/ ctx[1].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

	const block = {
		c: function create() {
			div0 = element("div");
			h2 = element("h2");
			t0 = text(t0_value);
			t1 = space();
			img = element("img");
			t2 = space();
			div1 = element("div");
			if (default_slot) default_slot.c();
			attr_dev(h2, "class", "small-title svelte-18r4fng");
			attr_dev(h2, "style", h2_style_value = /*$$props*/ ctx[0].titleStyle);
			add_location(h2, file$7, 21, 12, 541);
			if (img.src !== (img_src_value = /*$$props*/ ctx[0].src)) attr_dev(img, "src", img_src_value);
			attr_dev(img, "alt", "image");
			attr_dev(img, "class", "image-small svelte-18r4fng");
			add_location(img, file$7, 22, 12, 627);
			attr_dev(div0, "class", "text-area-small svelte-18r4fng");
			add_location(div0, file$7, 20, 8, 498);
			add_location(div1, file$7, 24, 8, 708);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div0, anchor);
			append_dev(div0, h2);
			append_dev(h2, t0);
			append_dev(div0, t1);
			append_dev(div0, img);
			insert_dev(target, t2, anchor);
			insert_dev(target, div1, anchor);

			if (default_slot) {
				default_slot.m(div1, null);
			}

			current = true;
		},
		p: function update(ctx, dirty) {
			if ((!current || dirty & /*$$props*/ 1) && t0_value !== (t0_value = /*$$props*/ ctx[0].title + "")) set_data_dev(t0, t0_value);

			if (!current || dirty & /*$$props*/ 1 && h2_style_value !== (h2_style_value = /*$$props*/ ctx[0].titleStyle)) {
				attr_dev(h2, "style", h2_style_value);
			}

			if (!current || dirty & /*$$props*/ 1 && img.src !== (img_src_value = /*$$props*/ ctx[0].src)) {
				attr_dev(img, "src", img_src_value);
			}

			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[2], dirty, null, null);
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div0);
			if (detaching) detach_dev(t2);
			if (detaching) detach_dev(div1);
			if (default_slot) default_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$1.name,
		type: "if",
		source: "(20:1) {#if matches}",
		ctx
	});

	return block;
}

// (19:0) <MediaQuery query="(max-width: 600px)" let:matches>
function create_default_slot$3(ctx) {
	let if_block_anchor;
	let current;
	let if_block = /*matches*/ ctx[3] && create_if_block$1(ctx);

	const block = {
		c: function create() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			if (/*matches*/ ctx[3]) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*matches*/ 8) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block$1(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot$3.name,
		type: "slot",
		source: "(19:0) <MediaQuery query=\\\"(max-width: 600px)\\\" let:matches>",
		ctx
	});

	return block;
}

function create_fragment$7(ctx) {
	let mediaquery0;
	let t;
	let mediaquery1;
	let current;

	mediaquery0 = new MediaQuery({
			props: {
				query: "(min-width: 601px)",
				$$slots: {
					default: [
						create_default_slot_1$2,
						({ matches }) => ({ 3: matches }),
						({ matches }) => matches ? 8 : 0
					]
				},
				$$scope: { ctx }
			},
			$$inline: true
		});

	mediaquery1 = new MediaQuery({
			props: {
				query: "(max-width: 600px)",
				$$slots: {
					default: [
						create_default_slot$3,
						({ matches }) => ({ 3: matches }),
						({ matches }) => matches ? 8 : 0
					]
				},
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(mediaquery0.$$.fragment);
			t = space();
			create_component(mediaquery1.$$.fragment);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			mount_component(mediaquery0, target, anchor);
			insert_dev(target, t, anchor);
			mount_component(mediaquery1, target, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const mediaquery0_changes = {};

			if (dirty & /*$$scope, $$props, matches*/ 13) {
				mediaquery0_changes.$$scope = { dirty, ctx };
			}

			mediaquery0.$set(mediaquery0_changes);
			const mediaquery1_changes = {};

			if (dirty & /*$$scope, $$props, matches*/ 13) {
				mediaquery1_changes.$$scope = { dirty, ctx };
			}

			mediaquery1.$set(mediaquery1_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(mediaquery0.$$.fragment, local);
			transition_in(mediaquery1.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(mediaquery0.$$.fragment, local);
			transition_out(mediaquery1.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(mediaquery0, detaching);
			if (detaching) detach_dev(t);
			destroy_component(mediaquery1, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$7.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$7($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("RightContentBox", slots, ['default']);

	$$self.$$set = $$new_props => {
		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
		if ("$$scope" in $$new_props) $$invalidate(2, $$scope = $$new_props.$$scope);
	};

	$$self.$capture_state = () => ({ MediaQuery });

	$$self.$inject_state = $$new_props => {
		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$props = exclude_internal_props($$props);
	return [$$props, slots, $$scope];
}

class RightContentBox extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "RightContentBox",
			options,
			id: create_fragment$7.name
		});
	}
}

/* src/scenes/bottombar/LargeIcon.svelte generated by Svelte v3.38.2 */

const file$6 = "src/scenes/bottombar/LargeIcon.svelte";

function create_fragment$6(ctx) {
	let div2;
	let div0;
	let img;
	let img_src_value;
	let t0;
	let div1;
	let t1_value = /*$$props*/ ctx[0].text + "";
	let t1;

	const block = {
		c: function create() {
			div2 = element("div");
			div0 = element("div");
			img = element("img");
			t0 = space();
			div1 = element("div");
			t1 = text(t1_value);
			if (img.src !== (img_src_value = /*$$props*/ ctx[0].src)) attr_dev(img, "src", img_src_value);
			attr_dev(img, "alt", "image");
			attr_dev(img, "class", "image svelte-g4vltw");
			add_location(img, file$6, 2, 8, 66);
			attr_dev(div0, "class", "image-container");
			add_location(div0, file$6, 1, 4, 28);
			attr_dev(div1, "class", "description svelte-g4vltw");
			add_location(div1, file$6, 4, 4, 133);
			attr_dev(div2, "class", "container svelte-g4vltw");
			add_location(div2, file$6, 0, 0, 0);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div2, anchor);
			append_dev(div2, div0);
			append_dev(div0, img);
			append_dev(div2, t0);
			append_dev(div2, div1);
			append_dev(div1, t1);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*$$props*/ 1 && img.src !== (img_src_value = /*$$props*/ ctx[0].src)) {
				attr_dev(img, "src", img_src_value);
			}

			if (dirty & /*$$props*/ 1 && t1_value !== (t1_value = /*$$props*/ ctx[0].text + "")) set_data_dev(t1, t1_value);
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(div2);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$6.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$6($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("LargeIcon", slots, []);

	$$self.$$set = $$new_props => {
		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
	};

	$$self.$inject_state = $$new_props => {
		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$props = exclude_internal_props($$props);
	return [$$props];
}

class LargeIcon extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "LargeIcon",
			options,
			id: create_fragment$6.name
		});
	}
}

/* src/scenes/bottombar/ContactInfo.svelte generated by Svelte v3.38.2 */

const file$5 = "src/scenes/bottombar/ContactInfo.svelte";

function create_fragment$5(ctx) {
	let div;
	let p0;
	let t1;
	let p1;
	let t3;
	let p2;
	let t5;
	let br;
	let t6;
	let p3;
	let t8;
	let p4;
	let t10;
	let p5;

	const block = {
		c: function create() {
			div = element("div");
			p0 = element("p");
			p0.textContent = "Anni & Joel";
			t1 = space();
			p1 = element("p");
			p1.textContent = "Hääsivusto";
			t3 = space();
			p2 = element("p");
			p2.textContent = "2021";
			t5 = space();
			br = element("br");
			t6 = space();
			p3 = element("p");
			p3.textContent = "Yhteydenotot:";
			t8 = space();
			p4 = element("p");
			p4.textContent = "Anni 040 849 7736";
			t10 = space();
			p5 = element("p");
			p5.textContent = "Joel 050 452 2882";
			attr_dev(p0, "class", "svelte-s2zhh3");
			add_location(p0, file$5, 3, 4, 47);
			attr_dev(p1, "class", "svelte-s2zhh3");
			add_location(p1, file$5, 4, 4, 70);
			attr_dev(p2, "class", "svelte-s2zhh3");
			add_location(p2, file$5, 5, 4, 92);
			add_location(br, file$5, 6, 4, 108);
			attr_dev(p3, "class", "svelte-s2zhh3");
			add_location(p3, file$5, 7, 1, 116);
			attr_dev(p4, "class", "svelte-s2zhh3");
			add_location(p4, file$5, 8, 4, 141);
			attr_dev(p5, "class", "svelte-s2zhh3");
			add_location(p5, file$5, 9, 1, 167);
			attr_dev(div, "class", "container svelte-s2zhh3");
			add_location(div, file$5, 2, 0, 19);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, p0);
			append_dev(div, t1);
			append_dev(div, p1);
			append_dev(div, t3);
			append_dev(div, p2);
			append_dev(div, t5);
			append_dev(div, br);
			append_dev(div, t6);
			append_dev(div, p3);
			append_dev(div, t8);
			append_dev(div, p4);
			append_dev(div, t10);
			append_dev(div, p5);
		},
		p: noop,
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$5.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$5($$self, $$props) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("ContactInfo", slots, []);
	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ContactInfo> was created with unknown prop '${key}'`);
	});

	return [];
}

class ContactInfo extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "ContactInfo",
			options,
			id: create_fragment$5.name
		});
	}
}

/* src/scenes/bottombar/BottomInfo.svelte generated by Svelte v3.38.2 */
const file$4 = "src/scenes/bottombar/BottomInfo.svelte";

// (10:0) {#if $$props.showDetails}
function create_if_block(ctx) {
	let div;
	let largeicon0;
	let t0;
	let largeicon1;
	let t1;
	let largeicon2;
	let current;

	largeicon0 = new LargeIcon({
			props: {
				src: "./images/kuva8-kalenteri.png",
				text: "18. syyskuu 2021"
			},
			$$inline: true
		});

	largeicon1 = new LargeIcon({
			props: {
				src: "./images/kuva6-kello.png",
				text: "Klo 13.30"
			},
			$$inline: true
		});

	largeicon2 = new LargeIcon({
			props: {
				src: "./images/kuva7-paikka.png",
				text: "Otaniemen kappeli"
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			div = element("div");
			create_component(largeicon0.$$.fragment);
			t0 = space();
			create_component(largeicon1.$$.fragment);
			t1 = space();
			create_component(largeicon2.$$.fragment);
			attr_dev(div, "class", "menu-row svelte-ogogqu");
			add_location(div, file$4, 10, 4, 281);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			mount_component(largeicon0, div, null);
			append_dev(div, t0);
			mount_component(largeicon1, div, null);
			append_dev(div, t1);
			mount_component(largeicon2, div, null);
			current = true;
		},
		i: function intro(local) {
			if (current) return;
			transition_in(largeicon0.$$.fragment, local);
			transition_in(largeicon1.$$.fragment, local);
			transition_in(largeicon2.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(largeicon0.$$.fragment, local);
			transition_out(largeicon1.$$.fragment, local);
			transition_out(largeicon2.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			destroy_component(largeicon0);
			destroy_component(largeicon1);
			destroy_component(largeicon2);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block.name,
		type: "if",
		source: "(10:0) {#if $$props.showDetails}",
		ctx
	});

	return block;
}

function create_fragment$4(ctx) {
	let div;
	let h2;
	let t0;
	let span;
	let t2;
	let t3;
	let contactinfo;
	let current;
	let if_block = /*$$props*/ ctx[0].showDetails && create_if_block(ctx);
	contactinfo = new ContactInfo({ $$inline: true });

	const block = {
		c: function create() {
			div = element("div");
			h2 = element("h2");
			t0 = text("Sanomme toisillemme ");
			span = element("span");
			span.textContent = "tahdon";
			t2 = space();
			if (if_block) if_block.c();
			t3 = space();
			create_component(contactinfo.$$.fragment);
			attr_dev(span, "class", "styled-text svelte-ogogqu");
			add_location(span, file$4, 6, 49, 198);
			attr_dev(h2, "class", "bottom-title svelte-ogogqu");
			add_location(h2, file$4, 6, 4, 153);
			attr_dev(div, "class", "text-container svelte-ogogqu");
			add_location(div, file$4, 5, 0, 120);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, h2);
			append_dev(h2, t0);
			append_dev(h2, span);
			insert_dev(target, t2, anchor);
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, t3, anchor);
			mount_component(contactinfo, target, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (/*$$props*/ ctx[0].showDetails) {
				if (if_block) {
					if (dirty & /*$$props*/ 1) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(t3.parentNode, t3);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			transition_in(contactinfo.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			transition_out(contactinfo.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			if (detaching) detach_dev(t2);
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(t3);
			destroy_component(contactinfo, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$4.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$4($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("BottomInfo", slots, []);

	$$self.$$set = $$new_props => {
		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
	};

	$$self.$capture_state = () => ({ LargeIcon, ContactInfo });

	$$self.$inject_state = $$new_props => {
		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$props = exclude_internal_props($$props);
	return [$$props];
}

class BottomInfo extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "BottomInfo",
			options,
			id: create_fragment$4.name
		});
	}
}

/* src/scenes/BasePage.svelte generated by Svelte v3.38.2 */
const file$3 = "src/scenes/BasePage.svelte";

function create_fragment$3(ctx) {
	let main;
	let title;
	let t0;
	let div;
	let t1;
	let bottominfo;
	let current;
	title = new Title({ $$inline: true });
	const default_slot_template = /*#slots*/ ctx[2].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

	bottominfo = new BottomInfo({
			props: {
				showDetails: /*$$props*/ ctx[0].showDetails
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			main = element("main");
			create_component(title.$$.fragment);
			t0 = space();
			div = element("div");
			if (default_slot) default_slot.c();
			t1 = space();
			create_component(bottominfo.$$.fragment);
			attr_dev(div, "class", "container svelte-1udgdqi");
			add_location(div, file$3, 10, 1, 282);
			attr_dev(main, "class", "svelte-1udgdqi");
			add_location(main, file$3, 7, 0, 262);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			insert_dev(target, main, anchor);
			mount_component(title, main, null);
			append_dev(main, t0);
			append_dev(main, div);

			if (default_slot) {
				default_slot.m(div, null);
			}

			append_dev(main, t1);
			mount_component(bottominfo, main, null);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
				}
			}

			const bottominfo_changes = {};
			if (dirty & /*$$props*/ 1) bottominfo_changes.showDetails = /*$$props*/ ctx[0].showDetails;
			bottominfo.$set(bottominfo_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(title.$$.fragment, local);
			transition_in(default_slot, local);
			transition_in(bottominfo.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(title.$$.fragment, local);
			transition_out(default_slot, local);
			transition_out(bottominfo.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(main);
			destroy_component(title);
			if (default_slot) default_slot.d(detaching);
			destroy_component(bottominfo);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$3.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$3($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("BasePage", slots, ['default']);

	$$self.$$set = $$new_props => {
		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
		if ("$$scope" in $$new_props) $$invalidate(1, $$scope = $$new_props.$$scope);
	};

	$$self.$capture_state = () => ({
		Title,
		LeftContentBox,
		RightContentBox,
		BottomInfo
	});

	$$self.$inject_state = $$new_props => {
		$$invalidate(0, $$props = assign(assign({}, $$props), $$new_props));
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	$$props = exclude_internal_props($$props);
	return [$$props, $$scope, slots];
}

class BasePage extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "BasePage",
			options,
			id: create_fragment$3.name
		});
	}
}

function styles(node, styles) {
	setCustomProperties(node, styles);
	
	return {
		update(styles) {
			setCustomProperties(node, styles);
		}
	};
}

function setCustomProperties(node, styles) {
	Object.entries(styles).forEach(([key, value]) => {
    node.style.setProperty(`--${key}`, value);
  });
}

/* src/scenes/MainPage.svelte generated by Svelte v3.38.2 */
const file$2 = "src/scenes/MainPage.svelte";

// (12:1) <LeftContentBox   src="./images/kuva1-oksa.png"    title="Sydämellisesti tervetuloa hääsivustollemme!"    >
function create_default_slot_7(ctx) {
	let p;

	const block = {
		c: function create() {
			p = element("p");
			p.textContent = "Tällä sivulla voi ilmoittaa tulostasi tai mahdollisesta esteestä ja lukea ajantasaista infoa häistä.";
			add_location(p, file$2, 15, 2, 521);
		},
		m: function mount(target, anchor) {
			insert_dev(target, p, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(p);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_7.name,
		type: "slot",
		source: "(12:1) <LeftContentBox   src=\\\"./images/kuva1-oksa.png\\\"    title=\\\"Sydämellisesti tervetuloa hääsivustollemme!\\\"    >",
		ctx
	});

	return block;
}

// (24:2) <Link to="/register" class="navigate-button">
function create_default_slot_6(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("Ilmoittaudu tästä");
		},
		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_6.name,
		type: "slot",
		source: "(24:2) <Link to=\\\"/register\\\" class=\\\"navigate-button\\\">",
		ctx
	});

	return block;
}

// (19:1) <RightContentBox   src="./images/kuva9-lintu.jpg"    title="Muistathan ilmoittautua 31.8.2021 mennessä"   >
function create_default_slot_5(ctx) {
	let p;
	let t1;
	let link;
	let current;

	link = new Link({
			props: {
				to: "/register",
				class: "navigate-button",
				$$slots: { default: [create_default_slot_6] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			p = element("p");
			p.textContent = "Ilmoitathan tulostasi tai mahdollisesta esteestä- Ilmoittautumislomake sis. tiedon allergioista ja erityisruokavalioista.";
			t1 = space();
			create_component(link.$$.fragment);
			add_location(p, file$2, 22, 2, 760);
		},
		m: function mount(target, anchor) {
			insert_dev(target, p, anchor);
			insert_dev(target, t1, anchor);
			mount_component(link, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const link_changes = {};

			if (dirty & /*$$scope*/ 1) {
				link_changes.$$scope = { dirty, ctx };
			}

			link.$set(link_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(link.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(link.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(p);
			if (detaching) detach_dev(t1);
			destroy_component(link, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_5.name,
		type: "slot",
		source: "(19:1) <RightContentBox   src=\\\"./images/kuva9-lintu.jpg\\\"    title=\\\"Muistathan ilmoittautua 31.8.2021 mennessä\\\"   >",
		ctx
	});

	return block;
}

// (27:1) <LeftContentBox   src="./images/kuva10-talo.jpg"    title="Päivittyvää lisätietoa"    button="Lisätietoa"   titleStyle="margin-top:46px"  >
function create_default_slot_4(ctx) {
	let p;

	const block = {
		c: function create() {
			p = element("p");
			p.textContent = "Lue lisätietoa, jota hääkutsusta ei löytynyt! Tällä sivulla päivittyvää tietoa, kuten ohjeita parkkeeraamiseen ja ohjelmanumeron varaamiseen. Lisäksi päivitämme kesän aikana muutoin tarkempaa infoa päivän kulusta sekä mahdollisista muutoksista esimerkiksi koronatilanteen vuoksi.";
			add_location(p, file$2, 32, 2, 1125);
		},
		m: function mount(target, anchor) {
			insert_dev(target, p, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(p);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_4.name,
		type: "slot",
		source: "(27:1) <LeftContentBox   src=\\\"./images/kuva10-talo.jpg\\\"    title=\\\"Päivittyvää lisätietoa\\\"    button=\\\"Lisätietoa\\\"   titleStyle=\\\"margin-top:46px\\\"  >",
		ctx
	});

	return block;
}

// (36:1) <RightContentBox   src="./images/kuva3-hääpari.jpg"    title="Perusinformaatio"    titleStyle="margin-top:43px"  >
function create_default_slot_3(ctx) {
	let div;
	let p0;
	let t1;
	let p1;
	let t3;
	let p2;
	let t5;
	let p3;
	let t7;
	let p4;

	const block = {
		c: function create() {
			div = element("div");
			p0 = element("p");
			p0.textContent = "Hääpäivä: 18.9.2021, vihkitilaisuus klo 13:30 ja juhlat kestävät noin klo 00:30 saakka";
			t1 = space();
			p1 = element("p");
			p1.textContent = "Vihkiminen: Otaniemen kappeli, Jämeräntaival 8, 02150 Espoo";
			t3 = space();
			p2 = element("p");
			p2.textContent = "Juhlatila: Thorstop, Vanha maantie 12, 02600 Espoo";
			t5 = space();
			p3 = element("p");
			p3.textContent = "Parkkeeraus: Pyydämme parkkeeraaman Leppävaaran urheilupuiston parkkipaikalle";
			t7 = space();
			p4 = element("p");
			p4.textContent = "Pukukoodi: Juhlava pukeutuminen";
			add_location(p0, file$2, 41, 3, 1577);
			add_location(p1, file$2, 42, 3, 1674);
			add_location(p2, file$2, 43, 3, 1744);
			add_location(p3, file$2, 44, 3, 1805);
			add_location(p4, file$2, 45, 3, 1894);
			attr_dev(div, "class", "base-info");
			add_location(div, file$2, 40, 2, 1550);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, p0);
			append_dev(div, t1);
			append_dev(div, p1);
			append_dev(div, t3);
			append_dev(div, p2);
			append_dev(div, t5);
			append_dev(div, p3);
			append_dev(div, t7);
			append_dev(div, p4);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_3.name,
		type: "slot",
		source: "(36:1) <RightContentBox   src=\\\"./images/kuva3-hääpari.jpg\\\"    title=\\\"Perusinformaatio\\\"    titleStyle=\\\"margin-top:43px\\\"  >",
		ctx
	});

	return block;
}

// (50:1) <LeftContentBox   src="./images/kuva4-puhekupla.jpg"    title="Ohjelmanumeron järjestäminen"    titleStyle="margin-top:23px"  >
function create_default_slot_2(ctx) {
	let p0;
	let t1;
	let p1;
	let t3;
	let p2;
	let t5;
	let p3;

	const block = {
		c: function create() {
			p0 = element("p");
			p0.textContent = "Jos olet suunnitellut jotain isompaa ohjelmaa, niin ilmoitathan siitä etukäteen Henrylle, jotta saamme mieluisesi ohjelmanumeron hääjuhlan aikatauluun.";
			t1 = space();
			p1 = element("p");
			p1.textContent = "Henry Sanmark";
			t3 = space();
			p2 = element("p");
			p2.textContent = "+358 503457711";
			t5 = space();
			p3 = element("p");
			p3.textContent = "henry.sanmark@iki.fi";
			attr_dev(p0, "class", "base-info");
			add_location(p0, file$2, 54, 2, 2094);
			add_location(p1, file$2, 55, 2, 2273);
			add_location(p2, file$2, 56, 2, 2296);
			add_location(p3, file$2, 57, 2, 2320);
		},
		m: function mount(target, anchor) {
			insert_dev(target, p0, anchor);
			insert_dev(target, t1, anchor);
			insert_dev(target, p1, anchor);
			insert_dev(target, t3, anchor);
			insert_dev(target, p2, anchor);
			insert_dev(target, t5, anchor);
			insert_dev(target, p3, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(p0);
			if (detaching) detach_dev(t1);
			if (detaching) detach_dev(p1);
			if (detaching) detach_dev(t3);
			if (detaching) detach_dev(p2);
			if (detaching) detach_dev(t5);
			if (detaching) detach_dev(p3);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_2.name,
		type: "slot",
		source: "(50:1) <LeftContentBox   src=\\\"./images/kuva4-puhekupla.jpg\\\"    title=\\\"Ohjelmanumeron järjestäminen\\\"    titleStyle=\\\"margin-top:23px\\\"  >",
		ctx
	});

	return block;
}

// (61:1) <RightContentBox   src="./images/kuva5-kukka.jpg"    title="Muistaminen"    titleStyle="margin-top:50px"  >
function create_default_slot_1$1(ctx) {
	let div;
	let p0;
	let t1;
	let p1;
	let t3;
	let p2;

	const block = {
		c: function create() {
			div = element("div");
			p0 = element("p");
			p0.textContent = "Meille tärkeintä on, että tulette juhlimaan kanssamme tärkeää päiväämme. Halutessasi voit muistaa meitä kartuttamalla häämatkakassaamme:";
			t1 = space();
			p1 = element("p");
			p1.textContent = "FI13 1470 3501 0573 87 (Nordea)";
			t3 = space();
			p2 = element("p");
			p2.textContent = "Joel Huttunen tai Anni Laitinen";
			add_location(p0, file$2, 66, 3, 2506);
			add_location(p1, file$2, 67, 3, 2653);
			add_location(p2, file$2, 68, 3, 2695);
			attr_dev(div, "class", "base-info");
			add_location(div, file$2, 65, 2, 2479);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, p0);
			append_dev(div, t1);
			append_dev(div, p1);
			append_dev(div, t3);
			append_dev(div, p2);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_1$1.name,
		type: "slot",
		source: "(61:1) <RightContentBox   src=\\\"./images/kuva5-kukka.jpg\\\"    title=\\\"Muistaminen\\\"    titleStyle=\\\"margin-top:50px\\\"  >",
		ctx
	});

	return block;
}

// (11:0) <BasePage showDetails>
function create_default_slot$2(ctx) {
	let leftcontentbox0;
	let t0;
	let rightcontentbox0;
	let t1;
	let leftcontentbox1;
	let t2;
	let rightcontentbox1;
	let t3;
	let leftcontentbox2;
	let t4;
	let rightcontentbox2;
	let current;

	leftcontentbox0 = new LeftContentBox({
			props: {
				src: "./images/kuva1-oksa.png",
				title: "Sydämellisesti tervetuloa hääsivustollemme!",
				$$slots: { default: [create_default_slot_7] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	rightcontentbox0 = new RightContentBox({
			props: {
				src: "./images/kuva9-lintu.jpg",
				title: "Muistathan ilmoittautua 31.8.2021 mennessä",
				$$slots: { default: [create_default_slot_5] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	leftcontentbox1 = new LeftContentBox({
			props: {
				src: "./images/kuva10-talo.jpg",
				title: "Päivittyvää lisätietoa",
				button: "Lisätietoa",
				titleStyle: "margin-top:46px",
				$$slots: { default: [create_default_slot_4] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	rightcontentbox1 = new RightContentBox({
			props: {
				src: "./images/kuva3-hääpari.jpg",
				title: "Perusinformaatio",
				titleStyle: "margin-top:43px",
				$$slots: { default: [create_default_slot_3] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	leftcontentbox2 = new LeftContentBox({
			props: {
				src: "./images/kuva4-puhekupla.jpg",
				title: "Ohjelmanumeron järjestäminen",
				titleStyle: "margin-top:23px",
				$$slots: { default: [create_default_slot_2] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	rightcontentbox2 = new RightContentBox({
			props: {
				src: "./images/kuva5-kukka.jpg",
				title: "Muistaminen",
				titleStyle: "margin-top:50px",
				$$slots: { default: [create_default_slot_1$1] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(leftcontentbox0.$$.fragment);
			t0 = space();
			create_component(rightcontentbox0.$$.fragment);
			t1 = space();
			create_component(leftcontentbox1.$$.fragment);
			t2 = space();
			create_component(rightcontentbox1.$$.fragment);
			t3 = space();
			create_component(leftcontentbox2.$$.fragment);
			t4 = space();
			create_component(rightcontentbox2.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(leftcontentbox0, target, anchor);
			insert_dev(target, t0, anchor);
			mount_component(rightcontentbox0, target, anchor);
			insert_dev(target, t1, anchor);
			mount_component(leftcontentbox1, target, anchor);
			insert_dev(target, t2, anchor);
			mount_component(rightcontentbox1, target, anchor);
			insert_dev(target, t3, anchor);
			mount_component(leftcontentbox2, target, anchor);
			insert_dev(target, t4, anchor);
			mount_component(rightcontentbox2, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const leftcontentbox0_changes = {};

			if (dirty & /*$$scope*/ 1) {
				leftcontentbox0_changes.$$scope = { dirty, ctx };
			}

			leftcontentbox0.$set(leftcontentbox0_changes);
			const rightcontentbox0_changes = {};

			if (dirty & /*$$scope*/ 1) {
				rightcontentbox0_changes.$$scope = { dirty, ctx };
			}

			rightcontentbox0.$set(rightcontentbox0_changes);
			const leftcontentbox1_changes = {};

			if (dirty & /*$$scope*/ 1) {
				leftcontentbox1_changes.$$scope = { dirty, ctx };
			}

			leftcontentbox1.$set(leftcontentbox1_changes);
			const rightcontentbox1_changes = {};

			if (dirty & /*$$scope*/ 1) {
				rightcontentbox1_changes.$$scope = { dirty, ctx };
			}

			rightcontentbox1.$set(rightcontentbox1_changes);
			const leftcontentbox2_changes = {};

			if (dirty & /*$$scope*/ 1) {
				leftcontentbox2_changes.$$scope = { dirty, ctx };
			}

			leftcontentbox2.$set(leftcontentbox2_changes);
			const rightcontentbox2_changes = {};

			if (dirty & /*$$scope*/ 1) {
				rightcontentbox2_changes.$$scope = { dirty, ctx };
			}

			rightcontentbox2.$set(rightcontentbox2_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(leftcontentbox0.$$.fragment, local);
			transition_in(rightcontentbox0.$$.fragment, local);
			transition_in(leftcontentbox1.$$.fragment, local);
			transition_in(rightcontentbox1.$$.fragment, local);
			transition_in(leftcontentbox2.$$.fragment, local);
			transition_in(rightcontentbox2.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(leftcontentbox0.$$.fragment, local);
			transition_out(rightcontentbox0.$$.fragment, local);
			transition_out(leftcontentbox1.$$.fragment, local);
			transition_out(rightcontentbox1.$$.fragment, local);
			transition_out(leftcontentbox2.$$.fragment, local);
			transition_out(rightcontentbox2.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(leftcontentbox0, detaching);
			if (detaching) detach_dev(t0);
			destroy_component(rightcontentbox0, detaching);
			if (detaching) detach_dev(t1);
			destroy_component(leftcontentbox1, detaching);
			if (detaching) detach_dev(t2);
			destroy_component(rightcontentbox1, detaching);
			if (detaching) detach_dev(t3);
			destroy_component(leftcontentbox2, detaching);
			if (detaching) detach_dev(t4);
			destroy_component(rightcontentbox2, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot$2.name,
		type: "slot",
		source: "(11:0) <BasePage showDetails>",
		ctx
	});

	return block;
}

function create_fragment$2(ctx) {
	let basepage;
	let current;

	basepage = new BasePage({
			props: {
				showDetails: true,
				$$slots: { default: [create_default_slot$2] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(basepage.$$.fragment);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			mount_component(basepage, target, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const basepage_changes = {};

			if (dirty & /*$$scope*/ 1) {
				basepage_changes.$$scope = { dirty, ctx };
			}

			basepage.$set(basepage_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(basepage.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(basepage.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(basepage, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$2.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$2($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("MainPage", slots, []);
	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MainPage> was created with unknown prop '${key}'`);
	});

	$$self.$capture_state = () => ({
		Link,
		BasePage,
		Title,
		LeftContentBox,
		RightContentBox,
		BottomInfo,
		styles
	});

	return [];
}

class MainPage extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "MainPage",
			options,
			id: create_fragment$2.name
		});
	}
}

/* src/scenes/RegisterPage.svelte generated by Svelte v3.38.2 */
const file$1 = "src/scenes/RegisterPage.svelte";

// (9:0) <BasePage>
function create_default_slot$1(ctx) {
	let div0;
	let h1;
	let t1;
	let p;
	let t3;
	let a;
	let t5;
	let div1;
	let iframe;
	let iframe_src_value;

	const block = {
		c: function create() {
			div0 = element("div");
			h1 = element("h1");
			h1.textContent = "Ilmoittautuminen";
			t1 = space();
			p = element("p");
			p.textContent = "Tällä lomakkeella voit ilmoittaa tulostasi / estymisestä Joelin ja Annin häihin 18.9.2021 sekä mahdollisista allergioista tai erityisruokavaliosta. Mikäli, lomake ei näy laitteellasi voit avata sen myös erilliseen välilehteen:";
			t3 = space();
			a = element("a");
			a.textContent = "https://forms.gle/ZmHEETtU2sHoP5ML8";
			t5 = space();
			div1 = element("div");
			iframe = element("iframe");
			iframe.textContent = "Ladataan...";
			add_location(h1, file$1, 10, 8, 350);
			add_location(p, file$1, 11, 8, 384);
			attr_dev(a, "href", "https://forms.gle/ZmHEETtU2sHoP5ML8");
			add_location(a, file$1, 12, 8, 626);
			attr_dev(div0, "class", "info");
			add_location(div0, file$1, 9, 4, 323);
			attr_dev(iframe, "title", "");
			if (iframe.src !== (iframe_src_value = "https://docs.google.com/forms/d/e/1FAIpQLScR_MPWApjknTI46LEcxaFMlfKGg9JVVF5eGV53Fb6_PszWoQ/viewform?embedded=true")) attr_dev(iframe, "src", iframe_src_value);
			attr_dev(iframe, "onload", "window.parent.scrollTo(0,0)");
			attr_dev(iframe, "id", "oc-contact");
			attr_dev(iframe, "width", "800");
			attr_dev(iframe, "height", "1360");
			attr_dev(iframe, "frameborder", "0");
			attr_dev(iframe, "marginheight", "0");
			attr_dev(iframe, "marginwidth", "0");
			add_location(iframe, file$1, 15, 8, 759);
			attr_dev(div1, "class", "container svelte-1olkwsh");
			add_location(div1, file$1, 14, 4, 727);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div0, anchor);
			append_dev(div0, h1);
			append_dev(div0, t1);
			append_dev(div0, p);
			append_dev(div0, t3);
			append_dev(div0, a);
			insert_dev(target, t5, anchor);
			insert_dev(target, div1, anchor);
			append_dev(div1, iframe);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div0);
			if (detaching) detach_dev(t5);
			if (detaching) detach_dev(div1);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot$1.name,
		type: "slot",
		source: "(9:0) <BasePage>",
		ctx
	});

	return block;
}

function create_fragment$1(ctx) {
	let basepage;
	let current;

	basepage = new BasePage({
			props: {
				$$slots: { default: [create_default_slot$1] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(basepage.$$.fragment);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			mount_component(basepage, target, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const basepage_changes = {};

			if (dirty & /*$$scope*/ 1) {
				basepage_changes.$$scope = { dirty, ctx };
			}

			basepage.$set(basepage_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(basepage.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(basepage.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(basepage, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$1.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$1($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("RegisterPage", slots, []);
	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<RegisterPage> was created with unknown prop '${key}'`);
	});

	$$self.$capture_state = () => ({
		BasePage,
		Title,
		LeftContentBox,
		RightContentBox,
		BottomInfo
	});

	return [];
}

class RegisterPage extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "RegisterPage",
			options,
			id: create_fragment$1.name
		});
	}
}

/* src/App.svelte generated by Svelte v3.38.2 */
const file = "src/App.svelte";

// (11:4) <Route path="/">
function create_default_slot_1(ctx) {
	let mainpage;
	let current;
	mainpage = new MainPage({ $$inline: true });

	const block = {
		c: function create() {
			create_component(mainpage.$$.fragment);
		},
		m: function mount(target, anchor) {
			mount_component(mainpage, target, anchor);
			current = true;
		},
		i: function intro(local) {
			if (current) return;
			transition_in(mainpage.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(mainpage.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(mainpage, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot_1.name,
		type: "slot",
		source: "(11:4) <Route path=\\\"/\\\">",
		ctx
	});

	return block;
}

// (8:0) <Router url="{url}">
function create_default_slot(ctx) {
	let div;
	let route0;
	let t;
	let route1;
	let current;

	route0 = new Route({
			props: {
				path: "register",
				component: RegisterPage
			},
			$$inline: true
		});

	route1 = new Route({
			props: {
				path: "/",
				$$slots: { default: [create_default_slot_1] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			div = element("div");
			create_component(route0.$$.fragment);
			t = space();
			create_component(route1.$$.fragment);
			add_location(div, file, 8, 2, 229);
		},
		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			mount_component(route0, div, null);
			append_dev(div, t);
			mount_component(route1, div, null);
			current = true;
		},
		p: function update(ctx, dirty) {
			const route1_changes = {};

			if (dirty & /*$$scope*/ 2) {
				route1_changes.$$scope = { dirty, ctx };
			}

			route1.$set(route1_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(route0.$$.fragment, local);
			transition_in(route1.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(route0.$$.fragment, local);
			transition_out(route1.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(div);
			destroy_component(route0);
			destroy_component(route1);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot.name,
		type: "slot",
		source: "(8:0) <Router url=\\\"{url}\\\">",
		ctx
	});

	return block;
}

function create_fragment(ctx) {
	let router;
	let current;

	router = new Router({
			props: {
				url: /*url*/ ctx[0],
				$$slots: { default: [create_default_slot] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(router.$$.fragment);
		},
		l: function claim(nodes) {
			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
		},
		m: function mount(target, anchor) {
			mount_component(router, target, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const router_changes = {};
			if (dirty & /*url*/ 1) router_changes.url = /*url*/ ctx[0];

			if (dirty & /*$$scope*/ 2) {
				router_changes.$$scope = { dirty, ctx };
			}

			router.$set(router_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(router.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(router.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(router, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots("App", slots, []);
	let { url = "" } = $$props;
	const writable_props = ["url"];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
	});

	$$self.$$set = $$props => {
		if ("url" in $$props) $$invalidate(0, url = $$props.url);
	};

	$$self.$capture_state = () => ({
		Router,
		Link,
		Route,
		MainPage,
		RegisterPage,
		url
	});

	$$self.$inject_state = $$props => {
		if ("url" in $$props) $$invalidate(0, url = $$props.url);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [url];
}

class App extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance, create_fragment, safe_not_equal, { url: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "App",
			options,
			id: create_fragment.name
		});
	}

	get url() {
		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set url(value) {
		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

const app = new App({
  target: document.body,
  props: {
    title: "Infoa häätilaisuudesta",
  },
});

module.exports = app;
//# sourceMappingURL=bundle.js.map
