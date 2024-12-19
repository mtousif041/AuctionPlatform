import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useSelector } from "react-redux";

ChartJS.register(
  // is graph ko toda aur setup krna hai uper wale jitne bhi items hai unko krvana hai register sivvaye Chart as ChartJS, ke
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement
);

const PaymentGraph = () => {
  const { monthlyRevenue } = useSelector((state) => state.superAdmin); // ye graph montly payment ka graph hai

  const data = {
    labels: [
      // labels ye show krenge ki ye data konse month ka hai
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],

    datasets: [
      {
        label: "Total Payment Received",
        data: monthlyRevenue,
        backgroundColor: "#D6482B",
        
      },
    ],
  };

  const options = {
    scales: {
      //
      y: {
        // means y axis
        beginAtZero: true, //yaani niche se uper ki tarafh jo grafh hoga uska kiya seen hona chaiye
        max: 50000, // yaani max payment per month itni payment hi recive honi chaiye
        ticks: {
          callback: function (value) {
            return value.toLocaleString();
          },
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: "Monthly Total Payments Received",
      },
    },
  };

  return <Bar data={data} options={options}  />;
};

export default PaymentGraph;
