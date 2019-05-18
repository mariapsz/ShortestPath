import React from "react";
import './summary.css';

class Summary extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {
        return <div className='container'>
            <div>
                <div>
                    <h2>
                        Program wyznaczający najkrótszą drogę pomiędzy wybranymi miejsowościami
                    </h2>
                </div>
                <label>Początek trasy:</label>
                <div>{this.getStartPointName() ? this.getStartPointName() : ''}</div>

                <label>Koniec trasy:</label>
                <div>{this.getTargetPointName() ? this.getTargetPointName() : ''}</div>
            </div>

        </div>
    }

    getStartPointName = () => {
        return this.props.displayInfo ? this.props.displayInfo.startPointMarker.options.title : '';
    };

    getTargetPointName = () => {
        return this.props.displayInfo ? this.props.displayInfo.targetPointMarker.options.title : '';
    }
}

export default Summary;