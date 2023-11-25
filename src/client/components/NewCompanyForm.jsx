import { useState } from 'react'
import { mySwal, toastMessage } from '../main.jsx'
import { updateTable, updateTableValue } from './CompanyTable.jsx'
import { Dropdown } from "./Dropdown.jsx"
import axios from 'axios'

export function NewCompanyForm({ setCompanyList }) {
    // email state
    const [newCompany, setNewCompany] = useState({name: "", email: ""})
    const [formError, setFormError] = useState([false, false])
    const [submitText, setSubmitText] = useState("Add")
    const [selected, setSelected] = useState(() => {
        // get last template used by user
        const localValue = localStorage.getItem("LAST_TEMPLATE");
        if (localValue == null/* || templates.length == 0*/) {
            localStorage.setItem("LAST_TEMPLATE", "Default")
            return "Default";
        }
        // return user as an int
        else return localValue; 
    })
    
    // runs submit function passed from Index.jsx
    async function handleSubmit(e, processedNewCompany) {
        e.preventDefault()
        setFormError(() => {return [false, false]})
        let exit = false
        let localError = [false, false];

        // throws error if company name is empty
        if (processedNewCompany.name === "") {
            toastMessage.fire({
                icon: "error",
                title: "You left an input empty"
            })

            localError[0] = true;
            
            exit = true;
        }
        // throws error if not valid email
        if (!processedNewCompany.email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
            toastMessage.fire({
                icon: "error",
                title: "Please enter a valid email"
            })
            localError[1] = true;
            exit = true;
        }

        // after errors are computed, all errors that apply are sent
        setFormError(localError)
        if (exit) return;

        // gets userID
        const userID = localStorage.getItem("USER")
        // get accessToken
        const accessToken = localStorage.getItem("ACCESS_TOKEN")

        console.log("NEW COMPANY:")
        console.log({userID, ...processedNewCompany})

        // CREATES NEW COMPANY IN DATABASE
        await axios.post("/api/add-company", {userID, name: processedNewCompany.name, email: processedNewCompany.email, accessToken: accessToken})
        .then((response) => {
            // if company already exists
            console.log(response.data)
            if (response.status === 200) {
                console.log("Already exists")
                toastMessage.fire({
                    icon:"info",
                    title: <>You already added <a className="underlined-link" href={"#"+response.data._id}>{processedNewCompany.name}</a></>,
                })
                return
            }
            // if request failed
            else if (response.status !== 201) {
                toastMessage.fire({
                    icon:"error",
                    title: "There was an error in submitting your request",
                    footer: `error1: ${response.data}`
                })
                return
            }
            console.log("Shouldnt run if already exists")

            // set local accessToken
            console.log("SET LOCAL ACCESS: ")
            localStorage.setItem("ACCESS_TOKEN", response.data[1])
            console.log(localStorage.getItem("ACCESS_TOKEN"))

            // success message
            toastMessage.fire({
                icon: "success",
                title: <><a className="underlined-link" href={"#"+response.data[0]._id}>{processedNewCompany.name}</a> added!</>
            })
    
            // reset form text
            setNewCompany({name: "", email: ""})

            // after company is added to database, add locally
            setCompanyList((currentCompanyList) => {
                return [...currentCompanyList, response.data[0]]
            })
        })
        .catch((err) => {
            toastMessage.fire({
                icon:"error",
                title: "There was an error in submitting your request",
                footer: `error2: ${err}`
            })
        })
    }

    return <form id="emailForm"
        onSubmit={async (e) => {
            setSubmitText("loading...")
            // preprocess inputs
            const preprocessed = {
                name: newCompany.name.trim(),
                email: newCompany.email.trim().toLowerCase()
            }
            handleSubmit(e, preprocessed).then((response) => {
                console.log(response)
                setSubmitText("Add")
            });
        }}>

        <span id="left-label" className="flex-row">
            <label className="highlight-offset">Add Company:</label>
        </span>

        <span className="flex-row">
            <span className="tooltip">
                <span className="tooltiptext tooltip-top">Company Name</span>
                <input value={newCompany.name} className={formError[0] ? "invalid-input" : ""} onChange={e => setNewCompany((currentCompany) => { return {...currentCompany, name: e.target.value} })} placeholder="Company Name" type="text" id="company-name"/>
            </span>

            <span className="tooltip">
                <span className="tooltiptext tooltip-top">Company Email</span>
                <input value={newCompany.email} className={formError[1] ? "invalid-input" : ""} onChange={e => setNewCompany((currentCompany) => { return {...currentCompany, email: e.target.value} })} placeholder="Company Email" type="text" id="company-email"/>
            </span>
        </span>

        <span className="flex-row">
            <button type="button" id="company-settings-btn" className="btn-animation secondary-btn">
                <span id="gear-container">
                    <img src="/src/client/static/gear-white-fill.png" alt="gear-icon" />
                </span>
            </button>
            <button type="submit" id="submit-btn" className="primary-btn btn-animation">{submitText}</button>
            
            <Dropdown templates={["Default", "Number 2", "Professional Business", "Friendly Email Template", "WHAT IS THE LIMIT OF THIS THINGY MABOB"]} selected={selected} setSelected={setSelected} />
            <input id="selected" type="hidden" value={selected} />
        </span>
    </form>
}