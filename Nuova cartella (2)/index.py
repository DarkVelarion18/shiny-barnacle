import asyncio
import aiohttp
import revolt
from revolt.ext import commands
import config

class Client(commands.CommandsClient):
    async def get_prefix(self,message: revolt.Message):
        return "!"
    
    @commands.command()
    async def pong(self, ctx: commands.Context):
        """ping pong"""
        
        await ctx.send("Ping")

    @commands.command()
    async def foo(self, ctx: commands.Context):
        """foo bar"""
        
        await ctx.send("bar")

    @commands.command()
    async def react(self, ctx: commands.Context):
        """send a ❤️ in chat """
        
        await ctx.send("❤️")
    
    @commands.command()
    async def hello(self, ctx: commands.Context):
        """say hello to the chat"""
        
        await ctx.send("Hello, world! \n Nice to meet you.")

    @commands.command()
    async def about(self, ctx: commands.Context):
        """about the bot"""
        
        await ctx.send("Hello, This is Rumpus a Friendly Python Revolt Bot!.")


async def main():
    async with aiohttp.ClientSession() as session:
        client = Client(session, config.token)
        await client.start()


asyncio.run(main())
