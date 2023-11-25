export function LoggedNav() {
    return <>
        <a href="/dashboard" className={"nav-link" + (window.location.href.includes("/dashboard") ? " selected-link" : "")}>Dashboard</a>
        {/* <button className="user-flow-btn" id="logout-btn" onClick={logout}>Log Out</button> */}
        <button className={"user-flow-btn" + (window.location.href.includes("/profile") ? " selected-link" : "")} id="profile-link" onClick={() => {window.open("/profile","_self")}}>Profile</button>
        {/* <a className="btn user-flow-btn" id="profile-link" href="/profile">Profile</a> */}
    </>
}