import { useEffect, useState } from 'react'
import { NewCompanyForm } from './components/NewCompanyForm'
import { CompanyTable } from './components/CompanyTable'
import axios from 'axios';

export function Dashboard({ companyList, setCompanyList }) {
    //! DEV TOOL ONLY
    function deleteAllCompanies() {
        companyList.map(async (company) => {
            await axios.post("/api/delete-company", {companyID: company._id}).then((response) => {
                if (response)
                    console.log("successfully deleted 1 company")
                else
                    console.log("FAILED to delete 1 company")
            })
        })
        setCompanyList([])
    }

    return <>
        <h1 className="header">Gatorbytes Email Service</h1>
        <NewCompanyForm setCompanyList={setCompanyList} />
        
        <span className="center-container">
            <button className="delete-button btn-animation" onClick={deleteAllCompanies}>DELETE ALL COMPANIES</button>
        </span>

        <CompanyTable companyList={companyList} />
    </>
}