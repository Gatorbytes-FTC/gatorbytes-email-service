import { CLIENT_ID, API_KEY, CLIENT_SECRET, DB_URL } from "../google/config.js";
import express, { response } from "express";
import ViteExpress from "vite-express"
// ---------------------
import axios from "axios";
import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";
// ---------------------
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb"
import dbFile from "./tmp-db.json" assert {type: "json"}
import { randomInt } from "crypto";

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
    'postmessage'
    // 'http://localhost:3000/oauth2callback'
);

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
const companiesDB = db.collection("companies")


//# HELPERS
function authorizeUser(accessToken) {
    auth.setCredentials({
        access_token: accessToken
    });
    return google.gmail({version: 'v1', auth});
}
async function createUser({userID, authCode, refreshToken, name, email, picture}) {
    // check if user exists
    const imaginaryUser = await usersDB.find({_id: userID}).toArray();
    if (imaginaryUser.length !== 0) {
        console.log("USER ALREADY EXISTS")
        return true
    }

    // add new user to database
    usersDB.insertOne({_id: userID, /*authCode:authCode,*/ refreshToken: refreshToken, name: name, email: email, picture: picture}).then((response)=>{
        // console.log( usersDB.find({username: "Juan Ponce de Leon"}).toArray())
        console.log(response);

        return true;
    }).catch((err)=>{
        return false;
    })
    
}
async function getCompanies(idType, id) {
    let companies = []
    const findObj = {}
    findObj[idType] = id
    await companiesDB.find(findObj).toArray().then((response) => {
        companies = response
    })
    return companies
}

//# AUTHENTICATION ROUTES
app.post("/api/authorize", async (req, res) => {
    const {code,authuser} = req.body;

    // get ACCESS_TOKEN
    auth.getToken(code, async (err, tokens) => {
        if (err) throw new Error()

        // get user information
        const userData = (await auth.verifyIdToken({
            idToken: tokens.id_token
        })).getPayload();

        // gets refresh and access token
        const refreshToken = tokens.refresh_token;
        const accessToken = tokens.access_token;

        // create account
        if (createUser({userID:authuser,  authCode:code,  refreshToken:refreshToken,  name:userData.name,  email:userData.email,  picture:userData.picture}))
            console.log("NO ERROR")
        else
            console.log("ERROR IN CREATING USER")

        // return userID
        res.send(authuser)
    });
});
app.post("/api/logout", (req, res) => {
    let userID = req.body.userID;
    if (Number.isNaN(userID)) {
        res.send("NOT LOGGED IN")
        return
    }
    userID = userID.toString()

    usersDB.deleteOne({_id: userID}).then((result) => {
        console.log(result)
        res.send(`Deleted user ${userID}`)
    })
});

//# COMPANY ROUTES
app.post("/api/add-company", (req, res) => {
    // get request body
    const userID = req.body.userID
    const companyName = req.body.name
    const companyEmail = req.body.email

    // document to be added to db
    const document = {
        userID: userID,
        companyName: companyName,
        companyEmail: companyEmail,
        emailHistory: [],
        progress: 0
    }

    // adds company to db
    companiesDB.insertOne(document).then(async (response1) => {
        // returns created company
        console.log(response1)
        getCompanies("_id", response1.insertedId).then((response2) => {
            res.status(201).send(response2[0])
        })
    })
    .catch((err) => {
        res.status(500).send(err)
    })

});

app.post("/api/get-companies", (req, res) => {
    // get userID from request body
    const userID = req.body.userID
    
    // find all companies that belong to userID
    getCompanies("userID", userID).then((response) => {
        console.log("GET COMPANY CALLED | " + String(randomInt(10)))
        res.send(response)
    })
})

app.post("/api/delete-company", (req, res) => {
    const companyID = req.body.companyID

    // deletes the company with the corresponding ID
    companiesDB.deleteOne({_id: new ObjectId(companyID)}).then((response) => {
        res.send(response.acknowledged)
    })
})

//# EMAIL ROUTES
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
