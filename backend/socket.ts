import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

let io: Server | undefined;

interface UserSocketMap {
    [userId: string]: string;
}

const userSocketMap: UserSocketMap = {}; // userId -> socketId

export const initializeSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: [process.env.FRONTEND_URL as string],
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket: Socket) => {
        console.log("A user connected", socket.id);

        const userId = socket.handshake.query.userId as string;

        if (userId && userId !== "undefined") {
            userSocketMap[userId] = socket.id;
        }

        // broadcast to all connected clients the list of online users
        io?.emit("getOnlineUsers", Object.keys(userSocketMap));

        socket.on("disconnect", () => {
            console.log("user disconnected", socket.id);
            if (userId && userSocketMap[userId]) {
                delete userSocketMap[userId];
            }
            io?.emit("getOnlineUsers", Object.keys(userSocketMap));
        });

        socket.on("updateLocation", async (data: { lat: number; lng: number }) => {
            console.log("User location updated:", userId, data);
            // Save location to database
            if (userId && userId !== "undefined" && data.lat && data.lng) {
                try {
                    const { User } = await import("./models/userModel");
                    await User.findOneAndUpdate(
                        { clerk_id: userId },
                        {
                            currentLocation: {
                                type: "Point",
                                coordinates: [data.lng, data.lat], // GeoJSON format: [longitude, latitude]
                            },
                            isOnline: true,
                            socketId: socket.id,
                        }
                    );
                } catch (error) {
                    console.error("Error updating user location:", error);
                }
            }
        });

        // Typing indicator for chat
        socket.on("typing", (data: { receiverId: string; isTyping: boolean }) => {
            const receiverSocketId = userSocketMap[data.receiverId];
            if (receiverSocketId) {
                io?.to(receiverSocketId).emit("userTyping", {
                    senderId: userId,
                    isTyping: data.isTyping,
                });
            }
        });
    });
};

export const getReceiverSocketId = (receiverId: string) => {
    return userSocketMap[receiverId];
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
