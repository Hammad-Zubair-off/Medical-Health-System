import Chart from "react-apexcharts";

type Props = {
  data?: number[];
  color?: string;
};

/** Tiny sparkline — pass live series; falls back to a flat line when empty. */
const SCol2Chart = ({ data, color = "#F36C3D" }: Props) => {
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
      width: 1,
      colors: [color],
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0,
        stops: [0, 90, 100],
        colorStops: [
          { offset: 0, color, opacity: 0.4 },
          { offset: 100, color: "#ffffff", opacity: 0.8 },
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
    <div id="s-col-2">
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

export default SCol2Chart;
