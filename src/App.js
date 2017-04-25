import React, { Component } from 'react';

import avatar from './avatar.svg';
import dashboardIcon from './dashboardIcon.svg';
import './App.css';

const calculateServices = (items) => {
  return items
    .reduce((sum, item) => {
      return sum + ((parseInt(item.service.price, 10) * parseInt(item.hours, 10)) * parseInt(item.projects, 10))
    }, 0)
}

const formatIntAsCurrency = (number) => {
  const t0 = number / 100
  const t1 = t0.toString()
  return `$${t1}`
}

const defaultItemIn = {
  hours: 0,
  projects: 0,
  service: {
    id: 'default',
    name: 'nothing',
    price: 0
  }
}

const AddedServicesTable = ({ addedServices, totalPrice }) =>
  <div>
    Hello Right
    <table>
      <thead>
        <tr>
          <th>Service</th>
          <th>Pricing</th>
          <th>Projects</th>
          <th>Hours</th>
        </tr>
      </thead>
      <tbody>
        {
          addedServices.map((item, index) => {
            return (
              <tr key={index}>
                <td>{item.service.name}</td>
                <td>{item.service.price}</td>
                <td>{item.projects}</td>
                <td>{item.hours}</td>
              </tr>
            )
          })
        }
      </tbody>
    </table>
    <div>Total: {formatIntAsCurrency(totalPrice)}<small>/MO</small></div>
  </div>

const Header = ({ username }) =>
  <div className="App-header">
    <img src='https://placekitten.com/g/20/20' className="App-logo" alt="logo" />
    <ul className="App-upper-nav App-left-nav">
      <li>
        <img src={dashboardIcon} className="icon" alt="dashboard-icon" />
        Dashboard
      </li>
    </ul>
    <ul className="App-upper-nav App-right-nav">
      <li>
        {username}
        <img src={avatar} className="App-avatar" alt="avatar" />
      </li>
      <li>Logout</li>
    </ul>
  </div>

const PricingCalculator = ({
  handleAddService,
  handleHourChange,
  handleProjectChange,
  handleServiceChange,
  hoursValue,
  projectsValue,
  selectFieldValue,
  services,
  tmpTotal
}) =>
  <form>
    Hello Left
    <br />
    <select onChange={handleServiceChange} value={selectFieldValue}>
      <option value="default">Select a Service</option>
      {
        services.map(service => {
          return (<option key={service.id} value={service.id}>{service.name} - {service.price}</option>)
        })
      }
    </select>
    <br />
    <input type="text" name="projects" onChange={handleProjectChange} value={projectsValue} />
    X
    <input type="text" name="hours" onChange={handleHourChange} value={hoursValue} />
    <div>= {tmpTotal ? formatIntAsCurrency(tmpTotal) : '$0.00'}<small>/MO</small></div>
    <button onClick={handleAddService}>Add Service</button>
  </form>

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      addedServices: [],
      itemIn: defaultItemIn,
      services: [],
      tmpTotal: 0,
      totalPrice: 0
    }

    this.handleAddService = this.handleAddService.bind(this)
    this.handleHourChange = this.handleHourChange.bind(this)
    this.handleProjectChange = this.handleProjectChange.bind(this)
    this.handleServiceChange = this.handleServiceChange.bind(this)
  }

  componentDidMount () {
    const query = 'Service'
    fetch(`api/services?q=${query}`, {
        accept: 'application/json',
      })
      .then((response) => {
        if (response.status >= 200 && response.status < 300) {
          return response
        }
        const error = new Error(`HTTP Error ${response.statusText}`)
        error.status = response.statusText
        error.response = response
        throw error
      })
      .then((response) => {
        return response.json()
      })
      .then((services) => {
        this.setState({ services })
      })
  }

  handleAddService (event) {
    event.preventDefault()
    const { addedServices, itemIn } = this.state
    addedServices.push({ ...itemIn })
    const totalPrice = calculateServices(addedServices)
    this.setState({
      addedServices,
      itemIn: { ...defaultItemIn },
      tmpTotal: 0,
      totalPrice
    })
  }

  handleHourChange (event) {
    const { itemIn } = this.state
    itemIn.hours = event.target.value
    this.setState({
      itemIn,
      tmpTotal: calculateServices([itemIn])
    })
  }

  handleProjectChange (event) {
    const { itemIn } = this.state
    itemIn.projects = event.target.value
    this.setState({
      itemIn,
      tmpTotal: calculateServices([itemIn])
    })
  }

  handleServiceChange (event) {
    const service = this.state.services
      .filter(service => service.id === parseInt(event.target.value, 10))
      .pop()
    const { itemIn } = this.state
    itemIn.service = service
    this.setState({
      itemIn,
      tmpTotal: calculateServices([itemIn])
    })
  }

  render() {
    const { addedServices, itemIn, services, totalPrice, tmpTotal } = this.state
    return (
      <div className="App">
        <Header username={'Matt Weppler'} />
        <div className="App-main">
          <p className="App-intro">Pricing Calculator</p>
          <div className="App-calc calc-left">
            <PricingCalculator
              handleAddService={this.handleAddService}
              handleHourChange={this.handleHourChange}
              handleProjectChange={this.handleProjectChange}
              handleServiceChange={this.handleServiceChange}
              hoursValue={itemIn.hours}
              projectsValue={itemIn.projects}
              selectFieldValue={itemIn.service.id}
              services={services}
              tmpTotal={tmpTotal}
            />
          </div>
          <div className="App-calc calc-right">
            <AddedServicesTable
              addedServices={addedServices}
              totalPrice={totalPrice}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default App

