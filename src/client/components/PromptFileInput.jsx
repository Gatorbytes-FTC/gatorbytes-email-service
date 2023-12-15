import { useEffect, useState } from "react"
import { mySwal } from "../main";
import { FileInput } from "./FileInput";

export function PromptFileInput(props) {
    const [selectedFile, setSelectedFile] = useState(null);

    // add onClick event to the child element
    useEffect(() => {
        const childID = props.children.props.id;
        if (!childID) {
            alert("make sure you have an id on the element you pass to FileInput"); return
        }

        document.getElementById(childID).addEventListener("click", openFileDialogue)
    }, [])

    async function uploadFileError(err, body="") {
        if (body == "") {
            await mySwal.fire({
                icon: "error",
                title: err,
            })
        } else {
            await mySwal.fire({
                icon: "error",
                title: err,
                text: body
            })
        }
        openFileDialogue()
    }

    async function openFileDialogue() {
        // open the file upload dialogue
        let localFile = selectedFile;
        const swalResult = await mySwal.fire({
            title: "Upload a list of your companies",
            confirmButtonText: "Upload File",
            focusConfirm: false,
            showLoaderOnConfirm: true,
            width: "65vw",
            // customClass: {htmlContainer: "swal-html-container", confirmButton: "primary-btn btn-animation"},
            html: <>
                <p>The file must be a JSON file with an array of objects containing sponsor info
                    <span className="tooltip">
                        <span style={{transform: "translate(-100%, 30px)"}} id="example-json-tooltip" className="tooltiptext tooltip-top"><img src="/src/client/static/company-json.png" alt="example of a file" /></span>
                        <p>&nbsp;<img style={{display: "inline", transform: "translateY(.1rem)"}} width="15rem" src="/src/client/static/question.png" /></p>
                    </span>
                </p>
                
                {/* <input type="file" name="companies-file" id="companies-file" accept=".json" /> */}
                <FileInput selectedFile={selectedFile} setSelectedFile={(val) => {localFile = val; setSelectedFile(val)}} readableFileType="JSON" onError={(err) => { uploadFileError(err) }} />
            </>,
            preConfirm: async () => {
                document.getElementById("example-json-tooltip").style.display = "none"
                await processFile(localFile);
                return "just want to get rid of the annoying warning"
            }
        })
    }

    async function processFile(localFile) {
        if (localFile) {
            await new Promise(resolve => setTimeout(resolve, 1000))
            const reader = new FileReader();
            reader.onload = async (e) => {
                const parsed = JSON.parse(e.target.result.replaceAll("\n", "").replaceAll("\r", "").replaceAll("\"", "\""))

                parsed.forEach(async (company) => {
                    const res = await props.onUpload(null, company)
                    console.log("res")
                    console.log(res)
                });

                // const promises = parsed.map((company) => {props.onUpload(null, company)})
                // let promiseResult = await Promise.all(promises).then((response) => {
                //     console.log("response")
                //     console.log(response)
                //     if (response[0] == null) {
                //         uploadFileError("There was an error parsing your JSON", "Hover over the question mark to see an example on how to structure your JSON")
                //         return
                //     }
                //     alert("SENT ALL: " + JSON.stringify(response))
                // }).catch(err => {
                //     console.log("err");
                //     console.log(err);
                // });
                // setTimeout(() => {
                //     console.log("promiseResult")
                //     console.log(promiseResult)
                // })
            };
            reader.readAsText(localFile);
        } else {
            uploadFileError("Please enter one JSON file")
            return
        }

        setSelectedFile(null)
    }
    
    return <>
        {props.children}
    </>
    // return props.children
}