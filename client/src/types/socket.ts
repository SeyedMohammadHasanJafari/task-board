export interface ActiveUser {
  socketId: string;
  userId: string;
  name: string;
  avatarColor: string;
  isGuest: boolean;
}

export interface RemoteCursor {
  socketId: string;
  x: number;
  y: number;
  user: {
    userId: string;
    name: string;
    avatarColor: string;
  };
}
