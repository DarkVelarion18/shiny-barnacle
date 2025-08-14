import os
import types
import asyncio
import importlib.util
import importlib.machinery
from typing import Callable, Awaitable, Any

# Utility: dynamic import of a module by file path, while preventing the
# module's top-level asyncio.run(main()) from executing networked code.
def _import_index_module_safely() -> types.ModuleType:
    target_path = os.path.join(os.path.dirname(__file__), "test_index.py")
    if not os.path.isfile(target_path):
        # In case repository layout differs, raise a clearer error
        raise FileNotFoundError(f"Expected to find module under tests/test_index.py, got: {target_path}")

    # Patch asyncio.run to a no-op so the module's top-level asyncio.run(main()) does not run
    import asyncio as _asyncio
    original_run = _asyncio.run
    _asyncio.run = lambda coro: None  # type: ignore[assignment]
    try:
        loader = importlib.machinery.SourceFileLoader("index_module_under_test", target_path)
        spec = importlib.util.spec_from_loader(loader.name, loader)
        mod = importlib.util.module_from_spec(spec)
        assert spec and spec.loader
        spec.loader.exec_module(mod)  # type: ignore[union-attr]
        return mod
    finally:
        # Restore original asyncio.run
        _asyncio.run = original_run  # type: ignore[assignment]

# Helper: create a minimal fake Context with async send capturing messages
class FakeCtx:
    def __init__(self, should_raise: bool = False):
        self.messages = []
        self.should_raise = should_raise

    async def send(self, content: str):
        if self.should_raise:
            raise RuntimeError("send failed")
        self.messages.append(content)

# Helper: resolve an async callable for a command attribute that may be:
# - a coroutine function directly (if decorator returns function), or
# - an object with a `.callback` or `.func` that is the coroutine function (discord/nextcord-like),
# - otherwise we raise a helpful error.
def resolve_command_callable(member: Any) -> Callable[..., Awaitable[Any]]:
    import inspect
    # Direct coroutine function
    if inspect.iscoroutinefunction(member):
        return member
    # Command-like wrapper with .callback
    callback = getattr(member, "callback", None)
    if callback is not None and inspect.iscoroutinefunction(callback):
        return callback  # expects (self, ctx)
    # Some libs use .func
    func = getattr(member, "func", None)
    if func is not None and inspect.iscoroutinefunction(func):
        return func
    # Otherwise, we can't figure it out
    raise TypeError(
        "Unable to resolve command callable. "
        "Expected coroutine function or wrapper with .callback/.func."
    )

def make_uninitialized_instance(cls: type):
    # Avoid invoking __init__ (which might require external services)
    return object.__new__(cls)

# ---- Tests ----

def test_get_prefix_returns_bang():
    mod = _import_index_module_safely()
    assert hasattr(mod, "Client"), "Client class must exist in module"
    client = make_uninitialized_instance(mod.Client)

    # get_prefix is an async method that returns "!"
    async def run():
        # Message argument is not used; provide a simple placeholder
        result = await mod.Client.get_prefix(client, message=None)  # type: ignore[arg-type]
        assert result == "!", "get_prefix should return '!'"
    asyncio.run(run())

def test_pong_command_sends_ping():
    mod = _import_index_module_safely()
    client = make_uninitialized_instance(mod.Client)
    # Resolve the command's coroutine function
    pong_callable = resolve_command_callable(mod.Client.pong)
    ctx = FakeCtx()

    async def run():
        await pong_callable(client, ctx)  # type: ignore[misc]
        assert ctx.messages == ["Ping"]
    asyncio.run(run())

def test_foo_command_sends_bar():
    mod = _import_index_module_safely()
    client = make_uninitialized_instance(mod.Client)
    foo_callable = resolve_command_callable(mod.Client.foo)
    ctx = FakeCtx()

    async def run():
        await foo_callable(client, ctx)  # type: ignore[misc]
        assert ctx.messages == ["bar"]
    asyncio.run(run())

def test_react_command_sends_heart():
    mod = _import_index_module_safely()
    client = make_uninitialized_instance(mod.Client)
    react_callable = resolve_command_callable(mod.Client.react)
    ctx = FakeCtx()

    async def run():
        await react_callable(client, ctx)  # type: ignore[misc]
        assert ctx.messages == ["❤️"]
    asyncio.run(run())

def test_hello_command_sends_greeting_with_newline():
    mod = _import_index_module_safely()
    client = make_uninitialized_instance(mod.Client)
    hello_callable = resolve_command_callable(mod.Client.hello)
    ctx = FakeCtx()

    async def run():
        await hello_callable(client, ctx)  # type: ignore[misc]
        assert len(ctx.messages) == 1
        assert ctx.messages[0] == "Hello, world! \n Nice to meet you."
        # Validate newline presence and surrounding spaces explicitly
        assert "\n" in ctx.messages[0]
        assert "Hello, world!" in ctx.messages[0]
        assert "Nice to meet you." in ctx.messages[0]
    asyncio.run(run())

def test_about_command_sends_about_message():
    mod = _import_index_module_safely()
    client = make_uninitialized_instance(mod.Client)
    about_callable = resolve_command_callable(mod.Client.about)
    ctx = FakeCtx()

    async def run():
        await about_callable(client, ctx)  # type: ignore[misc]
        assert ctx.messages == ["Hello, This is Rumpus a Friendly Python Revolt Bot!."]
    asyncio.run(run())

def test_command_send_failure_propagates_exception():
    mod = _import_index_module_safely()
    client = make_uninitialized_instance(mod.Client)
    pong_callable = resolve_command_callable(mod.Client.pong)
    ctx = FakeCtx(should_raise=True)

    async def run_and_expect_error():
        raised = None
        try:
            await pong_callable(client, ctx)  # type: ignore[misc]
        except RuntimeError as e:
            raised = e
        assert isinstance(raised, RuntimeError)
        assert str(raised) == "send failed"
    asyncio.run(run_and_expect_error())