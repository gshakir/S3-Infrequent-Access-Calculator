import React, { Component } from 'react';
import { Label, DropdownButton, MenuItem, Form } from 'react-bootstrap'
import './App.css';

const regionDisplay = {
    'US East (N.Virginia)'       : ['us-east-1', 'pp1'],
    'US West (Oregon)'           : ['us-west-2', 'pp1'],
    'US West (N.California)'     : ['us-west-1', 'pp3'],
    'EU (Ireland)'               : ['eu-west-1', 'pp1'],
    'EU (Frankfurt)'             : ['eu-central-1', 'pp4'],
    'Asia Pacific (Singapore)'   : ['ap-southeast-1', 'pp2'],
    'Asia Pacific (Sydney)'      : ['ap-southeast-2', 'pp3'],
    'Asia Pacific (Tokyo)'       : ['ap-northeast-1', 'pp5'],
    'Asia Pacific (Seoul)'       : ['ap-northeast-2', 'pp6'],
    'Asia Pacific (Mumbai)'      : ['ap-south-1', 'pp7'],
    'South America (Sao Paulo)'  : ['sa-east-1', 'pp8'],
}

const prices = {
    'pp1' : {s3: [30.0, 29.5, 29.0, 28.5, 28.0, 27.5], s3ia: 12.5, put: 5.0, putia: 10, get: 0.40, getia: 1, data: 0.01},
    'pp2' : {s3: [30.0, 29.5, 29.0, 28.5, 28.0, 27.5], s3ia: 20.0, put: 5.0, putia: 10, get: 0.40, getia: 1, data: 0.01},
    'pp3' : {s3: [33.0, 32.4, 31.9, 31.3, 30.8, 30.2], s3ia: 19.0, put: 5.5, putia: 10, get: 0.44, getia: 1, data: 0.01},
    'pp4' : {s3: [32.4, 31.9, 31.4, 30.8, 30.3, 29.7], s3ia: 18.0, put: 5.4, putia: 10, get: 0.43, getia: 1, data: 0.01},
    'pp5' : {s3: [33.0, 32.4, 31.9, 31.3, 30.8, 30.2], s3ia: 19.0, put: 4.7, putia: 10, get: 0.37, getia: 1, data: 0.01},
    'pp6' : {s3: [31.4, 30.8, 30.3, 29.7, 29.3, 28.7], s3ia: 18.0, put: 4.5, putia: 10, get: 0.35, getia: 1, data: 0.01},
    'pp7' : {s3: [30.0, 29.5, 29.0, 28.5, 28.0, 27.5], s3ia: 19.0, put: 5.0, putia: 10, get: 0.40, getia: 1, data: 0.01},
    'pp8' : {s3: [40.8, 40.1, 39.4, 38.7, 38.0, 37.4], s3ia: 26.0, put: 7.0, putia: 10, get: 0.56, getia: 1, data: 0.01},
}

const useLocale = toLocaleStringSupportsLocales()

function currencyFormat(total) {
    if(useLocale) {
        return Number(total).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }
    else {
        return "$" + Number(total).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}

function toLocaleStringSupportsLocales() {
    var number = 0;
    try {
        number.toLocaleString('i');
    } catch (e) {
        return e.name === 'RangeError';
    }
    return false;
}

const AwsRegion = ({region, onSelect}) => (
    <Form inline>
        <DropdownButton bsStyle="default" id="aws-region" onSelect={onSelect} title={region}>
            {Object.keys(regionDisplay).map(region => <MenuItem key={region} eventKey={region}> {region} - {regionDisplay[region][0]} </MenuItem>)}
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

        <Label bsClass="col-sm-3 text-center">{currencyFormat(s3s)}</Label>
        <Label bsClass="col-sm-3 text-center">{currencyFormat(s3ia)}</Label>
    </div>
);


const transparentBg = { background: 'transparent'}

class App extends Component {

    constructor() {
        super()
        this.state = { region: Object.keys(regionDisplay)[0], dataSize: 100, postPutRequests: 10, getRequests:100, dataTransferSize: 100 }
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
        this.setState({region: region});
    }

    calculateTieredPrice(prices, dataSize) {
        const multiplier = [1, 49, 450, 500, 4000, 5000] 
        let totalPrice = multiplier.reduce((prev, cur, idx) => {
                            if (dataSize >= 0) {
                                totalPrice = prev +  (prices[idx] * ( cur > dataSize ? dataSize : cur))
                                dataSize -= cur
                            }
                            return totalPrice
                         }, 0);

        // If data over 10PB
        //
        if (dataSize >=0 ) {
            totalPrice += prices.slice(-1)[0] * dataSize
        }
        return totalPrice
    }


    render() {
        const price = prices[regionDisplay[this.state.region][1]]

        const storageCost = this.calculateTieredPrice(price.s3, this.state.dataSize)
        const s3Total = storageCost + (this.state.postPutRequests * price.put) + (this.state.getRequests * price.get)

        const s3IaTotal =  (this.state.dataSize * price.s3ia) + 
                           (this.state.postPutRequests * price.putia) + 
                           (this.state.getRequests * price.getia)  +
                           (this.state.dataTransferSize * price.data)

        const savings = s3Total - s3IaTotal
        const savingsPercent = Number((savings/s3Total) * 100).toFixed(2)

        return (
            <div className="App">
                <div className="page-header">
                    <h3> S3 Standard vs S3 Infrequent Access </h3>
                    <h4> <small> Cost Calculator (All units per month) </small> </h4>
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
                                s3s={storageCost} 
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
                                <Label bsClass="col-sm-2 text-left h4"> Totals </Label>
                                <Label bsClass="col-sm-4 text-left h4"> Savings: {currencyFormat(savings)}<small> ({savingsPercent}%)</small> </Label>
                                <Label bsClass="col-sm-3 text-center h4">{ currencyFormat(s3Total) }</Label>
                                <Label bsClass="col-sm-3 text-center h4">{ currencyFormat(s3IaTotal)}</Label>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    }
}

export default App;
