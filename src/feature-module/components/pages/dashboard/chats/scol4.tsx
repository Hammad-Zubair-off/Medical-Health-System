import Chart from "react-apexcharts";

type Props = {
  data?: number[];
};

const SCol4Chart = ({ data }: Props) => {
  const seriesData =
    data && data.length > 0 ? data : [0, 0, 0, 0, 0, 0, 0];

  const chartOptions: Record<string, unknown> = {
    chart: {
      width: 100,
      height: 54,
      type: "area",
      toolbar: { show: false },
      sparkline: { enabled: true },
    },
    stroke: {
      curve: "smooth",
      width: 2,
      colors: ["#008073"],
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.5,
        opacityTo: 0,
        stops: [0, 90, 100],
        colorStops: [
          { offset: 0, color: "#008073", opacity: 0.4 },
          { offset: 100, color: "#ffffff", opacity: 0.1 },
        ],
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false },
    },
    yaxis: { show: false },
    grid: { show: false },
    tooltip: { enabled: false },
  };

  return (
    <div id="s-col-4">
      <Chart
        options={chartOptions}
        series={[{ name: "Data", data: seriesData }]}
        type="area"
        width={100}
        height={54}
      />
    </div>
  );
};

export default SCol4Chart;
