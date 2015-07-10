# kao-lite 

> lite version of [kao](https://github.com/xwcoder/kao)

differences between kao.js:
1. remove dependence on `messagebug`
2. remove `coreLib`
3. remove `DEBUG`
4. remove `kao.logger` module

## Usage

```
<script src="kao-lite.js"></script>
<script>
kao.add('jQuery', {path: './jq.js'});
kao.add('index', {path: './index.js', requires['jQuery']});

kao('index');
</script>
```

## API

### kao.add('id', options)

#### id

Type: `String`  
required: `true`

#### options

##### path

Type: `String`  

##### requires

Type: `Array`  


### kao.config(options)

#### options

##### path

Type: `String`
Default: domain of `kao-lite.js`


### kao('mod1',[mod2]..., [fn])

#### mod1, [mod2]...

Type: `String`  

module id to load

#### fn

Type: `function`

callback execute after modules loaded


## License

MIT © [creep](http://xwcoder.github.io)
