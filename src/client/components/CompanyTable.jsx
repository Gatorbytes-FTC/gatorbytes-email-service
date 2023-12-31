import { useState, useEffect } from 'react'
import { CompanyRow } from './CompanyRow'

export function CompanyTable({companyList}) {
    return <table>
        <thead>
            <tr>
                <th>Company</th>
                <th>Email</th>
                <th>Emails Sent</th>
                <th>Emails Recieved</th>
                <th>Progress</th>
            </tr>
        </thead>
        <tbody>
            {companyList.length === 0 && <tr><td><i>&nbsp;new companies apear here...</i></td></tr>}
            {companyList.map((company) => {
                return <CompanyRow {...company} key={company._id} />
            })}
        </tbody>
    </table>
}