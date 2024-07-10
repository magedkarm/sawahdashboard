import React from "react";
import { useQuery } from "react-query";
import axios from "axios";
import ReactApexChart from "react-apexcharts";
import "./Dashboard.css";
import LoadingComponent from "../../Components/LoadingComponent/LoadingComponent";
import { FaSackDollar } from "react-icons/fa6";
import { FaLandmark, FaUser } from "react-icons/fa";
const fetchStats = async () => {
  const { data } = await axios.get("/api/v1/stats/admin/", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  });
  return data.docs;
};

const DashBoard = () => {
  const { data, error, isLoading } = useQuery("stats", fetchStats);

  if (isLoading) return <LoadingComponent />;
  if (error) return <div>Error fetching data: {error.message}</div>;

  const {
    monthlySignUps,
    monthlyRevenue,
    popularLandmarks,
    topGuides,
    topBookedTours,
  } = data;

  const formatMonth = (month) => {
    return new Date(0, month - 1).toLocaleString("default", { month: "short" });
  };

  const formattedMonthlySignUps = monthlySignUps.map((item) => ({
    month: `${formatMonth(item._id.month)} ${item._id.year}`,
    numUsers: item.numUsers,
  }));

  const formattedMonthlyRevenue = monthlyRevenue.map((item) => ({
    month: `${formatMonth(item.month)} ${new Date().getFullYear()}`,
    totalRevenue: item.totalRevenue,
  }));

  const months = Array.from(
    new Set([
      ...formattedMonthlySignUps.map((item) => item.month),
      ...formattedMonthlyRevenue.map((item) => item.month),
    ])
  ).sort((a, b) => new Date(a) - new Date(b));

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
      <div className="global-card card ">
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-4 mb-3">
              <div className="inner-card card booking">
                <div className="card-body">
                  <div class="booking-status d-flex align-items-center">
                    <span>
                      <FaSackDollar />
                    </span>
                    <div class="ms-4">
                      <h2 class="mb-0 font-w600">
                        $
                        {monthlyRevenue.reduce(
                          (acc, item) => acc + item.totalRevenue,
                          0
                        )}
                      </h2>
                      <p class="mb-0 text-nowrap">Total Revenue</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="inner-card card booking">
                <div className="card-body">
                  <div class="booking-status d-flex align-items-center">
                    <span>
                      <FaUser />
                    </span>
                    <div class="ms-4">
                      <h2 class="mb-0 font-w600">
                        {monthlySignUps.reduce(
                          (acc, item) => acc + item.numUsers,
                          0
                        )}
                      </h2>
                      <p class="mb-0 text-nowrap"> Total Users</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="inner-card card booking">
                <div className="card-body">
                  <div class="booking-status d-flex align-items-center">
                    <span>
                      <FaLandmark />
                    </span>
                    <div class="ms-4">
                      <h2 class="mb-0 font-w600">{popularLandmarks[0].name}</h2>
                      <p class="mb-0 text-nowrap"> Popular Landmark</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row mb-4">
            <div className="col-md-6 mb-3">
              <div className="inner-card card">
                <div className="card-body">
                  <h4 className="card-title">Monthly SignUps & Revenue</h4>
                  <ReactApexChart
                    type="line"
                    series={[
                      {
                        name: "Monthly SignUps",
                        data: signUpData,
                      },
                      {
                        name: "Monthly Revenue",
                        data: revenueData,
                      },
                    ]}
                    options={{
                      chart: {
                        type: "line",
                      },
                      stroke: {
                        curve: "smooth",
                      },
                      xaxis: {
                        categories: months,
                      },
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-6 mb-3">
              <div className="inner-card card">
                <div className="card-body">
                  <h4 className="card-title">Popular Landmarks</h4>
                  <ReactApexChart
                    type="donut"
                    series={popularLandmarks.map(
                      (landmark) => landmark.numBookings
                    )}
                    options={{
                      labels: popularLandmarks.map((landmark) => landmark.name),
                      legend: {
                        position: "top",
                      },
                      title: {
                        text: "Popular Landmarks",
                        align: "center",
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
                  <ReactApexChart
                    type="bar"
                    series={[
                      {
                        name: "Rating",
                        data: topGuides.map((guide) => guide.rating),
                      },
                    ]}
                    options={{
                      chart: {
                        type: "bar",
                      },
                      xaxis: {
                        categories: topGuides.map((guide) => guide.name),
                      },
                      plotOptions: {
                        bar: {
                          horizontal: false,
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
                  <ReactApexChart
                    type="bar"
                    series={[
                      {
                        name: "Booking Count",
                        data: topBookedTours.map((tour) => tour.bookingCount),
                      },
                    ]}
                    options={{
                      chart: {
                        type: "bar",
                      },
                      xaxis: {
                        categories: topBookedTours.map((tour) => tour.name),
                      },
                      plotOptions: {
                        bar: {
                          horizontal: false,
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
};

export default DashBoard;
