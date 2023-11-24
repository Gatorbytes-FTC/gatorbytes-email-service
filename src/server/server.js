import { CLIENT_ID, API_KEY, CLIENT_SECRET, DB_URL } from "../google/config.js";
import express from "express";
import ViteExpress from "vite-express"
// ---------------------
import axios from "axios";
import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb"
// --------------------- ⭣⭣⭣ DEV IMPORTS ⭣⭣⭣
import dbFile from "./tmp-db.json" assert {type: "json"}
import fs from "fs"
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
    "postmessage"
    // "http://localhost:3000/oauth2callback"
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
console.log("MongoDB connected successully ✅");
const db = mongo.db("Gatorbytes_Email_Service");
const usersDB = db.collection("users");
const companiesDB = db.collection("companies")
const templatesDB = db.collection("templates")


//# HELPERS
async function tokenValid(accessToken) {
    // if getTokenInfo returns error it means access token is invalid (and vice versa)
    try {
        await auth.getTokenInfo(accessToken)
        console.log("\naccessToken IS valid | " + accessToken)
        return true;
    } catch (error) {
        console.log("\ngetTokenInfo returned error which means this accesss token is invalid! | " + accessToken);
        return false;
    }
}

async function getCreds(userID, accessToken=null) {
    const user = await usersDB.find({_id: userID}).toArray()
    .catch((err) => {
        console.log("(catch) ERROR IN FINDING USER: " + JSON.stringify(err))
        return null
    })

    if (user == null || user == []) {
        res.status(500).send("(if) ERROR IN FINDING USER: " + JSON.stringify(user))
        return null
    }
    // GET REFRESH TOKEN
    const refreshToken = user[0].refreshToken
    
    // IF ACCESS TOKEN IS INVALID RENEW IT
    if (!await tokenValid(accessToken)) {
        const params = {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token: refreshToken,
            grant_type: "refresh_token"
        }
        // get renewed token
        const tokens = await axios.post("https://oauth2.googleapis.com/token", new URLSearchParams(params))
        .catch(err => {
            console.log(err)
            return null
        })
        // set new access token
        accessToken = tokens.data.access_token
    }

    // return gmail with credentials
    auth.setCredentials({
        access_token: accessToken,
        scope: SCOPES
    });
    return [google.gmail({version: "v1", auth}), accessToken];                    
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
        console.log(response);

        return true;
    })
    .catch((err)=>{
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
function fillTemplate(template) {
    return String(template) + "!";
}
async function sendEmail(company, userID, accessToken) {
    // get token from request body and authorize
    const creds = await getCreds(userID, accessToken)
    if (!creds) {
        console.log("ERROR IN CREATING/GETTING CREDS")
        return
    }
    const [gmail, newAccessToken] = creds


    const currentUser = await usersDB.findOne({_id: userID})
    if (!currentUser) {
        console.log("ERROR IN GETTING CURRENT USER")
        return accessToken
    }
    
    const template = await templatesDB.findOne({name: "Default"})
    
    // compose email
    const emailLines = [
        `From: "${currentUser.name}" <${currentUser.email}>`,
        `To: ${company.companyEmail}`,
        "Content-type: text/html;charset=iso-8859-1",
        "MIME-Version: 1.0",
        `Subject: ${fillTemplate(template.subject)}`,
        "",
        fillTemplate(template.body)
    ];

    // join all the lines
    const email = emailLines.join("\r\n").trim();
    const base64Email = Buffer.from(email).toString("base64");
    const sentEmail = await gmail.users.messages.send({
        userId: "me",
        requestBody: {
            raw: base64Email
        }
    })
    .catch((err) => {
        console.log("ERROR IN SENDING MESSAGE :" + JSON.stringify(err))
    });
    if (!sentEmail) {
        console.log("'sentEmail' is null: " + JSON.stringify(sentEmail))
        return newAccessToken
    }
    
    gmail.users.messages.get({
        userId: "me",
        id: sentEmail.data.id
    })
    .then((response) => {
        if (!response) {
            console.log("Error in getting sent email from Gmail API: " + JSON.stringify(response))
            return
        }

        // add email to emailHistory
        let newEmail = {
            id: response.data.id,
            from: response.data.payload.headers[1].value,
            to: response.data.payload.headers[2].value,
            subject: response.data.payload.headers[5].value,
            // decoding from base64 to string
            body: Buffer.from(response.data.payload.body.data, "base64").toString("utf-8")

        }

        companiesDB.updateOne({_id: company._id}, {$push: {emailHistory: newEmail}})
    })


    return newAccessToken
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
        res.send([authuser, accessToken])
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
        auth.revok
    })
});

//# COMPANY ROUTES
app.post("/api/add-company", async (req, res) => {
    // get request body
    const userID = req.body.userID
    const companyName = req.body.name
    const companyEmail = req.body.email
    const accessToken = req.body.accessToken

    // document to be added to db
    const document = {
        userID: userID,
        companyName: companyName,
        companyEmail: companyEmail,
        emailHistory: [],
        progress: 0
    }

    // check if company isnt already added
    const imaginaryCompany = await companiesDB.find({userID: userID, $or: [{companyEmail: companyEmail}, {companyName: companyName}]}).toArray()
    .catch((err) => {
        console.log("Error in checking if company exists: " + JSON.stringify(err));
        res.status(500).send(err);
    })
    if (imaginaryCompany.length !== 0) {
        console.log("company already exists")
        res.status(200).send(imaginaryCompany[0])
        return
    }

    // adds company to db
    const insertResponse = await companiesDB.insertOne(document)
    .catch((err) => {
        console.log("Error in inserting company: " + JSON.stringify(err));
        res.status(500).send(err);
        return
    })
    // get the company you created
    const createdCompany = await getCompanies("_id", insertResponse.insertedId)
    .catch((err) => {
        console.log("Error in getting created company: " + JSON.stringify(err));
        res.status(500).send(err);
        return
    })

    // sends first email to user
    sendEmail(createdCompany[0], userID, accessToken).then((response) => {
        console.log("SEND EMAIL RESPONSE: " + JSON.stringify(response))
        res.status(201).send([createdCompany[0], response])
        return
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
    const gmail = google.gmail({version: "v1", auth});

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
        "Content-type: text/html;charset=iso-8859-1",
        "MIME-Version: 1.0",
        `Subject: ${subject}`,
        "",
        message
    ];
    // join all the lines
    const email = emailLines.join("\r\n").trim();
    const base64Email = Buffer.from(email).toString("base64");
    await gmail.users.messages.send({
        userId: "me",
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
