defmodule Memory.Game do
	def new do
		%{
			list: next_list(),
			completed: [], 
			guesses: [],
			times: 0,
		}
	end

	def client_view(game) do
		l = game.list
		comp = game.completed
		guesses = game.guesses
		%{
			skel: skeleton(l, comp, guesses),
			clicks: game.times
		}
	end

	def click(game, clk) do
		{:ok, w} = Enum.fetch(game.list, clk)
		unless Enum.member?(game.completed, w) do
			case game.guesses do
				[] -> 
					game 
					|> Map.put(:guesses, [clk])
					|> Map.put(:times, game.times + 1)
				[a] -> 
					{:ok, know} = Enum.fetch(game.list, a)
					cond do
						a == clk -> game
						know == w ->
							game 
							|> Map.put(:guesses, [])
							|> Map.put(:completed, game.completed ++ [w])
							|> Map.put(:times, game.times + 1)
						know != w ->
							# Settime out to hide
							ng = game
							|> Map.put(:guesses, game.guesses ++ [clk])
							|> Map.put(:times, game.times + 1)
							[ng, game]
					end
				_ -> game
			end
		else
			game
		end
	end

	def handle_info({:ping, game}) do
		
	end

	def skeleton(l, comp, guesses) do
		l
		|> Enum.map(fn cc -> 
			if Enum.member?(comp, cc) do
				cc
			else
				" "
			end
		end)
		|> show_guess(guesses, l)
	end

	defp show_guess(list, [], _) do
		list
	end

	defp show_guess(list, guess, origin) do
		[a | guess] = guess
		list
		|> List.replace_at(a, Enum.fetch!(origin, a))
		|> show_guess(guess, origin)
	end

	defp next_list do
		"AABBCCDDEEFFGGHH"
		|> String.graphemes
		|> Enum.shuffle
	end
end