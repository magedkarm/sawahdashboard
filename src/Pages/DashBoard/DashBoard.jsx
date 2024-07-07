import React from "react";
import { useQuery } from "react-query";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import "./Dashboard.css";
import LoadingComponent from "../../Components/LoadingComponent/LoadingComponent";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const fetchStats = async () => {
  const { data } = await axios.get("/api/v1/stats/admin/", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  });
  return data.docs;
};

export default function DashBoard() {
  const { data, error, isLoading } = useQuery("stats", fetchStats);

  if (isLoading)
    return (
      <>
        <LoadingComponent />
      </>
    );
  if (error) return <div>Error fetching data</div>;

  const {
    monthlySignUps,
    monthlyRevenue,
    popularLandmarks,
    topGuides,
    topBookedTours,
  } = data;

  const formattedMonthlySignUps = monthlySignUps.map((item) => ({
    month: `${item._id.year}-${item._id.month}`,
    numUsers: item.numUsers,
  }));

  const formattedMonthlyRevenue = monthlyRevenue.map((item) => ({
    month: `${new Date().getFullYear()}-${item.month}`, // assuming current year if not provided
    totalRevenue: item.totalRevenue,
  }));

  const months = Array.from(
    new Set([
      ...formattedMonthlySignUps.map((item) => item.month),
      ...formattedMonthlyRevenue.map((item) => item.month),
    ])
  );

  const signUpData = months.map((month) => {
    const signUp = formattedMonthlySignUps.find((item) => item.month === month);
    return signUp ? signUp.numUsers : 0;
  });

  const revenueData = months.map((month) => {
    const revenue = formattedMonthlyRevenue.find(
      (item) => item.month === month
    );
    return revenue ? revenue.totalRevenue : 0;
  });

  return (
    <>
      <div className="DashBoard">
        <div className="pageTitles">
          <h3>
            Panel /{" "}
            <span
              style={{ fontSize: "20px", fontWeight: "400", color: "#87898b" }}
            >
              dashboard
            </span>
          </h3>
        </div>
      </div>
      <div className="global-card card">
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-4 mb-3">
              <div className="inner-card card">
                <div className="card-body">
                  <h4 className="card-title">
                    Total Revenue: $
                    {monthlyRevenue.reduce(
                      (acc, item) => acc + item.totalRevenue,
                      0
                    )}
                  </h4>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="inner-card card">
                <div className="card-body">
                  <h4 className="card-title">
                    Total Users:{" "}
                    {monthlySignUps.reduce(
                      (acc, item) => acc + item.numUsers,
                      0
                    )}
                  </h4>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="inner-card card">
                <div className="card-body">
                  <h4 className="card-title">
                    Popular Landmark: {popularLandmarks[0].name}
                  </h4>
                </div>
              </div>
            </div>
          </div>
          <div className="row mb-4">
            <div className="col-md-6 mb-3">
              <div className="inner-card card">
                <div className="card-body">
                  <h4 className="card-title">Monthly SignUps & Revenue</h4>
                  <Line
                    data={{
                      labels: months,
                      datasets: [
                        {
                          label: "Monthly SignUps",
                          data: signUpData,
                          borderColor: "rgba(75, 192, 192, 1)",
                          backgroundColor: "rgba(75, 192, 192, 0.2)",
                        },
                        {
                          label: "Monthly Revenue",
                          data: revenueData,
                          borderColor: "rgba(153, 102, 255, 1)",
                          backgroundColor: "rgba(153, 102, 255, 0.2)",
                        },
                      ],
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <div className="inner-card card">
                <div className="card-body">
                  <h4 className="card-title">Popular Landmarks</h4>
                  <Doughnut
                    data={{
                      labels: popularLandmarks.map((landmark) => landmark.name),
                      datasets: [
                        {
                          label: "Number of Bookings",
                          data: popularLandmarks.map(
                            (landmark) => landmark.numBookings
                          ),
                          backgroundColor: [
                            "rgba(255, 99, 132, 0.2)",
                            "rgba(54, 162, 235, 0.2)",
                            "rgba(255, 206, 86, 0.2)",
                            "rgba(75, 192, 192, 0.2)",
                            "rgba(153, 102, 255, 0.2)",
                          ],
                          borderColor: [
                            "rgba(255, 99, 132, 1)",
                            "rgba(54, 162, 235, 1)",
                            "rgba(255, 206, 86, 1)",
                            "rgba(75, 192, 192, 1)",
                            "rgba(153, 102, 255, 1)",
                          ],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        legend: {
                          position: "top",
                        },
                        title: {
                          display: true,
                          text: "Popular Landmarks",
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="row mb-4">
            <div className="col-md-6 mb-3">
              <div className="inner-card card">
                <div className="card-body">
                  <h4 className="card-title">Top Guides</h4>
                  <Bar
                    data={{
                      labels: topGuides.map((guide) => guide.name),
                      datasets: [
                        {
                          label: "Rating",
                          data: topGuides.map((guide) => guide.rating),
                          backgroundColor: "rgba(255, 206, 86, 0.2)",
                          borderColor: "rgba(255, 206, 86, 1)",
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <div className="inner-card card">
                <div className="card-body">
                  <h4 className="card-title">Top Booked Tours</h4>
                  <Bar
                    data={{
                      labels: topBookedTours.map((tour) => tour.name),
                      datasets: [
                        {
                          label: "Booking Count",
                          data: topBookedTours.map((tour) => tour.bookingCount),
                          backgroundColor: "rgba(75, 192, 192, 0.2)",
                          borderColor: "rgba(75, 192, 192, 1)",
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
