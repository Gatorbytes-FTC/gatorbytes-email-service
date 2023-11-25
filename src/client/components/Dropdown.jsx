import { useState } from "react"
import { DropdownItem } from "./DropdownItem";

export function Dropdown({ templates, selected, setSelected }) {
    const [blurred, setBlurred] = useState([true, true])
    const [open, setOpen] = useState(false);

    return <span className="dropdown-container" onClick={() =>{
        setBlurred((currentBlurred) => {
            const ret = [false, currentBlurred[1]]
            console.log("OnClick 1: " + JSON.stringify(ret))
            if (ret[0] && ret[1]) setOpen(false)
            else setOpen(true)
            return ret
        })
        }} onBlur={() => {
            setBlurred((currentBlurred) => {
                const ret = [true, currentBlurred[1]]
                console.log("OnBlur 2: " + JSON.stringify(ret))
                if (ret[0] && ret[1]) setOpen(false)
                // else setOpen(true)
                return ret
            })
        }}
        >
        <span className="tooltip">
            <span className="tooltiptext tooltip-right">Email Template</span>

            <button type="button" class="dropdown-button" onClick={() => {setOpen(!open)}} >
                {selected}
                <div className={"dropdown-arrow " + (open ? "up-arrow" : "down-arrow")}>&nbsp;∨</div>
            </button>
        </span>

        <div className={"dropdown-area " + (open ? "dropdown-area-active" : "dropdown-area-inactive")} onClick={() =>{
            setBlurred((currentBlurred) => {
                const ret = [currentBlurred[0], false]
                console.log("OnClick 2: " + JSON.stringify(ret))
                if (ret[0] && ret[1]) setOpen(false)
                else setOpen(true)
            return ret
        })
    }} onBlur={() => {
        setBlurred((currentBlurred) => {
                const ret = [currentBlurred[0], true]
                console.log("OnBlur 2: " + JSON.stringify(ret))
                if (ret[0] && ret[1]) setOpen(false)
                // else setOpen(true)
                return ret
            })
        }}>
            <ul>
                {templates.length == 0 && <DropdownItem content="Default" />}
                {templates.map((template) => {
                    return <DropdownItem content={template} selected={selected} setSelected={setSelected} key={Math.floor(Math.random() * 1000)} />
                })}
            </ul>
        </div>
    </span>
}
