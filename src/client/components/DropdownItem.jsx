export function DropdownItem({content, selected, setSelected, setOpen }) {
    // setSelected("TEST")
    function selectOption() {
        setSelected(content);
        setOpen(false)
        localStorage.setItem("LAST_TEMPLATE", content)
    }

    return <>
        <li onClick={selectOption} >
            <span style={{position: "absolute", left: "10px"}}>{content == selected && "🐊 "}</span>
            {content}
        </li>
    </>
}