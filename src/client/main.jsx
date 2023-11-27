// basic react imports
import { StrictMode, useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom/client'
// style imports
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import "./static/styles.css"
// routing imports
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { LoginRequired } from './LoginRequired.jsx'
import { Navbar } from './components/Navbar.jsx'
import { LandingPage } from './LandingPage.jsx'
import { Profile } from './Profile.jsx'
import { Dashboard } from './Dashboard.jsx'
// authentication imports
import { GoogleOAuthProvider  } from '@react-oauth/google';
import { CLIENT_ID } from '../google/config.js'
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios'

// react compatible version of sweet alert available to all files
export const mySwal = withReactContent(Swal).mixin({
    background: "#262626",
    color: "#ECECEC",
    confirmButtonColor: "#05824a",
    customClass: {
        timerProgressBar: "swalProgressBar"
    }
})
export let toastMessage = withReactContent(mySwal).mixin({
    toast: true,
    showConfirmButton: false,
    position: "top-start",
    timer: 4000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', mySwal.stopTimer)
        toast.addEventListener('mouseleave', mySwal.resumeTimer)
    },
    width: "fit-content"
})

function Main() {
    // same thing for user token
    //* FORMAT: {id, accessToken}
    const [user, setUser] = useState(() => {
        // get user
        const localValue = localStorage.getItem("USER");
        if (localValue === "null") return null;
        // return user as an int
        else return parseInt(localValue); 
    });
    useEffect(() => {
        localStorage.setItem("USER", user)
    }, [user]);

    const [companyList, setCompanyList] = useState([])
    useEffect(() => {
        // GET USER ID
        const userID = localStorage.getItem("USER")
        if (userID == null) return
        
        // GET COMPANIES
        axios.post("/api/get-companies", {userID: userID}).then((response) => {
            if (response.data == null) {
                console.log("ERROR:" + response);
                return;
            }

            // if there isn't an error set local companies to db companies
            setCompanyList(response.data)
        })
    }, [])

    // login method (logout is in NewCompanyForm.jsx)
    const login = useGoogleLogin({
        flow: 'auth-code',
        ux_mode: "popup",
        scope: "https://mail.google.com/",
        onSuccess: (tokenResponse) => {
            axios.post("/api/authorize", tokenResponse)
            .then((result) => {
                setUser(result.data[0])
                localStorage.setItem("ACCESS_TOKEN", result.data[1])
                window.open("/dashboard", "_self")
            })
        }
    });

    // checks if user is logged and if they are then return the user (maybe readonly, could be devasting consequences for attempting to modify)
    function userLogged() {
        if (user === 0) return true

        return Boolean(user);
    }

    const navSpacerRef = useRef(null)
    const navbarRef = useRef(null)
    
    // SETS NAV-SPACER TO SAME HEIGHT AS NAVBAR
    useEffect(() => {
        navSpacerRef.current.style.height = String(navbarRef.current.offsetHeight)+"px";
    });

    return <>
        <Navbar login={login} userLogged={userLogged()} navRef={navbarRef} />
        <div id="nav-spacer" ref={navSpacerRef}> </div>
        <Router>
            <Routes>
                <Route exact path="/" element={<LandingPage />}></Route>
                <Route exact path="/dashboard" element={
                    <LoginRequired>
                        <Dashboard companyList={companyList} setCompanyList={setCompanyList} />
                    </LoginRequired>
                } />
                <Route exact path="/profile" element={
                    <LoginRequired>
                        <Profile />
                    </LoginRequired>
                } />
            </Routes>
        </Router>
        <br /><br /><br />
    </>
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <StrictMode>
        <GoogleOAuthProvider clientId={CLIENT_ID}>
            <Main />
        </GoogleOAuthProvider>
    </StrictMode>
)
