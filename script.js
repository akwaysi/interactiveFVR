// Function to get color based on FVR value
function getColor(fvr) {
    return fvr > 4 ? '#800026' :
           fvr > 3 ? '#BD0026' :
           fvr > 2 ? '#E31A1C' :
           fvr > 1 ? '#FC4E2A' :
           fvr > 0.5 ? '#FD8D3C' :
           fvr > 0.1 ? '#FEB24C' :
                      '#FFEDA0';
}

// Function to create the map and display the FVR data
function initializeMap() {
    var map = L.map('map').setView([35.5355, -93.4011], 17); // Initial view set within the coordinate bounds

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(map);

    fetch('Cleaned_Analysis_For_Leaflet.csv')
        .then(response => response.text())
        .then(data => {
            let csvData = Papa.parse(data, {header: true}).data;

            let latLngs = [];

            csvData.forEach(row => {
                let latLng = [parseFloat(row.Latitude), parseFloat(row.Longitude)];
                latLngs.push(latLng);

                let markerColor = getColor(row.Week_1_FVR); // Example with Week 1 FVR, can be dynamic
                let marker = L.circleMarker(latLng, {
                    radius: 8,
                    fillColor: markerColor,
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                }).addTo(map);

                marker.on('click', function() {
                    showFVRChart(row);
                });

                marker.on('mouseover', function() {
                    marker.bindPopup(`Plot: ${row.Plot}<br>Click to see FVR`).openPopup();
                });

                marker.on('mouseout', function() {
                    marker.closePopup();
                });
            });

            let bounds = L.latLngBounds(latLngs); // Calculate the bounds of all coordinates
            map.fitBounds(bounds, {padding: [50, 50]}); // Fit the map to these bounds with padding

            createLegend(map); // Add the legend to the map
        });
}

// Function to show the FVR chart when a marker is clicked
function showFVRChart(row) {
    let fvrData = [
        row.Week_1_FVR, row.Week_2_FVR, row.Week_3_FVR, row.Week_4_FVR,
        row.Week_5_FVR, row.Week_6_FVR, row.Week_7_FVR, row.Week_8_FVR,
        row.Week_9_FVR, row.Week_10_FVR, row.Week_11_FVR
    ];

    let ctx = document.getElementById('fvrChart').getContext('2d');
    if (window.myChart) {
        window.myChart.data.datasets[0].data = fvrData;
        window.myChart.update();
    } else {
        window.myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11'],
                datasets: [{
                    label: `FVR for Plot: ${row.Plot}`,
                    data: fvrData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Weeks'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'FVR'
                        }
                    }
                }
            }
        });
    }
}

// Function to create a legend for the FVR values
function createLegend(map) {
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function () {
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0.1, 0.5, 1, 2, 3, 4, 5],
            labels = [];

        div.innerHTML = '<strong>FVR Legend</strong><br>';
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i class="legend-color-box" style="background:' + getColor(grades[i] + 0.1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        return div;
    };

    legend.addTo(map);
}

// Initialize the map
initializeMap();
