# What for ?
1. A webpack 4 plugin for adding webpack generated js bundles as script tags to specified files (html/jsp)
2. Supports JSP variables to some extent
3. Matches generated bundles against regex provided by you and places them in the respective file paths provided by you.

# Installation

`npm i --save-dev webpack-script-tags-plugin`

# Prerequisites
1. Webpack 4 and above
2. For each of the .html/.jsp files specified, there should be a section with following comments:
```
<!-- webpack scripts: START -->
<!-- webpack scripts: END -->
```
Generated scripts will be placed in between these comments

# Usage
```
const WebpackScriptTagsPlugin = require('webpack-script-tags-plugin');

plugins: [
    new WebpackScriptTagsPlugin({
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

entryA generates something like below in index.html:
```
<!-- webpack scripts: START -->
<script  defer type='text/javascript' src="resources/dist/entryA.a023es.bundle.js" charset="utf-8"></script>
<script  src="resources/dist/runtime.qa2ewd.bundle.js" charset="utf-8"></script>
<script  defer src="resources/dist/defaultVendors~entryA~entryB.qw234.bundle.js" charset="utf-8"></script>
<!-- webpack scripts: END -->
```

entryB generates something like below in setup.jsp:
```
<!-- webpack scripts: START -->
<script  src="<%=contextPath%>/resources/dist/entryB.e68aa1.bundle.js" charset="utf-8"></script>
<script  src="<%=contextPath%>/resources/dist/runtime.75ffw.bundle.js" charset="utf-8"></script>
<script  src="<%=contextPath%>/resources/dist/defaultVendors~entryA~entryB.eb5e6.bundle.js" charset="utf-8"></script>
<!-- webpack scripts: END -->
```
