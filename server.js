var express = require('express'),
    app = express();

app.use("/src", express.static("./src"));
app.use("/test/", express.static("./test"));
app.use("/docs/", express.static("./yuidocs"));
app.use("/coverage/", express.static("./coverage/lcov-report"));

app.listen("8080");
