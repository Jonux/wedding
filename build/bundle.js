
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
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
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
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
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
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

    /* src/App.svelte generated by Svelte v3.38.2 */

    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let p0;
    	let t3;
    	let p1;
    	let t5;
    	let p2;
    	let t7;
    	let p3;
    	let t9;
    	let p4;
    	let t11;
    	let p5;
    	let t13;
    	let p6;
    	let t15;
    	let p7;
    	let t17;
    	let p8;
    	let t19;
    	let p9;
    	let t21;
    	let p10;
    	let t23;
    	let p11;
    	let t25;
    	let p12;
    	let t27;
    	let b;
    	let t29;
    	let p13;
    	let t31;
    	let p14;

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Infoa häätilaisuudesta";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "***";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "Hääpäivä: 18.9.2021, vihkitilaisuus klo 13:30, pääjuhla 15:00 - 00:30";
    			t5 = space();
    			p2 = element("p");
    			p2.textContent = "Vihkiminen eli kirkko: Otaniemen kappeli, Jämeräntaival 8, 02150 Espoo";
    			t7 = space();
    			p3 = element("p");
    			p3.textContent = "Juhlatila: Thorstop, Vanha maantie 12, 02600 Espoo";
    			t9 = space();
    			p4 = element("p");
    			p4.textContent = "Pukukoodi: Juhlava pukeutuminen";
    			t11 = space();
    			p5 = element("p");
    			p5.textContent = "***";
    			t13 = space();
    			p6 = element("p");
    			p6.textContent = "Muistaminen Meille tärkeintä on, että tulette juhlimaan kanssamme tärkeää päiväämme. Halutessasi voit muistaa meitä kartuttamalla häämatkakassaamme: FI13 1470 3501 0573 87 / Joel Huttunen tai Anni Laitinen";
    			t15 = space();
    			p7 = element("p");
    			p7.textContent = "Ilmoittautuminen on nyt auki google formissa ( linkki )! Formiin allergiat";
    			t17 = space();
    			p8 = element("p");
    			p8.textContent = "***";
    			t19 = space();
    			p9 = element("p");
    			p9.textContent = "Ilmoitathan tulostasi tai mahdollisesta esteestä 31.8.2021 mennessä hääsivuston lomakkeella:  (sis. tiedon allergioista ja erityisruokavalioista). Vaihtoehtoisesti voit ilmoittautua puhelimitse.";
    			t21 = space();
    			p10 = element("p");
    			p10.textContent = "Jos haluat pitää häissämme puheen tai olet suunnitellut jotain muuta ohjelmaa, niin ilmoitathan siitä etukäteen seremoniamestarille, jotta saamme mieluisesi ohjelmanumeron hääjuhlan aikatauluun.";
    			t23 = space();
    			p11 = element("p");
    			p11.textContent = "Parkkeeraus ensisijaisesti alapihalle (urheilupuisto).";
    			t25 = space();
    			p12 = element("p");
    			p12.textContent = "***";
    			t27 = space();
    			b = element("b");
    			b.textContent = "Yhteyshenkilöt";
    			t29 = space();
    			p13 = element("p");
    			p13.textContent = "Joel: 050-4522882";
    			t31 = space();
    			p14 = element("p");
    			p14.textContent = "Anni: 040-8497736";
    			attr_dev(h1, "class", "svelte-xmo9vl");
    			add_location(h1, file, 6, 1, 67);
    			add_location(p0, file, 8, 1, 101);
    			add_location(p1, file, 9, 1, 113);
    			add_location(p2, file, 10, 1, 191);
    			add_location(p3, file, 11, 1, 270);
    			add_location(p4, file, 12, 1, 329);
    			add_location(p5, file, 13, 1, 369);
    			add_location(p6, file, 14, 1, 381);
    			add_location(p7, file, 15, 1, 595);
    			add_location(p8, file, 16, 1, 678);
    			add_location(p9, file, 17, 4, 693);
    			add_location(p10, file, 18, 1, 897);
    			add_location(p11, file, 19, 1, 1101);
    			add_location(p12, file, 20, 1, 1164);
    			add_location(b, file, 21, 1, 1176);
    			add_location(p13, file, 22, 1, 1199);
    			add_location(p14, file, 23, 1, 1225);
    			attr_dev(main, "class", "svelte-xmo9vl");
    			add_location(main, file, 5, 0, 59);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, p0);
    			append_dev(main, t3);
    			append_dev(main, p1);
    			append_dev(main, t5);
    			append_dev(main, p2);
    			append_dev(main, t7);
    			append_dev(main, p3);
    			append_dev(main, t9);
    			append_dev(main, p4);
    			append_dev(main, t11);
    			append_dev(main, p5);
    			append_dev(main, t13);
    			append_dev(main, p6);
    			append_dev(main, t15);
    			append_dev(main, p7);
    			append_dev(main, t17);
    			append_dev(main, p8);
    			append_dev(main, t19);
    			append_dev(main, p9);
    			append_dev(main, t21);
    			append_dev(main, p10);
    			append_dev(main, t23);
    			append_dev(main, p11);
    			append_dev(main, t25);
    			append_dev(main, p12);
    			append_dev(main, t27);
    			append_dev(main, b);
    			append_dev(main, t29);
    			append_dev(main, p13);
    			append_dev(main, t31);
    			append_dev(main, p14);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
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
    	let { name } = $$props;
    	let { subName } = $$props;
    	const writable_props = ["name", "subName"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("subName" in $$props) $$invalidate(1, subName = $$props.subName);
    	};

    	$$self.$capture_state = () => ({ name, subName });

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("subName" in $$props) $$invalidate(1, subName = $$props.subName);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, subName];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { name: 0, subName: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<App> was created without expected prop 'name'");
    		}

    		if (/*subName*/ ctx[1] === undefined && !("subName" in props)) {
    			console.warn("<App> was created without expected prop 'subName'");
    		}
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get subName() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set subName(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
      target: document.body,
      props: {
    	contactInfo: "Yhteyshenkilöt"
      },
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
