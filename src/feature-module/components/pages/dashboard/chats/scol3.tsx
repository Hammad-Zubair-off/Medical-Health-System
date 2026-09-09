import Chart from "react-apexcharts";

type Props = {
  data?: number[];
};

const SCol3Chart = ({ data }: Props) => {
  const seriesData = data && data.length > 0 ? data : [0, 0, 0, 0, 0, 0, 0];

  const sCol3Chart: Record<string, unknown> = {
    chart: {
      width: 80,
      height: 54,
      type: "bar",
      toolbar: { show: false },
      sparkline: { enabled: true },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "70%",
        borderRadius: 0,
        endingShape: "rounded",
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: false },
    xaxis: {
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false },
    },
    yaxis: { show: false },
    grid: { show: false },
    tooltip: { enabled: false },
    colors: Array(seriesData.length).fill("#06AED4"),
    fill: { type: "solid" },
  };

  return (
    <div id="s-col-3">
      <Chart
        options={sCol3Chart}
        series={[{ name: "Data", data: seriesData }]}
        type="bar"
        width={80}
        height={54}
      />
    </div>
  );
};

export default SCol3Chart;
