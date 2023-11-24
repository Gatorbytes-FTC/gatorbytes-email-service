export function Profile({ logout }) {
    function logout() {
        //! THIS DELETES THE ACTUAL USER IN THE DB
        // axios.post("/api/logout", {userID: user})
        // .then((result) => {
        //     alert(JSON.stringify(result.data))
        //     setUser(null)
        //     localStorage.setItem("ACCESS_TOKEN", null)
        // }) 
        localStorage.clear();
        window.open("/","_self");
    }

    return <>
        <button className="user-flow-btn" id="logout-btn" onClick={logout}>Log Out</button>
    </>
}