import * as signalR from "@microsoft/signalr";

const HUB_URL = "https://localhost:7186/hubs/orders";

export const connection = new signalR.HubConnectionBuilder()
  .withUrl(HUB_URL, {
    withCredentials: true,
  })
  .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
  .configureLogging(signalR.LogLevel.Information)
  .build();

let startPromise = null;

export const startSignalR = async () => {
  if (connection.state === signalR.HubConnectionState.Connected) {
    return;
  }

  if (connection.state === signalR.HubConnectionState.Connecting) {
    return;
  }

  if (startPromise) {
    return startPromise;
  }

  startPromise = (async () => {
    try {
      await connection.start();

      console.log("⚡ Connected to SignalR Hub");

      if (connection.state === signalR.HubConnectionState.Connected) {
        await connection.invoke("JoinKitchenGroup");
        console.log("🍳 Joined Kitchen group");
      }
    } catch (error) {
      console.error("❌ SignalR Connection Error:", error);
      throw error;
    } finally {
      startPromise = null;
    }
  })();

  return startPromise;
};

connection.onreconnecting((error) => {
  console.warn("⚠️ SignalR reconnecting...", error);
});

connection.onreconnected(async (connectionId) => {
  console.log("✅ SignalR reconnected:", connectionId);

  try {
    await connection.invoke("JoinKitchenGroup");
    console.log("🍳 Rejoined Kitchen group");
  } catch (error) {
    console.error("❌ Failed to rejoin Kitchen group:", error);
  }
});

connection.onclose((error) => {
  console.warn("🔴 SignalR connection closed", error);
});