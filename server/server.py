#!/usr/bin/env python

#import asyncio
#import websockets
#
#
#
## Set of connected clients
#connected_clients = set()
#
## Function to handle each client connection
#async def handle_client(websocket, path):
#    # Add the new client to the set of connected clients
#    connected_clients.add(websocket)
#    try:
#        # Listen for messages from the client
#        async for message in websocket:
#            print(message)
#            # Broadcast the message to all other connected clients
#            for client in connected_clients:
#                if client != websocket:
#                    print("   ---> sent")
#                    await client.send(message)
#    except websockets.exceptions.ConnectionClosed:
#        pass
#    finally:
#        # Remove the client from the set of connected clients
#        connected_clients.remove(websocket)
#
## Main function to start the WebSocket server
#async def main():
#    server = await websockets.serve(handle_client, HOST, PORT)
#    await server.wait_closed()


"""Echo server using the asyncio API."""

import asyncio
from websockets.asyncio.server import serve

HOST="0.0.0.0"
PORT=8080

## Inspired by https://medium.com/@AlexanderObregon/building-real-time-applications-with-python-and-websockets-eb33a4098e02 

# Set of clients
clients = set()
remove_clients = set()

# Handler
async def handler(websocket):
    clients.add(websocket)
    try:
        async for message in websocket:
            print(message)
            # Broadcast the message
            for client in clients:
                if client != websocket:
                    print("   ---> sent")
                    await client.send(message) 
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        print("closed a connection....")
        clients.remove(websocket)

async def main():
    async with serve(handler, HOST, PORT) as server:
        await server.serve_forever()


if __name__ == "__main__":
    asyncio.run(main())
