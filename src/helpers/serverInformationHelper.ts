import { Request, Response } from "express";
import si from "systeminformation";
import catchAsync from "../shared/catchAsync";
import sendResponse from "../shared/sendResponse";

export const getServerInformation = catchAsync(async function getServerPerformance(req:Request,res:Response) {
  const [cpu, memory, disk, load] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.fsSize(),
    si.currentLoad(),
  ]);

  const serverInfo = {
    cpuUsage: `${cpu.currentLoad.toFixed(2)}%`,
    totalRAM: `${(memory.total / 1024 ** 3).toFixed(2)} GB`,
    usedRAM: `${(memory.active / 1024 ** 3).toFixed(2)} GB`,
    disk: disk.map((d) => ({
      mount: d.mount,
      usedPercent: d.use,
      freeGB: +(d.size - d.used) / 1024 ** 3,
    })),
    loadAverage: load.avgLoad,
  };

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Server information retrieved successfully",
    data: serverInfo,
  });
})

