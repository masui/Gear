(function() {
  var LindaClient, TupleSpace;

  LindaClient = (function() {
    function LindaClient() {}

    LindaClient.prototype.connect = function(io) {
      this.io = io;
      return this;
    };

    LindaClient.prototype.tuplespace = function(name) {
      return new TupleSpace(this, name);
    };

    LindaClient.prototype.requestKeepalive = function(url) {
      return this.tuplespace('__linda').write({
        type: 'keepalive',
        to: url
      });
    };

    return LindaClient;

  })();

  TupleSpace = (function() {
    function TupleSpace(linda, name) {
      this.linda = linda;
      this.name = name;
      this.watch_callback_ids = {};
      this.io_callbacks = [];
      this.linda.io.on('disconnect', (function(_this) {
        return function() {
          return _this.remove_io_callbacks();
        };
      })(this));
    }

    TupleSpace.prototype.create_callback_id = function() {
      return Date.now() - Math.random();
    };

    TupleSpace.prototype.create_watch_callback_id = function(tuple) {
      var key;
      key = JSON.stringify(tuple);
      return this.watch_callback_ids[key] || (this.watch_callback_ids[key] = this.create_callback_id());
    };

    TupleSpace.prototype.remove_io_callbacks = function() {
      var c, _i, _len, _ref;
      _ref = this.io_callbacks;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        this.linda.io.removeListener(c.name, c.listener);
      }
      return this.io_callbacks = [];
    };

    TupleSpace.prototype.write = function(tuple, options) {
      var data;
      if (options == null) {
        options = {
          expire: null
        };
      }
      data = {
        tuplespace: this.name,
        tuple: tuple,
        options: options
      };
      return this.linda.io.emit('__linda_write', data);
    };

    TupleSpace.prototype.take = function(tuple, callback) {
      var id, listener, name;
      if (typeof callback !== 'function') {
        return;
      }
      id = this.create_callback_id();
      name = "__linda_take_" + id;
      listener = function(err, tuple) {
        return callback(err, tuple);
      };
      this.io_callbacks.push({
        name: name,
        listener: listener
      });
      this.linda.io.once(name, listener);
      this.linda.io.emit('__linda_take', {
        tuplespace: this.name,
        tuple: tuple,
        id: id
      });
      return id;
    };

    TupleSpace.prototype.read = function(tuple, callback) {
      var id, listener, name;
      if (typeof callback !== 'function') {
        return;
      }
      id = this.create_callback_id();
      name = "__linda_read_" + id;
      listener = function(err, tuple) {
        return callback(err, tuple);
      };
      this.io_callbacks.push({
        name: name,
        listener: listener
      });
      this.linda.io.once(name, listener);
      this.linda.io.emit('__linda_read', {
        tuplespace: this.name,
        tuple: tuple,
        id: id
      });
      return id;
    };

    TupleSpace.prototype.watch = function(tuple, callback) {
      var id, listener, name;
      if (typeof callback !== 'function') {
        return;
      }
      id = this.create_watch_callback_id(tuple);
      name = "__linda_watch_" + id;
      listener = function(err, tuple) {
        return callback(err, tuple);
      };
      this.io_callbacks.push({
        name: name,
        listener: listener
      });
      this.linda.io.on(name, listener);
      this.linda.io.emit('__linda_watch', {
        tuplespace: this.name,
        tuple: tuple,
        id: id
      });
      return id;
    };

    TupleSpace.prototype.cancel = function(id) {
      if (this.linda.io.connected) {
        this.linda.io.emit('__linda_cancel', {
          tuplespace: this.name,
          id: id
        });
      }
      return setTimeout((function(_this) {
        return function() {
          var c, i, _i, _ref, _results;
          _results = [];
          for (i = _i = _ref = _this.io_callbacks.length - 1; _ref <= 0 ? _i <= 0 : _i >= 0; i = _ref <= 0 ? ++_i : --_i) {
            c = _this.io_callbacks[i];
            if (c.name.match(new RegExp("_" + id + "$"))) {
              _this.linda.io.removeListener(c.name, c.listener);
              _results.push(_this.io_callbacks.splice(i, 1));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        };
      })(this), 100);
    };

    return TupleSpace;

  })();

  if (typeof window !== "undefined" && window !== null) {
    window.Linda = LindaClient;
  } else if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
    module.exports = LindaClient;
  }

}).call(this);
