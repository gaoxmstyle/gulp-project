# postcss-plugin-pxtoviewport

## Usage

Pixels are the easiest unit to use (*opinion*). The only issue with them is that they don't let browsers change the default font size of 16. This script converts every px value to a rem from the properties you choose to allow the browser to set the font size.


### Input/Output

*With the default settings, only font related properties are targeted.*

```css
// input
h1 {
    margin: 0 0 20px;
    font-size: 32px;
    line-height: 1.2;
    letter-spacing: 1px;
}

// output
h1 {
    margin: 0 0 1.25rem;
    margin: 0 0 5.33333vw;
    font-size: 2rem;
    font-size: 8.53333vw;
    line-height: 1.2;
    letter-spacing: 1px;
}
```

### options

Type: `Object | Null`  
Default:
```js
{
    viewportWidth: 750,    
    viewportHeight: 1334,  
    unitPrecision: 5,      
    viewportUnit: 'vw',    
    selectorBlackList: [], 
    propList: [],            
    minPixelValue: 1,      
    mediaQuery: false, 
    rootValue: 16,      
    toRem: false,       
    toViewport: true    
}
```

- `viewportWidth` (Number) Design draft width
- `viewportUnit` (String) Reference unit
- `rootValue` (Number) The root element font size.
- `toRem` (Boolean) Allow px to rem
- `toViewport` (Boolean) Allow px to vw
- `unitPrecision` (Number) The decimal numbers to allow the REM units to grow to.
- `propList` (Array) if your don't what can change from px to vw.
- `selectorBlackList` (Array) The selectors to ignore and leave as px.
    - If value is string, it checks to see if selector contains the string.
        - `['body']` will match `.body-class`
    - If value is regexp, it checks to see if the selector matches the regexp.
        - `[/^body$/]` will match `body` but not `.body`
- `mediaQuery` (Boolean) Allow px to be converted in media queries.
- `minPixelValue` (Number) Set the minimum pixel value to replace.


### Use with gulp-postcss and autoprefixer

```js
var gulp = require('gulp');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var pxtovw = require('postcss-plugin-pxtoviewport');

gulp.task('css', function () {
    var processors = [
        autoprefixer({
            browsers: 'last 1 version'
        }),
        pxtovw({
            viewportWidth: 375,
            toRem: true
        })
    ];

    return gulp.src(['build/css/**/*.css'])
        .pipe(postcss(processors))
        .pipe(gulp.dest('build/css'));
});
```

### Use with webpack
```js
var webpack = require('webpack');
var px2viewport = require('postcss-plugin-pxtoviewport');

module.exports = {
    entry: [],
    output: [],
    module: {
        {
            test: /\.css$/,
            use: [
                'style-loader',
                'css-loader',
                {
                    loader: require.resolve('postcss-loader'),
                    options: {
                        ident: 'postcss',
                        plugins: () => [
                            px2viewport({
                                viewportWidth: 375,
                                toRem: true
                            })
                        ],
                    }
                }
            ]
        }
    }
}
```