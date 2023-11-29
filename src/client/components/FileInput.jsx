import { useEffect } from "react"

export function FileInput() {
    // add drag and drop functionality
    useEffect(() => {
        const draggableFileArea = document.getElementById("drag-file-area");


        ["drag", "dragstart", "dragend", "dragover", "dragenter", "dragleave", "drop"].forEach( evt => {
            console.log(evt)
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
    
        // draggableFileArea.addEventListener("drop", e => {
        //     uploadIcon.innerHTML = 'check_circle';
        //     dragDropText.innerHTML = 'File Dropped Successfully!';
        //     document.querySelector(".label").innerHTML = `drag & drop or <span className="browse-files"> <input type="file" className="default-file-input" style=""/> <span className="browse-files-text" style="top: -23px; left: -20px;"> browse file</span> </span>`;
        //     uploadButton.innerHTML = `Upload`;
            
        //     let files = e.dataTransfer.files;
        //     fileInput.files = files;
        //     console.log(files[0].name + " " + files[0].size);
        //     console.log(document.querySelector(".default-file-input").value);
        //     fileName.innerHTML = files[0].name;
        //     fileSize.innerHTML = (files[0].size/1024).toFixed(1) + " KB";
        //     uploadedFile.style.cssText = "display: flex;";
        //     progressBar.style.width = 0;
        //     fileFlag = 0;
        // });
    }, [])

    return <>

        <div className="upload-files-container">

            <div style={{userSelect: "none"}} className="drag-file-area upload-hover-off" id="drag-file-area">
                <span className="material-icons-outlined upload-icon"> <img draggable="false" width="45rem" src="/src/client/static/up-loading.png" alt="" /> </span>
                <h5 className="dynamic-message"> drag & drop JSON file here </h5>
                <label className="label"> or <br /> <span className="browse-files"> <input type="file" className="default-file-input" /> <span className="browse-files-text">browse file</span> <span>from device</span> </span> </label>
            </div>

            <span className="cannot-upload-message"> <span className="material-icons-outlined">error</span> Please select a file first <span className="material-icons-outlined cancel-alert-button">cancel</span> </span>

            <div className="file-block">
                <div className="file-info"> <span className="material-icons-outlined file-icon">description</span> <span className="file-name"> </span> | <span className="file-size">  </span> </div>
                <span className="material-icons remove-file-icon">delete</span>
                <div className="progress-bar"> </div>
            </div>

            {/* <button type="button" className="upload-button"> Upload </button> */}

        </div>

    </>
}