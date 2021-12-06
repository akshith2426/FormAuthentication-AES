const express = require('express');
const dotenv = require('dotenv');
const bodyparser = require("body-parser");
const path = require('path');
const app = express();

dotenv.config( { path : '.env'} )
const PORT = process.env.PORT || 9000

// parsing request to body-parser
app.use(bodyparser.urlencoded({ extended : true}))

// setting view engine
app.set("view engine", "ejs")

// load assets
app.use('/css', express.static(path.resolve(__dirname, "public/css")))

// load routers
app.use('/', require('./routes/router'))

app.listen(PORT, ()=> { console.log(`Server is running on http://localhost:${PORT}`)});
