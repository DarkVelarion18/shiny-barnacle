import asyncio
import aiohttp
import revolt
from revolt.ext import commands
import config

class Client(commands.CommandsClient):
    async def get_prefix(self,message: revolt.Message):
        """
        Return the command prefix used for a given message.
        
        This implementation always returns the literal "!" but accepts the message
        so callers can override it to compute per-message or per-guild prefixes.
        
        Parameters:
            message (revolt.Message): The incoming message for which the prefix is requested.
        
        Returns:
            str: The command prefix (always `"!"`).
        """
        return "!"
    
    @commands.command()
    async def pong(self, ctx: commands.Context):
        """
        Send a "Ping" message in response to the ping command.
        
        Parameters:
            ctx (commands.Context): The invocation context; used to send the reply message.
        """
        
        await ctx.send("Ping")

    @commands.command()
    async def foo(self, ctx: commands.Context):
        """
        Send "bar" in response to the invoked command.
        
        This command replies with the literal string "bar" to the channel or context from which it was invoked.
        
        Parameters:
            ctx (commands.Context): Invocation context used to send the reply.
        """
        
        await ctx.send("bar")

    @commands.command()
    async def react(self, ctx: commands.Context):
        """
        Send a heart emoji to the channel where the command was invoked.
        
        Parameters:
            ctx (commands.Context): The invocation context; the heart message is sent to ctx's channel.
        """
        
        await ctx.send("❤️")
    
    @commands.command()
    async def hello(self, ctx: commands.Context):
        """
        Send a greeting message to the chat.
        
        Parameters:
            ctx (commands.Context): Invocation context used to send the response message.
        """
        
        await ctx.send("Hello, world! \n Nice to meet you.")

    @commands.command()
    async def about(self, ctx: commands.Context):
        """
        Send a short informational message about the bot to the invoking context.
        
        Sends a greeting identifying the bot ("Hello, This is Rumpus a Friendly Python Revolt Bot!.") to the channel or user that invoked the command.
        """
        
        await ctx.send("Hello, This is Rumpus a Friendly Python Revolt Bot!.")


async def main():
    """
    Entry point that creates an aiohttp ClientSession, instantiates the bot Client with the session and configured token, and starts the bot.
    
    This coroutine manages the HTTP session context for the client and calls Client.start() to connect and run the Revolt bot. Intended to be executed with asyncio.run(main()).
    """
    async with aiohttp.ClientSession() as session:
        client = Client(session, config.token)
        await client.start()


asyncio.run(main())
