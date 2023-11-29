import { mySwal } from "../main"
import { ToggleCheckbox } from "./ToggleCheckbox"

export function CompanySettings({ notifyResponse, setNotifyResponse }) {
    async function openOptions() {
        const {value: options} = await mySwal.fire({
            title: "Company Settings",
            confirmButtonText: "Save Settings",
            focusConfirm: false,
            customClass: {htmlContainer: "display: flex; justify-content: center;"},
            html: <>
                {/* <label id="for-notify-response" style={{float: "left"}} htmlFor="TestID">Notify On Response&emsp;</label>
                <ToggleCheckbox labelID="for-notify-response" disconnected={true} scale="1" id="notify-response" name="notify-response" value="notify-response" toggled={notifyResponse} setToggled={setNotifyResponse} /> */}
                <p>No settings yet :)</p>
            </>,
            preConfirm: () => {
                return [
                    // document.getElementById("notify-response").checked
                ]
            },
        })
        console.log(options)
    }
    
    
    return <button type="button" className="btn-animation secondary-btn small-img-btn" onClick={openOptions}>
        <span id="gear-container" className="img-btn-container">
            <img draggable="false" src="/src/client/static/gear.png" alt="gear-icon" />
        </span>
    </button>
}