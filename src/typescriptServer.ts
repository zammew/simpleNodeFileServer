//sam: when working with files, rather use fs.read rather than file path because file path might be PUBLIC exposed, to transform on a path, no choice but to use URL
import * as express from 'express'
// sam: http to create websocket not by express
import * as http from 'http';
import * as WebSocket from 'ws';
import * as cors from 'cors';
import * as fileUpload  from 'express-fileupload';
import * as cookieParser  from 'cookie-parser'
import * as chalk from 'chalk';
import * as child_process from 'child_process'
import * as serveIndex  from 'serve-index'
import fetch from 'cross-fetch';

// sam: need _dirname and path to make file paths more readable than relative path, use dirname so that files are relative to index.ts (THE ENTRY POINT)
import * as path  from 'path'
import * as urljoin  from 'url-join'

// sam: ASKING SERVER TO PROCESS TEXT FILES AND RETURN IT WITHOUT STORING TO DISK:
import * as yamljs from 'yamljs'
import * as toml from 'toml'

// source: https://stackoverflow.com/questions/64725249/fs-promises-api-in-typescript-not-compiling-in-javascript-correctly
// sam: BELOW import submodule from fp module doesnt work in typescript
// import * as fs from 'fs/promises'
// sam: BELOW works
import {promises as fs}  from 'fs'

import * as util from 'util'

// sam: run bash command on SERVER, many uses
const exec = util.promisify(child_process.exec);
const promisea = exec('ls');
// const child = promise.child; 


const EXPRESS_PORT=9123;
const LOCALHOST=`http://localhost:${EXPRESS_PORT}`


var printFile=function(){
    return {o:'ok'}
}

// sam: run two servers on 2 different ports
const app_servejson=express()

// sam: MIME type is for treating TOML file as plain text so that it displays in browser instead of download
express.static.mime.define({
    'text/plain': ['toml']
});

// sam: be careful, in dev we enable CORS to allow other localhost ports to access this API , browser can access usually with no problem
app_servejson.use(cors())
// sam: servers publix/index.html at localhost:PORT/PUBLIC/nestedfolder/index.html serve file, but permission denied for FOLDER
app_servejson.use('/public',express.static('public'))
// sam: serve FILES but permission denied for FOLDERS
app_servejson.use('/public',serveIndex('public'))

// sam:allow click button to upload file and place and get cookies from browser
app_servejson.use(fileUpload())
app_servejson.use(cookieParser())

// sam:sets PERMANENT COOKIE not SESSION COOKIE on ORIGIN
//      with secure ENABLED. blocked XSS sp that browser console "document.cookie" doesnt show the secure cookie
app_servejson.get('/setcookie',(req,res)=>{
    // sam: res.cookie parameters are cookie Key and cookie Value
    // sam: cookie by default lives 10 years
    // sam: req.cookies sends back all cookies for that site as obj(cookieKey1:cookieValue1  ,  cookieKey2: cookieValue2)
    const REQ_COOKIES=req.cookies
    console.log("    REQ_COOKIES")
    console.log(REQ_COOKIES)
    let OPTIONAL_COOKIE_OPTIONS={
        maxAge: 10000000000,
        // expires works the same as the maxAge
        expires: new Date('01 12 2021'),
        secure: true,
        httpOnly: true,
    }
    res.cookie(`Cookie token name`,`encrypted cookie string Value` , OPTIONAL_COOKIE_OPTIONS);
    res.send(`Cookie have been saved successfully ${JSON.stringify(REQ_COOKIES)}`);
})
// sam: best way to decouple logic and speed up iterative testing with sending back by server, put same named route logic on top of route
async function toml2json(assetname){
    let readedToml=await fs.readFile(path.join(__dirname,'../public/XXXFOLDER-server/STATE.toml'),"utf-8")
    const convertedToJSON=toml.parse(readedToml)
    await console.log(convertedToJSON)
    return convertedToJSON
}
// sam:run function and console log to browser on FILE SAVB, efficient to debug, comment out in production
toml2json('dsds')
// sam: http://localhost:9123/public/XXXX/STATE.toml/converttomltojson , add /converttomltojson to end of static asset to convert it
app_servejson.get(/.*converttomltojson/, async(req,res)=>{
    let FULLPATH=urljoin(LOCALHOST,req.url.replace("/converttomltojson",""))
    let xx=await fetch(FULLPATH)
    let yy=await xx.text()
    console.log(await toml2json(yy))
    res.send(await toml2json(yy))
})
app_servejson.get('/clearcookie', (req,res)=>{
    res.clearCookie(`Cookie token name`)
    res.send('Cookie has been deleted successfully');
})
app_servejson.get('/', (req,res)=>{
    res.sendFile('landingpage.html', { root: __dirname })
    // res.send(printFile())
    // res.send('hello')
})
// sam: matches anything containing jsonexample, not very useful
app_servejson.get(/jsonexample/, (req,res)=>{
    console.log(JSON.stringify(req.url))
    // res.send(printFile())
    var obj=[{fruit:'apple'}]
    res.send(obj)
})
app_servejson.post('/upload',function(req, res) {
    console.log(req["files"]); // the uploaded file object
});
app_servejson.post('/runbashcommand',function(req, res) {
    console.log(req["files"]); // the uploaded file object
});
app_servejson.listen(EXPRESS_PORT,()=>console.log('hi express server running'))

// SECOND PORT for WEBSOCKET
// TEST wscat with cmd line "wscat -c ws://localhost:9124"
const app_websocket = express();
const server = http.createServer(app_websocket);
const wss = new WebSocket.Server({ server });
// sam:websocket uses different port
const WS_PORT=9124;
//initialize the WebSocket server instance
wss.on('connection', (ws: WebSocket) => {
    //connection is up, let's add a simple simple event
    ws.on('message', (message: string) => {
        //log the received message and send it back to the client
        console.log('received: %s', message);
        ws.send(`Hello, you sent -> ${message}`);
    });
    //send immediatly a feedback to the incoming connection    
    ws.send('Hi there, I am a WebSocket server');
});
//start our server
server.listen(WS_PORT, () => {
    console.log(`Server started on port ${WS_PORT} :)`);
});

async function runAnyAsyncFuncAtEndForDebugging(){
    await console.log(chalk.green('END OF LINE RUNNING ASYNC'));
    const { stdout, stderr } = await promisea;
    console.log("       stdout")
    await console.log(stdout)
    await console.log(chalk.green('END OF LINE RUNNING ASYNC2'));
    
    let xx=await fetch(urljoin(LOCALHOST,"public","/XXXFOLDER-server/STATE.toml"))
    let yy=await xx.text()
    console.log(toml2json(yy))
    // console.log(yy)
}
// runAnyAsyncFuncAtEndForDebugging()


// TODO:
//read and write files to txt/json/run sqlite bash comd/ append to log file
//https://medium.com/stackfame/how-to-run-shell-script-file-or-command-using-nodejs-b9f2455cb6b7
// ignore shellJS (bash better), npm cli good

// promisify chikd process
//https://stackoverflow.com/questions/30763496/how-to-promisify-nodes-child-process-exec-and-child-process-execfile-functions
