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
      var span, host, annotations;
      var largestRandom = Math.pow(2, 53) - 1;

      function initTrace(reqHeader) {
        var trace = {};
        var traceId = reqHeader['X-B3-TraceId'] || getUniqueId();
        trace.traceId = traceId;
        return trace;

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
          method: "GET",
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
