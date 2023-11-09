export function LoggedNav({ logout }) {
    return <>
        <button className="user-flow-btn" id="logout-btn" onClick={logout}>Log Out</button>
    </>
}