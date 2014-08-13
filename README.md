tryfer
======

A REST interface for publish json trace to restkin

INSTALL
=======

	bower install tryfer

CONFIG
======

    TryferProvider.setRestkin('http://localhost:6956/v1.0/trace'); // set restkin url
    TryferProvider.setName('AQUI');                                // set span name
    TryferProvider.setHost({
      'ipv4': '127.0.0.1',
      'port': 9000,
      'service_name': 'aqueduct:ui'
    });                                                            // receive a hash to set host info
    TryferProvider.setSampleRate(1);                               // set sample rate, default is 0.01

TRACE
=====

    var trace = Tryfer.initTrace(headers);       // init a Trace with httpheaders
    trace.clientSend();
    trace.record('string', 'one:products', '1');
    trace.clientReceive();
