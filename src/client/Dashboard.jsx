import { useEffect, useState } from 'react'
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { NewCompanyForm } from './components/NewCompanyForm'
import { CompanyTable } from './components/CompanyTable'
import { Navbar } from './components/Navbar';

export default function Dashboard() {
    // email list state that persists
    //* FORMAT: {id, company, address, emailsSent, emailsReceived, Completed}
    const [companyList, setCompanyList] = useState(() => {
        const localValue = localStorage.getItem("COMPANY_LIST")
        if (localValue == null) return []
    
        return JSON.parse(localValue)
    })
    // updates email list to local storage
    useEffect(() => {
        localStorage.setItem("COMPANY_LIST", JSON.stringify(companyList))
    }, [companyList])

    // adds email to email list
    function addCompany(company) {
        setCompanyList((currentCompanyList) => {
            return [...currentCompanyList, {id: company.id, company: company.name, address: company.email, emailsSent: 0, emailsReceived: 0, progress: 0}]
        })
    }

    //! DEV TOOL ONLY
    function deleteAllCompanies() {
        setCompanyList([])
    }

    return <>
        <h1 className="header">Gatorbytes Email Service</h1>
        <NewCompanyForm onSubmit={addCompany} />
        
        <span className="center-container">
            <button className="delete-button btn-animation" onClick={deleteAllCompanies}>DELETE ALL COMPANIES</button>
        </span>

        <CompanyTable companyList={companyList} />
    </>
}