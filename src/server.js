const express = require('express')
fs = require('fs')
path = require('path')
var cors = require('cors')
const util = require('util')

const app = express()
app.use(cors())

const port = 9900
const TEXTFILE='a.txt'

app.get('/read', (req, res) => {    
    fs.readFile(path.join(__dirname,'..','assets',TEXTFILE), 'utf8', async function (err,data) {
        if (err) {return console.log(err);}
        console.log(data);
        res.send(data)
    });
})

app.get('/write/:id', (req, res) => {    
    WRITTEN=req.params.id
    fs.writeFile(path.join(__dirname,'..','assets',TEXTFILE), WRITTEN, async function (err,data) {
        if (err) {return console.log('err write file error');}
        res.send(WRITTEN)
    });
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})