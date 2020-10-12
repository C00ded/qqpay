!function(e) {
    var t = {};
    function n(r) {
        if (t[r])
            return t[r].exports;
        var o = t[r] = {
            i: r,
            l: !1,
            exports: {}
        };
        return e[r].call(o.exports, o, o.exports, n),
        o.l = !0,
        o.exports
    }
    n.m = e,
    n.c = t,
    n.d = function(e, t, r) {
        n.o(e, t) || Object.defineProperty(e, t, {
            enumerable: !0,
            get: r
        })
    }
    ,
    n.r = function(e) {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
            value: "Module"
        }),
        Object.defineProperty(e, "__esModule", {
            value: !0
        })
    }
    ,
    n.t = function(e, t) {
        if (1 & t && (e = n(e)),
        8 & t)
            return e;
        if (4 & t && "object" == typeof e && e && e.__esModule)
            return e;
        var r = Object.create(null);
        if (n.r(r),
        Object.defineProperty(r, "default", {
            enumerable: !0,
            value: e
        }),
        2 & t && "string" != typeof e)
            for (var o in e)
                n.d(r, o, function(t) {
                    return e[t]
                }
                .bind(null, o));
        return r
    }
    ,
    n.n = function(e) {
        var t = e && e.__esModule ? function() {
            return e.default
        }
        : function() {
            return e
        }
        ;
        return n.d(t, "a", t),
        t
    }
    ,
    n.o = function(e, t) {
        return Object.prototype.hasOwnProperty.call(e, t)
    }
    ,
    n.p = "",
    n(n.s = 3)
}([function(e, t) {
    var n;
    n = function() {
        return this
    }();
    try {
        n = n || new Function("return this")()
    } catch (e) {
        "object" == typeof window && (n = window)
    }
    e.exports = n
}
, function(e, t, n) {
    "use strict";
    (function(e) {
        var r = n(2)
          , o = setTimeout;
        function i(e) {
            return Boolean(e && void 0 !== e.length)
        }
        function a() {}
        function c(e) {
            if (!(this instanceof c))
                throw new TypeError("Promises must be constructed via new");
            if ("function" != typeof e)
                throw new TypeError("not a function");
            this._state = 0,
            this._handled = !1,
            this._value = void 0,
            this._deferreds = [],
            d(e, this)
        }
        function u(e, t) {
            for (; 3 === e._state; )
                e = e._value;
            0 !== e._state ? (e._handled = !0,
            c._immediateFn(function() {
                var n = 1 === e._state ? t.onFulfilled : t.onRejected;
                if (null !== n) {
                    var r;
                    try {
                        r = n(e._value)
                    } catch (e) {
                        return void l(t.promise, e)
                    }
                    s(t.promise, r)
                } else
                    (1 === e._state ? s : l)(t.promise, e._value)
            })) : e._deferreds.push(t)
        }
        function s(e, t) {
            try {
                if (t === e)
                    throw new TypeError("A promise cannot be resolved with itself.");
                if (t && ("object" == typeof t || "function" == typeof t)) {
                    var n = t.then;
                    if (t instanceof c)
                        return e._state = 3,
                        e._value = t,
                        void f(e);
                    if ("function" == typeof n)
                        return void d((r = n,
                        o = t,
                        function() {
                            r.apply(o, arguments)
                        }
                        ), e)
                }
                e._state = 1,
                e._value = t,
                f(e)
            } catch (t) {
                l(e, t)
            }
            var r, o
        }
        function l(e, t) {
            e._state = 2,
            e._value = t,
            f(e)
        }
        function f(e) {
            2 === e._state && 0 === e._deferreds.length && c._immediateFn(function() {
                e._handled || c._unhandledRejectionFn(e._value)
            });
            for (var t = 0, n = e._deferreds.length; t < n; t++)
                u(e, e._deferreds[t]);
            e._deferreds = null
        }
        function p(e, t, n) {
            this.onFulfilled = "function" == typeof e ? e : null,
            this.onRejected = "function" == typeof t ? t : null,
            this.promise = n
        }
        function d(e, t) {
            var n = !1;
            try {
                e(function(e) {
                    n || (n = !0,
                    s(t, e))
                }, function(e) {
                    n || (n = !0,
                    l(t, e))
                })
            } catch (e) {
                if (n)
                    return;
                n = !0,
                l(t, e)
            }
        }
        c.prototype.catch = function(e) {
            return this.then(null, e)
        }
        ,
        c.prototype.then = function(e, t) {
            var n = new this.constructor(a);
            return u(this, new p(e,t,n)),
            n
        }
        ,
        c.prototype.finally = r.a,
        c.all = function(e) {
            return new c(function(t, n) {
                if (!i(e))
                    return n(new TypeError("Promise.all accepts an array"));
                var r = Array.prototype.slice.call(e);
                if (0 === r.length)
                    return t([]);
                var o = r.length;
                function a(e, i) {
                    try {
                        if (i && ("object" == typeof i || "function" == typeof i)) {
                            var c = i.then;
                            if ("function" == typeof c)
                                return void c.call(i, function(t) {
                                    a(e, t)
                                }, n)
                        }
                        r[e] = i,
                        0 == --o && t(r)
                    } catch (e) {
                        n(e)
                    }
                }
                for (var c = 0; c < r.length; c++)
                    a(c, r[c])
            }
            )
        }
        ,
        c.resolve = function(e) {
            return e && "object" == typeof e && e.constructor === c ? e : new c(function(t) {
                t(e)
            }
            )
        }
        ,
        c.reject = function(e) {
            return new c(function(t, n) {
                n(e)
            }
            )
        }
        ,
        c.race = function(e) {
            return new c(function(t, n) {
                if (!i(e))
                    return n(new TypeError("Promise.race accepts an array"));
                for (var r = 0, o = e.length; r < o; r++)
                    c.resolve(e[r]).then(t, n)
            }
            )
        }
        ,
        c._immediateFn = "function" == typeof e && function(t) {
            e(t)
        }
        || function(e) {
            o(e, 0)
        }
        ,
        c._unhandledRejectionFn = function(e) {
            "undefined" != typeof console && console && console.warn("Possible Unhandled Promise Rejection:", e)
        }
        ,
        t.a = c
    }
    ).call(this, n(4).setImmediate)
}
, function(e, t, n) {
    "use strict";
    t.a = function(e) {
        var t = this.constructor;
        return this.then(function(n) {
            return t.resolve(e()).then(function() {
                return n
            })
        }, function(n) {
            return t.resolve(e()).then(function() {
                return t.reject(n)
            })
        })
    }
}
, function(e, t, n) {
    e.exports = n(7)
}
, function(e, t, n) {
    (function(e) {
        var r = void 0 !== e && e || "undefined" != typeof self && self || window
          , o = Function.prototype.apply;
        function i(e, t) {
            this._id = e,
            this._clearFn = t
        }
        t.setTimeout = function() {
            return new i(o.call(setTimeout, r, arguments),clearTimeout)
        }
        ,
        t.setInterval = function() {
            return new i(o.call(setInterval, r, arguments),clearInterval)
        }
        ,
        t.clearTimeout = t.clearInterval = function(e) {
            e && e.close()
        }
        ,
        i.prototype.unref = i.prototype.ref = function() {}
        ,
        i.prototype.close = function() {
            this._clearFn.call(r, this._id)
        }
        ,
        t.enroll = function(e, t) {
            clearTimeout(e._idleTimeoutId),
            e._idleTimeout = t
        }
        ,
        t.unenroll = function(e) {
            clearTimeout(e._idleTimeoutId),
            e._idleTimeout = -1
        }
        ,
        t._unrefActive = t.active = function(e) {
            clearTimeout(e._idleTimeoutId);
            var t = e._idleTimeout;
            t >= 0 && (e._idleTimeoutId = setTimeout(function() {
                e._onTimeout && e._onTimeout()
            }, t))
        }
        ,
        n(5),
        t.setImmediate = "undefined" != typeof self && self.setImmediate || void 0 !== e && e.setImmediate || this && this.setImmediate,
        t.clearImmediate = "undefined" != typeof self && self.clearImmediate || void 0 !== e && e.clearImmediate || this && this.clearImmediate
    }
    ).call(this, n(0))
}
, function(e, t, n) {
    (function(e, t) {
        !function(e, n) {
            "use strict";
            if (!e.setImmediate) {
                var r, o, i, a, c, u = 1, s = {}, l = !1, f = e.document, p = Object.getPrototypeOf && Object.getPrototypeOf(e);
                p = p && p.setTimeout ? p : e,
                "[object process]" === {}.toString.call(e.process) ? r = function(e) {
                    t.nextTick(function() {
                        y(e)
                    })
                }
                : !function() {
                    if (e.postMessage && !e.importScripts) {
                        var t = !0
                          , n = e.onmessage;
                        return e.onmessage = function() {
                            t = !1
                        }
                        ,
                        e.postMessage("", "*"),
                        e.onmessage = n,
                        t
                    }
                }() ? e.MessageChannel ? ((i = new MessageChannel).port1.onmessage = function(e) {
                    y(e.data)
                }
                ,
                r = function(e) {
                    i.port2.postMessage(e)
                }
                ) : f && "onreadystatechange"in f.createElement("script") ? (o = f.documentElement,
                r = function(e) {
                    var t = f.createElement("script");
                    t.onreadystatechange = function() {
                        y(e),
                        t.onreadystatechange = null,
                        o.removeChild(t),
                        t = null
                    }
                    ,
                    o.appendChild(t)
                }
                ) : r = function(e) {
                    setTimeout(y, 0, e)
                }
                : (a = "setImmediate$" + Math.random() + "$",
                c = function(t) {
                    t.source === e && "string" == typeof t.data && 0 === t.data.indexOf(a) && y(+t.data.slice(a.length))
                }
                ,
                e.addEventListener ? e.addEventListener("message", c, !1) : e.attachEvent("onmessage", c),
                r = function(t) {
                    e.postMessage(a + t, "*")
                }
                ),
                p.setImmediate = function(e) {
                    "function" != typeof e && (e = new Function("" + e));
                    for (var t = new Array(arguments.length - 1), n = 0; n < t.length; n++)
                        t[n] = arguments[n + 1];
                    var o = {
                        callback: e,
                        args: t
                    };
                    return s[u] = o,
                    r(u),
                    u++
                }
                ,
                p.clearImmediate = d
            }
            function d(e) {
                delete s[e]
            }
            function y(e) {
                if (l)
                    setTimeout(y, 0, e);
                else {
                    var t = s[e];
                    if (t) {
                        l = !0;
                        try {
                            !function(e) {
                                var t = e.callback
                                  , r = e.args;
                                switch (r.length) {
                                case 0:
                                    t();
                                    break;
                                case 1:
                                    t(r[0]);
                                    break;
                                case 2:
                                    t(r[0], r[1]);
                                    break;
                                case 3:
                                    t(r[0], r[1], r[2]);
                                    break;
                                default:
                                    t.apply(n, r)
                                }
                            }(t)
                        } finally {
                            d(e),
                            l = !1
                        }
                    }
                }
            }
        }("undefined" == typeof self ? void 0 === e ? this : e : self)
    }
    ).call(this, n(0), n(6))
}
, function(e, t) {
    var n, r, o = e.exports = {};
    function i() {
        throw new Error("setTimeout has not been defined")
    }
    function a() {
        throw new Error("clearTimeout has not been defined")
    }
    function c(e) {
        if (n === setTimeout)
            return setTimeout(e, 0);
        if ((n === i || !n) && setTimeout)
            return n = setTimeout,
            setTimeout(e, 0);
        try {
            return n(e, 0)
        } catch (t) {
            try {
                return n.call(null, e, 0)
            } catch (t) {
                return n.call(this, e, 0)
            }
        }
    }
    !function() {
        try {
            n = "function" == typeof setTimeout ? setTimeout : i
        } catch (e) {
            n = i
        }
        try {
            r = "function" == typeof clearTimeout ? clearTimeout : a
        } catch (e) {
            r = a
        }
    }();
    var u, s = [], l = !1, f = -1;
    function p() {
        l && u && (l = !1,
        u.length ? s = u.concat(s) : f = -1,
        s.length && d())
    }
    function d() {
        if (!l) {
            var e = c(p);
            l = !0;
            for (var t = s.length; t; ) {
                for (u = s,
                s = []; ++f < t; )
                    u && u[f].run();
                f = -1,
                t = s.length
            }
            u = null,
            l = !1,
            function(e) {
                if (r === clearTimeout)
                    return clearTimeout(e);
                if ((r === a || !r) && clearTimeout)
                    return r = clearTimeout,
                    clearTimeout(e);
                try {
                    r(e)
                } catch (t) {
                    try {
                        return r.call(null, e)
                    } catch (t) {
                        return r.call(this, e)
                    }
                }
            }(e)
        }
    }
    function y(e, t) {
        this.fun = e,
        this.array = t
    }
    function h() {}
    o.nextTick = function(e) {
        var t = new Array(arguments.length - 1);
        if (arguments.length > 1)
            for (var n = 1; n < arguments.length; n++)
                t[n - 1] = arguments[n];
        s.push(new y(e,t)),
        1 !== s.length || l || c(d)
    }
    ,
    y.prototype.run = function() {
        this.fun.apply(null, this.array)
    }
    ,
    o.title = "browser",
    o.browser = !0,
    o.env = {},
    o.argv = [],
    o.version = "",
    o.versions = {},
    o.on = h,
    o.addListener = h,
    o.once = h,
    o.off = h,
    o.removeListener = h,
    o.removeAllListeners = h,
    o.emit = h,
    o.prependListener = h,
    o.prependOnceListener = h,
    o.listeners = function(e) {
        return []
    }
    ,
    o.binding = function(e) {
        throw new Error("process.binding is not supported")
    }
    ,
    o.cwd = function() {
        return "/"
    }
    ,
    o.chdir = function(e) {
        throw new Error("process.chdir is not supported")
    }
    ,
    o.umask = function() {
        return 0
    }
}
, function(e, t, n) {
    "use strict";
    n.r(t);
    var r = n(1)
      , o = window.Promise ? window.Promise : r.a;
    function i(e) {
        return (i = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        }
        : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        }
        )(e)
    }
    function a() {
        return (a = Object.assign || function(e) {
            for (var t = 1; t < arguments.length; t++) {
                var n = arguments[t];
                for (var r in n)
                    Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r])
            }
            return e
        }
        ).apply(this, arguments)
    }
    function c(e, t) {
        for (var n = 0; n < t.length; n++) {
            var r = t[n];
            r.enumerable = r.enumerable || !1,
            r.configurable = !0,
            "value"in r && (r.writable = !0),
            Object.defineProperty(e, r.key, r)
        }
    }
    var u = function() {
        function e(t, n, r) {
            !function(e, t) {
                if (!(e instanceof t))
                    throw new TypeError("Cannot call a class as a function")
            }(this, e),
            this.url = t,
            this.key = n,
            this.jsId = r,
            this.eventCount = 0
        }
        var t, n, r;
        return t = e,
        (n = [{
            key: "get",
            value: function(e, t) {
                var n = a({}, {
                    event: e,
                    eventCount: ++this.eventCount,
                    timestamp: Date.now(),
                    key: this.key,
                    referrer: document.referrer,
                    jsId: this.jsId
                }, t || {})
                  , r = new Image;
                return r.src = this.url + "/t/?" + this.toQueryString(n),
                new o(function(e) {
                    var t = 0
                      , n = setInterval(function() {
                        t += 50,
                        (r.complete || t >= 3e3) && (clearInterval(n),
                        e())
                    }, 50)
                }
                )
            }
        }, {
            key: "toQueryString",
            value: function(e) {
                var t = arguments.length > 1 ? arguments[1] : ""
                  , n = [];
                for (var r in e)
                    e.hasOwnProperty(r) && void 0 !== e[r] && ("object" === i(e[r]) ? n.push(this.toQueryString(e[r], t + r + "-")) : n.push(t + encodeURIComponent(r) + "=" + encodeURIComponent(e[r])));
                return n.join("&")
            }
        }]) && c(t.prototype, n),
        r && c(t, r),
        e
    }();
    function s(e, t) {
        for (var n = 0; n < t.length; n++) {
            var r = t[n];
            r.enumerable = r.enumerable || !1,
            r.configurable = !0,
            "value"in r && (r.writable = !0),
            Object.defineProperty(e, r.key, r)
        }
    }
    var l = function() {
        function e(t, n) {
            !function(e, t) {
                if (!(e instanceof t))
                    throw new TypeError("Cannot call a class as a function")
            }(this, e),
            this.jsId = t,
            this.url = n
        }
        var t, n, r;
        return t = e,
        (n = [{
            key: "track",
            value: function(e, t) {
                return new u(this.url,this.key,this.jsId).get(e, t)
            }
        }, {
            key: "setKey",
            value: function(e) {
                this.key = e
            }
        }, {
            key: "setUrl",
            value: function(e) {
                this.url = e
            }
        }]) && s(t.prototype, n),
        r && s(t, r),
        e
    }()
      , f = {
        create: function(e, t, n) {
            var r = "";
            if (void 0 !== n) {
                var o = new Date;
                o.setTime(o.getTime() + 24 * n * 60 * 60 * 1e3),
                r = "expires=" + o.toGMTString() + ";"
            }
            document.cookie = e + "=" + encodeURIComponent(t) + ";" + r + "path=/"
        },
        delete: function(e) {
            this.create(e, "", -1)
        },
        getValue: function(e) {
            for (var t = e + "=", n = document.cookie.split(";"), r = 0; r < n.length; r++) {
                for (var o = n[r]; " " === o.charAt(0); )
                    o = o.substring(1, o.length);
                if (0 === o.indexOf(t))
                    return o.substring(t.length, o.length)
            }
            return null
        }
    }
      , p = {}
      , d = {
        random: function(e) {
            for (var t = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", n = "", r = e; r > 0; --r)
                n += t[Math.floor(Math.random() * t.length)];
            return n
        },
        guid: function() {
            function e() {
                return Math.floor(65536 * (1 + Math.random())).toString(16).substring(1)
            }
            return e() + e() + "-" + e() + "-" + e() + "-" + e() + "-" + e() + e() + e()
        },
        unique: function(e) {
            return p[e] >= 0 ? p[e] += 1 : p[e] = 0,
            e + p[e]
        }
    }
      , y = {
        contains: [].indexOf ? function(e, t) {
            return -1 !== e.indexOf(t)
        }
        : function(e, t) {
            for (var n = 0; n < e.length; ++n)
                if (e[n] === t)
                    return !0;
            return !1
        }
    }
      , h = function(e, t) {
        var n, r, o, i, a, c = window._sift = window._sift || [];
        c.push(["_setAccount", e]),
        c.push(["_setUserId", ""]),
        c.push(["_setSessionId", t]),
        c.push(["_trackPageview"]),
        n = document,
        r = "script",
        o = "sift-beacon",
        a = n.getElementsByTagName(r)[0],
        n.getElementById(o) || ((i = n.createElement(r)).id = o,
        i.src = "https://cdn.siftscience.com/s.js",
        a.parentNode.insertBefore(i, a))
    }
      , m = function(e) {
        var t = {}
          , n = function(n) {
            var r = t
              , o = "";
            n.split(".").forEach(function(e) {
                r = r[o] || (r[o] = {}),
                o = e
            }),
            r[o] = e[n]
        };
        for (var r in e)
            n(r);
        return t[""] || t
    };
    function v(e) {
        return (v = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        }
        : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        }
        )(e)
    }
    var b = {
        stringify: function(e) {
            var t = this
              , n = arguments[1] || []
              , r = arguments[2] || []
              , o = function(o) {
                if (e.hasOwnProperty(o))
                    if ("[object Array]" === Object.prototype.toString.call(e[o]))
                        !!e[o].find(function(e) {
                            return "object" === v(e)
                        }) ? e[o].forEach(function(e, n) {
                            t.stringify(e, [o + "[".concat(n, "]")], r)
                        }) : e[o].forEach(function(e) {
                            r.push(o + "[]=" + e)
                        });
                    else if ("object" === v(e[o])) {
                        var i = n.slice();
                        i.push(o),
                        t.stringify(e[o], i, r)
                    } else if (null != e[o]) {
                        var a = "";
                        if (n.length > 0) {
                            a = n[0];
                            for (var c = 1; c < n.length; c++)
                                a += "[" + n[c] + "]";
                            a += "[" + o + "]"
                        } else
                            a += o;
                        r.push(a + "=" + encodeURIComponent(e[o]))
                    }
            };
            for (var i in e)
                o(i);
            return r.join("&")
        },
        parse: function() {
            var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : document.location.search;
            if ("" === e)
                return {};
            var t = (e = e.replace(/(^\?)/, "")).split("&").reduce(function(e, t) {
                var n = t.split("=")
                  , r = n[0];
                return -1 !== (r = r.replace(/\[([^\[\]]+)]/g, ".$1")).indexOf("[]") ? (e[r = r.replace("[]", "")] = e[r] || [],
                e[r].push(decodeURIComponent(n[1]))) : e[r] = decodeURIComponent(n[1]),
                e
            }, {});
            return m(t)
        }
    }
      , g = null;
    var _ = function(e, t) {
        return new o(function(n) {
            var r = "json" + (new Date).getTime();
            window[r] = function(e) {
                n(e);
                try {
                    delete window[r]
                } catch (e) {}
                window[r] = null
            }
            ;
            var o = "?" + b.stringify(t || {});
            !function(e) {
                var t = document.createElement("script")
                  , n = !1;
                t.src = e,
                t.async = !0,
                t.onload = t.onreadystatechange = function() {
                    n || this.readyState && "loaded" !== this.readyState && "complete" !== this.readyState || (n = !0,
                    t.onload = t.onreadystatechange = null,
                    t && t.parentNode && t.parentNode.removeChild(t))
                }
                ,
                g || (g = document.getElementsByTagName("head")[0]),
                g.appendChild(t)
            }(e + o + "&callback=" + r)
        }
        )
    };
    function w(e, t) {
        for (var n = 0; n < t.length; n++) {
            var r = t[n];
            r.enumerable = r.enumerable || !1,
            r.configurable = !0,
            "value"in r && (r.writable = !0),
            Object.defineProperty(e, r.key, r)
        }
    }
    var O = function() {
        function e() {
            !function(e, t) {
                if (!(e instanceof t))
                    throw new TypeError("Cannot call a class as a function")
            }(this, e),
            this._listeners = {}
        }
        var t, n, r;
        return t = e,
        (n = [{
            key: "on",
            value: function(e, t) {
                this._listeners[e] || (this._listeners[e] = []),
                this._listeners[e].push(t)
            }
        }, {
            key: "emit",
            value: function(e, t) {
                (this._listeners[e] || []).forEach(function(e) {
                    return e(t)
                })
            }
        }, {
            key: "removeAllListeners",
            value: function() {
                this._listeners = {}
            }
        }]) && w(t.prototype, n),
        r && w(t, r),
        e
    }();
    function j(e, t) {
        var n = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
            var r = Object.getOwnPropertySymbols(e);
            t && (r = r.filter(function(t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable
            })),
            n.push.apply(n, r)
        }
        return n
    }
    function k(e, t, n) {
        return t in e ? Object.defineProperty(e, t, {
            value: n,
            enumerable: !0,
            configurable: !0,
            writable: !0
        }) : e[t] = n,
        e
    }
    var I = function(e) {
        try {
            var t = JSON.parse(e);
            return t.__SecurionPayV2 ? t : null
        } catch (e) {
            return null
        }
    }
      , S = function(e) {
        return JSON.stringify(function(e) {
            for (var t = 1; t < arguments.length; t++) {
                var n = null != arguments[t] ? arguments[t] : {};
                t % 2 ? j(n, !0).forEach(function(t) {
                    k(e, t, n[t])
                }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : j(n).forEach(function(t) {
                    Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t))
                })
            }
            return e
        }({}, e, {
            __SecurionPayV2: !0
        }))
    }
      , T = function(e) {
        var t = "controller" === e.type ? e.controllerId : e.frameId
          , n = window.frames[t] || window.parent.frames[t];
        n && n.postMessage(S(e), "*")
    }
      , P = {
        getOrigin: function(e) {
            var t = document.createElement("a");
            t.href = e;
            var n = t.host;
            return n = (n = n.replace(/:80$/, "")).replace(/:443$/, ""),
            t.protocol + "//" + n
        }
    };
    function E(e) {
        return (E = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        }
        : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        }
        )(e)
    }
    function x(e, t) {
        var n = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
            var r = Object.getOwnPropertySymbols(e);
            t && (r = r.filter(function(t) {
                return Object.getOwnPropertyDescriptor(e, t).enumerable
            })),
            n.push.apply(n, r)
        }
        return n
    }
    function C(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = null != arguments[t] ? arguments[t] : {};
            t % 2 ? x(n, !0).forEach(function(t) {
                U(e, t, n[t])
            }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n)) : x(n).forEach(function(t) {
                Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t))
            })
        }
        return e
    }
    function U(e, t, n) {
        return t in e ? Object.defineProperty(e, t, {
            value: n,
            enumerable: !0,
            configurable: !0,
            writable: !0
        }) : e[t] = n,
        e
    }
    function M(e, t) {
        for (var n = 0; n < t.length; n++) {
            var r = t[n];
            r.enumerable = r.enumerable || !1,
            r.configurable = !0,
            "value"in r && (r.writable = !0),
            Object.defineProperty(e, r.key, r)
        }
    }
    function D(e) {
        return (D = Object.setPrototypeOf ? Object.getPrototypeOf : function(e) {
            return e.__proto__ || Object.getPrototypeOf(e)
        }
        )(e)
    }
    function F(e) {
        if (void 0 === e)
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        return e
    }
    function q(e, t) {
        return (q = Object.setPrototypeOf || function(e, t) {
            return e.__proto__ = t,
            e
        }
        )(e, t)
    }
    var R = function(e) {
        function t(e, n, r) {
            var o;
            return function(e, t) {
                if (!(e instanceof t))
                    throw new TypeError("Cannot call a class as a function")
            }(this, t),
            (o = function(e, t) {
                return !t || "object" !== E(t) && "function" != typeof t ? F(e) : t
            }(this, D(t).call(this)))._controllerId = n,
            o.id = o._generateId(),
            o.src = e,
            o.loaded = !1,
            o.on("load", function() {
                o.loaded = !0,
                o.queuedMessages.forEach(o._send.bind(F(o))),
                o.queuedMessages = []
            }),
            o.queuedMessages = [],
            o._requests = {},
            o._iframe = o._createIframe(r),
            o.appendTo(document.body),
            o
        }
        var n, r, i;
        return function(e, t) {
            if ("function" != typeof t && null !== t)
                throw new TypeError("Super expression must either be null or a function");
            e.prototype = Object.create(t && t.prototype, {
                constructor: {
                    value: e,
                    writable: !0,
                    configurable: !0
                }
            }),
            t && q(e, t)
        }(t, O),
        n = t,
        (r = [{
            key: "_isMounted",
            value: function() {
                return !!document.body && document.body.contains(this._iframe)
            }
        }, {
            key: "appendTo",
            value: function(e) {
                e.appendChild(this._iframe)
            }
        }, {
            key: "unmount",
            value: function() {
                this.loaded = !1,
                this.emit("unload")
            }
        }, {
            key: "destroy",
            value: function() {
                this.unmount();
                var e = this._iframe.parentElement;
                e && (e.removeChild(this._iframe),
                this.emit("destroy"))
            }
        }, {
            key: "action",
            value: function(e, t) {
                var n = this
                  , r = d.unique(e)
                  , i = new o(function(e, t) {
                    n._requests[r] = {
                        resolve: e,
                        reject: t
                    }
                }
                );
                return this.send({
                    action: "securionpay-frame-action",
                    payload: {
                        requestId: r,
                        type: e,
                        options: t
                    }
                }),
                i
            }
        }, {
            key: "resolve",
            value: function(e, t) {
                var n = this._requests[e];
                n && n.resolve(t)
            }
        }, {
            key: "send",
            value: function(e) {
                this._send({
                    frameId: this.id,
                    controllerId: this._controllerId,
                    message: e
                })
            }
        }, {
            key: "_send",
            value: function(e) {
                this.loaded ? T(e) : this.queuedMessages.push(e)
            }
        }, {
            key: "_generateId",
            value: function() {
                return d.unique("__privateSecurionPayFrame")
            }
        }, {
            key: "_createIframe",
            value: function() {
                var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
                  , t = document.createElement("iframe");
                t.setAttribute("allowTransparency", "true"),
                t.setAttribute("scrolling", "no"),
                t.setAttribute("frameborder", "0"),
                t.setAttribute("name", this.id);
                var n = C({
                    origin: P.getOrigin(window.location.toString()),
                    referrer: window.location.href.toString(),
                    controllerId: this._controllerId
                }, e);
                return t.src = "".concat(this.src, "#").concat(b.stringify(n)),
                t
            }
        }]) && M(n.prototype, r),
        i && M(n, i),
        t
    }()
      , A = function(e, t) {
        e.style.cssText = Object.keys(t).map(function(e) {
            return e + ": " + t[e] + " !important;"
        }).join(" ")
    };
    function N(e) {
        return (N = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        }
        : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        }
        )(e)
    }
    function L(e, t) {
        for (var n = 0; n < t.length; n++) {
            var r = t[n];
            r.enumerable = r.enumerable || !1,
            r.configurable = !0,
            "value"in r && (r.writable = !0),
            Object.defineProperty(e, r.key, r)
        }
    }
    function B(e, t) {
        return !t || "object" !== N(t) && "function" != typeof t ? function(e) {
            if (void 0 === e)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return e
        }(e) : t
    }
    function z(e, t, n) {
        return (z = "undefined" != typeof Reflect && Reflect.get ? Reflect.get : function(e, t, n) {
            var r = function(e, t) {
                for (; !Object.prototype.hasOwnProperty.call(e, t) && null !== (e = K(e)); )
                    ;
                return e
            }(e, t);
            if (r) {
                var o = Object.getOwnPropertyDescriptor(r, t);
                return o.get ? o.get.call(n) : o.value
            }
        }
        )(e, t, n || e)
    }
    function K(e) {
        return (K = Object.setPrototypeOf ? Object.getPrototypeOf : function(e) {
            return e.__proto__ || Object.getPrototypeOf(e)
        }
        )(e)
    }
    function V(e, t) {
        return (V = Object.setPrototypeOf || function(e, t) {
            return e.__proto__ = t,
            e
        }
        )(e, t)
    }
    var $ = function(e) {
        function t(e, n, r) {
            return function(e, t) {
                if (!(e instanceof t))
                    throw new TypeError("Cannot call a class as a function")
            }(this, t),
            B(this, K(t).call(this, e, n, r))
        }
        var n, r, o;
        return function(e, t) {
            if ("function" != typeof t && null !== t)
                throw new TypeError("Super expression must either be null or a function");
            e.prototype = Object.create(t && t.prototype, {
                constructor: {
                    value: e,
                    writable: !0,
                    configurable: !0
                }
            }),
            t && V(e, t)
        }(t, R),
        n = t,
        (r = [{
            key: "_createIframe",
            value: function(e) {
                var n = z(K(t.prototype), "_createIframe", this).call(this, e);
                return A(n, {
                    position: "absolute",
                    top: "0px",
                    left: "0px",
                    height: "100%",
                    width: "100%",
                    "z-index": "2147483647"
                }),
                n
            }
        }, {
            key: "appendTo",
            value: function(e) {
                this.overlay = document.createElement("div"),
                A(this.overlay, {
                    position: "fixed",
                    "z-index": "214748364",
                    top: "0px",
                    bottom: "0px",
                    right: "0px",
                    left: "0px",
                    background: "rgba(0, 0, 0, 0.5) none repeat scroll 0% 0%",
                    transition: "background 300ms cubic-bezier(0.4, 0, 0.2, 1) 0s",
                    "will-change": "background",
                    inset: "0px"
                }),
                e.insertBefore(this.overlay, e.firstChild),
                z(K(t.prototype), "appendTo", this).call(this, this.overlay)
            }
        }, {
            key: "destroy",
            value: function() {
                z(K(t.prototype), "destroy", this).call(this),
                this.overlay.parentElement.removeChild(this.overlay)
            }
        }]) && L(n.prototype, r),
        o && L(n, o),
        t
    }();
    function Q(e, t) {
        for (var n = 0; n < t.length; n++) {
            var r = t[n];
            r.enumerable = r.enumerable || !1,
            r.configurable = !0,
            "value"in r && (r.writable = !0),
            Object.defineProperty(e, r.key, r)
        }
    }
    var J = function() {
        function e(t, n, r, o, i) {
            !function(e, t) {
                if (!(e instanceof t))
                    throw new TypeError("Cannot call a class as a function")
            }(this, e),
            this._apiUrl = t,
            this._key = n,
            this._trackerUrl = r,
            this._jsId = o,
            this._showOverlay = !0,
            this._controller = i
        }
        var t, n, r;
        return t = e,
        (n = [{
            key: "showOverlay",
            value: function(e) {
                return this._showOverlay = e,
                this
            }
        }, {
            key: "verifyThreeDSecure",
            value: function(e) {
                var t = new $(this._apiUrl + "/3d-secure/inner.html",this._controller._id,{
                    publicKey: this._key,
                    showOverlay: this._showOverlay,
                    apiUrl: this._apiUrl,
                    trackerUrl: this._trackerUrl,
                    jsId: this._jsId
                });
                return this._controller.addFrame(t),
                t.action("verify-threed-secure", {
                    request: e
                }).then(function(e) {
                    return t.destroy(),
                    e
                })
            }
        }]) && Q(t.prototype, n),
        r && Q(t, r),
        e
    }();
    function Y(e) {
        return (Y = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        }
        : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        }
        )(e)
    }
    function Z(e, t) {
        for (var n = 0; n < t.length; n++) {
            var r = t[n];
            r.enumerable = r.enumerable || !1,
            r.configurable = !0,
            "value"in r && (r.writable = !0),
            Object.defineProperty(e, r.key, r)
        }
    }
    function G(e, t) {
        return !t || "object" !== Y(t) && "function" != typeof t ? function(e) {
            if (void 0 === e)
                throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
            return e
        }(e) : t
    }
    function H(e, t, n) {
        return (H = "undefined" != typeof Reflect && Reflect.get ? Reflect.get : function(e, t, n) {
            var r = function(e, t) {
                for (; !Object.prototype.hasOwnProperty.call(e, t) && null !== (e = W(e)); )
                    ;
                return e
            }(e, t);
            if (r) {
                var o = Object.getOwnPropertyDescriptor(r, t);
                return o.get ? o.get.call(n) : o.value
            }
        }
        )(e, t, n || e)
    }
    function W(e) {
        return (W = Object.setPrototypeOf ? Object.getPrototypeOf : function(e) {
            return e.__proto__ || Object.getPrototypeOf(e)
        }
        )(e)
    }
    function X(e, t) {
        return (X = Object.setPrototypeOf || function(e, t) {
            return e.__proto__ = t,
            e
        }
        )(e, t)
    }
    var ee = function(e) {
        function t(e, n) {
            return function(e, t) {
                if (!(e instanceof t))
                    throw new TypeError("Cannot call a class as a function")
            }(this, t),
            G(this, W(t).call(this, n.apiUrl + "/controller.html", e, n))
        }
        var n, r, o;
        return function(e, t) {
            if ("function" != typeof t && null !== t)
                throw new TypeError("Super expression must either be null or a function");
            e.prototype = Object.create(t && t.prototype, {
                constructor: {
                    value: e,
                    writable: !0,
                    configurable: !0
                }
            }),
            t && X(e, t)
        }(t, R),
        n = t,
        (r = [{
            key: "_generateId",
            value: function() {
                return this._controllerId
            }
        }, {
            key: "_createIframe",
            value: function(e) {
                var n = H(W(t.prototype), "_createIframe", this).call(this, e);
                return A(n, {
                    border: "none",
                    margin: "0",
                    padding: "0",
                    width: "1px",
                    "min-width": "100%",
                    overflow: "hidden",
                    display: "block",
                    visibility: "hidden",
                    position: "fixed",
                    height: "1px",
                    "pointer-events": "none"
                }),
                n
            }
        }]) && Z(n.prototype, r),
        o && Z(n, o),
        t
    }();
    function te(e, t) {
        for (var n = 0; n < t.length; n++) {
            var r = t[n];
            r.enumerable = r.enumerable || !1,
            r.configurable = !0,
            "value"in r && (r.writable = !0),
            Object.defineProperty(e, r.key, r)
        }
    }
    var ne = function() {
        function e(t, n) {
            !function(e, t) {
                if (!(e instanceof t))
                    throw new TypeError("Cannot call a class as a function")
            }(this, e),
            this._id = d.unique("__privateSecurionPayController"),
            this._controllerFrame = new ee(this._id,{
                publicKey: t,
                apiUrl: n
            }),
            this._frames = {},
            this._requests = {},
            this._origin = P.getOrigin(n),
            this._setupMessageListener()
        }
        var t, n, r;
        return t = e,
        (n = [{
            key: "_setupMessageListener",
            value: function() {
                var e = this;
                window.addEventListener("message", function(t) {
                    if (t.origin === e._origin) {
                        var n = I(t.data);
                        n && e._handleMessage(n)
                    }
                })
            }
        }, {
            key: "_handleMessage",
            value: function(e) {
                var t = this;
                if (this._id === e.controllerId) {
                    var n = e.message
                      , r = n.action
                      , o = n.payload || {};
                    if ("securionpay-frame-event" === r) {
                        var i = this._frames[e.frameId];
                        i && i.emit(o.event, o.data)
                    } else if ("securionpay-controller-load" === r)
                        this._controllerFrame.emit("load"),
                        Object.keys(this._frames).forEach(function(e) {
                            t._frames[e].send({
                                action: "securionpay-controller-load"
                            })
                        });
                    else if ("securionpay-user-action-complete" === r) {
                        var a = this._requests[o.requestId];
                        a && a.resolve(o.result)
                    } else if ("securionpay-user-action-error" === r) {
                        var c = this._requests[o.requestId];
                        c && c.reject(o.error)
                    } else {
                        if ("securionpay-frame-error" === r)
                            throw new Error(n.payload.message);
                        if ("securionpay-frame-action-complete" === r) {
                            var u = this._frames[e.frameId];
                            u && u.resolve(o.requestId, o.result)
                        }
                    }
                }
            }
        }, {
            key: "action",
            value: function(e, t) {
                var n = this
                  , r = d.unique(e)
                  , i = new o(function(e, t) {
                    n._requests[r] = {
                        resolve: e,
                        reject: t
                    }
                }
                );
                return this._controllerFrame.send({
                    action: "securionpay-user-action",
                    payload: {
                        requestId: r,
                        type: e,
                        options: t
                    }
                }),
                i
            }
        }, {
            key: "addFrame",
            value: function(e) {
                this._setupFrame(e),
                this._frames[e.id] = e
            }
        }, {
            key: "_setupFrame",
            value: function(e) {
                var t = this;
                this._controllerFrame.send({
                    action: "securionpay-user-createframe",
                    payload: {
                        newFrameId: e.id
                    }
                }),
                e.on("load", function() {
                    t._controllerFrame.send({
                        action: "securionpay-frame-load",
                        payload: {
                            loadedFrameId: e.id
                        }
                    }),
                    t._controllerFrame.loaded && e.send({
                        action: "securionpay-controller-load"
                    })
                })
            }
        }]) && te(t.prototype, n),
        r && te(t, r),
        e
    }();
    function re(e) {
        return (re = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        }
        : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        }
        )(e)
    }
    var oe = ["number", "cvc", "expMonth", "expYear", "cardholderName", "amount", "currency", "addressCountry", "addressCity", "addressState", "addressZip", "addressLine1", "addressLine2", "mcc6012Data[birthDate]", "mcc6012Data[pan]", "mcc6012Data[zip]", "mcc6012Data[lastName]", "mcc6012Data[accountNumber]"]
      , ie = []
      , ae = d.guid()
      , ce = {}
      , ue = function(e, t) {
        var n = e + t
          , r = ce[n];
        return r || (r = new ne(e,t),
        ce[n] = r),
        r
    };
    document.currentScript && "https://securionpay.com" !== P.getOrigin(document.currentScript.src) && console.warn("SecurionPay.js should be loaded from securionpay.com.");
    var se = {
        apiUrl: "https://api.securionpay.com",
        trackerUrl: "https://securionpay.com",
        setPublicKey: function(e) {
            !function(e) {
                if (/^sk_/.test(e))
                    throw new Error("You are using a secret key with SecurionPay.js, instead of the public one.")
            }(e),
            se.key = e,
            le.setKey(e)
        },
        setApiUrl: function(e) {
            this.apiUrl = e
        },
        setTrackerUrl: function(e) {
            this.trackerUrl = e,
            le.setUrl(e)
        },
        setDataCollectors: function(e) {
            ie = e,
            y.contains(ie, "sift") && _(se.apiUrl + "/data-collectors/sift", {
                key: se.key
            }).then(function(e) {
                h(e.jsSnippetKey, se.utils.getSessionId())
            })
        },
        createCardToken: function(e, t) {
            le.track("custom_form.tokenize"),
            null == t && (t = function() {}
            ),
            (e = se.utils.extractParams(e)).paymentUserAgent = "custom-form/v1-39720b2e0d",
            y.contains(ie, "sift") && (e.fraudCheckData = {
                siftSessionId: se.utils.getSessionId()
            }),
            ue(se.key, this.apiUrl).action("TOKENIZE_V1", {
                request: e
            }).then(function(e) {
                (e.error ? le.track("custom_form.tokenize.server_error", {
                    error: e.error
                }) : le.track("custom_form.tokenize.success", {
                    tokenId: e.id
                })).then(function() {
                    return t(e)
                })
            })
        },
        verifyThreeDSecure: function(e, t) {
            null == t && (t = function() {}
            ),
            le.track("three_d_secure.verify");
            var n = ue(se.key, this.apiUrl);
            new J(se.apiUrl,se.key,this.trackerUrl,ae,n).verifyThreeDSecure(e).then(function(e) {
                (e.error ? le.track("three_d_secure.verify.success", {
                    tokenId: e.id,
                    threeDSecureInfo: e.threeDSecureInfo
                })).then(function() {
                    return t(e)
                })
            })
        },
        utils: {
            extractParams: function(e) {
                if (!e || "object" != re(e))
                    return e;
                if (e.jquery && (e = e[0]),
                !e.getElementsByTagName)
                    return e;
                for (var t = {}, n = e.getElementsByTagName("input"), r = e.getElementsByTagName("select"), o = 0; o < n.length; ++o) {
                    var i = n[o]
                      , a = i.getAttribute("data-securionpay");
                    y.contains(oe, a) && (t[a] = i.value)
                }
                for (o = 0; o < r.length; ++o) {
                    var c = r[o];
                    a = c.getAttribute("data-securionpay");
                    y.contains(oe, a) && null != c.selectedIndex && (t[a] = c.options[c.selectedIndex].value)
                }
                return t
            },
            getSessionId: function() {
                var e = f.getValue("__spsi");
                if (e)
                    return e;
                var t = d.random(32);
                return f.create("__spsi", t),
                t
            },
            deleteSessionId: function() {
                return f.delete("__spsi")
            }
        }
    }
      , le = new l(ae,se.trackerUrl);
    window.SecurionPay = window.Securionpay = se
}
]);
