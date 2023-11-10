export function LoggedNav() {
    function redirect(url) {
        console.log(url)
        window.open(url,"_self")
    }
    return <>
        <a href="/dashboard" className="nav-link">Dashboard</a>
        {/* <button className="user-flow-btn" id="logout-btn" onClick={logout}>Log Out</button> */}
        <button className="user-flow-btn" id="profile-link" onClick={() => {redirect("/profile")}}>Profile</button>
        {/* <a className="btn user-flow-btn" id="profile-link" href="/profile">Profile</a> */}
    </>
}