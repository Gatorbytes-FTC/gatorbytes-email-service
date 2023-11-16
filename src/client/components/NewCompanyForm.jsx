import { useState } from 'react'
import { mySwal, toastMessage } from '../main.jsx'
import { updateTable, updateTableValue } from './CompanyTable.jsx'
import axios from 'axios'

export function NewCompanyForm({ setCompanyList }) {
    // email state
    const [newCompany, setNewCompany] = useState({name: "", email: ""})
    const [formError, setFormError] = useState([false, false])
    
    // runs submit function passed from Index.jsx
    function handleSubmit(e) {
        e.preventDefault()
        setFormError(() => {return [false, false]})
        let exit = false
        let localError = [false, false];
        // throws error if company name is empty
        if (newCompany.name === "") {
            toastMessage.fire({
                icon: "error",
                title: "You left an input empty"
            })

            localError[0] = true;
            
            exit = true;
        }
        // throws error if not valid email
        if (!newCompany.email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
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

        console.log("NEW COMPANY:")
        console.log({userID, ...newCompany})

        // CREATES NEW COMPANY IN DATABASE
        axios.post("/api/add-company", {userID, ...newCompany})
        .then((response) => {
            // if request failed don't reset (duh)
            if (response.status !== 201 && response.status !== 200) {
                toastMessage.fire({
                    icon:"error",
                    title: "There was an error in submitting your request",
                    footer: `error1: ${response.data}`
                })
                return
            }

            // success message
            toastMessage.fire({
                icon: "success",
                title: <><a className="underlined-link" href={"#"+response.data._id}>{newCompany.name}</a> added!</>
            })
    
            // reset form text
            setNewCompany({name: "", email: ""})

            // after company is added to database, add locally
            setCompanyList((currentCompanyList) => {
                return [...currentCompanyList, response.data]
            })
        })
        .catch((err) => {
            toastMessage.fire({
                icon:"error",
                title: "There was an error in submitting your request",
                footer: `error2: ${err}`
            })
            return
        })
    }

    return <form id="emailForm" onSubmit={handleSubmit}>
        <span className="flex-row left-label">
            <label className="highlight-offset">Add Company:</label>
        </span>

        <span className="flex-row">
            <span className="tooltip">
                <span className="tooltiptext">Company Name</span>
                <input value={newCompany.name} className={formError[0] ? "invalid-input" : ""} onChange={e => setNewCompany((currentCompany) => { return {...currentCompany, name: e.target.value} })} placeholder="Company Name" type="text" id="company-name"/>
            </span>

            <span className="tooltip">
                <span className="tooltiptext">Company Email</span>
                <input value={newCompany.email} className={formError[1] ? "invalid-input" : ""} onChange={e => setNewCompany((currentCompany) => { return {...currentCompany, email: e.target.value} })} placeholder="Company Email" type="text" id="company-email"/>
            </span>
        </span>

        <button className="primary-btn btn-animation">Add</button>
    </form>
}