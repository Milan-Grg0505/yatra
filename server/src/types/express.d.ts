/* eslint-disable @typescript-eslint/no-empty-interface */
import { Types } from 'mongoose';

declare global {
  namespace Express {
    /**
     * Passport assigns `req.user` to whatever the strategy resolved.
     * We augment Express.User so `req.user.<field>` is typed everywhere.
     */
    interface User {
      _id: Types.ObjectId | string;
      id: string;
      email: string;
      role: 'admin' | 'user' | 'owner';
      hotel: Types.ObjectId | string | null;
      name: string;
    }

    interface Request {
      user?: User;
    }
  }
}

export { };
