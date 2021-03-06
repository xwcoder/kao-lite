kao.add('a', {path: 'test/js/a.js'});
kao.add('b', {path: 'test/js/b.js', requires: ['a']});

kao.add('c', {path: 'test/js/c.js', requires: ['a']});
kao.add('d', {path: 'test/js/d.js', requires: ['c']});

kao.add('e', {path: 'test/js/e.js', requires: ['c', 'a']});

kao.add('f', {path: 'test/js/f.js', requires: ['d', 'e']});

kao( 'test/index.css', 'b', function () {
  log('b:' + b)
})

kao('b', 'c', 'e', function () {
  log('b:' + b);
  log('c:' + c);
  log('b+c+e:' + (b+c+e));
});
kao('test/index.css', 'd', function () {
  log('d:' + d);
});

kao('e', function () {
  log('e:' + e);
});

kao('test/index.css', 'f', function () {
  log('f:' + f);
});
