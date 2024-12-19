// Include D3.js in your HTML before running this script
// Example: <script src="https://d3js.org/d3.v6.min.js"></script>

// Data: list of countries with ChatGPT access
const countriesWithAccess = [
  "Albania", "Algeria", "Afghanistan", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", 
  "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belgium", "Belize", "Benin", "Bhutan", 
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", 
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "Colombia", "Comoros", 
  "Congo (Brazzaville)", "Congo (DRC)", "Costa Rica", "Côte d'Ivoire", "Croatia", "Cyprus", "Czechia (Czech Republic)", 
  "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", 
  "Estonia", "Eswatini (Swaziland)", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", 
  "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Holy See (Vatican City)", 
  "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", 
  "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", 
  "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", 
  "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", 
  "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", 
  "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", 
  "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", 
  "Romania", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", 
  "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", 
  "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", 
  "Sri Lanka", "Suriname", "Sweden", "Switzerland", "Sudan", "Taiwan", "Tajikistan", "Tanzania", "Thailand", 
  "Timor-Leste (East Timor)", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", 
  "Uganda", "Ukraine (with certain exceptions)", "United Arab Emirates", "United Kingdom", "United States of America", 
  "Uruguay", "Uzbekistan", "Vanuatu", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

// Set up dimensions and projection for the map
const width = 960;
const height = 600;
const projection = d3.geoNaturalEarth1()
  .scale(130)
  .translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);

// Create the SVG container
const svg = d3.select("#map-container")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Create a tooltip for displaying country names
const tooltip = d3.select("body")

  .append("div")
  .style("position", "absolute")
  .style("background", "#fff")
  .style("padding", "5px 10px")
  .style("border", "1px solid #ccc")
  .style("border-radius", "4px")
  .style("box-shadow", "0 2px 5px rgba(0,0,0,0.2)")
  .style("display", "none")
  .style("pointer-events", "none")
  .style("z-index", "7")
  .style("color", "black");
  

// Load and display the world map
d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(worldData => {
  const countries = topojson.feature(worldData, worldData.objects.countries).features;

  // Draw the map
  svg.selectAll(".country")
    .data(countries)
    .enter()
    .append("path")
    .attr("class", "country")
    .attr("d", path)
    .attr("fill", d => {
      // Check if the country is in the access list
      const countryName = d.properties.name;
      return countriesWithAccess.includes(countryName) ? "#4caf50" : "#ccc"; // Green for access, grey otherwise
    })
    .attr("stroke", "#333")
    .attr("stroke-width", 0.5);

  // Add hover interactions
  svg.selectAll(".country")
    .on("mouseover", function (event, d) {
      const countryName = d.properties.name;
      
      d3.select(this).attr("fill", "#ff9800"); // Highlight on hover
      tooltip.style("display", "block").text(countryName);
      
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY + 10}px`);
    })
    .on("mouseout", function (event, d) {
      const countryName = d.properties.name;
      d3.select(this).attr("fill", countriesWithAccess.includes(countryName) ? "#4caf50" : "#ccc"); // Reset color
      tooltip.style("display", "none");
    });
});
