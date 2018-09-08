import React, { Component } from 'react';
import Hls from "hls.js";
import logo from "./logo.svg";

const LOADER_STYLE = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    zIndex: 1,
    margin: '-120px 0 0 -120px',
    borderRadius: '50%',
    width: '240px',
    height: '240px',
    '-webkit-animation': 'spin 2s linear infinite',
    animation: 'spin 5s linear infinite',
    backgroundImage: url('/assets/spinner.png'),
    backgroundSize: '80%',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '50%'
}

class Spinner extends Component {
    render() {
        return (
            <div style={LOADER_STYLE}/>
        );
    }
}

export default Spinner;
