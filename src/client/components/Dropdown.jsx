import { useState, useEffect } from "react"
import { DropdownItem } from "./DropdownItem";

export function Dropdown({ templates, selected, setSelected }) {

    const [open, setOpen] = useState(false);


    return <span className="dropdown-container" >
        <span className="tooltip">
            <span className="tooltiptext tooltip-right">Email Template</span>

            <button type="button" className="dropdown-button" onClick={() => {setOpen(!open)} }>
                {selected}
                <div className={"dropdown-arrow " + (open ? "up-arrow" : "down-arrow")}>&nbsp;∨</div>
            </button>
        </span>

        <div className={"dropdown-area " + (open ? "dropdown-area-active" : "dropdown-area-inactive")}>
            <ul>
                {templates.length == 0 && <DropdownItem content="Default" />}
                {templates.map((template) => {
                    return <DropdownItem setOpen={setOpen} content={template} selected={selected} setSelected={setSelected} key={Math.floor(Math.random() * 10000)} />
                })}
            </ul>
        </div>
    </span>
}

