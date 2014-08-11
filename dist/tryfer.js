/**
 * Restful Resources service for AngularJS apps
 * @version v1.4.0 - 2014-04-25 * @link https://github.com/mgonto/restangular
 * @author Martin Gontovnikas <martin@gon.to>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
'use strict';
(function() {

  var module = angular.module('tryfer', []);

  module.provider('Tryfer', function() {

    this.$get = ['$http', function($http) {

      var trace = {};
      var largestRandom = Math.pow(2, 53) - 1;

      function initTrace(reqHeader) {
        var traceId = reqHeader['X-B3-TraceId'] || getUniqueId();
        var spanId = reqHeader['X-B3-SpanId'] || getUniqueId();
        var parentId = reqHeader['X-B3-ParentSpanId'] || getUniqueId();

        var span = {
          'trace_id': hexStringify(traceId),
          'span_id': hexStringify(spanId),
          'parent_id': hexStringify(parentId),
          'name': 'GET',
          'annotations': []
        };

        var host = trace.getHost();

        trace.span = span;
        trace.host = host;

        return trace;
      }

      trace.clientSend = function() {
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
        var annotation = {
          'type': 'timestamp',
          'key': 'cr',
          'value': getNowMicros(),
          'host': trace.host || trace.getHost()
        };

        trace.span.annotations.push(annotation);
        return trace;
      };

      // type = {string, bytes, timestamp}
      trace.record = function(type, key, value) {
        var annotation = {
          'type': type,
          'key': key,
          'value': value,
          'host': trace.host || trace.getHost()
        };

        trace.span.annotations.push(annotation);

        return trace;
      };

      trace.getHost = function(ip, port, serviceName) {
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

      function ipv4ToNumber(ipv4) {
        var octets = ipv4.split('.');
        var sum = 0, i;

        if(octets.length !== 4) {
          throw new Error('IPv4 string does not have 4 parts.');
        }

        for (i=0; i<4; i++) {
          var octet = parseInt(octets[i], 10);
          if (isNaN(octet) || octet < 0 || octet > 255) {
            throw new Error('IPv4 string contains a value that is not a number ' +
                            'between 0 and 255 inclusive');
          }

          sum = (sum << 8) + octet;
        }

        return sum;
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

      function postData() {
        $http({
          url: 'http://www.baidu.com',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With',
          }
        });
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
