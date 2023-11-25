export function DropdownItem({content, selected, setSelected}) {
    // setSelected("TEST")

    return <>
        <li onClick={() => { setSelected(content) }}>
            {content == selected && "🐊 "}
            {content}
            {/* {selected} */}
        </li>
    </>
}