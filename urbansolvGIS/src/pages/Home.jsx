import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from "react-leaflet";
import BottomTable from "../components/bottomTable";
import "leaflet/dist/leaflet.css";
import { db } from "../config/firebase"; // Pastikan path-nya benar
import { collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import L from "leaflet";

const Home = () => {
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [trafficInfo, setTrafficInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState([]);
  const [displayedRoute, setDisplayedRoute] = useState([]);
  const [routeHistory, setRouteHistory] = useState([]);
  const [popupPosition, setPopupPosition] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false); // State untuk mengontrol visibilitas popup
  const [markers, setMarkers] = useState([]); // State untuk menyimpan semua marker

  const userId = localStorage.getItem("user"); // Ambil userId dari localStorage atau global state

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
        userId, // Simpan userId ke dalam dokumen
        startLat: start.lat,
        startLng: start.lng,
        endLat: end.lat,
        endLng: end.lng,
        trafficInfo: traffic,
        duration: duration,
        distance: distance,
        timestamp: new Date(),
      });
      fetchRouteHistory(); // Ambil ulang riwayat rute setelah menyimpan rute baru
    } catch (error) {
      console.error("Error saving route: ", error);
    }
  };

  const fetchRouteHistory = async () => {
    try {
      const q = query(collection(db, "routes"), where("userId", "==", userId), orderBy("timestamp", "desc")); // Mengurutkan berdasarkan timestamp descending
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
            message: "Jalan macet, mencari rute lain.",
            icon: L.icon({
              iconUrl: "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
            }),
          };
          setMarkers((prevMarkers) => [...prevMarkers, macetMarker]); // Tambahkan marker kondisi macet ke dalam markers
          setPopupPosition(macetMarker.position);
          setPopupMessage(macetMarker.message);
          setShowPopup(true);
          trafficDetected = true;
          delay = 2000; // Animasi diperlambat menjadi 2 detik per langkah setelah terdeteksi macet
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
        setMarkers((prevMarkers) => [...prevMarkers, endMarker]); // Tambahkan marker titik akhir rute ke dalam markers
        setPopupPosition(endMarker.position);
        setPopupMessage(endMarker.message);
        setShowPopup(true);
      }
    }, delay); // Menggunakan variabel delay untuk menentukan kecepatan animasi
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
    setPopupPosition(null);
    setPopupMessage("");
    setShowPopup(false);
    setMarkers([]); // Hapus semua marker saat tombol Clear ditekan
  };

  const MapClickHandler = () => {
    useMapEvents({
      click: handleMapClick,
    });
    return null;
  };

  return (
    <>
      <div className="col-12 " style={{ height: "65%", backgroundColor: "#1565c0" }}>
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
                  .filter((coord) => coord && coord.length === 2) // Pastikan coord valid
                  .map((coord) => {
                    if (coord) return [coord[1], coord[0]];
                  })}
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
