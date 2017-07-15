import * as d3 from 'd3'
import * as topojson from 'topojson'

const width = window.innerWidth
const height = window.innerHeight

const map = d3.select('#map').append('svg')
  .attr('width', width)
  .attr('height', height)

const g = map.append('g')

const projection = d3.geoMercator()
  .center([137, 34])
  .scale(7000)
  .translate([40, 1700])

const path = d3.geoPath()
  .projection(projection)

const zoomed = () => {
  g.attr('transform', d3.event.transform)
}

const zoom = d3.zoom()
  .scaleExtent([0.2, 4])
  .on('start', () => map.style('cursor', 'move'))
  .on('end', () => map.style('cursor', 'default'))
  .on('zoom', zoomed)

map.call(zoom)

const parsePopulationCSV = (d) => {
  return {
    id: d['団体コード'] ? d['団体コード'].substr(0, 5) : '',
    total: +d['総数']
  }
}

const lookupCityInfo = (id, cities) => {
  return cities.find((d) => {
    return d.id === id
  })
}

const lookupPopulation = (id, population) => {
  return population.find((d) => {
    return d.id === id
  })
}

const addExtraInfo = (jp, cities, totalPopulation) => {
  jp.objects.cities.geometries = jp.objects.cities.geometries.map((d) => {
    d.properties = {
      info: lookupCityInfo(d.id, cities),
      population: lookupPopulation(d.id, totalPopulation)
    }
    return d
  })
  return jp
}

const popup = (d) => {
  try {
    d3.select('#popup')
      .style('visibility', 'visible')
      .html(`
        <div class="name">${d.properties.info.city_en}</div>
        <table>
          <thead>
            <tr>
              <th>Prefecture ID</th>
              <th>Original Name</th>
              <th>Population</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${d.properties.info.prefecture_id}</td>
              <td>${d.properties.info.city_ja} ${d.properties.info.special_district_ja}</td>
              <td class="population">${d3.format(',')(d.properties.population.total)}</td>
            </tr>
          </tbody>
        </table>
      `)
  } catch (e) {
    console.log(e) // some properties might be missing
  }
}

d3.queue()
  .defer(d3.json, 'japan-2017-topo.json')
  .defer(d3.csv, 'cities_in_japan_2016.csv')
  .defer(d3.csv, 'population_in_japan_2017.csv', parsePopulationCSV)
  .await((error, jp, cities, population) => {
    if (error) throw error

    // fade out the loading animation first
    d3.select('.loading-pulse')
      .classed('fadeout', true)

    // make a slight delay so the map appears smoothly
    setTimeout(() => {
      const z = d3.scaleQuantile()
        .domain(population.map(d => d.total))
        .range(d3.quantize(d3.interpolateViridis, 256))

      jp = addExtraInfo(jp, cities, population)

      g.append('g')
        .attr('class', 'city')
        .selectAll('path')
        .data(topojson.feature(jp, jp.objects.cities).features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('class', d => 'c' + d.id)
        // Apparently not all the administrative district has population data
        .style('fill', d => z(d.properties.population ? d.properties.population.total : 0))
        .style('stroke', 'white')
        .style('stroke-width', '0.1px')
        .on('mouseenter', function () {
          // Change the order, otherwise the width of stroke could be inconsistent
          this.parentNode.appendChild(this)
          d3.select(this).style('stroke-width', '1px')
        })
        .on('mouseout', function () { d3.select(this).style('stroke-width', '0.1px') })
        .on('mouseover', popup)
      d3.select('.loading-container')
        .classed('fadeout', true)
    }, 100)
  })
