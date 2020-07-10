# A webpack 4 plugin for generating script tags and placing them across one or more files
Supports JSP variables to some extent

# Installation

`npm i --save-dev webpack-scripts-plugin`

# Prerequisites
For each of the .html/.jsp files specified, there should be a section with following comments:
```
<!-- webpack scripts: START -->
<!-- webpack scripts: END -->
```
Generated scripts will be placed in between these comments

# usage
```
const WebpackScriptsPlugin = require('webpack-scripts-plugin');

plugins: [
    new WebpackScriptsPlugin({
        entryA: {
            scripts: [
                { test: /runtime\.(.+)\.bundle\.js/, },
                { test: /entryA(.*)\.(.+)\.bundle\.js/, attrs: `defer type='text/javascript'`, },
                { test: /(.*)defaultVendors(.*)\.(.+)\.bundle\.js/, attrs: 'defer', },
            ],
            filePath: 'src/index.html'
        },
        entryB: {
            scripts: [
                { test: /runtime\.(.+)\.bundle\.js/, },
                { test: /(.*)defaultVendors(.*)\.(.+)\.bundle\.js/, },
                { test: /entryB\.(.+)\.bundle\.js/, },
            ],
            filePath: 'WEB-INF/jsp/setup.jsp',
            useContextVar: 'contextPath',
        },
    })
]
```

# entryA generates something like below in index.html:
```
<!-- webpack scripts: START -->
<script  defer type='text/javascript' src="resources/dist/entryA.aad367fb555c6f9f48fc.bundle.js" charset="utf-8"></script>
<script  src="resources/dist/runtime.75ffecf22e8334b80c1b.bundle.js" charset="utf-8"></script>
<script  defer src="resources/dist/defaultVendors~entryA~entryB.eb5e6982941a298f3ffd.bundle.js" charset="utf-8"></script>
<!-- webpack scripts: END -->
```

# entryB generates something like below in setup.jsp:
```
<!-- webpack scripts: START -->
<script  src="<%=contextPath%>/resources/dist/entryB.e68aa1c653b3e5ad74ee.bundle.js" charset="utf-8"></script>
<script  src="<%=contextPath%>/resources/dist/runtime.75ffecf22e8334b80c1b.bundle.js" charset="utf-8"></script>
<script  src="<%=contextPath%>/resources/dist/defaultVendors~entryA~entryB.eb5e6982941a298f3ffd.bundle.js" charset="utf-8"></script>
<!-- webpack scripts: END -->
```
