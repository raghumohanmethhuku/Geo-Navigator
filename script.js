let sourceResults = [];
let destinationResults = [];
let map = L.map('map', {
    zoomControl: true
}).setView([17.3850, 78.4867], 10);

L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution: '&copy; OpenStreetMap contributors'
    }
).addTo(map);

// Global Variables

let sourceMarker;
let destinationMarker;
let routeLine;

// Find Route Function

async function findRoute() {

    const source =
        document.getElementById("source").value;

    const destination =
        document.getElementById("destination").value;

    if (!source || !destination) {

        alert("Please enter both locations");
        return;
    }

    try {

        // Source Location

        const sourceResponse =
            await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${source}`
            );

        const sourceData =
            await sourceResponse.json();

        // Destination Location

        const destinationResponse =
            await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${destination}`
            );

        const destinationData =
            await destinationResponse.json();

        if (
            sourceData.length === 0 ||
            destinationData.length === 0
        ) {
            alert("Location not found");
            return;
        }

        let sourceIndex =
document.getElementById(
"sourceOptions"
).value || 0;

let destinationIndex =
document.getElementById(
"destinationOptions"
).value || 0;

let sLat =
parseFloat(
sourceResults[sourceIndex].lat
);

let sLon =
parseFloat(
sourceResults[sourceIndex].lon
);

let dLat =
parseFloat(
destinationResults[destinationIndex].lat
);

let dLon =
parseFloat(
destinationResults[destinationIndex].lon
);
        // Remove Previous Markers

        if (sourceMarker) {
            map.removeLayer(sourceMarker);
        }

        if (destinationMarker) {
            map.removeLayer(destinationMarker);
        }

        if (routeLine) {
            map.removeLayer(routeLine);
        }

        // Add Source Marker

        sourceMarker =
            L.marker([sLat, sLon])
            .addTo(map)
            .bindPopup("Source")
            .openPopup();

        // Add Destination Marker

        destinationMarker =
            L.marker([dLat, dLon])
            .addTo(map)
            .bindPopup("Destination");

        // Real Road Routing Using OSRM

        const routeResponse =
            await fetch(
                `https://router.project-osrm.org/route/v1/driving/${sLon},${sLat};${dLon},${dLat}?overview=full&geometries=geojson`
            );

        const routeData =
            await routeResponse.json();

        const coordinates =
            routeData.routes[0].geometry.coordinates;

        const routePoints =
            coordinates.map(
                coord => [coord[1], coord[0]]
            );

        routeLine =
    L.polyline(
        routePoints,
        {
            color: "#2563eb",
            weight: 6,
            opacity: 0.9
        }
    ).addTo(map);

        map.fitBounds(
            routeLine.getBounds()
        );

        // Distance

        let distance =
            routeData.routes[0].distance / 1000;

        distance =
            distance.toFixed(2);

        document.getElementById(
            "distance"
        ).innerHTML =
            distance + " km";

        // Time

        let totalMinutes =
    Math.round(
        routeData.routes[0].duration / 60
    );

let hours =
    Math.floor(totalMinutes / 60);

let minutes =
    totalMinutes % 60;

if(hours > 0){
    document.getElementById("time").innerHTML =
        `${hours} hr ${minutes} min`;
}
else{
    document.getElementById("time").innerHTML =
        `${minutes} min`;
}

    }
    catch (error) {

        console.error(error);

        alert(
            "Something went wrong"
        );
    }
}

// Current Location

function getCurrentLocation() {

    navigator.geolocation.getCurrentPosition(

        function(position) {

            let lat =
                position.coords.latitude;

            let lon =
                position.coords.longitude;
if (sourceMarker) {
    map.removeLayer(sourceMarker);
}

sourceMarker =
    L.marker([lat, lon])
    .addTo(map)
    .bindPopup("My Current Location")
    .openPopup();

map.setView([lat, lon], 13);
        },

        function() {

            alert(
                "Unable to fetch location"
            );
        }
    );
}
function toggleFullscreen() {

    const mapDiv =
        document.getElementById("map");

    if (!document.fullscreenElement) {

        mapDiv.requestFullscreen();

    } else {

        document.exitFullscreen();
    }
}
async function searchLocations() {

    const source =
        document.getElementById("source").value;

    const destination =
        document.getElementById("destination").value;

    const sourceResponse =
        await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${source}`
        );

    sourceResults =
        await sourceResponse.json();

    const sourceDropdown =
        document.getElementById("sourceOptions");

    sourceDropdown.innerHTML = "";

    sourceResults.forEach((location, index) => {

        sourceDropdown.innerHTML +=
        `<option value="${index}">
            ${location.display_name}
        </option>`;

    });

    sourceDropdown.style.display = "block";



    const destinationResponse =
        await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${destination}`
        );

    destinationResults =
        await destinationResponse.json();

    const destinationDropdown =
        document.getElementById("destinationOptions");

    destinationDropdown.innerHTML = "";

    destinationResults.forEach((location, index) => {

        destinationDropdown.innerHTML +=
        `<option value="${index}">
            ${location.display_name}
        </option>`;

    });

    destinationDropdown.style.display = "block";
}