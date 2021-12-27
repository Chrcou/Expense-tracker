
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
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
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
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
    let outros;
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
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
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.1' }, detail), true));
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
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
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

    /* src/components/ExpanseTable/ExpanseTable.svelte generated by Svelte v3.44.1 */

    const { console: console_1 } = globals;
    const file$2 = "src/components/ExpanseTable/ExpanseTable.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (18:4) {#each expenses as exp}
    function create_each_block(ctx) {
    	let tr;
    	let th;
    	let t0_value = /*exp*/ ctx[1].id + "";
    	let t0;
    	let t1;
    	let td0;
    	let t2_value = /*exp*/ ctx[1].date + "";
    	let t2;
    	let t3;
    	let td1;
    	let t4_value = /*exp*/ ctx[1].paymentType + "";
    	let t4;
    	let t5;
    	let td2;
    	let t6_value = /*exp*/ ctx[1].category + "";
    	let t6;
    	let t7;
    	let td3;
    	let t8_value = /*exp*/ ctx[1].amount + "";
    	let t8;
    	let t9;
    	let td4;
    	let t10_value = /*exp*/ ctx[1].quantity + "";
    	let t10;
    	let t11;
    	let td5;
    	let t12_value = /*exp*/ ctx[1].subtotal + "";
    	let t12;
    	let t13;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			th = element("th");
    			t0 = text(t0_value);
    			t1 = space();
    			td0 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td1 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td2 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			td3 = element("td");
    			t8 = text(t8_value);
    			t9 = space();
    			td4 = element("td");
    			t10 = text(t10_value);
    			t11 = space();
    			td5 = element("td");
    			t12 = text(t12_value);
    			t13 = space();
    			attr_dev(th, "scope", "row");
    			add_location(th, file$2, 19, 8, 461);
    			add_location(td0, file$2, 22, 8, 519);
    			add_location(td1, file$2, 24, 8, 548);
    			add_location(td2, file$2, 25, 8, 583);
    			add_location(td3, file$2, 26, 8, 615);
    			add_location(td4, file$2, 27, 8, 645);
    			add_location(td5, file$2, 28, 8, 677);
    			add_location(tr, file$2, 18, 6, 448);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, th);
    			append_dev(th, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td0);
    			append_dev(td0, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td1);
    			append_dev(td1, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td2);
    			append_dev(td2, t6);
    			append_dev(tr, t7);
    			append_dev(tr, td3);
    			append_dev(td3, t8);
    			append_dev(tr, t9);
    			append_dev(tr, td4);
    			append_dev(td4, t10);
    			append_dev(tr, t11);
    			append_dev(tr, td5);
    			append_dev(td5, t12);
    			append_dev(tr, t13);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*expenses*/ 1 && t0_value !== (t0_value = /*exp*/ ctx[1].id + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*expenses*/ 1 && t2_value !== (t2_value = /*exp*/ ctx[1].date + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*expenses*/ 1 && t4_value !== (t4_value = /*exp*/ ctx[1].paymentType + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*expenses*/ 1 && t6_value !== (t6_value = /*exp*/ ctx[1].category + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*expenses*/ 1 && t8_value !== (t8_value = /*exp*/ ctx[1].amount + "")) set_data_dev(t8, t8_value);
    			if (dirty & /*expenses*/ 1 && t10_value !== (t10_value = /*exp*/ ctx[1].quantity + "")) set_data_dev(t10, t10_value);
    			if (dirty & /*expenses*/ 1 && t12_value !== (t12_value = /*exp*/ ctx[1].subtotal + "")) set_data_dev(t12, t12_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(18:4) {#each expenses as exp}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let th4;
    	let t9;
    	let th5;
    	let t11;
    	let th6;
    	let t13;
    	let tbody;
    	let each_value = /*expenses*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "#";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Date";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Payment type";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Category";
    			t7 = space();
    			th4 = element("th");
    			th4.textContent = "Amount";
    			t9 = space();
    			th5 = element("th");
    			th5.textContent = "Quantity";
    			t11 = space();
    			th6 = element("th");
    			th6.textContent = "Subtotal";
    			t13 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(th0, "scope", "col");
    			add_location(th0, file$2, 7, 6, 146);
    			attr_dev(th1, "scope", "col");
    			add_location(th1, file$2, 8, 6, 175);
    			attr_dev(th2, "scope", "col");
    			add_location(th2, file$2, 9, 6, 207);
    			attr_dev(th3, "scope", "col");
    			add_location(th3, file$2, 10, 6, 247);
    			attr_dev(th4, "scope", "col");
    			add_location(th4, file$2, 11, 6, 283);
    			attr_dev(th5, "scope", "col");
    			add_location(th5, file$2, 12, 6, 317);
    			attr_dev(th6, "scope", "col");
    			add_location(th6, file$2, 13, 6, 353);
    			add_location(tr, file$2, 6, 4, 135);
    			add_location(thead, file$2, 5, 2, 123);
    			add_location(tbody, file$2, 16, 2, 406);
    			attr_dev(table, "class", "table table-striped");
    			add_location(table, file$2, 4, 0, 85);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(tr, t3);
    			append_dev(tr, th2);
    			append_dev(tr, t5);
    			append_dev(tr, th3);
    			append_dev(tr, t7);
    			append_dev(tr, th4);
    			append_dev(tr, t9);
    			append_dev(tr, th5);
    			append_dev(tr, t11);
    			append_dev(tr, th6);
    			append_dev(table, t13);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*expenses*/ 1) {
    				each_value = /*expenses*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
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
    	validate_slots('ExpanseTable', slots, []);
    	let { expenses } = $$props;
    	console.log("expenses", expenses);
    	const writable_props = ['expenses'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<ExpanseTable> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('expenses' in $$props) $$invalidate(0, expenses = $$props.expenses);
    	};

    	$$self.$capture_state = () => ({ expenses });

    	$$self.$inject_state = $$props => {
    		if ('expenses' in $$props) $$invalidate(0, expenses = $$props.expenses);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [expenses];
    }

    class ExpanseTable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { expenses: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ExpanseTable",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*expenses*/ ctx[0] === undefined && !('expenses' in props)) {
    			console_1.warn("<ExpanseTable> was created without expected prop 'expenses'");
    		}
    	}

    	get expenses() {
    		throw new Error("<ExpanseTable>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set expenses(value) {
    		throw new Error("<ExpanseTable>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
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
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const storeDefaultValue = [{
            id: 1,
            date: "3rd",
            paymentType: "direct debit",
            category: "rent",
            amount: 600,
            quantity: 1,
            subtotal: 600,
        }, {
            id: 2,
            date: "1st",
            paymentType: "direct debit",
            category: "internet service provider",
            amount: 39,
            quantity: 1,
            subtotal: 39,
        }];
    const store = writable(storeDefaultValue);

    function createExpense(date, paymentType, category, amount, quantity, subtotal) {
        console.log("createExpanse");
        store.update((data) => {
            let id = data.length + 1;
            let newExpense = {
                id,
                paymentType,
                date,
                category,
                amount,
                quantity,
                subtotal,
            };
            return [...data, newExpense];
        });
    }

    /* src/components/expenseCreate/expenseCreate.svelte generated by Svelte v3.44.1 */
    const file$1 = "src/components/expenseCreate/expenseCreate.svelte";

    function create_fragment$1(ctx) {
    	let form;
    	let div0;
    	let label0;
    	let t1;
    	let input0;
    	let t2;
    	let div1;
    	let label1;
    	let t4;
    	let select0;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let t9;
    	let div2;
    	let label2;
    	let t11;
    	let select1;
    	let option4;
    	let option5;
    	let option6;
    	let option7;
    	let option8;
    	let t17;
    	let div3;
    	let label3;
    	let t19;
    	let input1;
    	let t20;
    	let div4;
    	let label4;
    	let t22;
    	let input2;
    	let t23;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = "Date";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = "Payment type";
    			t4 = space();
    			select0 = element("select");
    			option0 = element("option");
    			option0.textContent = "cash";
    			option1 = element("option");
    			option1.textContent = "card";
    			option2 = element("option");
    			option2.textContent = "direct debit";
    			option3 = element("option");
    			option3.textContent = "cheque";
    			t9 = space();
    			div2 = element("div");
    			label2 = element("label");
    			label2.textContent = "Category";
    			t11 = space();
    			select1 = element("select");
    			option4 = element("option");
    			option4.textContent = "rent";
    			option5 = element("option");
    			option5.textContent = "electricity";
    			option6 = element("option");
    			option6.textContent = "food";
    			option7 = element("option");
    			option7.textContent = "phone";
    			option8 = element("option");
    			option8.textContent = "gas";
    			t17 = space();
    			div3 = element("div");
    			label3 = element("label");
    			label3.textContent = "Amount";
    			t19 = space();
    			input1 = element("input");
    			t20 = space();
    			div4 = element("div");
    			label4 = element("label");
    			label4.textContent = "Quantity";
    			t22 = space();
    			input2 = element("input");
    			t23 = space();
    			button = element("button");
    			button.textContent = "create";
    			attr_dev(label0, "for", "date");
    			add_location(label0, file$1, 14, 4, 400);
    			attr_dev(input0, "type", "date");
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "id", "date");
    			attr_dev(input0, "placeholder", "dd/mm/yyyy");
    			add_location(input0, file$1, 15, 4, 435);
    			attr_dev(div0, "class", "form-group");
    			add_location(div0, file$1, 13, 2, 371);
    			attr_dev(label1, "for", "paymentType");
    			add_location(label1, file$1, 24, 4, 605);
    			option0.__value = "cash";
    			option0.value = option0.__value;
    			add_location(option0, file$1, 26, 6, 733);
    			option1.__value = "card";
    			option1.value = option1.__value;
    			add_location(option1, file$1, 27, 6, 774);
    			option2.__value = "direct-debit";
    			option2.value = option2.__value;
    			add_location(option2, file$1, 28, 6, 815);
    			option3.__value = "cheque";
    			option3.value = option3.__value;
    			add_location(option3, file$1, 29, 6, 872);
    			attr_dev(select0, "class", "form-control");
    			attr_dev(select0, "id", "paymentType");
    			if (/*paymentType*/ ctx[3] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[7].call(select0));
    			add_location(select0, file$1, 25, 4, 655);
    			attr_dev(div1, "class", "form-group");
    			add_location(div1, file$1, 23, 2, 576);
    			attr_dev(label2, "for", "category");
    			add_location(label2, file$1, 33, 4, 965);
    			option4.__value = "rent";
    			option4.value = option4.__value;
    			add_location(option4, file$1, 35, 6, 1080);
    			option5.__value = "electricity";
    			option5.value = option5.__value;
    			add_location(option5, file$1, 36, 6, 1121);
    			option6.__value = "food";
    			option6.value = option6.__value;
    			add_location(option6, file$1, 37, 6, 1176);
    			option7.__value = "phone";
    			option7.value = option7.__value;
    			add_location(option7, file$1, 38, 6, 1217);
    			option8.__value = "gas";
    			option8.value = option8.__value;
    			add_location(option8, file$1, 39, 6, 1260);
    			attr_dev(select1, "class", "form-control");
    			attr_dev(select1, "id", "category");
    			if (/*category*/ ctx[4] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[8].call(select1));
    			add_location(select1, file$1, 34, 4, 1008);
    			attr_dev(div2, "class", "form-group");
    			add_location(div2, file$1, 32, 2, 936);
    			attr_dev(label3, "for", "amount");
    			add_location(label3, file$1, 43, 4, 1347);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "id", "amount");
    			attr_dev(input1, "placeholder", "amount");
    			add_location(input1, file$1, 44, 4, 1386);
    			attr_dev(div3, "class", "form-group");
    			add_location(div3, file$1, 42, 2, 1318);
    			attr_dev(label4, "for", "quantity");
    			add_location(label4, file$1, 53, 4, 1556);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "class", "form-control");
    			attr_dev(input2, "id", "quantity");
    			attr_dev(input2, "placeholder", "quantity");
    			add_location(input2, file$1, 54, 4, 1599);
    			attr_dev(div4, "class", "form-group");
    			add_location(div4, file$1, 52, 2, 1527);
    			attr_dev(button, "class", "btn btn-success");
    			add_location(button, file$1, 62, 2, 1748);
    			add_location(form, file$1, 12, 0, 316);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t1);
    			append_dev(div0, input0);
    			set_input_value(input0, /*date*/ ctx[2]);
    			append_dev(form, t2);
    			append_dev(form, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t4);
    			append_dev(div1, select0);
    			append_dev(select0, option0);
    			append_dev(select0, option1);
    			append_dev(select0, option2);
    			append_dev(select0, option3);
    			select_option(select0, /*paymentType*/ ctx[3]);
    			append_dev(form, t9);
    			append_dev(form, div2);
    			append_dev(div2, label2);
    			append_dev(div2, t11);
    			append_dev(div2, select1);
    			append_dev(select1, option4);
    			append_dev(select1, option5);
    			append_dev(select1, option6);
    			append_dev(select1, option7);
    			append_dev(select1, option8);
    			select_option(select1, /*category*/ ctx[4]);
    			append_dev(form, t17);
    			append_dev(form, div3);
    			append_dev(div3, label3);
    			append_dev(div3, t19);
    			append_dev(div3, input1);
    			set_input_value(input1, /*amount*/ ctx[0]);
    			append_dev(form, t20);
    			append_dev(form, div4);
    			append_dev(div4, label4);
    			append_dev(div4, t22);
    			append_dev(div4, input2);
    			set_input_value(input2, /*quantity*/ ctx[1]);
    			append_dev(form, t23);
    			append_dev(form, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[6]),
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[7]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[8]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[9]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[10]),
    					listen_dev(form, "submit", prevent_default(/*localCreateExpense*/ ctx[5]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*date*/ 4) {
    				set_input_value(input0, /*date*/ ctx[2]);
    			}

    			if (dirty & /*paymentType*/ 8) {
    				select_option(select0, /*paymentType*/ ctx[3]);
    			}

    			if (dirty & /*category*/ 16) {
    				select_option(select1, /*category*/ ctx[4]);
    			}

    			if (dirty & /*amount*/ 1 && input1.value !== /*amount*/ ctx[0]) {
    				set_input_value(input1, /*amount*/ ctx[0]);
    			}

    			if (dirty & /*quantity*/ 2 && to_number(input2.value) !== /*quantity*/ ctx[1]) {
    				set_input_value(input2, /*quantity*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			mounted = false;
    			run_all(dispose);
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
    	let subtotal;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ExpenseCreate', slots, []);
    	let date;
    	let paymentType;
    	let category;
    	let amount = "00.00";
    	let quantity;

    	let localCreateExpense = () => {
    		createExpense(date, paymentType, category, Number(amount), quantity, subtotal);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ExpenseCreate> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		date = this.value;
    		$$invalidate(2, date);
    	}

    	function select0_change_handler() {
    		paymentType = select_value(this);
    		$$invalidate(3, paymentType);
    	}

    	function select1_change_handler() {
    		category = select_value(this);
    		$$invalidate(4, category);
    	}

    	function input1_input_handler() {
    		amount = this.value;
    		$$invalidate(0, amount);
    	}

    	function input2_input_handler() {
    		quantity = to_number(this.value);
    		$$invalidate(1, quantity);
    	}

    	$$self.$capture_state = () => ({
    		date,
    		paymentType,
    		category,
    		amount,
    		quantity,
    		createExpense,
    		localCreateExpense,
    		subtotal
    	});

    	$$self.$inject_state = $$props => {
    		if ('date' in $$props) $$invalidate(2, date = $$props.date);
    		if ('paymentType' in $$props) $$invalidate(3, paymentType = $$props.paymentType);
    		if ('category' in $$props) $$invalidate(4, category = $$props.category);
    		if ('amount' in $$props) $$invalidate(0, amount = $$props.amount);
    		if ('quantity' in $$props) $$invalidate(1, quantity = $$props.quantity);
    		if ('localCreateExpense' in $$props) $$invalidate(5, localCreateExpense = $$props.localCreateExpense);
    		if ('subtotal' in $$props) subtotal = $$props.subtotal;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*amount, quantity*/ 3) {
    			subtotal = Number(amount) * quantity;
    		}
    	};

    	return [
    		amount,
    		quantity,
    		date,
    		paymentType,
    		category,
    		localCreateExpense,
    		input0_input_handler,
    		select0_change_handler,
    		select1_change_handler,
    		input1_input_handler,
    		input2_input_handler
    	];
    }

    class ExpenseCreate extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ExpenseCreate",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.44.1 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let h1;
    	let t0;
    	let t1;
    	let expensecreate;
    	let t2;
    	let expansetable;
    	let current;
    	expensecreate = new ExpenseCreate({ $$inline: true });

    	expansetable = new ExpanseTable({
    			props: { expenses: /*expenses*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			create_component(expensecreate.$$.fragment);
    			t2 = space();
    			create_component(expansetable.$$.fragment);
    			attr_dev(h1, "class", "svelte-4tfad7");
    			add_location(h1, file, 11, 1, 321);
    			attr_dev(main, "class", "svelte-4tfad7");
    			add_location(main, file, 10, 0, 313);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(h1, t0);
    			append_dev(main, t1);
    			mount_component(expensecreate, main, null);
    			append_dev(main, t2);
    			mount_component(expansetable, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);
    			const expansetable_changes = {};
    			if (dirty & /*expenses*/ 2) expansetable_changes.expenses = /*expenses*/ ctx[1];
    			expansetable.$set(expansetable_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(expensecreate.$$.fragment, local);
    			transition_in(expansetable.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(expensecreate.$$.fragment, local);
    			transition_out(expansetable.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(expensecreate);
    			destroy_component(expansetable);
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
    	validate_slots('App', slots, []);
    	let { title } = $$props;
    	let expenses = [];

    	store.subscribe(data => {
    		$$invalidate(1, expenses = data);
    	});

    	const writable_props = ['title'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    	};

    	$$self.$capture_state = () => ({
    		ExpanseTable,
    		ExpenseCreate,
    		store,
    		title,
    		expenses
    	});

    	$$self.$inject_state = $$props => {
    		if ('title' in $$props) $$invalidate(0, title = $$props.title);
    		if ('expenses' in $$props) $$invalidate(1, expenses = $$props.expenses);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, expenses];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { title: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !('title' in props)) {
    			console.warn("<App> was created without expected prop 'title'");
    		}
    	}

    	get title() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
        target: document.body,
        props: {
            title: 'Expense Tracker'
        }
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
