import { CLIENT_ID, API_KEY, CLIENT_SECRET, DB_URL } from "../google/config.js";
import express from "express";
import ViteExpress from "vite-express"
// ---------------------
import axios from "axios";
import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";
// ---------------------
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb"
import { writeFile } from "fs";
import dbFile from "./tmp-db.json" assert {type: "json"}

//!!!!!! https://data.crunchbase.com/docs/using-the-api
//! APIIIIIII FOR COMPANY DATAAAA

//# EXPRESS + VITE SETUP
const app = express();
app.use(express.json())
ViteExpress.listen(app, 3000, () =>
    console.log("Server is active on http://localhost:3000/dashboard")
);

//# GMAIL API SETUP
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
//# MONGO DB SETUP
const mongo = new MongoClient(DB_URL, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
await mongo.connect();
console.log('MongoDB connected successully ✅');
const db = mongo.db("Gatorbytes_Email_Service");
const usersDB = db.collection("users");

//# ROUTES
app.post("/api/login", async (req, res) =>  {
    const userID = req.body.authuser;
    const accessToken = req.body.access_token;
    // gets basic user data (name, email, etc...)
    let userData = (await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`)).data
    userData = {username: userData.name, email: userData.email, picture: userData.picture}
    // res.send(userData.data)
    // return
    // error checking
    // if (!userID || !accessToken) {
    //     res.status(400).send("YOU FORGOT TO INCLUDE 'authuser' or 'access_token' in HTTP request body")
    //     return
    // }
    // if (dbFile.hasOwnProperty(userID)) {
    //     res.send("EXISTING USER LOGGED IN")
    //     return
    // }

    usersDB.insertOne({_id: userID, ...userData, access_token: accessToken})
    console.log(usersDB.find({username: "Juan Ponce de Leon"}).toArray())

    dbFile[userID] = accessToken;

    writeFile('./src/server/tmp-db.json', JSON.stringify(dbFile, null, 4), err => {
        if (err) {
            res.status(500).send("ERROR IN WRITING FILE");
        } else {
            res.status(201).send("SUCCESSFULLY CREATED USER");
        }
    })
});
app.post("/api/logout", (req, res) => {
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

});

app.post("/api/add-company", (req, res) => {
    let companyID = req.body.id;
    let companyName = req.body.name;
    let companyEmail = req.body.companyEmail;

    res.send(`ADDED ${companyName} TO DATABASE`)
});

app.post("api/send-email", async (req, res) => {
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
});

app.get("/ping", (req, res) => {
    res.send("pong");
});

//! REMOVE LATER THIS IS ONLY FOR RIGHT NOW (LANDING PAGE WILL REPLACE THIS)
app.get("/", (req, res) => {
    res.redirect("/dashboard")
})
