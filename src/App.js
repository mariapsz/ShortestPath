import React from 'react';
import Map from './components/map';
import Summary from "./components/summary";
import './App.css'

class App extends React.Component {

    render() {
        return (
            <div>
                <div className="split left">
                    <Map/>
                </div>

                <div className="split right">
                    <Summary/>
                </div>
            </div>
        );
    }
}

export default App;
