const express = require('express');


const app = express();
app.get('/', (req, res) => {
    res.send("welcome allll");
});

    app.listen(3000, () => { console.log("app listen in 3000") })