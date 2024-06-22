import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from "react-leaflet";
import BottomTable from "../components/bottomTable";
import "leaflet/dist/leaflet.css";
import { db } from "../config/firebase";
import { collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import L from "leaflet";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Home = () => {
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [trafficInfo, setTrafficInfo] = useState(null);
  const [route, setRoute] = useState([]);
  const [displayedRoute, setDisplayedRoute] = useState([]);
  const [routeHistory, setRouteHistory] = useState([]);
  const [popupPosition, setPopupPosition] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [markers, setMarkers] = useState([]);
  const userId = localStorage.getItem("user");

  const token = import.meta.env.VITE_JAWG_ACCESS_TOKEN;

  useEffect(() => {
    fetchRouteHistory();
  }, []);

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

  const saveRoute = async (start, end, traffic, duration, distance) => {
    try {
      await addDoc(collection(db, "routes"), {
        userId,
        startLat: start.lat,
        startLng: start.lng,
        endLat: end.lat,
        endLng: end.lng,
        trafficInfo: traffic,
        duration: duration,
        distance: distance,
        timestamp: new Date(),
      });
      fetchRouteHistory();
    } catch (error) {
      console.error("Error saving route: ", error);
    }
  };

  const fetchRouteHistory = async () => {
    try {
      const q = query(collection(db, "routes"), where("userId", "==", userId), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      setRouteHistory(
        querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            timestamp: data.timestamp.toDate().toLocaleString(),
          };
        })
      );
    } catch (error) {
      console.error("Error fetching route history: ", error);
    }
  };

  const createRoute = async (start, end) => {
    if (!start || !end) {
      console.error("Koordinat Awal atau Akhir tidak diatur dengan benar.", start, end);
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
    let duration = routes[0].duration;
    let distance = routes[0].distance;

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
          duration = routes[i].duration;
          distance = routes[i].distance;
          break;
        }
      }
    }

    // Menambahkan durasi 10 menit jika terdeteksi kemacetan
    if (traffic === 1) {
      duration += 600; // 600 detik = 10 menit
    }
    setRoute(mainRoute);
    setTrafficInfo(traffic);
    animateRoute(mainRoute, traffic, duration, distance);
    saveRoute(start, end, traffic, duration, distance);
  };

  const animateRoute = async (route, traffic, duration, distance) => {
    let index = 0;
    setDisplayedRoute([]);
    let trafficDetected = false;
    let delay = 100; // Kecepatan normal animasi (100ms per langkah)

    const interval = setInterval(() => {
      if (index < route.length) {
        setDisplayedRoute((prev) => [...prev, route[index]]);
        if (traffic === 1 && !trafficDetected && index === Math.floor(route.length / 2)) {
          const macetMarker = {
            position: [route[index][1], route[index][0]],
            message: "Titik Parah Kemacetan.",
            icon: L.icon({
              iconUrl: "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
            }),
          };
          setMarkers((prevMarkers) => [...prevMarkers, macetMarker]);
          setPopupPosition(macetMarker.position);
          setPopupMessage(macetMarker.message);
          setShowPopup(true);
          trafficDetected = true;
          delay = 2000;

          // Menampilkan toast ketika terdeteksi kemacetan
          toast.warning("Ada kemacetan terdeteksi. Durasi waktu akan mengalami perlambatan sekitar 10 menit.", {
            position: "top-center",
          });
        }
        index++;
      } else {
        clearInterval(interval);
        const endMarker = {
          position: [route[route.length - 1][1], route[route.length - 1][0]],
          message: `Rute selesai. Jarak: ${(distance / 1000).toFixed(2)} km, Waktu tempuh: ${(duration / 60).toFixed(2)} menit.`,
          icon: L.icon({
            iconUrl: "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
          }),
        };
        setMarkers((prevMarkers) => [...prevMarkers, endMarker]);
        setPopupPosition(endMarker.position);
        setPopupMessage(endMarker.message);
        setShowPopup(true);
      }
    }, delay);
  };

  const handleMapClick = (e) => {
    if (!start) {
      setStart(e.latlng);
    } else if (!end) {
      setEnd(e.latlng);
      createRoute(start, e.latlng);
    }
  };

  const handleClear = () => {
    setStart(null);
    setEnd(null);
    setRoute([]);
    setDisplayedRoute([]);
    setTrafficInfo(null);
    setPopupPosition(null);
    setPopupMessage("");
    setShowPopup(false);
    setMarkers([]);
  };

  const MapClickHandler = () => {
    useMapEvents({
      click: handleMapClick,
    });
    return null;
  };

  return (
    <>
      <ToastContainer />
      <div className="col-12 " style={{ height: "65%", backgroundColor: "#1565c0" }}>
        <div id="map" style={{ height: "85%", marginTop: "20px" }}>
          <MapContainer center={[-6.9175, 107.6191]} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url={`https://tile.jawg.io/jawg-matrix/{z}/{x}/{y}{r}.png?access-token=${token}`}
              attribution='<a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
                positions={displayedRoute.filter((coord) => coord && coord.length === 2).map((coord) => [coord[1], coord[0]])}
                color={trafficInfo === 1 ? "red" : "blue"}
              />
            )}
            {markers.map((marker, index) => (
              <Marker key={index} position={marker.position} icon={marker.icon}>
                <Popup open={true}>{marker.message}</Popup>
              </Marker>
            ))}
            {popupPosition && showPopup && (
              <Marker position={popupPosition}>
                <Popup open={true}>{popupMessage}</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
        <button onClick={handleClear} className="btn btn-secondary mt-2">
          Clear
        </button>
      </div>
      <BottomTable routeHistory={routeHistory} />
    </>
  );
};

export default Home;
