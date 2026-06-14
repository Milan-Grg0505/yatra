import { Response } from "express";

export interface SuccessShape<T> {
  success: true;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>
}

//reusable api response function
export class ApiResponse {
  static ok<T>(res: Response, data?: T, message = 'Success', meta?: Record<string, unknown>) {
    const body: SuccessShape<T> = { success: true, message };
    if (data !== undefined) body.data = data;
    if (meta) body.meta = meta;
    return res.status(200).json(body);
  }

  static created<T>(res: Response, data?: T, message = 'Created') {
    return res.status(201).json({ success: true, message, data });
  }

  static noContent(res: Response) {
    return res.status(204).end();
  }
}
