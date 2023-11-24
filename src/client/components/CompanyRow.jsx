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

    // PROCESS EMAIL HISTORY TO USABLE NUMBERS
    let processedHistory = [0, 0];
    emailHistory.forEach(email => {
        console.log(email.address)
        console.log(companyEmail)
        console.log(email.address == companyEmail)
        // if email is not from user add one to sent
        if (email.address == companyEmail) {
            processedHistory[1] += 1
        } else {
            // if email is from user add 1 to sent (index 0)
            processedHistory[0] += 1
        }
    });

    return <tr id={_id}>
        <td>{companyName}</td>
        <td>{companyEmail}</td>
        <td>{processedHistory[0]}</td>
        <td>{processedHistory[1]}</td>
        {progressToTxt(progress)}
    </tr>
}