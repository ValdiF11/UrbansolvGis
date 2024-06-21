const BottomTable = () => {
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
            </tr>
          </thead>
          <tbody>
            {/* Add your table rows here */}
            {Array.from({ length: 10 }).map((_, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>Data 1</td>
                <td>Data 2</td>
                <td>Data 3</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default BottomTable;
