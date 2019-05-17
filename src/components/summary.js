import React from "react";
import './summary.css';

class Summary extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {
        return <div className='container'>
            {this.props.displayInfo ? this.displayInfo() : 'Nie ma jeszcze nic'}
        </div>
    }

    displayInfo = () => {
        const nazwyMiast = [];
        this.props.displayInfo.places.forEach(place => {
            nazwyMiast.push(place.name);
            nazwyMiast.push(<br/>)
        })
        return nazwyMiast;
    }
}

export default Summary;