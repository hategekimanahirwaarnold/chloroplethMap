const tooltip = document.getElementById("tooltip");

const padding = 150;
const w = 800;
const h = 600;

let color1 = "rgb(73, 73, 241)";
let color2 = "aqua";
let color3 = "rgb(255, 249, 167)";
let color4 = "rgb(247, 165, 13)";
let color5 = "rgb(236, 114, 43)";
let color6 = "rgb(247, 48, 13)";

const svg = d3.select("body")
  .append("svg")
  .attr("width", w)
  .attr("height", h);

var legendData = [
  { color: color1, label: "[0%, 10%[" },
  { color: color2, label: "[10%, 25%[" },
  { color: color3, label: "[25%, 40%[" },
  { color: color4, label: "[40%, 55%[" },
  { color: color5, label: "[55%, 70%[" },
  { color: color6, label: "[70%, 80%]"},
];

var legend = svg.append("g")
  .attr("id", "legend")
  .selectAll("g")
  .data(legendData)
  .enter()
  .append("g")
  .attr("transform", function (d, i) {
    return "translate(" + (padding + i * 90) + ", " + (h - 50) + ")";
  });

legend.append("rect")
  .attr("width", 90)
  .attr("height", 18)
  .style("fill", function (d) {
    return d.color;
  });

legend.append("text")
  .attr("x", 0)
  .attr("y", -6)
  .text(function (d) {
    return d.label;
  });

const g = svg.append("g");

// Define the projection and path generators
const projection = d3.geoAlbersUsa();
const path = d3.geoPath(projection);

// Load the data
Promise.all([
  d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"),
  d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json")
]).then(([countyData, educationData]) => {
  const counties = topojson.feature(countyData, countyData.objects.counties);

  // Merge the education data with county data based on the "fips" property
  counties.features.forEach(county => {
    const countyId = county.id;
    const educationCountyData = educationData.find(data => data.fips === countyId);
    county.properties.education = educationCountyData ? educationCountyData.bachelorsOrHigher : 0;
  });
  //console.log(counties.features)
  // Draw the counties on the map
  svg.append("g").selectAll('path')
  .data(counties.features)
  .enter()
  .append('path')
  .attr("class", "county")
  .attr("d", path)
  .attr("data-fips", d => d.id)
  .attr("data-education", d => d.properties.education)
  .attr("fill", ((d) => {
    let edu = d.properties.education;
    
    if (edu < 10 ) {
      return color1
    } else if (edu < 25) {
      return color2
    } if(edu < 40) {
      return color3
    } if(edu < 55) {
      return color4
    } if(edu < 70) {
      return color5
    } if(edu <= 80) {
      return color6
    } else {
      console.log("not in the range: ", d);
      return "black"
    }
  }))
  .on("mouseover", function(event, d) {
    // Show tooltip
    tooltip.style.display = "block";
    
    // Get the data-education attribute value of the current path
    const education = d3.select(this).attr("data-education");
    
    // Calculate tooltip position based on mouse coordinates
    const xPosition = event.pageX;
    const yPosition = event.pageY;
    
    // Update tooltip content with the education value
    tooltip.innerHTML = "Education: " + education;
    
    // Set the data-education attribute of the tooltip
    tooltip.setAttribute("data-education", education);
    
    // Position the tooltip
    tooltip.style.left = xPosition + "px";
    tooltip.style.top = yPosition + "px";
  })
  .on("mouseout", function() {
    // Hide the tooltip on mouseout
    tooltip.style.display = "none";
  });


      }).catch (err => {
        console.log("There was an error: ", err)
      });
