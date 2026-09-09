import Chart from "react-apexcharts";

type Props = {
  completed?: number[];
  ongoing?: number[];
  rescheduled?: number[];
};

const EMPTY = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

const SCol19Chart = ({
  completed = EMPTY,
  ongoing = EMPTY,
  rescheduled = EMPTY,
}: Props) => {
  const chartOptions: Record<string, unknown> = {
    chart: {
      type: "bar",
      height: 250,
      stacked: true,
      toolbar: { show: false },
      sparkline: { enabled: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "25%",
        borderRadius: 3,
        distributed: false,
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 0,
      colors: ["#fff"],
    },
    colors: ["#00D1D1", "#1E90FF", "#3B28CC"],
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      labels: {
        style: {
          fontSize: "14px",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      tickPlacement: "between",
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "14px",
        },
        formatter: (val: number) => `${Math.round(val)}`,
        offsetX: -10,
      },
      min: 0,
      forceNiceScale: true,
    },
    legend: {
      position: "bottom",
    },
    grid: {
      show: true,
      strokeDashArray: 4,
      padding: {
        left: 0,
        right: -10,
      },
    },
    tooltip: { enabled: true },
  };

  const series = [
    { name: "Completed", data: completed },
    { name: "Ongoing", data: ongoing },
    { name: "Rescheduled", data: rescheduled },
  ];

  return (
    <div id="s-col-19">
      <Chart options={chartOptions} series={series} type="bar" height={250} />
    </div>
  );
};

export default SCol19Chart;
