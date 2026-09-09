import Chart from "react-apexcharts";

type Slice = { label: string; value: number };

type Props = {
  slices?: Slice[];
  totalLabel?: string;
};

const COLORS = ["#6DA6F2", "#5C60CC", "#9B51B6", "#2E37A4", "#FF955A"];

const CircleChart = ({
  slices = [],
  totalLabel = "Total",
}: Props) => {
  const labels = slices.map((s) => s.label);
  const series = slices.map((s) => s.value);
  const empty = series.length === 0 || series.every((v) => v === 0);

  const chartOptions: Record<string, unknown> = {
    chart: {
      type: "donut",
      height: 270,
      width: "100%",
    },
    labels: empty ? ["No data"] : labels,
    colors: COLORS,
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 2,
      colors: ["#fff"],
    },
    plotOptions: {
      pie: {
        donut: {
          size: "60%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "16px",
              fontWeight: 400,
              offsetY: -10,
              color: "#0A1B39",
            },
            value: {
              show: true,
              fontSize: "18px",
              fontWeight: 700,
              offsetY: 10,
              color: "#0A1B39",
            },
            total: {
              show: true,
              label: totalLabel,
              fontSize: "14px",
              color: "#0A1B39",
              formatter: function (w: {
                globals: { seriesTotals: number[] };
              }) {
                return w.globals.seriesTotals.reduce(
                  (a: number, b: number) => a + b,
                  0
                );
              },
            },
          },
        },
      },
    },
    tooltip: {
      enabled: true,
    },
  };

  return (
    <div id="circle-chart">
      <Chart
        options={chartOptions}
        series={empty ? [1] : series}
        type="donut"
        height={270}
      />
    </div>
  );
};

export default CircleChart;
