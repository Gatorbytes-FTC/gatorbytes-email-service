import { useState } from 'react'

export function CompanyRow({id, company, address, emailsSent, emailsReceived, progress}) {
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

    return <tr id={id}>
        <td>{company}</td>
        <td>{address}</td>
        <td>{emailsSent}</td>
        <td>{emailsReceived}</td>
        {progressToTxt(progress)}
    </tr>
}