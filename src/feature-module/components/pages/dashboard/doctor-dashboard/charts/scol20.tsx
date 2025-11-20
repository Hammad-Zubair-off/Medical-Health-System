import { useMemo } from "react";
import Chart from "react-apexcharts";
import { Timestamp } from "firebase/firestore";
import type { FirestoreAppointment } from "../../../../../../core/services/firestore/appointments.service";

interface SCol20ChartProps {
  appointments?: FirestoreAppointment[];
}

const SCol20Chart = ({ appointments = [] }: SCol20ChartProps) => {
  // Process appointments data to calculate monthly totals
  const chartData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Initialize arrays for 12 months
    const monthlyTotals = new Array(12).fill(0);
    const monthlyCompleted = new Array(12).fill(0);
    
    // Get current year for filtering
    const currentYear = new Date().getFullYear();
    
    // Process each appointment
    appointments.forEach((appointment) => {
      // Convert Firestore Timestamp to Date
      let appointmentDate: Date;
      if (appointment.appointmentDate instanceof Timestamp) {
        appointmentDate = appointment.appointmentDate.toDate();
      } else if (appointment.appointmentDate instanceof Date) {
        appointmentDate = appointment.appointmentDate;
      } else {
        return; // Skip invalid dates
      }
      
      // Only process appointments from current year
      if (appointmentDate.getFullYear() !== currentYear) {
        return;
      }
      
      const month = appointmentDate.getMonth(); // 0-11
      
      // Count total appointments for this month
      monthlyTotals[month]++;
      
      // Count completed appointments for this month
      if (appointment.status === "completed" || appointment.status === "checked-out") {
        monthlyCompleted[month]++;
      }
    });
    
    // Calculate max value for Y-axis (round up to nearest 50 for better visualization)
    const maxValue = Math.max(...monthlyTotals, ...monthlyCompleted, 1);
    const yAxisMax = Math.ceil(maxValue / 50) * 50;
    
    return {
      categories: monthNames,
      totalData: monthlyTotals,
      completedData: monthlyCompleted,
      yAxisMax: Math.max(yAxisMax, 50), // Minimum 50 for better visualization
    };
  }, [appointments]);

  const chartOptions = useMemo(() => ({
    chart: {
      height: 250,
      type: "line" as const,
      toolbar: { show: false },
      stacked: false,
    },
    stroke: {
      width: [0, 3], // Bar width 0 (solid), line width 3
      curve: "smooth" as const,
    },
    plotOptions: {
      bar: {
        columnWidth: "15%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    fill: {
      type: ["solid", "gradient"],
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0,
        stops: [0, 90, 100],
        colorStops: [
          {
            offset: 0,
            color: "#00B96B",
            opacity: 0.4,
          },
          {
            offset: 100,
            color: "#ffffff",
            opacity: 0,
          },
        ],
      },
    },
    colors: ["#3B28CC", "#00B96B"],
    xaxis: {
      categories: chartData.categories,
      labels: {
        style: {
          fontSize: "13px",
        },
      },
    },
    yaxis: {
      min: 0,
      max: chartData.yAxisMax,
      tickAmount: 5, // Show 5 ticks for better readability
      labels: {
        style: {
          fontSize: "13px",
        },
        offsetX: -10,
        formatter: (value: number) => Math.round(value).toString(),
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      custom: function ({ series, dataPointIndex, w }: {
        series: number[][];
        dataPointIndex: number;
        w: { globals: { labels: string[] } };
      }) {
        const total = series[0][dataPointIndex];
        const completed = series[1][dataPointIndex];
        return `<div class="apex-tooltip" style="padding: 8px; background: white; border: 1px solid #ddd; border-radius: 4px;">
          <strong style="display: block; margin-bottom: 4px;">${w.globals.labels[dataPointIndex]}</strong>
          <span style="color:#3B28CC">●</span> Total Appointments: <strong>${total}</strong><br/>
          <span style="color:#00B96B">●</span> Completed: <strong>${completed}</strong>
        </div>`;
      },
    },
    legend: { show: false },
    grid: {
      borderColor: "#eee",
      strokeDashArray: 4,
      padding: {
        left: 0,
        right: -10,
      },
    },
    markers: {
      size: [0, 5], // No markers on bars, size 5 on line
      hover: {
        sizeOffset: 2, // Increase size by 2 on hover
      },
    },
  }), [chartData]);

  const series = useMemo(() => [
    {
      name: "Total Appointments",
      type: "bar" as const,
      data: chartData.totalData,
    },
    {
      name: "Completed",
      type: "area" as const,
      data: chartData.completedData,
    },
  ], [chartData]);

  return (
    <div id="s-col-20">
      <Chart options={chartOptions} series={series} type="line" height={250} />
    </div>
  );
};

export default SCol20Chart;
