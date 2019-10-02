defmodule MemoryWeb.GamesChannel do
	use MemoryWeb, :channel

	alias Memory.Game
	alias Memory.BackupAgent

	def join("games:" <> name, payload, socket) do
		if authorized?(payload) do
			game = BackupAgent.get(name) || Game.new()
			socket = socket 
			|> assign(:game, game)
			|> assign(:name, name)
			BackupAgent.put(name, game)
			{:ok, %{"join" => name, "game" => Game.client_view(game)}, socket}
		else
			{:error, %{reason: "unauthorized"}}
		end
	end

	def handle_in("guess", %{"click" => clk}, socket) do
		name = socket.assigns[:name]
		case Game.click(socket.assigns[:game], clk) do
			[ng, game] -> 
				socket = assign(socket, :game, ng);
				BackupAgent.put(name, game)
				Process.send_after(self(), {:refresh, game}, 1000)
				{:reply, {:ok, %{"game" => Game.client_view(ng)}}, socket}
			game ->
				socket = assign(socket, :game, game);
				BackupAgent.put(name, game)
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
		{:noreply, socket}
	end

	defp authorized?(_payload) do
		true
	end

end