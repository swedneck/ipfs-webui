import React from 'react'
import PropTypes from 'prop-types'
import ReactFauxDOM from 'react-faux-dom'
import { AutoSizer } from 'react-virtualized'
import * as d3 from 'd3'
import * as topojson from 'topojson'

// Static
import './WorldMap.css'
import worldData from './world.json'

export class WorldMap extends React.Component {
  static propTypes = {
    peers: PropTypes.array
  }

  renderMap = (height, width, coordinates) => {
    const projection = d3.geoEquirectangular()
      .scale(height / Math.PI)
      .translate([width / 2, height / 2])
      .precision(0.1)

    const path = d3.geoPath().projection(projection)

    const graticule = d3.geoGraticule()

    const el = d3.select(ReactFauxDOM.createElement('svg'))
      .attr('width', width)
      .attr('height', height)

    // Fill Pattern
    el.append('defs')
      .append('pattern')
      .attr('id', 'gridpattern')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 3)
      .attr('height', 3)
      .attr('patternUnits', 'userSpaceOnUse')
      .append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', 1)
      .attr('style', 'stroke: none; fill: rgba(0, 0, 0, 0.8)')

    el.append('path')
      .datum(graticule)
      .attr('class', 'graticule')
      .attr('d', path)

    el.insert('path', '.graticule')
      .datum(topojson.feature(worldData, worldData.objects.land))
      .attr('d', path)
      .attr('fill', 'url(#gridpattern)')

    el.insert('path', '.graticule')
      .datum(topojson.mesh(
        worldData,
        worldData.objects.countries,
        (a, b) => a !== b
      ))
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', 'none')
      .attr('stroke-width', '0.5px')

    el.append('path')
      .datum({
        type: 'MultiPoint',
        coordinates: coordinates
      })
      .attr('d', path.pointRadius((d) => 8))
      .attr('class', 'world-locations-base')

    el.append('path')
      .datum({
        type: 'MultiPoint',
        coordinates: coordinates
      })
      .attr('d', path.pointRadius((d) => 2))
      .attr('class', 'world-locations-center')

    return el.node().toReact()
  }

  render () {
    const { peers } = this.props

    return (
      <div className='MapContainer flex w-100 mb4'>
        <AutoSizer>
          { ({ height, width }) => this.renderMap(height, width, [0, 0]) }
        </AutoSizer>

        <div className='flex flex-auto flex-column items-center self-end pb4'>
          <div className='f1 gray'>{ peers ? peers.length : 0 }</div>
          <div className='f4 b'>PEERS</div>
        </div>
      </div>
    )
  }
}

export default WorldMap
