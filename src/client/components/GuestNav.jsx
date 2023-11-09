export function GuestNav({ login }) {
    return <>
        <button className="user-flow-btn" id="login-btn" onClick={() => login()}>Log In</button>
    </>
}