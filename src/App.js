import React, { Component } from 'react';
import { Label, DropdownButton, MenuItem, ButtonGroup, Button, InputGroup, FormGroup} from 'react-bootstrap'
import { Form, ControlLabel} from 'react-bootstrap'
import './App.css';

const prices = {
    'us-east-1' : {s3: 30, s3ia: 12.5, put: 5, putia: 10, get: 0.4, getia: 1, data: 0.01},
    'us-west-2' : {s3: 30, s3ia: 12.5, put: 5, putia: 10, get: 0.4, getia: 1, data: 0.01},
    'eu-west-1' : {s3: 30, s3ia: 12.5, put: 5, putia: 10, get: 0.4, getia: 1, data: 0.01},
    'ap-southeast-1' : {s3: 30, s3ia: 20, put: 5, putia: 10, get: 0.4, getia: 1, data: 0.01},

    'us-west-1' : {s3: 33, s3ia: 19, put: 5.5, putia: 10, get: 0.44, getia: 1, data: 0.01},
    'ap-southeast-2' : {s3: 33, s3ia: 19, put: 5.5, putia: 10, get: 0.44, getia: 1, data: 0.01}

}

const AwsRegion = ({region, onSelect}) => (
    <Form inline>
        <ControlLabel bsClass="">{"Region: "}</ControlLabel>
        <DropdownButton bsStyle="default" id="aws-region" onSelect={onSelect} title={region}>
            {Object.keys(prices).map(region => <MenuItem key={region} eventKey={region}> {region} </MenuItem>)}
        </DropdownButton>
    </Form>

);

const ValueRow = ({label, value, s3s, s3ia, onChange, addon}) => (
    <div className="row panel">
        <Label bsClass="col-sm-3 text-left">{label}</Label>

        <div className="col-sm-3">
            <form className="form-inline">
                <div className="form-group">
                    <div className="input-group">
                        <input type="number" className="form-control text-center" onChange={onChange} value={value} />
                        <div className="valuerow input-group-addon"> {addon} </div>
                    </div>
                </div>
            </form>
        </div>

        <Label bsClass="col-sm-3 text-center">{"$" + s3s}</Label>
        <Label bsClass="col-sm-3 text-center">{"$" + s3ia}</Label>
    </div>
);


const transparentBg = { background: 'transparent'}

class App extends Component {

    constructor() {
        super()
        this.state = { region: 'us-east-1', dataSize: 10, postPutRequests: 10, getRequests:100, dataTransferSize: 100 }
    }

    handleDataSize(e) {
        e.preventDefault();
        this.setState({dataSize: e.target.value});
    }

    handlePostRequest(e) {
        e.preventDefault();
        this.setState({postPutRequests: e.target.value});
    }

    handleGetRequest(e) {
        e.preventDefault();
        this.setState({getRequests: e.target.value});
    }

    handleDataTransferSize(e) {
        e.preventDefault();
        this.setState({dataTransferSize: e.target.value});
    }

    handleRegion(region, e) {
        console.log(e)
        console.log(region)
        this.setState({region: region});
    }

    render() {
        console.log("Rendering")
        console.log(this.state)
        console.log(prices[this.state.region])
        const price = prices[this.state.region]

        const s3Total = (this.state.dataSize * price.s3) + 
                        (this.state.postPutRequests * price.put) + 
                        (this.state.getRequests * price.get) 

        const s3IaTotal =  (this.state.dataSize * price.s3ia) + 
                           (this.state.postPutRequests * price.putia) + 
                           (this.state.getRequests * price.getia)  +
                           (this.state.dataTransferSize * price.data)

        return (
            <div className="App">
                <div className="page-header">
                    <h3> S3 Standard vs S3 Infrequent Access </h3>
                    <h4> <small> Cost Calculator </small> </h4>
                </div>

                <AwsRegion region={this.state.region} onSelect={(key, e) => this.handleRegion(key, e)} />

                <div className="jumbotron col-sm-10 col-sm-offset-1" style={transparentBg} >

                    <div className="panel panel-primary">

                        <div className="panel-heading">
                            <div className="row">
                                <Label bsClass="col-sm-3 text-left"> Resource </Label>
                                <Label bsClass="col-sm-3 text-center"> Unit</Label>
                                <Label bsClass="col-sm-3 text-center"> S3 Standard </Label>
                                <Label bsClass="col-sm-3 text-center"> S3 Infrequent Access </Label>
                            </div>
                        </div>

                        <div className="panel-body">
                            <ValueRow label="Data Size in TB" 
                                value={this.state.dataSize} 
                                s3s={this.state.dataSize * price.s3} 
                                s3ia={this.state.dataSize * price.s3ia}
                                addon="     TB   "
                                onChange={(e) => this.handleDataSize(e)} />

                            <ValueRow label="No. of POST/PUT requests in Millions"  
                                value={this.state.postPutRequests}
                                s3s={this.state.postPutRequests * price.put} 
                                s3ia={this.state.postPutRequests * price.putia}
                                addon="Million"
                                onChange={(e) => this.handlePostRequest(e)} />

                            <ValueRow label="No. of GET requests in Millions" 
                                value={this.state.getRequests}
                                s3s={this.state.getRequests * price.get} 
                                s3ia={this.state.getRequests * price.getia}
                                addon="Million"
                                onChange={(e) => this.handleGetRequest(e)} />

                            <ValueRow label="S3 IA Data transfer cost in GB" 
                                value={this.state.dataTransferSize}
                                s3s="0" 
                                s3ia={this.state.dataTransferSize * price.data}
                                addon="GB"
                                onChange={(e) => this.handleDataTransferSize(e)} />
                        </div>


                        <div className="panel-footer">
                            <div className="row">
                                <Label bsClass="col-sm-6 text-left"> Total <small> (Per Month) </small> </Label>
                                <Label bsClass="col-sm-3 text-center">{"$" + s3Total}</Label>
                                <Label bsClass="col-sm-3 text-center">{"$" + s3IaTotal}</Label>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    }
}

export default App;
