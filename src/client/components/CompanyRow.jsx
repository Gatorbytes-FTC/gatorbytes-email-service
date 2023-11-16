import { useState } from 'react'

export function CompanyRow({_id, companyName, companyEmail, emailHistory, progress}) {
    // turns progress (int) to user friendly text (string duh)
    function progressToTxt(num) {
        let txt = ""
        switch (num) {
            case 0:
                txt = "In Progress... ⚠️"
                break;
            case 1:
                txt = "Completed ✅"
                break;
            case 2:
                txt = "Denied 🚫"
                break;
        
            default:
                return <td>INVALID PROGRESS NUMBER</td>
        }

        return <td className={"progress-" + num}>{txt}</td>
    }

    function getSent() {
        return JSON.stringify(emailHistory)
    }

    return <tr id={_id}>
        <td>{companyName}</td>
        <td>{companyEmail}</td>
        <td>{getSent()}</td>
        <td></td>
        {progressToTxt(progress)}
    </tr>
}