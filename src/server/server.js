import { CLIENT_ID, API_KEY, CLIENT_SECRET } from "../google/config.js";
import express from "express";
import ViteExpress from "vite-express"
// ---------------------
import { writeFile } from "fs";
import dbFile from "./tmp-db.json" assert {type: "json"}
import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";

// EXPRESS + VITE SETUP
const app = express();
app.use(express.json())
ViteExpress.listen(app, 3000, () =>
    console.log("Server is active on http://localhost:3000")
);

// GMAIL API SETUP
const SCOPES = ["https://mail.google.com/"]
const auth = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    'http://localhost:3000/'
);
// authorize user and return logged in gmail client
function authorizeUser(accessToken) {
    auth.setCredentials({
        access_token: accessToken
    });
    return google.gmail({version: 'v1', auth});
}



// ! TEMP | USE REAL DB LATER
// regular routes
app.post("/login", (req, res) => {
    const userID = req.body.authuser;
    const accessToken = req.body.access_token;
    
    if (!userID || !accessToken) {
        res.status(400).send("YOU FORGOT TO INCLUDE 'authuser' or 'access_token' in HTTP request body")
        return
    }
    if (dbFile.hasOwnProperty(userID)) {
        res.send("EXISTING USER LOGGED IN")
        return
    }

    dbFile[userID] = accessToken;

    writeFile('./src/server/tmp-db.json', JSON.stringify(dbFile, null, 4), err => {
        if (err) {
            res.status(500).send("ERROR IN WRITING FILE");
        } else {
            res.status(201).send("SUCCESSFULLY CREATED USER");
        }
    })
})
app.post("/logout", (req, res) => {
    let userID = req.body.userID;
    console.log(userID)
    delete dbFile[userID];

    writeFile('./src/server/tmp-db.json', JSON.stringify(dbFile, null, 4), err => {
        if (err) {
            res.status(500).send("ERROR IN WRITING FILE");
        } else {
            res.status(200).send("USER LOGGED OUT");
        }
    })

})


app.post("/send-email", async (req, res) => {
    // get token from request body and authorize
    let accessToken = req.body.accessToken
    auth.setCredentials({
        access_token: accessToken
    });
    const gmail = google.gmail({version: 'v1', auth});

    // get all email components from request body
    let fromName = req.body.fromName
    let fromAddress = req.body.fromAddress
    let to = req.body.to
    let subject = req.body.subject
    let message = req.body.message
    
    // compose email
    const emailLines = [
        `From: "${fromName}" <${fromAddress}>`,
        `To: ${to}`,
        'Content-type: text/html;charset=iso-8859-1',
        'MIME-Version: 1.0',
        `Subject: ${subject}`,
        '',
        message
    ];
    // join all the lines
    const email = emailLines.join('\r\n').trim();
    const base64Email = Buffer.from(email).toString('base64');
    await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: base64Email
        }
    });
    res.send("SUCCESSFULLY SENT EMAIL")
})

app.get("/ping", (req, res) => {
    res.send("pong");
});
