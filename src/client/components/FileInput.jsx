import { useEffect } from "react"

export function FileInput(props) {
    // add onClick event to the child element
    useEffect(() => {
        const childID = props.children.props.id;
        if (!childID) {
            alert("make sure you have an id on the element you pass to FileInput"); return
        }

        document.getElementById(childID).addEventListener("click", getFile)
    }, [])

    function getFile() {
        
    }
    
    return <>
        {props.children}
    </>
    // return props.children
}