import React from 'react'
import Chart from 'react-apexcharts'

const Graph = ({ options, series, type = 'bar', width = 500 }) => {
    
    return (<Chart options={options} series={series} type={type} width={width} />)
}

export default Graph;