
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
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

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
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
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
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

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
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
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
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

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* src/components/ExpanseTable/ExpanseTable.svelte generated by Svelte v3.44.1 */

    const { console: console_1$1 } = globals;
    const file$3 = "src/components/ExpanseTable/ExpanseTable.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (20:4) {#each expenses as exp}
    function create_each_block(ctx) {
    	let tr;
    	let th;
    	let t0_value = /*exp*/ ctx[2].id + "";
    	let t0;
    	let t1;
    	let td0;
    	let t2_value = /*exp*/ ctx[2].date + "";
    	let t2;
    	let t3;
    	let td1;
    	let t4_value = /*exp*/ ctx[2].paymentType + "";
    	let t4;
    	let t5;
    	let td2;
    	let t6_value = /*exp*/ ctx[2].category + "";
    	let t6;
    	let t7;
    	let td3;
    	let t8_value = /*exp*/ ctx[2].amount + "";
    	let t8;
    	let t9;
    	let td4;
    	let t10_value = /*exp*/ ctx[2].quantity + "";
    	let t10;
    	let t11;
    	let td5;
    	let t12_value = /*exp*/ ctx[2].subtotal + "";
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
    			add_location(th, file$3, 21, 8, 574);
    			add_location(td0, file$3, 24, 8, 632);
    			add_location(td1, file$3, 26, 8, 661);
    			add_location(td2, file$3, 27, 8, 696);
    			add_location(td3, file$3, 28, 8, 728);
    			add_location(td4, file$3, 29, 8, 758);
    			add_location(td5, file$3, 30, 8, 790);
    			add_location(tr, file$3, 20, 6, 561);
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
    			if (dirty & /*expenses*/ 1 && t0_value !== (t0_value = /*exp*/ ctx[2].id + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*expenses*/ 1 && t2_value !== (t2_value = /*exp*/ ctx[2].date + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*expenses*/ 1 && t4_value !== (t4_value = /*exp*/ ctx[2].paymentType + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*expenses*/ 1 && t6_value !== (t6_value = /*exp*/ ctx[2].category + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*expenses*/ 1 && t8_value !== (t8_value = /*exp*/ ctx[2].amount + "")) set_data_dev(t8, t8_value);
    			if (dirty & /*expenses*/ 1 && t10_value !== (t10_value = /*exp*/ ctx[2].quantity + "")) set_data_dev(t10, t10_value);
    			if (dirty & /*expenses*/ 1 && t12_value !== (t12_value = /*exp*/ ctx[2].subtotal + "")) set_data_dev(t12, t12_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(20:4) {#each expenses as exp}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
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
    	let tr_transition;
    	let t13;
    	let tbody;
    	let current;
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
    			add_location(th0, file$3, 9, 6, 259);
    			attr_dev(th1, "scope", "col");
    			add_location(th1, file$3, 10, 6, 288);
    			attr_dev(th2, "scope", "col");
    			add_location(th2, file$3, 11, 6, 320);
    			attr_dev(th3, "scope", "col");
    			add_location(th3, file$3, 12, 6, 360);
    			attr_dev(th4, "scope", "col");
    			add_location(th4, file$3, 13, 6, 396);
    			attr_dev(th5, "scope", "col");
    			add_location(th5, file$3, 14, 6, 430);
    			attr_dev(th6, "scope", "col");
    			add_location(th6, file$3, 15, 6, 466);
    			add_location(tr, file$3, 8, 4, 218);
    			add_location(thead, file$3, 7, 2, 206);
    			add_location(tbody, file$3, 18, 2, 519);
    			attr_dev(table, "class", "table table-striped");
    			add_location(table, file$3, 6, 0, 168);
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

    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

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
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!tr_transition) tr_transition = create_bidirectional_transition(tr, fade, /*fadeOptions*/ ctx[1], true);
    				tr_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (!tr_transition) tr_transition = create_bidirectional_transition(tr, fade, /*fadeOptions*/ ctx[1], false);
    			tr_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			if (detaching && tr_transition) tr_transition.end();
    			destroy_each(each_blocks, detaching);
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
    	validate_slots('ExpanseTable', slots, []);
    	let { expenses } = $$props;
    	console.log("expenses", expenses);
    	const fadeOptions = { duration: 11700 };
    	const writable_props = ['expenses'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<ExpanseTable> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('expenses' in $$props) $$invalidate(0, expenses = $$props.expenses);
    	};

    	$$self.$capture_state = () => ({ fade, expenses, fadeOptions });

    	$$self.$inject_state = $$props => {
    		if ('expenses' in $$props) $$invalidate(0, expenses = $$props.expenses);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [expenses, fadeOptions];
    }

    class ExpanseTable extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { expenses: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ExpanseTable",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*expenses*/ ctx[0] === undefined && !('expenses' in props)) {
    			console_1$1.warn("<ExpanseTable> was created without expected prop 'expenses'");
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

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            if (value == null) {
                store.set(value = new_value);
                return Promise.resolve();
            }
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            if (duration === 0) {
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                store.set(value = target_value);
                return Promise.resolve();
            }
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
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
    const totalTweenStore = tweened(0, { easing: cubicOut, duration: 500, delay: 800 });

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

    function getCurrentDate() {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}-${month}-${day}`;
    }

    /* src/components/expenseCreate/expenseCreate.svelte generated by Svelte v3.44.1 */
    const file$2 = "src/components/expenseCreate/expenseCreate.svelte";

    function create_fragment$2(ctx) {
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
    			add_location(label0, file$2, 23, 4, 605);
    			attr_dev(input0, "type", "date");
    			attr_dev(input0, "class", "form-control");
    			attr_dev(input0, "id", "date");
    			attr_dev(input0, "placeholder", "dd/mm/yyyy");
    			add_location(input0, file$2, 24, 4, 640);
    			attr_dev(div0, "class", "form-group");
    			add_location(div0, file$2, 22, 2, 576);
    			attr_dev(label1, "for", "paymentType");
    			add_location(label1, file$2, 33, 4, 810);
    			option0.__value = "cash";
    			option0.value = option0.__value;
    			add_location(option0, file$2, 35, 6, 938);
    			option1.__value = "card";
    			option1.value = option1.__value;
    			add_location(option1, file$2, 36, 6, 979);
    			option2.__value = "direct-debit";
    			option2.value = option2.__value;
    			add_location(option2, file$2, 37, 6, 1020);
    			option3.__value = "cheque";
    			option3.value = option3.__value;
    			add_location(option3, file$2, 38, 6, 1077);
    			attr_dev(select0, "class", "form-control");
    			attr_dev(select0, "id", "paymentType");
    			if (/*paymentType*/ ctx[3] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[7].call(select0));
    			add_location(select0, file$2, 34, 4, 860);
    			attr_dev(div1, "class", "form-group");
    			add_location(div1, file$2, 32, 2, 781);
    			attr_dev(label2, "for", "category");
    			add_location(label2, file$2, 42, 4, 1170);
    			option4.__value = "rent";
    			option4.value = option4.__value;
    			add_location(option4, file$2, 44, 6, 1285);
    			option5.__value = "electricity";
    			option5.value = option5.__value;
    			add_location(option5, file$2, 45, 6, 1326);
    			option6.__value = "food";
    			option6.value = option6.__value;
    			add_location(option6, file$2, 46, 6, 1381);
    			option7.__value = "phone";
    			option7.value = option7.__value;
    			add_location(option7, file$2, 47, 6, 1422);
    			option8.__value = "gas";
    			option8.value = option8.__value;
    			add_location(option8, file$2, 48, 6, 1465);
    			attr_dev(select1, "class", "form-control");
    			attr_dev(select1, "id", "category");
    			if (/*category*/ ctx[4] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[8].call(select1));
    			add_location(select1, file$2, 43, 4, 1213);
    			attr_dev(div2, "class", "form-group");
    			add_location(div2, file$2, 41, 2, 1141);
    			attr_dev(label3, "for", "amount");
    			add_location(label3, file$2, 52, 4, 1552);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "form-control");
    			attr_dev(input1, "id", "amount");
    			attr_dev(input1, "placeholder", "amount");
    			add_location(input1, file$2, 53, 4, 1591);
    			attr_dev(div3, "class", "form-group");
    			add_location(div3, file$2, 51, 2, 1523);
    			attr_dev(label4, "for", "quantity");
    			add_location(label4, file$2, 62, 4, 1761);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "class", "form-control");
    			attr_dev(input2, "id", "quantity");
    			attr_dev(input2, "placeholder", "quantity");
    			add_location(input2, file$2, 63, 4, 1804);
    			attr_dev(div4, "class", "form-group");
    			add_location(div4, file$2, 61, 2, 1732);
    			attr_dev(button, "class", "btn btn-success");
    			add_location(button, file$2, 71, 2, 1953);
    			attr_dev(form, "class", "svelte-rzv6h2");
    			add_location(form, file$2, 21, 0, 521);
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
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
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

    	initform();

    	function initform() {
    		$$invalidate(3, paymentType = "cash");
    		$$invalidate(4, category = "rent");
    		$$invalidate(0, amount = "00.00");
    		$$invalidate(1, quantity = 1);
    		$$invalidate(2, date = getCurrentDate());
    	}

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
    		getCurrentDate,
    		localCreateExpense,
    		initform,
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
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ExpenseCreate",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/ExpenseTotal/ExpenseTotal.svelte generated by Svelte v3.44.1 */

    const { console: console_1 } = globals;
    const file$1 = "src/components/ExpenseTotal/ExpenseTotal.svelte";

    function create_fragment$1(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let h5;
    	let t1;
    	let h6;
    	let t3;
    	let p;
    	let t4;
    	let t5;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h5 = element("h5");
    			h5.textContent = "Total";
    			t1 = space();
    			h6 = element("h6");
    			h6.textContent = "All depenses";
    			t3 = space();
    			p = element("p");
    			t4 = text(/*$totalTweenStore*/ ctx[0]);
    			t5 = text(" €");
    			attr_dev(h5, "class", "card-title");
    			add_location(h5, file$1, 15, 10, 472);
    			attr_dev(h6, "class", "card-subtitle mb-2 text-muted");
    			add_location(h6, file$1, 16, 10, 516);
    			attr_dev(p, "class", "card-text");
    			add_location(p, file$1, 17, 10, 586);
    			attr_dev(div0, "class", "card-body");
    			add_location(div0, file$1, 14, 8, 438);
    			attr_dev(div1, "class", "card");
    			set_style(div1, "width", "18rem");
    			add_location(div1, file$1, 13, 4, 389);
    			add_location(div2, file$1, 12, 0, 379);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h5);
    			append_dev(div0, t1);
    			append_dev(div0, h6);
    			append_dev(div0, t3);
    			append_dev(div0, p);
    			append_dev(p, t4);
    			append_dev(p, t5);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$totalTweenStore*/ 1) set_data_dev(t4, /*$totalTweenStore*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
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
    	let $totalTweenStore;
    	validate_store(totalTweenStore, 'totalTweenStore');
    	component_subscribe($$self, totalTweenStore, $$value => $$invalidate(0, $totalTweenStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ExpenseTotal', slots, []);
    	let total = 0;

    	store.subscribe(data => {
    		total = data.reduce(
    			(acc, curr) => {
    				return curr.subtotal + acc;
    			},
    			0
    		);

    		totalTweenStore.set(total);
    		console.log("totalTweenStore", totalTweenStore);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<ExpenseTotal> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		store,
    		totalTweenStore,
    		total,
    		$totalTweenStore
    	});

    	$$self.$inject_state = $$props => {
    		if ('total' in $$props) total = $$props.total;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$totalTweenStore];
    }

    class ExpenseTotal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ExpenseTotal",
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
    	let expensetotal;
    	let t2;
    	let expensecreate;
    	let t3;
    	let expansetable;
    	let current;
    	expensetotal = new ExpenseTotal({ $$inline: true });
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
    			create_component(expensetotal.$$.fragment);
    			t2 = space();
    			create_component(expensecreate.$$.fragment);
    			t3 = space();
    			create_component(expansetable.$$.fragment);
    			attr_dev(h1, "class", "svelte-vdmke7");
    			add_location(h1, file, 12, 1, 395);
    			attr_dev(main, "class", "svelte-vdmke7");
    			add_location(main, file, 11, 0, 387);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(h1, t0);
    			append_dev(main, t1);
    			mount_component(expensetotal, main, null);
    			append_dev(main, t2);
    			mount_component(expensecreate, main, null);
    			append_dev(main, t3);
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
    			transition_in(expensetotal.$$.fragment, local);
    			transition_in(expensecreate.$$.fragment, local);
    			transition_in(expansetable.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(expensetotal.$$.fragment, local);
    			transition_out(expensecreate.$$.fragment, local);
    			transition_out(expansetable.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(expensetotal);
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
    		ExpenseTotal,
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
