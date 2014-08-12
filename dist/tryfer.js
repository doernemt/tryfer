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
    var Configurer = {};
    var globalConfiguration = {};
    Configurer.init = function(object, config) {

      object.setSampleRate = function(sampleRate) {
        if (sampleRate === undefined || sampleRate === null) {
          sampleRate = 0.1;
        }
        config.sampleRate = sampleRate;
      };

      object.setRestkin = function(url) {
        config.restkinUrl = url;
      };

      object.setName = function(serviceName) {
        config.serviceName = serviceName;
      };

      object.setHost = function(hostHash) {
        config.hostHash = hostHash;
      };

    };

    Configurer.init(this, globalConfiguration);

    this.$get = ['$http', function($http) {

      function createTrace(config) {
        var service = {};
        var trace = {};
        var largestRandom = Math.pow(2, 53) - 1;

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

        trace.getHost = function() {
          var hostHash = config.hostHash;
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
            serviceName = 'tryfer:default';
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
            config.restkinUrl,
            data,
            {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST'
            }
          ).success(function() {
              console.log('trace success');
            }).error(function() {
              console.log('trace error');
            });

        };

        // type = {string|bytes|timestamp}
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

        function initTrace(requestHeader) {
          var sampleRate;
          if (config.sampleRate === undefined || config.sampleRate === null) {
            sampleRate = 0.1;
          } else {
            sampleRate = config.sampleRate;
          }

          if (requestHeader === undefined || requestHeader === null) {
            requestHeader = {};
          }

          if (Math.random() <= sampleRate) {
            trace.sampleRate = true;
          }else {
            trace.sampleRate = false;
            return trace;
          }

          var traceId = requestHeader['X-B3-TraceId'] || getUniqueId();
          var spanId = getUniqueId();
          var parentId = requestHeader['X-B3-SpanId'] || null;

          var span = {
            'trace_id': hexStringify(traceId),
            'span_id': hexStringify(spanId),
            'name': name,
            'annotations': []
          };

          if (parentId !== null) {
            span['parent_id'] = hexStringify(parentId);
          }

          var host = trace.getHost();

          trace.span = span;
          trace.host = host;

          return trace;
        }

        service.initTrace = _.bind(initTrace);

        return service;
      }

      return createTrace(globalConfiguration);

    }];

  });




})();
