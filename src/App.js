import React from 'react';
import Map from './components/map';
import Summary from "./components/summary";
import './App.css'

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            roadsMarker: undefined,
        }
    }


    render() {
        return (
            <div>
                <div className="split left">
                    <Map
                        handleRoadsMarker={this.onHandle}/>
                </div>

                <div className="split right">
                    <Summary
                        displayInfo={this.state.roadsMarker}/>
                </div>
            </div>
        );
    }

    onHandle = (roadsMarker) => {
        this.setState({
            roadsMarker: roadsMarker,
        })
    }
}

export default App;
