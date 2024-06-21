import React from "react";

const BottomTable = ({ routeHistory }) => {
  return (
    <>
      <div>
        <h5>User History</h5>
      </div>
      <div className="col-12" style={{ height: "200px", overflowY: "auto", backgroundColor: "#0d47a1", color: "white" }}>
        <table className="table table-dark table-striped mb-0">
          <thead>
            <tr>
              <th>No</th>
              <th>Start</th>
              <th>End</th>
              <th>Traffic</th>
              <th>Duration</th>
              <th>Distance</th>
              <th>CreatedAt</th>
            </tr>
          </thead>
          <tbody>
            {routeHistory.map((route, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{`${route.startLat}, ${route.startLng}`}</td>
                <td>{`${route.endLat}, ${route.endLng}`}</td>
                <td>{route.trafficInfo === 0 ? "Lancar" : "Macet"}</td>
                <td>{(route.duration / 60).toFixed(2)} mins</td>
                <td>{(route.distance / 1000).toFixed(2)} km</td>
                <td>{route.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default BottomTable;
