const users: any[] = [];

// Add a user to the list

const addUser = ({
  name,
  userId,
  roomId,
  host,
  presenter,
  socketId
}: {
  name: string;
  userId: string;
  roomId: number;
  host?: boolean;
  presenter?: boolean;
  socketId: any
}): any[] => {
  const user = {
    name,
    userId,
    roomId,
    host: host ?? false,
    presenter: presenter ?? false,
    socketId
  };
  users.push(user);
  return users.filter((user: any) => user.roomId === roomId);
};

// Remove a user from the list

const removeUser = (id: string): any | undefined => {
  const index = users.findIndex((user: any) => user.socketId === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

// Get a user from the list

const getUser = (id: string): any | undefined => {
  return users.find((user: any) => user.socketId === id);
};

// get all users from the room

const getUsersInRoom = (roomId: string): any[] => {
  return users.filter((user: any) => user.roomId === roomId);
};

export { addUser, removeUser, getUser, getUsersInRoom };
