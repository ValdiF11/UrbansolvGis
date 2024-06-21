import React, { useState, useEffect } from "react";
import { auth, db } from "../config/firebase";
import { doc, getDoc } from "firebase/firestore";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from "react-leaflet";
import BottomTable from "../components/bottomTable";
import "leaflet/dist/leaflet.css";

const Home = () => {
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [trafficInfo, setTrafficInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState([]);
  const [displayedRoute, setDisplayedRoute] = useState([]);
  const [routeHistory, setRouteHistory] = useState([]);
  const [userDetail, setUserDetail] = useState(null);

  //   useEffect(() => {
  //     fetchRouteHistory();
  //   }, []);

  const fetchUserData = async () => {
    const user = auth.currentUser;
    const docRef = doc(db, "Users", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setUserDetail(docSnap.data());
      console.log("Document data:", docSnap.data());
    } else {
      console.log("User not login");
    }
  };
  const getRoute = async (start, end, alternatives = false) => {
    const response = await axios({
      url: `https://api.mapbox.com/directions/v5/mapbox/driving/${start.lng},${start.lat};${end.lng},${end.lat}`,
      params: {
        access_token: import.meta.env.VITE_TOKEN_MAPBOX,
        geometries: "geojson",
        steps: true,
        alternatives: alternatives,
      },
      method: "GET",
    });
    console.log(response.data.routes);
    return response.data.routes;
  };

  const fetchTrafficInfo = async (start, end) => {
    const response = await axios({
      url: "http://localhost:5001/predict",
      data: {
        start: start,
        end: end,
      },
      method: "POST",
    });
    return response.data.traffic;
  };

  //   const saveRoute = async (start, end, traffic) => {
  //     await axios({
  //       url: "http://localhost:3000/map/addRoute",
  //       data: {
  //         startLat: start.lat,
  //         startLng: start.lng,
  //         endLat: end.lat,
  //         endLng: end.lng,
  //         trafficInfo: traffic,
  //       },
  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${localStorage.access_token}`,
  //       },
  //     });
  //   };

  const fetchRouteHistory = async () => {
    const response = await axios({
      url: "http://localhost:3000/map/getRoutes",
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.access_token}`,
      },
    });
    setRouteHistory(response.data);
  };

  const createRoute = async (start, end) => {
    if (!start || !end) {
      console.error("Start or End coordinates are not set properly.", start, end);
      return;
    }

    let routes;
    try {
      routes = await getRoute(start, end);
    } catch (error) {
      console.error("Error fetching routes: ", error);
      return;
    }

    let traffic;
    try {
      traffic = await fetchTrafficInfo(start, end);
    } catch (error) {
      console.error("Error fetching traffic info: ", error);
      return;
    }

    let mainRoute = routes[0].geometry.coordinates;

    if (traffic === 1) {
      routes = await getRoute(start, end, true);
      for (let i = 1; i < routes.length; i++) {
        const altStart = {
          lat: routes[i].geometry.coordinates[0][1],
          lng: routes[i].geometry.coordinates[0][0],
        };
        const altEnd = {
          lat: routes[i].geometry.coordinates[routes[i].geometry.coordinates.length - 1][1],
          lng: routes[i].geometry.coordinates[routes[i].geometry.coordinates.length - 1][0],
        };
        traffic = await fetchTrafficInfo(altStart, altEnd);
        if (traffic === 0) {
          mainRoute = routes[i].geometry.coordinates;
          break;
        }
      }
    }
    setRoute(mainRoute);
    setTrafficInfo(traffic);
    animateRoute(mainRoute);
    // saveRoute(start, end, traffic);
  };

  const animateRoute = (route) => {
    let index = 0;
    setDisplayedRoute([]);

    const interval = setInterval(() => {
      if (index < route.length) {
        setDisplayedRoute((prev) => [...prev, route[index]]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 100); // Adjust the speed of the animation
  };

  const handleMapClick = (e) => {
    if (!start) {
      setStart(e.latlng);
      console.log("Start Point Set: ", e.latlng);
    } else if (!end) {
      setEnd(e.latlng);
      console.log("End Point Set: ", e.latlng);
      createRoute(start, e.latlng);
    }
  };

  const handleClear = () => {
    setStart(null);
    setEnd(null);
    setRoute([]);
    setDisplayedRoute([]);
    setTrafficInfo(null);
  };

  const MapClickHandler = () => {
    useMapEvents({
      click: handleMapClick,
    });
    return null;
  };

  //   const filter = (displayedRoute) => {
  //     let array = displayedRoute;
  //     array = array.filter((element) => element !== undefined);
  //     console.log(array);
  //     return array;
  //   };

  //   const data = filter(displayedRoute);
  return (
    <>
      <div className="col-12 " style={{ height: "65%", backgroundColor: "#1565c0" }}>
        {trafficInfo !== null && (
          <div className={`alert ${trafficInfo === 0 ? "alert-success" : "alert-danger"}`}>
            Traffic Info: {trafficInfo === 0 ? "Lancar" : "Macet"}
          </div>
        )}
        <div id="map" style={{ height: "85%", marginTop: "20px" }}>
          <MapContainer center={[-6.9175, 107.6191]} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapClickHandler />
            {start && (
              <Marker position={start}>
                <Popup>Start Point</Popup>
              </Marker>
            )}
            {end && (
              <Marker position={end}>
                <Popup>End Point</Popup>
              </Marker>
            )}
            {displayedRoute.length > 0 && (
              <Polyline
                positions={displayedRoute
                  .filter((coord) => coord && coord.length === 2) // Ensure coord is valid
                  .map((coord) => {
                    console.log(coord);
                    if (coord) return [coord[1], coord[0]];
                  })}
                color="blue"
              />
            )}
          </MapContainer>
        </div>
        <button onClick={handleClear} className="btn btn-secondary mt-2">
          Clear
        </button>
      </div>
      <BottomTable />
    </>
  );
};

export default Home;
