// basic react imports
import { StrictMode, useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
// style imports
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import "./static/styles.css"
// routing imports
import { Navbar } from './components/Navbar.jsx'
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom'
import Dashboard from './Dashboard.jsx'
// authentication imports
import { GoogleOAuthProvider  } from '@react-oauth/google';
import { CLIENT_ID } from '../google/config.js'
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios'

// react compatible version of sweet alert available to all files
export let mySwal = withReactContent(Swal).mixin({
    background: "#262626",
    color: "#ECECEC",
    confirmButtonColor: "#05824a",
    customClass: {
        timerProgressBar: "swalProgressBar"
    }
})

function Main() {
    // same thing for user token
    //* FORMAT: {id, accessToken}
    const [user, setUser] = useState(() => {
        const localValue = localStorage.getItem("USER")
        if (localValue === null) return {id:null, accessToken:null}

        return JSON.parse(localValue)
    })
    useEffect(() => {
        localStorage.setItem("USER", JSON.stringify(user))
    }, [user])


    // login / logout methods
    const login = useGoogleLogin({
        ux_mode: "popup",
        scope: "https://mail.google.com/",
        onSuccess: (tokenResponse) => {
            axios.post("/login", tokenResponse)
            .then((response) => {
                alert(JSON.stringify(response.data))
                setUser({id: tokenResponse.authuser, accessToken: tokenResponse.access_token})
            })
        },
    });
    function logout() {
        axios.post("/logout", {userID: user.id})
        .then((response) => {
            alert(JSON.stringify(response.data))
            setUser({id: null, accessToken: null})
        }) 
    }

    // checks if user is logged and if they are then return the user (maybe readonly, could be devasting consequences for attempting to modify)
    function userLogged() {
        if (user.id == undefined) {
            console.log("USERLOGGED(): " + JSON.stringify(user))
            return false
        }
        return user
    }

    return <>
        <Navbar login={login} logout={logout} userLogged={userLogged()} />
        <br /><br /><br />
        <Router>
            <Routes>
                <Route exact path="/" element={<Dashboard />} />
            </Routes>
        </Router>
    </>
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <StrictMode>
        <GoogleOAuthProvider clientId={CLIENT_ID}>
            <Main />
        </GoogleOAuthProvider>
    </StrictMode>
)
