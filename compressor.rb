# encoding=UTF-8
# -*- coding: UTF-8 -*-
# coding: UTF-8
# Copyright © 2014 john <john@apple.local>

require 'uglifier'

compress_js = open('./dist/tryfer-min.js', 'w')
compress_js.print(Uglifier.new.compile(File.read("./dist/tryfer.js")))
