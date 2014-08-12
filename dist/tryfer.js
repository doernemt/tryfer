/**
 * Restful Trace service for AngularJS apps
 * @version v0.0.1 - 2014-08-11 * @link https://github.com/zhaoxuan/tryfer
 * @author John Zhao <zhaoxuan1727@gmail.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
'use strict';
(function() {

  var module = angular.module('tryfer', []);

  module.provider('Tryfer', function() {

    this.$get = ['$http', function($http) {

      var trace = {};
      var largestRandom = Math.pow(2, 53) - 1;

      function initTrace(reqHeader, sampleRate, name, hostHash) {
        if (sampleRate === undefined || sampleRate === null) {
          sampleRate = 0.001;
        }

        if (reqHeader === undefined || reqHeader === null) {
          reqHeader = {};
        }

        if (name === undefined || name === null) {
          name = 'HTTP';
        }

        if (Math.random() <= sampleRate) {
          trace.sampleRate = true;
        }else {
          trace.sampleRate = false;
          return trace;
        }

        var traceId = reqHeader['X-B3-TraceId'] || getUniqueId();
        var spanId = getUniqueId();
        var parentId = reqHeader['X-B3-SpanId'] || null;

        var span = {
          'trace_id': hexStringify(traceId),
          'span_id': hexStringify(spanId),
          'name': name,
          'annotations': []
        };

        if (parentId !== null) {
          span['parent_id'] = hexStringify(parentId);
        }

        if (hostHash === undefined || hostHash === null) {
          hostHash = {
            'ip': '127.0.0.1',
            'port': 80,
            'service_name': 'tryfer'
          };
        }

        var host = trace.getHost(hostHash);

        trace.span = span;
        trace.host = host;

        return trace;
      }

      trace.clientSend = function() {
        if (trace.sampleRate === false) {
          return trace;
        }

        var annotation = {
          'type': 'timestamp',
          'key': 'cs',
          'value': getNowMicros(),
          'host': trace.host || trace.getHost()
        };

        trace.span.annotations.push(annotation);
        return trace;
      };

      trace.clientReceive = function() {
        if (trace.sampleRate === false) {
          return trace;
        }

        var annotation = {
          'type': 'timestamp',
          'key': 'cr',
          'value': getNowMicros(),
          'host': trace.host || trace.getHost()
        };

        trace.span.annotations.push(annotation);
        trace.sendData();
        return trace;
      };

      trace.sendData = function() {
        if (trace.sampleRate === false) {
          return 'sampleRate is false';
        }

        var data = [];
        data.push(trace.span);

        $http.post(
          'http://localhost:6956/v1.0/trace',
          data,
          {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST'
          }
        );

      };

      // type = {string, bytes, timestamp}
      trace.record = function(type, key, value) {
        if (trace.sampleRate === false) {
          return trace;
        }

        var annotation = {
          'type': type,
          'key': key,
          'value': value,
          'host': trace.host || trace.getHost()
        };

        trace.span.annotations.push(annotation);

        return trace;
      };

      trace.getHost = function(hostHash) {
        var ip = hostHash['ip'];
        var port = hostHash['port'];
        var serviceName = hostHash['service_name'];

        if (ip === undefined || ip === null) {
          ip = '127.0.0.1';
        }
        if (port === undefined || port === null) {
          port = 80;
        }
        if (serviceName === undefined || serviceName === null) {
          serviceName = 'aqueduct';
        }

        var host = {
          'ipv4': ipv4ToNumber(ip),
          'port': port,
          'service_name': serviceName
        };

        return host;
      };

      trace.getHeaders = function() {
        var headers = {};

        if (trace.sampleRate === false) {
          return headers;
        }

        var span = trace.span;
        headers['X-B3-TraceId'] = span['trace_id'];
        headers['X-B3-SpanId'] = span['span_id'];
        headers['X-B3-ParentSpanId'] = span['parent_id'];

        return headers;
      };

      function ipv4ToNumber(ipv4) {
        var dot = ipv4;
        var d = dot.split('.');
        return (((((((+d[0])*256)+(+d[1]))*256)+(+d[2]))*256)+(+d[3])).toString();

      }

      function hexStringify(number, length) {
        var hexString = number.toString(16);
        if (length === undefined || length === null) {
          length = 16;
        }
        if (hexString.length < length) {
          // plus 1, because if you want 15 zeros you need 16 empty elements (
          // 15 = negative space between elements)
          return (new Array(length + 1 - hexString.length)).join('0') + hexString;
        } else {
          return hexString;
        }
      }

      function getUniqueId() {
        return Math.floor(Math.random() * largestRandom);
      }

      function getNowMicros() {
        return Date.now() * 1000;
      }

      function call() {
        var service = {};
        service.getNowMicros = _.bind(getNowMicros);
        service.getUniqueId = _.bind(getUniqueId);
        service.postData = _.bind(postData);
        service.initTrace = _.bind(initTrace);

        return service;
      }

      return call();

    }];

  });




})();
