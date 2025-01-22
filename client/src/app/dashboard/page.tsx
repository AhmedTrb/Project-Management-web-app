"use client";
import CircularProgress from "@mui/material/CircularProgress";
import { LineChart } from "@mui/x-charts/LineChart";
import React from "react";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
type Props = {};

function HomePage({}: Props) {
  return (
    <div className="flex flex-col justify-start w-full gap-y-10 p-10 bg-[#f5f5f5] min-h-screen">
      {/* Top Section */}
      <div className="grid lg:grid-cols-5 gap-x-4 gap-y-5 w-full md:grid-cols-3  sm:grid-cols-1">
        {/* running tasks */}
        <div className="flex flex-col justify-start items-start p-3 gap-y-4 col-span-2 md:col-span-1 sm:col-span-1 bg-secondary-950 rounded-lg ">
          <div className="flex flex-col justify-start items-start gap-y-2">
            <p className="text-white text-md ">Running Tasks</p>
            <p className="text-white text-3xl font-bold">54</p>
          </div>
          <div className="flex items-center gap-x-6">
            {/* Progress circle */}
            <CircularProgress
              variant="determinate"
              value={25}
              size={70}
              sx={{ color: "white" }}
              thickness={2}
            />
            <div className="flex flex-col justify-start items-start gap-y-[2px]">
              <p className="text-white text-lg font-bold">100</p>
              <p className="text-white text-lg">Tasks</p>
            </div>
          </div>
        </div>

        {/* Tasks activity line chart  */}
        <div className="flex flex-col justify-start items-start gap-y-2 lg:col-span-2 shadow-lg p-3 rounded-lg sm:col-span-1 w-full md:col-span-2">
          <p className=" text-secondary-950 text-md font-bold ">
            Tasks activity
          </p>
          <div className="h-20">
          <LineChart
            width={450}
            height={150}
            xAxis={[{ 
              data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
              scaleType: "band"
            }]}
            series={[
              {
                data: [2, 5, 2, 8, 1, 5],
                area: true,
                color: "#5030e5", // secondary-950 color
                showMark: false,
                curve: "natural"
              },
            ]}
            sx={{
              "& .MuiLineElement-root": {
                strokeWidth: 2,
              },
              "& .MuiAreaElement-root": {
                fillOpacity: 0.1
              }

            }}
            className="h-full"
          />
          </div>
        </div>
        {/* calendar  */}
        <div className="flex flex-col justify-start items-start gap-y-3 lg:col-span-2 sm:col-span-1 md:col-span-3">
          <div className="w-full bg-white rounded-lg p-3 shadow-lg felx justify-center items-center">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar sx={{ width: "100%", height: "100%" }} />
          </LocalizationProvider>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
