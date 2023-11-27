import { useEffect, useState } from "react"

export function ToggleCheckbox({ labelID, id, name="", value, toggled, setToggled, scale, disconnected=false}) {
    const [localToggled, setLocalToggled] = useState(toggled)

    function toggle() {
        console.log("TOGGLED TO " + !localToggled + " | disconnected = " + disconnected)
        if (disconnected) {setLocalToggled(!localToggled)}
        else {setToggled(!toggled)}
    }
    useEffect(() => {
        // clones old label to remove all event listeners
        let old_label = document.getElementById(labelID);
        let new_label = old_label.cloneNode(true);
        old_label.parentNode.replaceChild(new_label, old_label);

        document.getElementById(labelID).addEventListener("click", toggle);          

    }, disconnected ? [localToggled] : [toggled])

    return <span style={{transform: `scale(${scale})`}} className="checkbox-container" onClick={toggle}>
        
        <input id={id} name={name} value={value} type="checkbox" className="toggle-checkbox" checked={disconnected ? localToggled : toggled} onChange={() => {/* just to get rid of warning */}} />
        

        <span className="toggle-background">
            <div className="checkbox-circle-icon"></div>
            <div className="checkbox-vertical-line"></div>
        </span>
    </span>
}