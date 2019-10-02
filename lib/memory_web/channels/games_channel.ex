defmodule MemoryWeb.GamesChannel do
	use MemoryWeb, :channel

	alias Memory.Game

	def join("games:" <> name, payload, socket) do
		if authorized?(payload) do
			game = Game.new()
			socket = socket 
			|> assign(:game, game)
			|> assign(:name, name)
			{:ok, %{"join" => name, "game" => Game.client_view(game)}, socket}
		else
			{:error, %{reason: "unauthorized"}}
		end
	end

	def handle_in("guess", %{"click" => clk}, socket) do
		{clk, _} = Integer.parse(clk)
		case Game.click(socket.assign[:game], clk) do
			[ng, game] -> 
				socket = assign(socket, :game, ng);
				Process.send_after(self(), {:refresh, game}, 1000)
				{:reply, {:ok, %{"game" => Game.client_view(ng)}}, socket}
			game ->
				socket = assign(socket, :game, game);
				{:reply, {:ok, %{"game" => Game.client_view(game)}}, socket}
		end
	end

	def handle_in("restart", _payload, socket) do
		game = Game.new();
		socket = assign(socket, :game, game)
		{:reply, {:ok, %{"game" => Game.client_view(game)}}, socket}
	end

	def handle_info({:refresh, game}, socket) do
		socket = assign(socket, :game, game);
		push(socket, "refresh", %{"game" => Game.client_view(game)})
	end

	defp authorized?(_payload) do
		true
	end

end