require 'uglifier'

compress_js = open('./dist/tryfer-min.js', 'w')
compress_js.print(Uglifier.new.compile(File.read("./dist/tryfer.js")))
compress_js.close
