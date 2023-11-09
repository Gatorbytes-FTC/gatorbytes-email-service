export function LoggedNav({ logout }) {
    return <>
        <a href="/dashboard" className="nav-link">Dashboard</a>
        {/* <button className="user-flow-btn" id="logout-btn" onClick={logout}>Log Out</button> */}
        <button className="user-flow-btn" id="profile-link" onClick={logout}>Profile</button>
        <a className="btn user-flow-btn" id="profile-link" href="/profile">Profile</a>
    </>
}