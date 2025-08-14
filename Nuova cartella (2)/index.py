import asyncio
import aiohttp
import revolt
from revolt.ext import commands
import config

class Client(commands.CommandsClient):
    async def get_prefix(self,message: revolt.Message):
        """
        Return the command prefix for a given message.
        
        Currently always returns the literal "!" regardless of message content.
        
        Returns:
            str: The command prefix to use.
        """
        return "!"
    
    @commands.command()
    async def pong(self, ctx: commands.Context):
        """
        Respond with "Ping" to the invoking context.
        
        Used as a simple liveness/latency check command — sends the string "Ping" to the channel where the command was invoked.
        """
        
        await ctx.send("Ping")

    @commands.command()
    async def foo(self, ctx: commands.Context):
        """
        Respond with the literal string "bar" in the channel where the command was invoked.
        
        Parameters:
            ctx (commands.Context): Invocation context providing access to the channel and author.
        """
        
        await ctx.send("bar")

    @commands.command()
    async def react(self, ctx: commands.Context):
        """
        Send a single heart emoji ("❤️") to the channel associated with the given context.
        """
        
        await ctx.send("❤️")
    
    @commands.command()
    async def hello(self, ctx: commands.Context):
        """
        Send a greeting message to the channel.
        
        Sends "Hello, world! \n Nice to meet you." to the invocation context's channel.
        """
        
        await ctx.send("Hello, world! \n Nice to meet you.")

    @commands.command()
    async def about(self, ctx: commands.Context):
        """
        Send an informational message about the bot to the invocation channel.
        
        Sends the literal string "Hello, This is Rumpus a Friendly Python Revolt Bot!." to the channel where the command was invoked.
        """
        
        await ctx.send("Hello, This is Rumpus a Friendly Python Revolt Bot!.")


async def main():
    """
    Create an aiohttp ClientSession, instantiate the bot Client with the session and configured token, and start the client's event loop.
    
    The coroutine opens an aiohttp.ClientSession for the lifetime of the client, constructs Client(session, config.token), and awaits client.start(), which runs until the client shuts down. Intended to be executed with an event loop (for example via `asyncio.run(main())`).
    """
    async with aiohttp.ClientSession() as session:
        client = Client(session, config.token)
        await client.start()


-if __name__ == "__main__":
-    asyncio.run(main())
+if __name__ == "__main__":
+    asyncio.run(main())
