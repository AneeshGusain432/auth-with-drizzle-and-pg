import type { Response } from "express";

class ApiResponse {
  static ok(res: Response, message: string, data?: {} | null) {
    return res.status(200).json({
      success: true,
      error: false,
      message,
      data,
    });
  }

  static created(res: Response, message: string, data: {} | null) {
    return res.status(201).json({
      success: true,
      error: false,
      message,
      data,
    });
  }
}

export default ApiResponse;
