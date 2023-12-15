import { useState, useEffect } from "react"
import { mySwal } from "../main";

export function FileInput({ readableFileType, onError, selectedFile, setSelectedFile }) {
    // add drag and drop functionality
    const [uploadMessage, setUploadMessage] = useState(`drag & drop ${ readableFileType } file here`);
    const [fileName, setFileName] = useState("")
    const [dynamicIcon, setDynamicIcon] = useState("/src/client/static/up-loading.png")

    useEffect(() => {
        const draggableFileArea = document.getElementById("drag-file-area");
        const fileInput = document.getElementById("default-file-input");
 
        // console.log(fileInput)

        ["drag", "dragstart", "dragend", "dragover", "dragenter", "dragleave", "drop"].forEach( evt => {
            draggableFileArea.addEventListener(evt, e => {
                e.preventDefault();
                e.stopPropagation();
            })
        });
    
        ["dragover", "dragenter"].forEach( evt => {
            draggableFileArea.addEventListener(evt, e => {
                e.preventDefault();
                e.stopPropagation();
                draggableFileArea.classList.remove("upload-hover-off")
                draggableFileArea.classList.add("upload-hover-on")
            });
        });
        ["dragleave", "dragend", "drop"].forEach( evt => {
            draggableFileArea.addEventListener(evt, e => {
                e.preventDefault();
                e.stopPropagation();
                draggableFileArea.classList.remove("upload-hover-on")
                draggableFileArea.classList.add("upload-hover-off")
            });
        });
    
        draggableFileArea.addEventListener("drop", e => {
            setUploadMessage("File dropped successfully!")
            let droppedFiles = e.dataTransfer.files;

            onFileSelect(droppedFiles)
        });

        fileInput.addEventListener("change", e => {
            setUploadMessage("File selected successfully!")
            onFileSelect(fileInput.files)
        })

    }, [])
    
    function onFileSelect(newFiles) {
        const uploadedFile = document.querySelector(".file-block");
        
        if (newFiles.length < 1) {
            onError("Please drop a file")
            return
        } else if (newFiles.length > 1) {
            onError("Please drop only 1 file")
            return
        } else if (newFiles[0].name.split('.').pop() != "json") {
            onError("Please drop a JSON file")
            return
        }
        
        setFileName(newFiles[0].name + " | " + (newFiles[0].size/1024).toFixed(1) + " KB")
        uploadedFile.style.cssText = "display: flex;";
        setDynamicIcon("/src/client/static/check-mark.png")
        setSelectedFile(newFiles[0])
    }
    
    function resetInput() {
        const fileInput = document.getElementById("default-file-input");
        const uploadedFile = document.querySelector(".file-block");
        
        setUploadMessage(`drag & drop ${ readableFileType } file here`)
        setFileName("")
        uploadedFile.style.cssText = "display: none;";
        fileInput.value = "";
        setDynamicIcon("/src/client/static/up-loading.png")
        setSelectedFile(null)
    }


    console.log(selectedFile)

    return <>

        <div className="upload-files-container">

            <div style={{userSelect: "none"}} className="drag-file-area upload-hover-off" id="drag-file-area">
                <span className="material-icons-outlined upload-icon"> <img draggable="false" width="45rem" src={dynamicIcon} alt="" /> </span>
                <h5 className="dynamic-message"> { uploadMessage } </h5>
                
                <label className="label" style={(uploadMessage != `drag & drop ${ readableFileType } file here` ? {display: "none"} : {display: "block"})} > or <br /> <span className="browse-files"> <input id="default-file-input" type="file" accept=".json" className="default-file-input" /> <span className="browse-files-text">browse file</span> <span>from device</span> </span> </label>
                {uploadMessage != `drag & drop ${ readableFileType } file here` && <br></br>}
            </div>

            <span className="cannot-upload-message"> <span className="material-icons-outlined">error</span> Please select a file first <span className="material-icons-outlined cancel-alert-button">cancel</span> </span>

            <div className="file-block">
                <div className="file-info"> <span className="material-icons-outlined file-icon">{ fileName }</span> </div>
                <span className="material-icons remove-file-icon" onClick={resetInput}>delete</span>
                <div className="progress-bar"> </div>
            </div>

            {/* <button type="button" className="upload-button"> Upload </button> */}

        </div>

    </>
}