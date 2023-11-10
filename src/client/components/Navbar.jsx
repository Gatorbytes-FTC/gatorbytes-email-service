import { LoggedNav } from "./LoggedNav"
import { GuestNav } from "./GuestNav"
import { useState, useEffect } from "react"

export function Navbar({ login, logout, userLogged, navRef }) {
    const [navLinks, setNavLinks] = useState(<></>)
    useEffect(() => {
        if (userLogged) {
            setNavLinks(<LoggedNav logout={logout} />)
        }
        else {setNavLinks(<GuestNav login={login} />)}
    }, [userLogged])

    return <>
        <div id="navbar" ref={navRef}>
            <div className="logo">
                {/* <a href="/">GB🐊</a> */}
                <a href="/" style={{height: "200%"}}><img src="/src/client/static/gatorbytes.png" alt="gatorbytes logo" /></a>
            </div>
            <div className="menu hide">
                {navLinks}
            </div>
        </div>
    </>
} 