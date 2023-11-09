import { useState } from 'react'
import { mySwal } from '../main.jsx'

export function NewCompanyForm(props) {
    // email state
    const [newCompany, setNewCompany] = useState({id: 0,name: "", email: ""})
    const [formError, setFormError] = useState([false, false])
    
    // runs submit function passed from Index.jsx
    function handleSubmit(e) {
        e.preventDefault()
        setFormError((currentFormError) => {return [false, false]})
        let exit = false
        let localError = [false, false];
        if (newCompany.name === "") {
            mySwal.fire({
                icon: "error",
                toast: true,
                title: "You left an input empty",
                showConfirmButton: false,
                position: "top-start",
                timer: 4000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', mySwal.stopTimer)
                    toast.addEventListener('mouseleave', mySwal.resumeTimer)
                }
            })

            localError[0] = true;
            
            exit = true;
        }
        if (newCompany.email === "") {
            mySwal.fire({
                icon: "error",
                toast: true,
                title: "You left an input empty",
                showConfirmButton: false,
                position: "top-start",
                timer: 4000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', mySwal.stopTimer)
                    toast.addEventListener('mouseleave', mySwal.resumeTimer)
                }
            })
            
            localError[1] = true;

            exit = true;
        }

        if (!newCompany.email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
            mySwal.fire({
                icon: "error",
                toast: true,
                title: "Please enter a valid email",
                showConfirmButton: false,
                position: "top-start",
                timer: 4000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', mySwal.stopTimer)
                    toast.addEventListener('mouseleave', mySwal.resumeTimer)
                }
            })
            localError[1] = true;
            exit = true;
        }

        setFormError(localError)
        if (exit) return;


        let randomID = crypto.randomUUID();
        props.onSubmit({...newCompany, id: randomID})
        mySwal.fire({
            icon: "success",
            toast: true,
            title: <><a className="underlined-link" href={"#"+randomID}>{newCompany.name}</a> added!</> ,
            showConfirmButton: false,
            position: "top-start",
            timer: 4000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', mySwal.stopTimer)
                toast.addEventListener('mouseleave', mySwal.resumeTimer)
            }
        })
        setNewCompany({id: 0, name: "", email: ""})
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