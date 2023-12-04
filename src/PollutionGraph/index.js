import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const PollutionGraph = () => {
  const [locationData, setLocationData] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get("https://api.openaq.org/v2/locations");

        setLocationData(
          response?.data?.results
            ?.filter(
              (location, index, self) =>
                location.city &&
                self.findIndex((l) => l.city === location.city) === index
            )
            ?.map((location) => location.city)
        );
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    const fetchPollutionData = async () => {
      if (!selectedCity || !selectedDate) {
        return;
      }

      try {
        setLoading(true);
        const formattedDate = new Date(selectedDate).toISOString();
        const pollutionDataResponse = await axios.get(
          `https://api.openaq.org/v2/measurements?city=${selectedCity}&date_from=2000-01-01T00:00:00Z&date_to=${formattedDate}&limit=100&page=1&offset=0&sort=desc&radius=1000&order_by=datetime&parameter=pm25`
        );
        console.log(pollutionDataResponse);
        if (
          pollutionDataResponse?.data?.results &&
          pollutionDataResponse?.data?.results?.length > 0
        ) {
          setChartData(pollutionDataResponse.data.results);
          setLoading(false);
        } else {
          console.log("No pollution data found for the selected city and date");
        }
      } catch (error) {
        console.error("Error fetching pollution data:", error);
      }
    };

    fetchPollutionData();
  }, [selectedCity, selectedDate]);

  return (
    <div>
      <label>Select City: </label>
      <select
        value={selectedCity}
        onChange={(e) => {
          setSelectedCity(e.target.value);
        }}
      >
        <option value="">Select a city</option>
        {locationData?.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>

      <label>Select Date: </label>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />

      {loading ? (
        <p style={{ marginTop: "100px" }}>Loading...</p>
      ) : selectedCity && selectedDate ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "50vh",
          }}
        >
          <LineChart width={600} height={300} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="location"
            />
            <YAxis
              dataKey="value"
              label={{ value: "µg/m³", angle: -90, position: "insideLeft" }}
            />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#8884d8"  />
          </LineChart>
        </div>
      ) : (
        <p>Select a city and date to view pollution data</p>
      )}
    </div>
  );
};

export default PollutionGraph;
